using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

// <Purpose>
// Manages data and logic for ChatOverviewPage.
// Holds all chats as source of truth (_allChats) and exposes
// a filtered and sorted view (FilteredChats) for UI binding.
// </Purpose>
// Uses:
// - Models/Chat.cs
// - Services/DataService.cs

namespace LocalLLMApp.ViewModels
{
    public enum ChatFilterOption { All, LinkedToCase, ChatsWithoutCase }

    public partial class ChatOverviewPageViewModel : ObservableObject
    {
        // Fields
        private List<Chat> _allChats = new();
        private ChatFilterOption _currentFilter = ChatFilterOption.All;
        private bool _sortDescending = true;

        // Observable Properties
        [ObservableProperty]
        private ObservableCollection<Chat> _filteredChats = new();

        private readonly DataService _dataService;
        private readonly ViewNavigationService _viewNavService;

        // Derived Properties
        public string ActiveSort => _sortDescending ? "Dato (Nyeste først)" : "Dato (Eldste først)";
        
        public string ActiveFilter => _currentFilter switch
        {
            ChatFilterOption.LinkedToCase => "Samtaler knyttet til sak",
            ChatFilterOption.ChatsWithoutCase => "Samtaler uten sak",
            _ => "Alle samtaler"
        };

        public bool IsChatsEmpty => FilteredChats.Count == 0;

        public ChatOverviewPageViewModel() 
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
        }

        // Load chats method
        public void LoadChats()
        {
            _allChats = _dataService.GetChats() ?? new List<Chat>();

            // Set description based on chat connection with case
            foreach (var chat in _allChats)
            {
                var linkedCase = _dataService.GetCaseByCaseId(chat.CaseId);
                if (linkedCase != null)
                    chat.Description = $"Sak: {linkedCase.Title}";
            }

            ApplyFilterAndSort();
        }

        // Creates a new chat without a case and navigates to ChatPage
        public async void CreateChat(Frame frame)
        {
            var newChat = new Chat
            {
                Title = "Ny samtale",
                CaseId = 0
            };

            var newChatWithId = await _dataService.AddChat(newChat);
            if (newChatWithId != null)
            {
                _viewNavService.NavigateTo(typeof(ChatPage), frame, newChat);
            }
        }
        // Filter and Sort
        // Called from code-behind when filter or sort options change
        public void SetFilter(ChatFilterOption filter)
        {
            _currentFilter = filter;
            ApplyFilterAndSort();
        }

        public void SetSort(bool descending)
        {
            _sortDescending = descending;
            ApplyFilterAndSort();
        }
        // Method that applies the current filter and sort settings to _allChats and updates FilteredChats
        private void ApplyFilterAndSort()
        {
            // Step 1: Filter based on the 3 options in "ChatFilterOption"
            IEnumerable<Chat> result = _currentFilter switch
            {
                ChatFilterOption.LinkedToCase => _allChats.Where(ch => ch.CaseId != 0),
                ChatFilterOption.ChatsWithoutCase => _allChats.Where(ch => ch.CaseId == 0),
                _ => _allChats
            };

            // Step 2: Sort
            if (_sortDescending)
                result = result.OrderByDescending(ch => ch.CreatedAt);
            else
                result = result.OrderBy(ch => ch.CreatedAt);

            // Step 3: Creates a collection of chats and notify UI to update filter and sort label
            FilteredChats = new ObservableCollection<Chat>(result);
            OnPropertyChanged(nameof(ActiveSort)); 
            OnPropertyChanged(nameof(ActiveFilter));
            OnPropertyChanged(nameof(IsChatsEmpty));
        }

        // Delete and Rename chats
        public async Task DeleteChatAsync(Chat chat)
        {
            bool success = await _dataService.DeleteChatByIdAsync(chat.ChatId);
            if (success)
            {
                FilteredChats.Remove(chat);
            }
        }

        public async Task SaveRenameChatAsync(Chat chat, string newTitle)
        {
            var oldTitle = chat.Title;
            chat.Title = newTitle;

            bool success = await _dataService.UpdateChat(chat);
            if (!success)
            {
                chat.Title = oldTitle;
            }

            await Task.CompletedTask;
        }
    }
}