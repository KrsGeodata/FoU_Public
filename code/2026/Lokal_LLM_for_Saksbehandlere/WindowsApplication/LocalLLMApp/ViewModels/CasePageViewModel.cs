// ViewModels/CasePageViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;

/*
This ViewModel is responsible for managing the data and logic for the CasePage.
It holds the selected case, its related chats and files, and handles user interactions such as creating chats,
navigating to chat pages, and managing case files.

Short overview of the structure:
    1. Fields/ObservableProperties
    2. Derived properties
    3. Constructor
    4. LoadCase → FetchChatsForCase → FetchFilesForCase
    5. CreateChatAndNavigate → NavigateToChat → DeleteChatAsync
    6. RemoveSingleFileAsync → RemoveMultipleFiles → AddCaseFiles → AddFilesToPendingChatAttachments
*/

namespace LocalLLMApp.ViewModels
{
    public partial class CasePageViewModel : ObservableObject
    {
        [ObservableProperty]
        private ObservableCollection<Chat> _chats = new();

        [ObservableProperty]
        private Case? _selectedCase;

        // Files belonging to the case, shown in the right panel (FileListControl)
        [ObservableProperty]
        private ObservableCollection<FilesInfo> _filesInfo = new();


        // Pending chat attachments staged for upload when chat is created
        public ObservableCollection<FilesInfo> PendingChatAttachments { get; } = new();

        [ObservableProperty]
        private string _messageInput = string.Empty;


        // Derived properties from SelectedCase
        public string CaseTitle => SelectedCase?.Title ?? string.Empty;
        public string CaseDescription => SelectedCase?.Description ?? string.Empty;
        public Visibility EmptyStateVisibility => SelectedCase == null ? Visibility.Visible : Visibility.Collapsed;
        public Visibility ContentVisibility => SelectedCase == null ? Visibility.Collapsed : Visibility.Visible;


        // Returns true when there are no chats, used to show empty state in the view
        public bool IsChatsEmpty => Chats.Count == 0;

        private readonly DataService _dataService;
        private readonly ViewNavigationService _viewNavService;
        private readonly AttachmentService _attachmentService;

        public CasePageViewModel()
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>(); 
            _attachmentService = Ioc.Default.GetRequiredService<AttachmentService>();
            _chats.CollectionChanged += OnChatsChanged;
        }

        // Since IsChatsEmpty is a derived property, an event handler is needed to
        // trigger PropertyChanged when the Chats collection changes
        private void OnChatsChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            OnPropertyChanged(nameof(IsChatsEmpty));
        }

        // Loads the selected case and its related chats and files.
        // Called from OnNavigatedTo in CasePage.xaml.cs
        public void LoadCase(Case selectedCase)
        {
            try
            {
                SelectedCase = selectedCase;
                Chats.Clear();
                FilesInfo.Clear();
                PendingChatAttachments.Clear();

                OnPropertyChanged(nameof(CaseTitle));
                OnPropertyChanged(nameof(CaseDescription));
                OnPropertyChanged(nameof(EmptyStateVisibility));
                OnPropertyChanged(nameof(ContentVisibility));

                FetchChatsForCase(selectedCase);
                FetchFilesForCase(selectedCase);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"ERROR in LoadCase: {ex.Message}");
                throw;
            }
        }

        // Fetches files belonging to the case and adds them to FilesInfo
        public async void FetchFilesForCase(Case? selectedCase)
        {
            if (selectedCase == null || selectedCase.CaseId == 0) return;

            try
            {
                var filesForCase = await _dataService.GetFilesInfoForCase(selectedCase.CaseId);
                if (filesForCase == null) return;

                foreach (var f in filesForCase)
                {
                    if (f != null)
                        FilesInfo.Add(f);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"ERROR in FetchFilesForCase: {ex.Message}");
            }
        }

        // Fetches chats belonging to the case and adds them to Chats
        public void FetchChatsForCase(Case? selectedCase)
        {
            if (selectedCase == null || selectedCase.CaseId == 0) return;

            var chatsForCase = _dataService.GetChatsByCaseId(SelectedCase.CaseId);
            foreach (var c in chatsForCase)
            {
                Chats.Add(c);
            }
            OnPropertyChanged(nameof(IsChatsEmpty));
        }

        // Creates new chat, uploads pending attachments, sends first message with attachments, then navigates to ChatPage.
        // Called from CasePage.xaml.cs when user sends message in ChatInputControl.
        public async void CreateChatAndNavigate(Frame frame)
        {
            if (string.IsNullOrWhiteSpace(MessageInput)) return;

            var newChat = new Chat
            {
                Title = "Ny samtale",
                Description = string.Empty,
                CaseId = SelectedCase.CaseId
            };

            Chat? uploadedNewChat = await _dataService.AddChat(newChat);

            var navigateChat = uploadedNewChat ?? newChat;

            var firstMessage = new ChatMessage 
            {
                MessageText = MessageInput,
                IsUserMessage = true
            };

            foreach (var chatAttachment in PendingChatAttachments)
                firstMessage.Attachments.Add(chatAttachment);

            // Chats.Add(newChatWithId);
            MessageInput = string.Empty;
            PendingChatAttachments.Clear();

            _viewNavService.NavigateTo(typeof(ChatPage), frame, [navigateChat, firstMessage]);
            //NavigateToChat(newChat, frame);

        }

        // Navigates to ChatPage with the selected Chat object
        public void NavigateToChat(Chat selectedChat, Frame frame)
        {
            _viewNavService.NavigateTo(typeof(ChatPage), frame, selectedChat);
        }

        // Deletes a Chat from DB and removes it from the list in UI
        public async Task DeleteChatAsync(Chat deleteChat)
        {
            if (deleteChat == null) return;
            try
            {
                await _dataService.DeleteChatByIdAsync(deleteChat.ChatId);
                var existingChat = Chats.FirstOrDefault(c => c.ChatId == deleteChat.ChatId);
                if (existingChat is not null)
                    Chats.Remove(existingChat);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error deleting chat: {ex.Message}");
            }
        }

        // Removes a single file from the case (FilesInfo + backend).
        // Called from FileListControl in the right panel.
        public async Task RemoveSingleFileAsync(FilesInfo file)
        {
            FilesInfo.Remove(file);
            try
            {
                var result = await _dataService.DeleteFileAsync(file);
                if (result == false)
                    FilesInfo.Add(file);
            }
            catch (Exception ex)
            {
                FilesInfo.Add(file);
                Debug.WriteLine($"Error removing file: {ex.Message}");
            }
        }

        // Removes multiple files from the case (FilesInfo only, no backend call)
        public void RemoveMultipleFiles(IEnumerable<FilesInfo> fileNames)
        {
            foreach (var file in fileNames)
                FilesInfo.Remove(file);
        }

        // Adds files to the CASE (FilesInfo + backend upload).
        // Called from FileDragAndDropControl in the right panel.
        public async void AddCaseFiles(StorageFile[] files)
        {
            if (files is null || files.Length == 0) return;

            foreach (var file in files)
            {
                if (file == null) continue;

                var display = string.IsNullOrEmpty(file.Path) ? file.Name : file.Path;
                string fileName = Path.GetFileName(display);

                if (FilesInfo.Any(x => x.FileName == fileName)) continue;

                var newFile = new FilesInfo
                {
                    CaseId = SelectedCase.CaseId,
                    FileName = fileName
                };
                FilesInfo.Add(newFile);

                try
                {
                    FilesInfo? newFilesInfo = await _dataService.AddNewFile(file, fileName, SelectedCase.CaseId, 0, 0);
                    //string fileId = await _dataService.AddNewFile(file, fileName, SelectedCase.CaseId, 0);
                    
                    
                    if(newFilesInfo != null)
                    {
                        var index = FilesInfo.IndexOf(newFile);
                        FilesInfo[index] = newFilesInfo;
                    }
                    else
                    {
                        FilesInfo.Remove(newFile);
                    }
                }
                catch (Exception ex)
                {
                    FilesInfo.Remove(newFile);
                    Debug.WriteLine($"Error uploading case file: {ex.Message}");
                }
            }
        }

        // Via AttachmentService, the method validates and stages files for later upload 
        // CasePage and ChatPage: Called from ChatInputControl
        // Files are uploaded when CreateChatAndNavigate() is called
        public void AddFilesToPendingChatAttachments(StorageFile[] files)
        {
            if (files is null || files.Length == 0) return;

            foreach (var file in files)
            {
                if (file == null) continue;

                var display = string.IsNullOrEmpty(file.Path) ? file.Name : file.Path;
                string fileName = Path.GetFileName(display);

                if (PendingChatAttachments.Any(x => x.FileName == fileName)) continue;

                PendingChatAttachments.Add(new FilesInfo
                {
                    CaseId = SelectedCase.CaseId,
                    FileName = fileName,
                    FileExtension = Path.GetExtension(fileName),
                    FileObject = file
                });
            }
        }

        // TODO: missing backend call — only updates the in-memory object.
        // Should call _dataService.UpdateCase(caseItem) to persist the rename.
        public async Task SaveRenameCaseAsync(Case caseItem, string newTitle)
        {
            caseItem.Title = newTitle;
            await Task.CompletedTask;
        }

        // TODO: missing backend call — only updates the in-memory object.
        // Should call _dataService.UpdateChat(chat) to persist the rename
        public async Task SaveRenameChatAsync(Chat chat, string newTitle)
        {
            chat.Title = newTitle;
            await Task.CompletedTask;
        }
    }
}