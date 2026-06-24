using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Converters.Json;
using LocalLLMApp.Models;
using LocalLLMApp.Models.ApiModels;
using LocalLLMApp.UserControls;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows.Markup;
using Windows.Media.Devices;
using Windows.Storage;

// <Purpose>
// A centeralized service for managing all data related to cases,
// chats, and messages in the app.
// This service can be used to fetch data from the API, manage local data storage,
// and provide data to the ViewModels.
// NB! TBD if it should also handle files or if that should be a separate service.
// </Purpose>
/*
 * 1. Get data from a storage/place
 * 2. Return the data to someone
 * 3. Recieve and send data to a place
 */
// Uses:
// - Models/APIData.cs
// - Services/CacheService.cs

namespace LocalLLMApp.Services
{
    public class DataService : IDisposable
    {
        // CacheService for storing data in memory for quick access
        private readonly CacheService _cache;

        private readonly APIService _apiService; 

        // The current logged in User. Own value so we don't need to get it from
        // Cache all the time since only one user is logged in at a time
        private User currentUser;
        // Sets up JsonSerializerOptions to ignore case when matching property names
        // Add converter to map enums from strings in camelCase, used for Case.Status with CaseStatus Enum
        // NullToZeroIntConverter so there are no issues when parsing jsonobjects
        private JsonSerializerOptions sharedJsonSerializerOptions = new JsonSerializerOptions
            {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,  // ignore circular refs    
            Converters = { new NullToZeroIntConverter(), new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
                PropertyNameCaseInsensitive = true
            };

        // Set a default expiry time for certain cache entries, can be adjusted as needed
        private readonly TimeSpan cacheExpiryNormal = TimeSpan.FromMinutes(10);
        private readonly TimeSpan cacheAndDBMissExpiryTime = TimeSpan.FromSeconds(10);


        public DataService()
        {
            _cache = new CacheService();
            _apiService = Ioc.Default.GetRequiredService<APIService>();
            currentUser = new User();
        }

        // Dispose the cache when the DataService is disposed
        // Gets called when the app is closed. To prevent memory leaks and free up resources used by the cache.
        public void Dispose()
        {
            _cache.Dispose();
        }

        // Firstly gets User data (Cases, Chats, ChatMessages) from the DB
        // Then it loads this data into the Cache
        // Had to await this because of the errors I desribed in LoginViewModel. Keeping this comment here for easier tracking incase of broken functionality
        public async Task FillTheCacheWithUserData(User user)
        {
            try
            {
                currentUser = user;
                SaveUser(currentUser);

                string json = await _apiService.GetUserDashboardAsync(currentUser.UserId);

                LoadCacheFromJson(json);
                Debug.WriteLine("Loaded the Json to the cache");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error loading JSON from disk to cache: {ex.Message}");
            }
        }


        // Parses a Json string and stores the data in the cache
        // Parses into a APIData object, which allows missing fields
        public void LoadCacheFromJson(string json) 
        {
            var data = JsonSerializer.Deserialize<APIData>(json, sharedJsonSerializerOptions);
            if (data is null) return;

            //Store each collection individually
            if (data.User is not null) 
            {
                if (data.User.UserId > 0) 
                {
                    currentUser.UserId = data.User.UserId;
                }
                if (data.User.Name != null && data.User.Name != string.Empty)
                {
                    currentUser.Name = data.User.Name;
                }
                if (data.User.Email != null && data.User.Email != string.Empty)
                {
                    currentUser.Email = data.User.Email;
                }
                _cache.Set("user", currentUser);
            }


            if (data.Cases is not null)
            {
                var dict = data.Cases.ToDictionary(c => c.CaseId);
                SetCaseDictionary(dict);
            }

            if (data.Chats is not null)
            {
                var dict = data.Chats.ToDictionary(c => c.ChatId);
                SetChatDictionary(dict);
            }


            if (data.Messages is not null)
            {
                var messagesByChatId = data.Messages.GroupBy(m => m.ChatId);
                foreach (var group in messagesByChatId)
                {
                    SetMessagesByChat(group.Key, group.ToList(), cacheExpiryNormal);
                }
            }

            if (data.Chats is not null && data.Cases is not null)
            {
                // Build a count lookup: CaseId -> number of chats
                var chatCountByCaseId = data.Chats
                    .GroupBy(c => c.CaseId)
                    .ToDictionary(g => g.Key, g => g.Count());

                _cache.Set("chatCount:byCaseId", chatCountByCaseId);
            }

            if (data.Files is not null)
            {
                var filesByChatId = data.Files
                    .Where(f => f.ChatId != 0)
                    .GroupBy(f => f.ChatId);

                foreach (var group in filesByChatId)
                {
                    SetFilesInfosByChat(group.Key, group.ToList(), cacheExpiryNormal);
                }

                var filesByCaseId = data.Files
                    .Where(f => f.CaseId != 0)
                    .GroupBy(f => f.CaseId);

                foreach (var group in filesByCaseId)
                {
                    SetFilesInfosByCase(group.Key, group.ToList(), cacheExpiryNormal);
                }
            }
        }


        // Data processing for Send Chat endpoint
        public async Task<APIChatResponse?>SendChatV2(ChatMessage chatMessage, int? caseId) 
        {

            List<StorageFile>? files = [];
            foreach (FilesInfo info in chatMessage.Attachments) 
            { 
                if(info.FileObject != null) 
                { 
                    files.Add(info.FileObject);
                }
            }


            APIChatRequest request = new APIChatRequest {
                chat_message = chatMessage,
                user_id = currentUser.UserId,
                chat_id = chatMessage.ChatId,
                case_id = caseId
            };

            string response = await _apiService.SendChatMessageV2(request, files);
            Debug.WriteLine($"This is SendChatv2 response: {response}");
            var deserializedResponse = DeserializeJsonString<APIChatResponse>(response);


            if (deserializedResponse is null)
            {
                Debug.WriteLine("Returning null");
                return null;
            }

            if (deserializedResponse.UserMessage != null) 
            {
                AddChatMessageToCache(deserializedResponse.UserMessage);
            }

            if (deserializedResponse.AIResponse != null)
            {
                AddChatMessageToCache(deserializedResponse.AIResponse);
            }

            if (deserializedResponse.FilesInfos != null && deserializedResponse.FilesInfos.Count <= 0)
            {
                foreach(var fileInfo in deserializedResponse.FilesInfos) 
                {
                    AddFilesInfoToCache(fileInfo);
                }
            }
            Debug.WriteLine($"Returning deserializedResponse: {deserializedResponse}");
            return deserializedResponse;
        }

        /*******************************/

        /********************************************/
        /*        Shared or general functions       */
        /********************************************/
        #region
        // Helper function to deserialize a Json string into an object of type T
        private T? DeserializeJsonString<T>(string jsonString)
        {
            if (string.IsNullOrEmpty(jsonString))
            {
                return default;
            }

            try
            {
                return JsonSerializer.Deserialize<T>(jsonString, sharedJsonSerializerOptions);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in DeserializeJsonString: {ex}, {ex.Message}");
                return default;
            }
        }


        // Clear both Cache and CurrentUser
        public void ClearAllData() 
        {
            currentUser = new User();
            _cache.Clear();
        }
        #endregion


        /********************************************/
        /*          All functions for User          */
        /*       Sorted by CRUD functionality       */
        /********************************************/
        #region
        /*********************************/
        /***          CREATE           ***/
        /*********************************/
        /*********************************/
        /***           READ            ***/
        /*********************************/
        /*********************************/
        /***          UPDATE           ***/
        /*********************************/
        /*********************************/
        /***          DELETE           ***/
        /*********************************/
        // Saves a user to the cache
        public void SaveUser(User user) 
        {
            _cache.Set("user", user);
        }

        // Deletes the stored user from the cache
        public void DeleteUser() 
        {
            _cache.Remove("user");
        }

        // Returns the stored user, or null if not found
        public User FetchUser()
        {
            var returnUser = _cache.Get<User>("user") ?? null;
            if (returnUser is null || returnUser.UserId == 0)
            {
                // Fetch from API or local storage if not in cache
                return new User();
            }
            return returnUser;
        }
        #endregion


        /********************************************/
        /*          All functions for Cases         */
        /*       Sorted by CRUD functionality       */
        /********************************************/
        #region
        /*********************************/
        /***    CASE CACHE HELPERS     ***/
        /*********************************/
        private Dictionary<int, Case> GetCaseDictionary()
        {
            var caseDict = _cache.Get<Dictionary<int, Case>>("cases");
            if (caseDict is null)
                return new Dictionary<int, Case>();
            return caseDict;
        }


        private void SetCaseDictionary(Dictionary<int, Case> dict)
        {
            _cache.Set("cases", dict);
        }

        /*********************************/
        /***          CREATE           ***/
        /*********************************/
        public async Task<Case?> AddCase(Case newCase)
        {
            try
            {
                newCase.UserId = currentUser.UserId;

                string uploadResult = await _apiService.UploadCaseAsync(newCase);
                var returnedCase = DeserializeJsonString<Case>(uploadResult);

                if (returnedCase is null) 
                {
                    return null;
                }

                var cases = GetCaseDictionary();
                cases[returnedCase.CaseId] = returnedCase;
                SetCaseDictionary(cases);

                return returnedCase;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error adding new case: {ex.Message}");
                return null;
            }
        }

        /*********************************/
        /***           READ            ***/
        /*********************************/
        public List<Case> GetCases()
        {
            var caseDict = GetCaseDictionary();
            return caseDict.Values.ToList();
        }


        public Case? GetCaseByCaseId(int caseId)
        {
            var caseDict = GetCaseDictionary();
            return caseDict.GetValueOrDefault(caseId);
        }


        public int GetChatCountForCase(int caseId)
        {
            var chatCounts = _cache.Get<Dictionary<int, int>>("chatCount:byCaseId");
            if (chatCounts is null)
                return 0;

            return chatCounts.GetValueOrDefault(caseId);
        }

        /*********************************/
        /***          UPDATE           ***/
        /*********************************/
        public async Task<bool> UpdateCase(Case updateCase)
        {
            string updateResult = await _apiService.UpdateCaseAsync(updateCase);
            if (string.IsNullOrEmpty(updateResult))
                return false;

            var updatedCase = DeserializeJsonString<Case>(updateResult);
            if (updatedCase is null)
                return false;

            var cases = GetCaseDictionary();
            cases[updatedCase.CaseId] = updatedCase;
            SetCaseDictionary(cases);

            return true;
        }


        public void UpdateChatCountForCase(int caseId, int updateAmount) 
        {
            var counts = _cache.Get<Dictionary<int, int>>("chatCount:byCaseId") ?? [];
            counts[caseId] = Math.Max(0, counts.GetValueOrDefault(caseId) + updateAmount);
            _cache.Set("chatCount:byCaseId", counts);
        }

        /*********************************/
        /***          DELETE           ***/
        /*********************************/
        public async Task<bool> DeleteCaseAsync(Case removeCase)
        {
            var cases = GetCaseDictionary();
            if (!cases.ContainsKey(removeCase.CaseId))
                return false;

            var deleteResult = await _apiService.DeleteCaseAsync(removeCase.CaseId);
            if (deleteResult == false)
                return false;

            RemoveCaseAndRelationsFromCacheByCaseId(removeCase.CaseId);

            return true;
        }

        private bool RemoveCaseAndRelationsFromCacheByCaseId(int caseId)
        {
            if (caseId <= 0)
            {
                return false;
            }

            var caseInCache = GetCaseByCaseId(caseId);
            if (caseInCache is null || caseInCache.CaseId != caseId)
            {
                return false;
            }

            var caseDict = GetCaseDictionary();
            caseDict.Remove(caseId);
            SetCaseDictionary(caseDict);

            var chatsForCase = GetChatsByCaseId(caseId);
            foreach (var chat in chatsForCase) 
            {
                RemoveChatAndRelationsFromCacheByChatId(chat.ChatId);
            }

            DeleteFilesFromCacheByCaseId(caseId);

            return true;
        }
        #endregion


        /********************************************/
        /*          All functions for Chats         */
        /*       Sorted by CRUD functionality       */
        /********************************************/
        #region
        /*********************************/
        /***    CHAT CACHE HELPERS     ***/
        /*********************************/
        private Dictionary<int, Chat> GetChatDictionary()
        {
            var chatDict = _cache.Get<Dictionary<int, Chat>>("chats");
            if (chatDict is null)
                return new Dictionary<int, Chat>();
            return chatDict;
        }

        private void SetChatDictionary(Dictionary<int, Chat> dict)
        {
            _cache.Set("chats", dict);
        }

        /*********************************/
        /***          CREATE           ***/
        /*********************************/
        public async Task<Chat?> AddChat(Chat newChat)
        {
            try
            {
                newChat.UserId = currentUser.UserId;

                string uploadResult = await _apiService.UploadChatAsync(newChat);
                var returnedChat = DeserializeJsonString<Chat>(uploadResult);

                if (returnedChat is null)
                {
                    return null;
                }

                AddChatToCache(returnedChat);

                return returnedChat;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error adding new chat: {ex.Message}");
                return null;
            }
        }


        private void AddChatToCache(Chat newChat) 
        {
            var chats = GetChatDictionary();
            chats[newChat.ChatId] = newChat;
            SetChatDictionary(chats);

            if (newChat.CaseId > 0)
            {
                UpdateChatCountForCase(newChat.CaseId, 1);
            }
        }
        /*********************************/
        /***           READ            ***/
        /*********************************/
        public List<Chat> GetChats()
        {
            var chatDict = GetChatDictionary();
            return chatDict.Values.ToList();
        }

        public List<Chat> GetChatsByCaseId(int caseId)
        {
            var chatDict = GetChatDictionary();
            return chatDict.Values.Where(c => c.CaseId == caseId).ToList();
        }

        public Chat? GetChatByChatId(int chatId)
        {
            var chatDict = GetChatDictionary();
            return chatDict.GetValueOrDefault(chatId);
        }
        
        /*********************************/
        /***          UPDATE           ***/
        /*********************************/
        public async Task<bool> UpdateChat(Chat updateChat)
        {
            string updateResult = await _apiService.UpdateChatAsync(updateChat);
            if (string.IsNullOrEmpty(updateResult))
                return false;

            var updatedChat = DeserializeJsonString<Chat>(updateResult);
            if (updatedChat is null)
                return false;

            var chats = GetChatDictionary();
            chats[updatedChat.ChatId] = updatedChat;
            SetChatDictionary(chats);

            if (updateChat.CaseId != updatedChat.CaseId)
            {
                UpdateChatCountForCase(updatedChat.CaseId, 1);
            }

            return true;
        }
        /*********************************/
        /***          DELETE           ***/
        /*********************************/
        public async Task<bool> DeleteChatByIdAsync(int chatId)
        {
            if (chatId <= 0)
            {
                return false;
            }
            var chatExists = GetChatByChatId(chatId);
            if (chatExists is null || chatExists.ChatId != chatId) 
            {
                return false;
            }

            try
            {
                var response = await _apiService.DeleteChatAsync(chatId);

                if (response == false)
                {
                    return false;
                }

                RemoveChatAndRelationsFromCacheByChatId(chatId);

                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error deleting File: {ex.Message}");
                return false;
            }
        }

        private bool RemoveChatAndRelationsFromCacheByChatId(int chatId) 
        { 
            if ( chatId <= 0) 
            {
                return false;
            }

            var chatInCache = GetChatByChatId(chatId);
            if (chatInCache is null ||  chatInCache.ChatId != chatId) 
            { 
                return false; 
            }

            if (chatInCache.CaseId > 0)
            {
                UpdateChatCountForCase(chatInCache.CaseId, -1);
            }

            var chatsDict = GetChatDictionary();
            chatsDict.Remove(chatId);
            SetChatDictionary(chatsDict);

            DeleteFilesFromCacheByChatId(chatId);

            return true;
        }
        #endregion


        /********************************************/
        /*       All functions for ChatMessages     */
        /*       Sorted by CRUD functionality       */
        /********************************************/
        #region
        /*********************************/
        /**  CHAT MESSAGE CACHE HELPERS **/
        /*********************************/
        private List<ChatMessage> GetChatMessagesByChat(int chatId)
        {
            var messages = _cache.Get<List<ChatMessage>>($"messages:chat:{chatId}");
            if (messages is null)
                return [];
            return messages;
        }

        private void SetMessagesByChat(int chatId, List<ChatMessage> messages, TimeSpan? expiry = null)
        {
            _cache.Set($"messages:chat:{chatId}", messages, expiry);
        }

        /*********************************/
        /***          CREATE           ***/
        /*********************************/
        public async Task<ChatMessage?> AddChatMessage(ChatMessage newChatMessage)
        {
            try
            {
                string uploadResult = await _apiService.UploadChatMessageAsync(newChatMessage);
                var returnedChatMessage = DeserializeJsonString<ChatMessage>(uploadResult);

                if (returnedChatMessage is null)
                {
                    return null;
                }

                AddChatMessageToCache(returnedChatMessage);

                return returnedChatMessage;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error adding new chat message: {ex.Message}");
                return null;
            }
        }

        private void AddChatMessageToCache(ChatMessage newChatMessage)
        {
            var chatMessages = GetChatMessagesByChat(newChatMessage.ChatId);
            chatMessages.Add(newChatMessage);
            SetMessagesByChat(newChatMessage.ChatId, chatMessages, cacheExpiryNormal);
        }
        /*********************************/
        /***           READ            ***/
        /*********************************/
        public async Task<List<ChatMessage>> GetChatMessagesForChat(int chatId)
        {
            if (_cache.TryGet<bool>($"messages:chat:{chatId}:empty", out _))
                return [];

            var messages = GetChatMessagesByChat(chatId);
            if (messages is not null && messages.Count() > 0) 
            {
                SetMessagesByChat(chatId, messages, cacheExpiryNormal);
                return messages;
            }
                
            var response = await _apiService.GetChatMessagesForChatAsync(chatId);
            var returnedChatMessage = DeserializeJsonString<List<ChatMessage>>(response);

            if (returnedChatMessage is null || returnedChatMessage.Count == 0)
            {
                _cache.Set($"messages:chat:{chatId}:empty", true, cacheAndDBMissExpiryTime);
                return [];
            }

            SetMessagesByChat(chatId, returnedChatMessage, cacheExpiryNormal);
            return returnedChatMessage;
        }

        /*********************************/
        /***          UPDATE           ***/
        /*********************************/

        /*********************************/
        /***          DELETE           ***/
        /*********************************/
        #endregion


        /********************************************/
        /*       All functions for FilesInfo        */
        /*       Sorted by CRUD functionality       */
        /********************************************/
        #region
        /*********************************/
        /**   FILESINFO CACHE HELPERS   **/
        /*********************************/
        private List<FilesInfo> GetFilesInfoByChat(int chatId)
        {
            var fileInfos = _cache.Get<List<FilesInfo>>($"files:chat:{chatId}");
            if (fileInfos is null)
                return new List<FilesInfo>();
            return fileInfos;
        }

        private List<FilesInfo> GetFilesInfoByCase(int caseId)
        {
            var fileInfos = _cache.Get<List<FilesInfo>>($"files:case:{caseId}");
            if (fileInfos is null)
                return new List<FilesInfo>();
            return fileInfos;
        }

        private void SetFilesInfosByChat(int chatId, List<FilesInfo> files, TimeSpan? expiry = null)
        {
            _cache.Set($"files:chat:{chatId}", files, expiry);
        }

        private void SetFilesInfosByCase(int caseId, List<FilesInfo> files, TimeSpan? expiry = null)
        {
            _cache.Set($"files:case:{caseId}", files, expiry);
        }
        /*********************************/
        /***          CREATE           ***/
        /*********************************/
        // Upload a file to the backend and its info to the cache, returns the FileId
        public async Task<FilesInfo?> AddNewFile(StorageFile newFile, string fileName, int caseId = 0, int chatId = 0, int chatMessageId = 0)
        {
            try
            {
                using (var stream = await newFile.OpenStreamForReadAsync())
                {
                    var uploadFileInfo = await _apiService.UploadFileAsync(currentUser.UserId, stream, fileName, caseId, chatId, chatMessageId);
                    FilesInfo? newFilesInfo = DeserializeJsonString<FilesInfo>(uploadFileInfo);

                    if (newFilesInfo is null)
                    {
                        return null;
                    }


                    var response = AddFilesInfoToCache(newFilesInfo);
                    return response;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error uploading file: {ex.Message}");
                return null;
            }
        }

        private FilesInfo? AddFilesInfoToCache(FilesInfo newFilesInfo)
        {
            if (newFilesInfo.CaseId > 0)
            {
                var caseFiles = GetFilesInfoByCase(newFilesInfo.CaseId);
                caseFiles.Add(newFilesInfo);
                SetFilesInfosByCase(newFilesInfo.CaseId, caseFiles, cacheExpiryNormal);

                return newFilesInfo;
            }
            else if (newFilesInfo.ChatId > 0)
            {
                var chatFiles = GetFilesInfoByChat(newFilesInfo.ChatId);
                chatFiles.Add(newFilesInfo);
                SetFilesInfosByChat(newFilesInfo.ChatId, chatFiles, cacheExpiryNormal);

                return newFilesInfo;
            }
            return null;
        }
        /*********************************/
        /***           READ            ***/
        /*********************************/
        public async Task<List<FilesInfo>> GetFilesInfoForChat(int chatId)
        {
            if (_cache.TryGet<bool>($"filesinfo:chat:{chatId}:empty", out _))
                return [];

            var files = GetFilesInfoByChat(chatId);
            if (files is not null && files.Count() > 0)
            {
                SetFilesInfosByChat(chatId, files, cacheExpiryNormal);
                return files;
            }

            var response = await _apiService.GetFilesInfoForChatAsync(chatId);
            var returnedFilesInfos = DeserializeJsonString<List<FilesInfo>>(response);

            if (returnedFilesInfos is null || returnedFilesInfos.Count == 0)
            {
                _cache.Set($"filesinfo:chat:{chatId}:empty", true, cacheAndDBMissExpiryTime);
                return [];
            }

            SetFilesInfosByChat(chatId, returnedFilesInfos, cacheExpiryNormal);
            return returnedFilesInfos;
        }


        public async Task<List<FilesInfo>> GetFilesInfoForCase(int caseId)
        {
            if (_cache.TryGet<bool>($"filesinfo:case:{caseId}:empty", out _))
                return [];

            var files = GetFilesInfoByCase(caseId);
            if (files is not null && files.Count() > 0)
            {
                SetFilesInfosByCase(caseId, files, cacheExpiryNormal);
                return files;
            }

            var response = await _apiService.GetFilesInfoForCaseAsync(caseId);
            var returnedFilesInfos = DeserializeJsonString<List<FilesInfo>>(response);

            if (returnedFilesInfos is null || returnedFilesInfos.Count == 0)
            {
                _cache.Set($"filesinfo:case:{caseId}:empty", true, cacheAndDBMissExpiryTime);
                return [];
            }

            SetFilesInfosByCase(caseId, returnedFilesInfos, cacheExpiryNormal);
            return returnedFilesInfos;
        }


        /*********************************/
        /***          UPDATE           ***/
        /*********************************/

        /*********************************/
        /***          DELETE           ***/
        /*********************************/
        // Delete a file from db, storage and cache
        public async Task<bool> DeleteFileAsync(FilesInfo deleteFile)
        {
            if (string.IsNullOrEmpty(deleteFile.FileId))
            {
                return false;
            }

            try
            {
                var response = await _apiService.DeleteFileAsync(currentUser.UserId, deleteFile.FileId);

                if (response == false)
                {
                    return false;
                }

                RemoveFilesInfoFromCacheByObject(deleteFile);

                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error deleting File: {ex.Message}");
                return false;
            }
        }


        private bool RemoveFilesInfoFromCacheByObject(FilesInfo info)
        {
            string? cacheKey = null;

            if (info.CaseId > 0)
            {
                cacheKey = $"files:case:{info.CaseId}";
            }
            else if (info.ChatId > 0)
            {
                cacheKey = $"files:chat:{info.ChatId}";
            }
            else
            {
                return false;
            }

            var fileInfos = _cache.Get<List<FilesInfo>>(cacheKey);

            if (fileInfos is null || fileInfos.Count == 0)
            {
                return false;
            }
            var removedCount = fileInfos.RemoveAll(f => f.FileId == info.FileId);

            if (removedCount == 0)
            {
                return false;
            }

            _cache.Set(cacheKey, fileInfos);

            return true;
        }


        private void DeleteFilesFromCacheByCaseId(int caseId)
        {
            var fileInfos = GetFilesInfoByCase(caseId);
            fileInfos = [];
            SetFilesInfosByCase(caseId, fileInfos, TimeSpan.FromMilliseconds(1));
        }


        private void DeleteFilesFromCacheByChatId(int chatId)
        {
            var fileInfos = GetFilesInfoByChat(chatId);
            fileInfos = [];
            SetFilesInfosByChat(chatId, fileInfos, TimeSpan.FromMilliseconds(1));
        }
        #endregion
    }
}
