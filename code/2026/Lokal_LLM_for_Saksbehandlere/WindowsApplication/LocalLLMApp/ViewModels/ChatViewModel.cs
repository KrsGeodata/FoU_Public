// ViewModels/ChatViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp.Models;
using LocalLLMApp.Models.ApiModels;
using LocalLLMApp.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Documents;
using Windows.Storage;

// Manages chat page data and logic: messages, attachments, and LLM communication.
// Handles loading chat history, sending messages with attachments, and file validation.

namespace LocalLLMApp.ViewModels
{
    public partial class ChatViewModel : ObservableObject
    {
        [ObservableProperty]
        private string _currentChatTitle = "Samtale 1";

        [ObservableProperty]
        private string _currentChatDescription = "Sak 1";

        [ObservableProperty]
        private string _messageInput = string.Empty;

        [ObservableProperty]
        private bool _isLoading = false;

        // Pending attachments staged for sending with next message
        public ObservableCollection<FilesInfo> PendingAttachments { get; } = new();

        // All messages in current chat, including attachments
        public ObservableCollection<ChatMessage> Messages { get; } = new();

        private readonly DataService _dataService;
        private readonly APIService _apiService;
        private readonly AttachmentService _attachmentService;
        private readonly ChatService _chatService;
        private int _currentChatId;
        private int _currentCaseId;

        public ChatViewModel()
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _apiService = Ioc.Default.GetRequiredService<APIService>();
            _attachmentService = Ioc.Default.GetRequiredService<AttachmentService>();
            _chatService = Ioc.Default.GetRequiredService<ChatService>();
        }

        public ChatViewModel(Chat selectedChat) : this()
        {
            SetFieldsFromChatObject(selectedChat);
        }

        private void SetFieldsFromChatObject(Chat selectedChat) 
        {
            _currentChatTitle = selectedChat.Title;
            _currentChatDescription = selectedChat.Description;
            _currentChatId = selectedChat.ChatId;
            _currentCaseId = selectedChat.CaseId;
        }

        // Loads chat data: messages with attachments and pending files.
        // Called from OnNavigatedTo in ChatPage.xaml.cs
        public async Task LoadChat(Chat? selectedChat)
        {
            if (selectedChat == null)
            {
                Debug.WriteLine("No chat selected. Cannot load chat data.");
                return;
            } 
            else if (selectedChat.ChatId <= 0) 
            {
                Debug.WriteLine("Chat does not have ChatId. Cannot load chat data.");
                return;
            }

            List<ChatMessage> chatHistory = await _dataService.GetChatMessagesForChat(selectedChat.ChatId);
            List<FilesInfo> chatFiles = await _dataService.GetFilesInfoForChat(selectedChat.ChatId);

            foreach (var message in chatHistory ?? []) 
            {
                var attachmentsForMessage = chatFiles.Where(f => f.ChatMessageId == message.ChatMessageId);

                foreach (var fileInfo in attachmentsForMessage)
                {
                    // Avoid duplicates just in case
                    if (!message.Attachments.Any(a => a.FileId == fileInfo.FileId))
                    {
                        message.Attachments.Add(fileInfo);
                    }
                }
                Messages.Add(message);
                OnPropertyChanged(nameof(Messages));
            }
        }

        // Sends message with attachments to backend and LLM.
        // Steps: 1) Create message with attachments, 2) Save to backend, 3) Clear input, 4) Get LLM response
        [RelayCommand]
        private async Task SendMessageAsync()
        {
            if (_currentChatId <= 0)
                await StartNewChat();
            
            if (string.IsNullOrWhiteSpace(MessageInput))
                return;

            var newMessage = new ChatMessage
            {
                MessageText = MessageInput,
                IsUserMessage = true,
                ChatId = _currentChatId
            };
            foreach (var file in PendingAttachments) 
            {
                newMessage.Attachments.Add(file);
            }
            Messages.Add(newMessage);
            OnPropertyChanged(nameof(Messages));

            // Clear input field
            var userMessageText = MessageInput;
            MessageInput = string.Empty;
            PendingAttachments.Clear();

            // Send message
            //await SendChatMessageAsync(newMessage);

            IsLoading = true;
            try
            {
                APIChatResponse? response = await _chatService.SendChatMessageWithFiles(newMessage, _currentCaseId);
                if (response == null)
                {
                    IsLoading = false;
                    return;
                }

                if (response.UserMessage != null)
                {
                    UpdateChatMessageAttributesOfMostRecentMessage(response.UserMessage);
                }

                // Update metadata for FilesInfo already in UI for the uploaded message
                if (response.FilesInfos != null && response.FilesInfos.Count > 0 && Messages.Any())
                {
                    UpdateFilesInfoAttributesOfMostRecentMessage(response.FilesInfos);
                }

                if (response.AIResponse != null)
                {
                    Messages.Add(response.AIResponse);
                    OnPropertyChanged(nameof(Messages));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"[ChatViewModel] Error in SendChatMessageAsync: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        // Sends initial message to LLM after chat creation from CasePage.
        // First user message with attachments is already saved by CreateChatAndNavigate().
        public async Task SendFirstMessageAsync(ChatMessage firstMessage)
        {
            if (_currentChatId <= 0)
                await StartNewChat();

            firstMessage.ChatId = _currentChatId;

            Messages.Add(firstMessage);
            OnPropertyChanged(nameof(Messages));
            await SendChatMessageAsync(firstMessage);
        }

        // General send message function for both the loaded first chats but also "normal" input chats
        private async Task SendChatMessageAsync(ChatMessage newMessage) 
        {
            IsLoading = true;
            try
            {
                APIChatResponse? response = await _chatService.SendChatMessageWithFiles(newMessage, _currentCaseId);
                if (response == null)
                {
                    IsLoading = false;
                    return;
                }

                if (response == null)
                {
                    IsLoading = false;
                    return;
                }

                if (response.UserMessage != null)
                {
                    UpdateChatMessageAttributesOfMostRecentMessage(response.UserMessage);
                }

                // Update metadata for FilesInfo already in UI for the uploaded message
                if (response.FilesInfos != null && response.FilesInfos.Count > 0 && Messages.Any())
                {
                    UpdateFilesInfoAttributesOfMostRecentMessage(response.FilesInfos);
                }

                if (response.AIResponse != null)
                {
                    Messages.Add(response.AIResponse);
                    OnPropertyChanged(nameof(Messages));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"[ChatViewModel] Error in SendChatMessageAsync: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }


        // Creates new chat in backend and updates current chat ID and case ID.
        // Called when sending a new message from ChatPage without an existing chat
        private async Task StartNewChat() 
        {
            Chat sendChat = new Chat
            {
                Title = _currentChatTitle,
                Description = _currentChatDescription,
                CaseId = _currentCaseId
            };

            Chat? newChat = await _dataService.AddChat(sendChat);
            if (newChat == null)
            {
                return; //Create error message here
            }
            SetFieldsFromChatObject(newChat);
        }


        // Via AttachmentService, this validates and uploads files, then adds to pending attachments.
        // Called from ChatPage when user selects files via file picker or drag-and-drop.
        public void AddFilesToPendingAttachments(StorageFile[] files)
        {
            if (files is null || files.Length == 0) return;

            foreach (var file in files)
            {
                if (file == null) continue;
                var fileName = Path.GetFileName(string.IsNullOrEmpty(file.Path) ? file.Name : file.Path);
                if (PendingAttachments.Any(x => x.FileName == fileName)) continue;

                PendingAttachments.Add(new FilesInfo
                {
                    FileName = fileName,
                    FileObject = file,
                    ChatId = _currentChatId,
                    FileExtension = Path.GetExtension(fileName)
                });
            }
        }

        public void UpdateChatMessageAttributesOfMostRecentMessage(ChatMessage updatedChatMessage) 
        {
            var lastMessage = Messages.Last();

            lastMessage.ChatMessageId = updatedChatMessage.ChatMessageId;
            lastMessage.CreatedAt = updatedChatMessage.CreatedAt;
        }

        // Saves new chat title to backend, rolls back on failure
        public async Task SaveRenameChatAsync(string newTitle)
        {
            var oldTitle = CurrentChatTitle;
            CurrentChatTitle = newTitle;

            // Fetch existing chat from cache to preserve all fields
            var existingChat = _dataService.GetChatByChatId(_currentChatId);
            if (existingChat == null)
            {
                CurrentChatTitle = oldTitle;
                return;
            }

            existingChat.Title = newTitle;

            bool success = await _dataService.UpdateChat(existingChat);
            if (!success)
            {
                CurrentChatTitle = oldTitle;
            }
        }

        public void UpdateFilesInfoAttributesOfMostRecentMessage(List<FilesInfo>? updatedFilesInfos) 
        {
            // Update metadata for FilesInfo already in UI for the uploaded message
            if (updatedFilesInfos != null && updatedFilesInfos.Count > 0 && Messages.Any())
            {
                var lastMessage = Messages.Last();

                foreach (var serverInfo in updatedFilesInfos)
                {
                    // Match ONLY by FileName (case-insensitive)  backend provides FileId later
                    var existing = lastMessage.Attachments.FirstOrDefault(a =>
                        string.Equals(a.FileName, serverInfo.FileName, StringComparison.OrdinalIgnoreCase));

                    if (existing != null)
                    {
                        // Create merged object and replace the single item so UI gets a Replace collection change (minimizes flicker).
                        var merged = new FilesInfo
                        {
                            FileId = serverInfo.FileId ?? existing.FileId,
                            UserId = serverInfo.UserId != 0 ? serverInfo.UserId : existing.UserId,
                            ChatId = serverInfo.ChatId != 0 ? serverInfo.ChatId : existing.ChatId,
                            OriginalFilename = !string.IsNullOrEmpty(serverInfo.OriginalFilename) ? serverInfo.OriginalFilename : existing.OriginalFilename,
                            FileExtension = !string.IsNullOrEmpty(serverInfo.FileExtension) ? serverInfo.FileExtension : existing.FileExtension,
                            FileName = !string.IsNullOrEmpty(serverInfo.FileName) ? serverInfo.FileName : existing.FileName,
                            UploadedAt = !string.IsNullOrEmpty(serverInfo.UploadedAt) ? serverInfo.UploadedAt : existing.UploadedAt,
                            ChatMessageId = serverInfo.ChatMessageId != 0 ? serverInfo.ChatMessageId : existing.ChatMessageId
                        };

                        var idx = lastMessage.Attachments.IndexOf(existing);
                        if (idx >= 0)
                        {
                            lastMessage.Attachments[idx] = merged;
                        }
                    }
                }
            }
        }
    }
}
