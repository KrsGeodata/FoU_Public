using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Navigation;

// <Purpose>
// This ViewModel is responsible for managing the data and logic for the DashboardPage.
// </Purpose>
// Uses the ViewNavigationService for navigation

namespace LocalLLMApp.ViewModels
{
    public partial class DashboardViewModel : ObservableObject
    {

        private readonly ViewNavigationService _viewNavService;
        private readonly DataService _dataService;

        // The max amount of objects in each ObserVableCollection
        private const int MaxRecentItems = 5;
        public ObservableCollection<NavigationViewItem> OpenCases { get; } = new();

        public ObservableCollection<NavigationViewItem> RecentChats { get; } = new();

        // Constructor initializing the navigation commands
        public DashboardViewModel()
        {
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            _dataService = Ioc.Default.GetRequiredService<DataService>();
        }

        // Navigate to a page based on the provided tag
        // Is set up with individual function calls for each page type instead
        // of a dynamic function that takes the tag as a parameter. This is done
        // to ensure both type safety and to be able to add extra logic to the
        // navigation process for each page type if necessary in the future.
        public void NavigateToBasedOnTag(Type pageType, Frame frame, object parameter = null)
        {
            Debug.WriteLine($"This is NavigationToBasedOnTag: {pageType}, {frame}, {parameter}");
            
            
            //var pageType = Type.GetType(tag);
            //if (pageType != null && frame.CurrentSourcePageType != pageType) - Old implementation
            if (pageType != null) // Without check for != pageType allows for refresh of the same page
            {
                switch(pageType) 
                { 
                    case Type t when t == typeof(CasePage):
                        NavigateToCase(frame, parameter);
                        break;
                    case Type t when t == typeof(CaseOverviewPage):
                        NavigateToCaseOverview(frame, parameter);
                        break;
                    case Type t when t == typeof(ChatOverviewPage):
                        NavigateToChatOverview(frame, parameter);
                        break;
                    case Type t when t == typeof(ChatPage):
                        NavigateToChat(frame, parameter);
                        break;
                    case Type t when t == typeof(CreateCasePage):
                        NavigateToCreateCase(frame, parameter);
                        break;
                    case Type t when t == typeof(DashboardPage):
                        NavigateToDashboard(frame, parameter);
                        break;
                    case Type t when t == typeof(LoginPage):
                        LogOut(frame);
                        break;
                    case Type t when t == typeof(ProfilePage):
                        NavigateToProfile(frame, parameter);
                        break;
                    case Type t when t == typeof(SettingsPage):
                        NavigateToSettings(frame, parameter);
                        break;
                }
            }
        }

        public void AddCase(Case c)
        {
            var newCase = CreateNavigationViewItemForCase(c);

            TrackAndReorderItem(c);
        }

        public void AddChat(Chat c) 
        {
            var chat = CreateNavigationViewItemForChat(c);

            TrackAndReorderItem(c);
        }

        // Loads up to 5 active cases from DataService and adds them to the sidebar
        public void LoadCasesIntoSidebar()
        {
            var cases = _dataService.GetCases();
            if (cases is null) return;
            foreach (var c in cases.Where(c => c.Status == CaseStatus.Active))
                AddCase(c);
        }

        // Loads up to 5 chats from DataService and addes them to the sidebar
        public void LoadChatsIntoSideBar() 
        {
            var chats = _dataService.GetChats();
            if (chats is null) return;
            foreach (var c in chats)
                AddChat(c);
        }

        // Calls AddOrMoveToTopOrRemove with the correct parameters
        public void TrackAndReorderItem<T>(T target) where T : class 
        { 
            if (target is Case c) 
            {
                AddOrMoveToTopOrRemove(OpenCases, c, CreateNavigationViewItemForCase);
            }
            else if (target is Chat chat) 
            {
                AddOrMoveToTopOrRemove(RecentChats, chat, CreateNavigationViewItemForChat);
            }
        }

        // Takes an ObservableCollection, an object and a create function and updates the ObservableCollections accordingly
        private void AddOrMoveToTopOrRemove<T>(ObservableCollection<NavigationViewItem> collection, T target,
            Func<T, NavigationViewItem> createItem) where T : class
        {
            // Check if the item already exists in the collection by comparing Tags
            NavigationViewItem? existingItem = collection
                .FirstOrDefault(navViewItem => navViewItem.Tag is T tagItem && tagItem.Equals(target));
            
            if (existingItem != null)
            {
                if (target is Case c && c.Status == CaseStatus.Archived) 
                {
                    // Item is Archived and should be removed from the sidebar
                    collection.Remove(existingItem);
                } 
                else 
                {
                    // Item already exists — move it to the top without adding a duplicate
                    collection.Remove(existingItem);
                    collection.Insert(0, existingItem);
                }
            }
            else
            {
                // If the item is an archived case, don't add it to the sidebar
                if (target is Case c && c.Status == CaseStatus.Archived) 
                {
                    return;
                }
                else 
                {
                    // Item is new — create a NavigationViewItem for it and insert at the top
                    NavigationViewItem newItem = createItem(target);
                    collection.Insert(0, newItem);

                    // If we now exceed the limit, remove the oldest item at the bottom
                    if (collection.Count > MaxRecentItems)
                        collection.RemoveAt(collection.Count - 1);
                }
            }
        }

        // Create a new NavigationViewItem with a Case as a Tag
        private NavigationViewItem CreateNavigationViewItemForCase(Case c) 
        {
            var caseNavItem = new NavigationViewItem
            {
                Content = c.Title,
                Tag = c,
                Icon = new FontIcon { Glyph = "\uF12B" }
            };

            ToolTipService.SetToolTip(caseNavItem, c.Description);

            return caseNavItem;
        }

        // Create a new NavigationViewItem with a Chat as a Tag
        private NavigationViewItem CreateNavigationViewItemForChat(Chat chat) 
        {
            var chatNavItem = new NavigationViewItem
            {
                Content = chat.Title,
                Icon = new FontIcon { Glyph = "\uE8BD" },
                Tag = chat
            };

            ToolTipService.SetToolTip(chatNavItem, chat.Description);

            return chatNavItem;
        }


        /*
         *  Navigation Functions
         */

        // Navigates to CasePage
        private void NavigateToCase(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(CasePage), _frame, parameter);
        }

        // Navigates to CaseOverviewPage
        private void NavigateToCaseOverview(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(CaseOverviewPage), _frame, parameter);
        }

        // Navigates to ChatOverviewPage
        private void NavigateToChatOverview(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(ChatOverviewPage), _frame, parameter);
        }

        // Navigates to ChatPage
        private void NavigateToChat(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(ChatPage), _frame, parameter);
        }

        // Navigates to CreateCasePage
        private void NavigateToCreateCase(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(CreateCasePage), _frame, parameter);
        }

        // Navigates to DashboardPage
        private void NavigateToDashboard(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(DashboardPage), _frame, parameter);
        }

        // Navigates to LoginPage after clearing the DataService
        private void LogOut(Frame frame)
        {
            _viewNavService.ClearRegisteredFrame();
            _dataService.ClearAllData();

            if (frame.CanGoBack) 
            {
                frame.BackStack.Clear();
            }

            _viewNavService.NavigateTo(typeof(LoginPage), App.Current.rootFrame);
        }

        // Navigates to ProfilePage
        private void NavigateToProfile(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(ProfilePage), _frame, parameter);
        }

        // Navigates to SettingsPage
        private void NavigateToSettings(Frame _frame, object parameter = null)
        {
            _viewNavService.NavigateTo(typeof(SettingsPage), _frame, parameter);
        }

        /*******************************************************/
        /***   Sidebar handlers methods                      ***/
        /*******************************************************/

        /// Handles renaming a case.
        public async Task HandleCaseRename(Case caseToRename, string newName)
        {
            await _dataService.UpdateCase(caseToRename);
        }

        /// Handles renaming a chat.
        public async Task HandleChatRename(Chat chatToRename, string newName)
        {
            await _dataService.UpdateChat(chatToRename);
        }

        /// Handles deleting a chat.
        public async Task HandleChatDelete(Chat chatToDelete)
        {
            await _dataService.DeleteChatByIdAsync(chatToDelete.ChatId);
        }
    }
}
