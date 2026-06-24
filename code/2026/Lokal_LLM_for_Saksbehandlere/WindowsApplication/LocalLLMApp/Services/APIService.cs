using CommunityToolkit.Common;
using LocalLLMApp.Converters.Json;
using LocalLLMApp.Models;
using LocalLLMApp.Models.ApiModels;
using Microsoft.UI;
using MimeTypes;
using StreamJsonRpc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipelines;
using System.IO.Pipes;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows;
using System.Xml.Linq;
using Windows.Storage;
using Windows.System;

// <Purpose>
// Service where we specify the different API calls to make to the FastAPI server
// </Purpose>
// Note/ToDo:
//  - Maybe add a health check first for the service to see if it can connect to the server
//  - Add an automated function that checks either if you are using LocalHost or FastAPIServer
// NB! - you have to switch out the param conURL based on if you are testing in production or localHost


namespace LocalLLMApp.Services
{
    class APIService
    {
        private const string LocalApiUrl = "http://127.0.0.1:8000";
        private const string HostedApiUrl = "http://lokal-llm.geokrs.no";

        // Starts with hosted endpoint and automatically falls back to local endpoint if unreachable.
        private string _preferredApiBaseUrl = HostedApiUrl;

        // Shared HTTP client reused for all API calls.
        private static readonly HttpClient SharedHttpClient = new();

        // Sets up the http client if tokens from appsettings.json is found
        public APIService()
        {
            var basicAuthToken = LoadTokenFromAppSettings();
            if (!string.IsNullOrWhiteSpace(basicAuthToken))
            {
                SharedHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", basicAuthToken);
            }
        }

        /********************************************/
        /*         Non Endpoint functions           */
        /********************************************/
        #region
        // This approach is very similar to GetJsonFromDisk() in DataService
        // Maybe there is a way to abstract the logic into its own method? Could help optimize the code and make it cleaner, but I don't have time for this now
        // Loads the Basic Auth Token from appsetings.local.json by looking through the directory, returns null if no token is found
        private static string? LoadTokenFromAppSettings()
        {
            try
            {
                // gets the base directory of the app
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                var dir = new DirectoryInfo(baseDir);

                // Searches the base directory of the app (10 levels, can prob be toned down a bit) 
                for (int depth = 0; depth < 10 && dir != null; depth++)
                {
                    var appSettingsPath = Path.Combine(dir.FullName, "appsettings.local.json");
                    if (File.Exists(appSettingsPath))
                    {
                        // snatches the token from appsettings
                        using var document = JsonDocument.Parse(File.ReadAllText(appSettingsPath));
                        var basicAuth = document.RootElement.GetProperty("BasicAuth");
                        var username = basicAuth.GetProperty("Username").GetString()?.Trim();
                        var password = basicAuth.GetProperty("Password").GetString()?.Trim();

                        if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                        {
                            // base64 since the http header wants it
                            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                        }

                        return null;
                    }
                    // moves one folder up
                    dir = dir.Parent;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
        #endregion


        /********************************************/
        /*          Important Endpoints             */
        /********************************************/
        #region
        // LoginAsync send the login data to the backend and tells us if the login worked or not
        public async Task<APILoginResponse> LoginAsync(string email, string password)
        {
            // Defines the request object that backend wants, serializes it to json and prepares it for sending
            var request = new { email, password };
            string jsonRequest = JsonSerializer.Serialize(request);

            try
            {
                // Send login request to backend auth endpoint (with automatic URL fallback)
                HttpResponseMessage response = await LoginWithLocalFallBack("/auth/login", jsonRequest);


                //  2xx status means login was accepted
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var json = JsonDocument.Parse(responseString);
                    var root = json.RootElement;

                    return new APILoginResponse
                    {
                        Success = true,
                        Email = root.GetProperty("user").GetProperty("email").GetString() ?? string.Empty,
                        Name = root.GetProperty("user").GetProperty("name").GetString() ?? string.Empty,
                        UserId = root.GetProperty("user").GetProperty("id").GetInt64()
                    };
                }

                return new APILoginResponse
                {
                    Success = false,
                    ErrorMessage = response.StatusCode == HttpStatusCode.Unauthorized
                        ? "Feil brukernavn eller passord."
                        : $"Login failed: {response.StatusCode}"
                };
            }
            catch (Exception ex)
            {
                return new APILoginResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message + " Could not connect to server"
                };
            }
        }


        public async Task<string> SendChatMessage(string message, int? chatId = null, int? caseId = null)
        {
            APIChatMessage apiChatMessage = new()
            {
                message = message,
                chat_id = chatId,
                case_id = caseId
            };
            string jsonPayload = JsonSerializer.Serialize(apiChatMessage);

            try
            {
                HttpResponseMessage response = await LoginWithLocalFallBack("/chat", jsonPayload);

                if (response.IsSuccessStatusCode)
                {
                    string responseString = await response.Content.ReadAsStringAsync();
                    try
                    {
                        using JsonDocument doc = JsonDocument.Parse(responseString);
                        if (doc.RootElement.TryGetProperty("text", out JsonElement textElement))
                            return textElement.GetString() ?? string.Empty;
                    }
                    catch (JsonException ex)
                    {
                        Debug.WriteLine("Failed to parse chat response: " + ex.Message);
                    }
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
            }
            return "There seems to be an error somewhere in the system";
        }

        public async Task<string> SendChatMessageV2(APIChatRequest request, List<StorageFile>? fileStreams = null)
        {
            using var form = new MultipartFormDataContent();
            string jsonPayloadMessage = JsonSerializer.Serialize(request);
            form.Add(new StringContent(jsonPayloadMessage), "request_body");

            if (fileStreams != null) 
            { 
                foreach(StorageFile f in fileStreams) 
                {
                    var display = string.IsNullOrEmpty(f.Path) ? f.Name : f.Path;
                    string fileName = Path.GetFileName(display);

                    string extension = Path.GetExtension(fileName);
                    var contentType = MimeTypeMap.GetMimeType(extension);

                    var stream = await f.OpenStreamForReadAsync();

                    var fileContent = new StreamContent(stream);
                    fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
                    form.Add(fileContent, "files", fileName);
                }
            }

            try
            {
                HttpResponseMessage response = await SharedHttpClient.PostAsync($"{_preferredApiBaseUrl}/chat2", form); 
                string responseString = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    //string responseString = await response.Content.ReadAsStringAsync();
                    Debug.WriteLine(responseString);
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}");
                    Debug.WriteLine(responseString);
                    return "";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine($"Problem in SendChatMessageV2: {ex}, {ex.Message}");
                return "";
            }
        }


        private async Task<HttpResponseMessage> LoginWithLocalFallBack(string route, string jsonPayload)
        {

            string[] endpoints;
            if (_preferredApiBaseUrl == HostedApiUrl)
            {
                endpoints = new[] { HostedApiUrl, LocalApiUrl };
            }
            else
            {
                endpoints = new[] { LocalApiUrl, HostedApiUrl };
            }

            Exception? lastException = null;

            foreach (var endpoint in endpoints)
            {
                try
                {
                    Debug.WriteLine($"[APIService] Trying endpoint: {endpoint}");
                    using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    var response = await SharedHttpClient.PostAsync($"{endpoint}{route}", content);

                    // Remember latest successful endpoint so next request starts there.
                    _preferredApiBaseUrl = endpoint;
                    Debug.WriteLine($"[APIService] Active endpoint: {_preferredApiBaseUrl}");
                    return response;
                }
                catch (Exception ex)
                {
                    lastException = ex;
                }
            }

            throw lastException ?? new InvalidOperationException("Failed to contact backend endpoint.");
        }
        #endregion


        /********************************************/
        /*             GET Endpoints                */
        /********************************************/
        #region
        // Generic GET function that takes in a route and returns the response as a string
        public async Task<string> GetDataFromEndpointAsync(string route)
        {
            try
            {
                HttpResponseMessage response = await SharedHttpClient.GetAsync($"{_preferredApiBaseUrl}{route}");
                string responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    Debug.WriteLine(responseString);
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}, {responseString}");
                    return "";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine($"Problem in GetDataFromEndpointAsync: {ex}, {ex.Message}");
                return "";
            }
        }


        // Get all Cases and Chats related to a user, used for the dashboard and initial data load when logging in
        public async Task<string> GetUserDashboardAsync(int userId)
        {
            return await GetDataFromEndpointAsync($"/users/{userId}/dashboard");
        }

        public async Task<string> GetCasesAsync(int userId) 
        { 
            return await GetDataFromEndpointAsync($"/cases/user/{userId}");
        }

        public async Task<string> GetChatsAsync(int userId)
        {
            return await GetDataFromEndpointAsync($"/chats/user/{userId}");
        }

        public async Task<string> GetChatMessagesForChatAsync(int chatId)
        {
            return await GetDataFromEndpointAsync($"/chats/{chatId}/messages");
        }

        public async Task<string> GetFilesInfoForCaseAsync(int caseId) 
        {
            return await GetDataFromEndpointAsync($"/files/info/case/{caseId}");
        }

        public async Task<string> GetFilesInfoForChatAsync(int chatId)
        {
            return await GetDataFromEndpointAsync($"/files/info/chat/{chatId}");
        }
        #endregion


        /********************************************/
        /*             POST Endpoints               */
        /********************************************/
        #region
        // Uploads a file to the backend and returns a UUID and UploadedAt if successful
        public async Task<string> UploadFileAsync(int userId, Stream fileStream, string fileName, int? caseId = null, int? chatId = null, int? chatMessageId = null)
        {
            using var form = new MultipartFormDataContent();
            form.Add(new StringContent(userId.ToString()), "user_id");

            if (caseId.HasValue)
                form.Add(new StringContent(caseId.Value.ToString()), "case_id");

            if (chatId.HasValue)
                form.Add(new StringContent(chatId.Value.ToString()), "chat_id");

            if (chatMessageId.HasValue)
                form.Add(new StringContent(chatMessageId.Value.ToString()), "chat_message_id");

            string extension = Path.GetExtension(fileName);
            var contentType = MimeTypeMap.GetMimeType(extension);

            var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            form.Add(fileContent, "file", fileName);

            try
            {
                HttpResponseMessage response = await SharedHttpClient.PostAsync($"{_preferredApiBaseUrl}/files/upload", form);
                string responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}, {responseString}");
                    return "";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine($"Problem in UploadFileAsync: {ex}, {ex.Message}");
                return "";
            }
        }


        // Generic POST function that takes in a route and object then returns the response as a string
        public async Task<string> UploadObjectToEndpointAsync(string route, object obj)
        {
            string jsonPayload = JsonSerializer.Serialize(obj);
            using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await SharedHttpClient.PostAsync($"{_preferredApiBaseUrl}{route}", content);
                string responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}, {responseString}");
                    return "";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine($"Problem in UploadObjectToEndpointAsync: {ex}, {ex.Message}");
                return "";
            }
        }


        public async Task<string> UploadCaseAsync(Case newCase) 
        {
            return await UploadObjectToEndpointAsync("/cases", newCase);
        }


        public async Task<string> UploadChatAsync(Chat newChat)
        {
            return await UploadObjectToEndpointAsync("/chats", newChat);
        }

        public async Task<string> UploadChatMessageAsync(ChatMessage newChatMessage) 
        {
            return await UploadObjectToEndpointAsync("/chats/messages", newChatMessage);
        }
        #endregion


        /********************************************/
        /*             DELETE Endpoints             */
        /********************************************/
        #region
        // Generic DELETE function that takes in a route and returns a bool indicating if the delete went through
        public async Task<bool> DeleteFromBackendAsync(string route) 
        {
            try
            {
                HttpResponseMessage response = await SharedHttpClient.DeleteAsync($"{_preferredApiBaseUrl}{route}");

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    string responseString = await response.Content.ReadAsStringAsync();
                    Debug.WriteLine($"Error: {response.StatusCode}, {responseString}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine(ex);
                return false;
            }
        }

        public async Task<bool> DeleteFileAsync(int userId, string fileId) 
        {
            return await DeleteFromBackendAsync($"/files/{userId}/{fileId}");
        }

        public async Task<bool> DeleteCaseAsync(int caseId) 
        {
            return await DeleteFromBackendAsync($"/cases/{caseId}");
        }

        public async Task<bool> DeleteChatAsync(int chatId) 
        {
            return await DeleteFromBackendAsync($"/chats/{chatId}");
        }
        #endregion


        /********************************************/
        /*             PUT Endpoints                */
        /********************************************/
        #region
        // Generic PUT function that takes in a route and object then returns the response as a string
        public async Task<string> UpdateObjectAtEndpointAsync(string route, object obj)
        {
            string jsonPayload = JsonSerializer.Serialize(obj);
            using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await SharedHttpClient.PutAsync($"{_preferredApiBaseUrl}{route}", content);
                string responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    Debug.WriteLine(responseString);
                    return responseString;
                }
                else
                {
                    Debug.WriteLine($"Error: {response.StatusCode}, {responseString}");
                    return "";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message + " May server not running");
                Debug.WriteLine($"Problem in UpdateObjectAtEndpointAsync: {ex}, {ex.Message}");
                return "";
            }
        }

        public async Task<string> UpdateCaseAsync(Case updateCase)
        {
            return await UpdateObjectAtEndpointAsync($"/cases/{updateCase.CaseId}", updateCase);
        }

        public async Task<string> UpdateChatAsync(Chat updateChat)
        {
            return await UpdateObjectAtEndpointAsync($"/chats/{updateChat.ChatId}", updateChat);
        }
        #endregion
    }
}
