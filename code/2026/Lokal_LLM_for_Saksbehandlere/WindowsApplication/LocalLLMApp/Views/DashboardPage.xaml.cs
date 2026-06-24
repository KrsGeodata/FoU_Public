using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.ViewModels;
using MessagePack;
using Microsoft.UI;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Reflection.Metadata;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows.Automation;
using System.Xml.Linq;
using Windows.ApplicationModel.Chat;
using static CommunityToolkit.WinUI.Animations.Expressions.ExpressionValues;



// <Purpose>
// This is the code-behind for the DashboardPage.xaml view.
// It is responsible for handling events and interactions on the DashboardPage,
// should only contain logic for interacting with the UI elements defined in the XAML file,
// and should not contain any business logic or data manipulation (which should be handled in the ViewModel).
// </Purpose>

namespace LocalLLMApp.Views
{
    public sealed partial class DashboardPage : Page
    {
        // ViewModel instance for the DashboardPage, used for data binding in the XAML view
        private readonly DashboardViewModel _dashboardViewModel = new();

        private readonly ViewNavigationService _viewNavService;
        private readonly DataService _dataService;

        // Ensures that programmatic navigation and Clicking the NavView don't create a loop
        private bool _isSyncingSelection = false;

        // Used to reference the ObservableCollections in the ViewModel
        private Dictionary<NavigationViewItem, ObservableCollection<NavigationViewItem>> _menuMap = new();

        // Constructor, initializes the page
        public DashboardPage()
        {
            InitializeComponent();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            _dataService = Ioc.Default.GetRequiredService<DataService>();

            SetNavViewPaneHeaderImage();

            // Subscribes to collection changes for dynamic context menu attachment
            // When cases/chats are added to sidebar, context menus are automatically attached
            ViewModel.OpenCases.CollectionChanged += OnCasesAddedToSidebar;
            ViewModel.RecentChats.CollectionChanged += OnChatsAddedToSidebar;


            _viewNavService.NavigationChanged += (sender, e) => SyncNavViewSelection(e.PageType, e.SentObject);

            _viewNavService.RegisterFrame(DashboardFrame);
        }

        // Expose the DashboardFrame to allow navigation to other pages within the dashboard
        public Frame getFrame() => DashboardFrame;

        // Called when the page is navigated to
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            DashboardFrame.Navigate(typeof(CaseOverviewPage));

            ViewModel.LoadCasesIntoSidebar();
            ViewModel.LoadChatsIntoSideBar();

            // Update the Selected Sidebar item to correspond to the page initially loaded to
            // Is hardcoded because why not. It is easier to do
            _isSyncingSelection = true;
            SidebarNavigationView.SelectedItem = SidebarNavigationView.MenuItems
                             .OfType<NavigationViewItem>()
                             .FirstOrDefault(item => item.Tag is string tag && tag == "LocalLLMApp.Views.CaseOverviewPage");
            _isSyncingSelection = false;

            // Reference the ObservableCollections in the ViewModel
            _menuMap = new()
            {
                { OpenCasesItem,   ViewModel.OpenCases   },
                { RecentChatsItem, ViewModel.RecentChats },
            };
        }

        // Sets an image in the PaneHeader decided by an EnvironmentViariable
        private void SetNavViewPaneHeaderImage() 
        {
            string? relativePath = Environment.GetEnvironmentVariable("NAVIGATION_VIEW_PANE_HEADER_IMAGE");

            if (string.IsNullOrEmpty(relativePath))
                return;

            string absolutePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, relativePath));

            if (!File.Exists(absolutePath)) 
                return;

            PaneHeaderImage.Source = new BitmapImage(new Uri(absolutePath));
        }

        // Takes an object and looks for it in the _menuMap to set it as the
        // SelectedItem in the NavigationView
        private async Task<bool> FocusItemAsync<T>(T target) where T : class 
        {
            // If the target is null return false
            if (target == null)
                return false;

            ViewModel.TrackAndReorderItem(target);

            // Holds results for search through the menu colelction
            NavigationViewItem? matchedOwnerGroup = null;
            NavigationViewItem? matchedNavViewItem = null;

            // Try to match Tag with target
            foreach (var (groupNavViewItem, itemCollection) in _menuMap) 
            {
                // Search this group's collection for an item whose Tag matches the target.
                NavigationViewItem? foundItem = itemCollection
                    .Cast<NavigationViewItem>()
                    .FirstOrDefault(navViewItem => TagMatches(navViewItem, target));

                // If found, store both group and item, then break
                if (foundItem != null)
                {
                    matchedOwnerGroup = groupNavViewItem;
                    matchedNavViewItem = foundItem;
                    break;
                }
            }

            // No match — don't touch any UI state at all
            if (matchedOwnerGroup == null || matchedNavViewItem == null) 
                return false;

            // Sets the object that was navigated to 
            //ViewModel.ReorderItems(target);

            // Collapse all groups except the matched one
            foreach (var (groupNavViewItem, _) in _menuMap)
                groupNavViewItem.IsExpanded = groupNavViewItem == matchedOwnerGroup;

            // Lets us await a non-async event, since WinUI generates the child containers asynchronously.
            // We need to wait for the layout to finish before access of the container
            var layoutCompletionSource = new TaskCompletionSource<bool>();

            void OnLayoutUpdated(object? sender, object eventArgs) 
            {
                layoutCompletionSource.TrySetResult(true);
                matchedOwnerGroup.LayoutUpdated -= OnLayoutUpdated;
            }

            matchedOwnerGroup.LayoutUpdated += OnLayoutUpdated;

            // Wait here until the LayoutUpdated event fires
            await layoutCompletionSource.Task;

            // Retrieve the realized container for the item
            NavigationViewItem? realizedContainer = SidebarNavigationView.ContainerFromMenuItem(matchedNavViewItem) as NavigationViewItem
                ?? matchedNavViewItem;

            SidebarNavigationView.SelectedItem = realizedContainer;
            return true;
        }

        // Check if the object set as tags in the ObservableCollections matches an
        // object that has been navigated to.
        private static bool TagMatches<T>(NavigationViewItem navViewItem, T target) where T : class
        {
            if (navViewItem.Tag is not T tagItem) return false;

            return tagItem switch
            {
                Case c when target is Case ct => c.CaseId == ct.CaseId,
                Chat ch when target is Chat cht => ch.ChatId == cht.ChatId,
                _ => ReferenceEquals(tagItem, target)
            };
        }

        // Sync the NavigationView so that it shows you are on the correct page
        private async void SyncNavViewSelection(Type pageType, object sentObject = null) 
        {
            _isSyncingSelection = true;
            try 
            {
                // With this corrected block:
                var checkObject = sentObject;
                if (sentObject is object[] arr && arr.Length > 0)
                {
                    checkObject = arr[0];
                }
                //var found = ViewModel.TestCases.FirstOrDefault(tc => tc.Tag.CaseId == sentObject.CaseId)
                bool itemWasFound = await FocusItemAsync(checkObject);

                if (!itemWasFound) 
                {
                    NavigationViewItem? matchedItem = null;

                    if (pageType is not null)
                    {
                        // Search the static MenuItems
                        matchedItem = SidebarNavigationView.MenuItems
                             .OfType<NavigationViewItem>()
                             .FirstOrDefault(item => item.Tag is string tag && tag == pageType.FullName);

                        // Also search footer items
                        matchedItem ??= SidebarNavigationView.FooterMenuItems
                            .OfType<NavigationViewItem>()
                            .FirstOrDefault(item => item.Tag is string tag && tag == pageType.FullName);
                    }

                    SidebarNavigationView.SelectedItem = null;

                    await Task.Yield();

                    // Set SelectedItem to matchedItem
                    SidebarNavigationView.SelectedItem = matchedItem;

                    foreach (var (groupNavigationViewItem, _) in _menuMap)
                        groupNavigationViewItem.IsExpanded = false;

                }
            }
            finally
            {
                _isSyncingSelection = false;
            }
        }


        // Sets the selected item to be matching the tag of the current open page
        // Currently only used by NavigationView_BackRequested
        private void DashboardFrame_Navigated(object sender, NavigationEventArgs e)
        {
            DashboardFrame.Navigated -= DashboardFrame_Navigated;

            if (e.Content != null)
            {
                SyncNavViewSelection(e.Content.GetType(), e.Parameter);
            }
        }


        // Event handler for when the back button is requested in the NavigationView
        private void NavigationView_BackRequested(NavigationView sender, NavigationViewBackRequestedEventArgs args)
        {
            if (DashboardFrame.CanGoBack) 
            {
                DashboardFrame.Navigated += DashboardFrame_Navigated;
                DashboardFrame.GoBack();
            }   
        }

        // Event handler for when the selection changes in the NavigationView
        // Fired by the user clicking a nav item
        private void NavigationView_SelectionChanged(
            Microsoft.UI.Xaml.Controls.NavigationView sender,
            Microsoft.UI.Xaml.Controls.NavigationViewSelectionChangedEventArgs args)
        {
            if (_isSyncingSelection) return; // Ignore programmatic changes
            if (args.SelectedItemContainer == null) return;

            // First get the Tag from Selected Element
            var tag = args.SelectedItemContainer.Tag;
            
            // Get the type and string of the tag for navigation
            var selectedType = args.SelectedItemContainer.Tag?.GetType();
            var tagString = tag.ToString();

            // Navigate based on contents of tag
            if (selectedType is null) 
            {
                return;
            } 
            else if (selectedType == typeof(Case))
            {
                //var pageType = Type.GetType("LocalLLMApp.Views.CasePage");
                var pageType = typeof(CasePage);
                _dashboardViewModel.NavigateToBasedOnTag(pageType, DashboardFrame, tag);
            } 
            else if (selectedType == typeof(Chat)) 
            {
                //var pageType = Type.GetType("LocalLLMApp.Views.ChatPage");
                var pageType = typeof(ChatPage);
                _dashboardViewModel.NavigateToBasedOnTag(pageType, DashboardFrame, tag);
            } 
            else if (!string.IsNullOrEmpty(tagString))
            {
                var pageType = !string.IsNullOrEmpty(tagString) ? Type.GetType(tagString) : null;
                if (pageType != null)
                {
                    _dashboardViewModel.NavigateToBasedOnTag(pageType, DashboardFrame);
                }
            }
        }

        
        // Event handler for when the "New Chat" menu item is tapped

        private void NewChatMenuItem_Tapped(object sender, TappedRoutedEventArgs e)
        {
            _dashboardViewModel.NavigateToBasedOnTag(typeof(ChatPage), DashboardFrame);
        }
       

        // Adds a case as a sub-item under "Saker"
        private void AddCaseToSidebar(Case c)
        {
           _dashboardViewModel.AddCase(c);
        }
        
        // Adds a chat as a sub-item under "Nylige samtaler"
        private void AddChatToSidebar(Chat chat)
        {
            _dashboardViewModel.AddChat(chat);
        }


        /*******************************************************/
        /***  Right-click / Context menu for sidebar items   ***/
        /***   Attaches context menus when items are added   ***/
        /*******************************************************/

        /// Event handler called when new cases are added to the sidebar
        /// Attaches a context menu (right-click menu) to each new case item
        private void OnCasesAddedToSidebar(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems == null) return;

            foreach (NavigationViewItem sidebarItem in e.NewItems)
            {
                var contextMenu = new MenuFlyout();
                // Menu is built dynamically when opened to reflect current case status
                contextMenu.Opening += (menuSender, menuArgs) =>
                    CreateCaseContextMenu(contextMenu, sidebarItem.Tag as Case);
                sidebarItem.ContextFlyout = contextMenu;
            }
        }

        /// Event handler called when new chats are added to the sidebar
        /// Attaches a context menu (right-click menu) to each new chat item
        private void OnChatsAddedToSidebar(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems == null) return;

            foreach (NavigationViewItem sidebarItem in e.NewItems)
            {
                var contextMenu = new MenuFlyout();
                // Menu is built dynamically when opened
                contextMenu.Opening += (menuSender, menuArgs) =>
                    CreateChatContextMenu(contextMenu, sidebarItem.Tag as Chat);
                sidebarItem.ContextFlyout = contextMenu;
            }
        }

        /// Creates the context menu for a case sidebar item
        /// Menu options: "Gi nytt navn" and "Avslutt sak" / "Åpne sak"
        private void CreateCaseContextMenu(MenuFlyout menu, Case currentCase)
        {
            if (currentCase == null) return;

            menu.Items.Clear();

            // Menu option: Rename case
            var renameMenuItem = new MenuFlyoutItem
            {
                Text = "Gi nytt navn",
                Icon = new FontIcon { Glyph = "\uE8AC" },
                Tag = currentCase
            };
            renameMenuItem.Click += OnCaseRenameMenuItemClicked;

            // TODO: Enable menu option, toggle status (Close/Open case)
            // Text changes based on current status
            //bool isCaseActive = currentCase.Status == CaseStatus.Active;
            //var toggleStatusMenuItem = new MenuFlyoutItem
            //{
            //    Text = isCaseActive ? "Avslutt sak" : "Åpne sak",
            //    Icon = new FontIcon { Glyph = isCaseActive ? "\uE7B8" : "\uE8DA" },
            //    Tag = currentCase
            //};
            //toggleStatusMenuItem.Click += OnCaseStatusToggleMenuItemClicked;

            menu.Items.Add(renameMenuItem);
            //menu.Items.Add(new MenuFlyoutSeparator());
            //menu.Items.Add(toggleStatusMenuItem);
        }

        /// Creates the context menu for a chat sidebar item.
        /// Menu options: "Gi nytt navn", "Slett samtale"
        private void CreateChatContextMenu(MenuFlyout menu, Chat currentChat)
        {
            if (currentChat == null) return;

            menu.Items.Clear();

            // Menu option: Rename chat
            var renameMenuItem = new MenuFlyoutItem
            {
                Text = "Gi nytt navn",
                Icon = new FontIcon { Glyph = "\uE8AC" },
                Tag = currentChat
            };
            renameMenuItem.Click += OnChatRenameMenuItemClicked;

            // Menu option: Delete chat (shown in red)
            var deleteMenuItem = new MenuFlyoutItem
            {
                Text = "Slett samtale",
                Icon = new FontIcon { Glyph = "\uE74D", Foreground = new SolidColorBrush(Colors.Red) },
                Foreground = new SolidColorBrush(Colors.Red),
                Tag = currentChat
            };
            deleteMenuItem.Click += OnChatDeleteMenuItemClicked;

            menu.Items.Add(renameMenuItem);
            menu.Items.Add(new MenuFlyoutSeparator());
            menu.Items.Add(deleteMenuItem);
        }

        /*********************************/
        /***    Menu Click Handlers    ***/
        /*********************************/

        /// Handles click on "Gi nytt navn" menu item for a case
        /// Opens rename dialog
        private async void OnCaseRenameMenuItemClicked(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.Tag is Case caseToRename)
            {
                await ShowRenameDialog(caseToRename);
            }
        }

        /// Handles click on "Gi nytt navn" menu item for a chat
        /// Opens rename dialog
        private async void OnChatRenameMenuItemClicked(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.Tag is Chat chatToRename)
            {
                await ShowRenameDialog(chatToRename);
            }
        }

        /// Handles click on "Slett samtale" menu item.
        /// Opens confirmation dialog.
        private async void OnChatDeleteMenuItemClicked(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.Tag is Chat chatToDelete)
            {
                await ShowDeleteChatDialog(chatToDelete);
            }
        }


        /// Handles click on "Avslutt sak" / "Åpne sak" menu item
        /// Delegates data handling to ViewModel
        //private async void OnCaseStatusToggleMenuItemClicked(object sender, RoutedEventArgs e)
        //{
        //    if (sender is MenuFlyoutItem menuItem && menuItem.Tag is Case caseToToggle)
        //    {
        //        // NOTE: Data handling delegated to ViewModel
        //        await ViewModel.HandleCaseStatusToggle(caseToToggle);
        //    }
        //}

        /*********************************/
        /***      ContentDialogs       ***/
        /***      UI Logic Only        ***/
        /*********************************/

        /// Made a generic rename dialog for both Case and Chat
        /// Returns new name if user confirms, null otherwise
        /// Validation is handled by ViewModel
        private async Task<string?> ShowRenameDialog(string currentName, string dialogTitle)
        {
            var textBox = new TextBox
            {
                Text = currentName,
                PlaceholderText = "Skriv inn nytt navn",
                SelectionStart = 0,
                SelectionLength = currentName.Length,
                MaxWidth = 400,            
                TextWrapping = TextWrapping.Wrap
            };

            var dialog = new ContentDialog
            {
                Title = dialogTitle,
                Content = textBox,
                PrimaryButtonText = "Lagre",
                CloseButtonText = "Avbryt",
                DefaultButton = ContentDialogButton.Primary,
                XamlRoot = this.XamlRoot
            };

            // Allow Enter key to submit
            textBox.KeyDown += (s, e) =>
            {
                if (e.Key == Windows.System.VirtualKey.Enter)
                    dialog.Hide();
            };

            if (await dialog.ShowAsync() == ContentDialogResult.Primary)
            {
                return textBox.Text.Trim();
            }

            return null;
        }

        /// Shows rename dialog for a case.
        /// REFACTORED: Now uses generic ShowRenameDialog helper.
        /// All validation delegated to ViewModel.
        private async Task ShowRenameDialog(Case currentCase)
        {
            string? newName = await ShowRenameDialog(currentCase.Title, "Gi nytt navn til sak");
            if (newName != null)
            {
                await ViewModel.HandleCaseRename(currentCase, newName);
            }
        }

        /// Shows rename dialog for a chat.
        /// REFACTORED: Now uses generic ShowRenameDialog helper.
        /// All validation delegated to ViewModel.
        private async Task ShowRenameDialog(Chat currentChat)
        {
            string? newName = await ShowRenameDialog(currentChat.Title, "Gi nytt navn til samtale");
            if (newName != null)
            {
                // NOTE: Validation and data handling delegated to ViewModel
                await ViewModel.HandleChatRename(currentChat, newName);
            }
        }

        /// Shows confirmation dialog for deleting a chat.
        /// Only handles UI - data deletion delegated to ViewModel.
        private async Task ShowDeleteChatDialog(Chat currentChat)
        {
            var dialog = new ContentDialog
            {
                Title = "Er du sikker?",
                Content = new TextBlock
                {
                    Text = $"Vil du slette samtalen '{currentChat.Title}'? Denne handlingen kan ikke angres.",
                    TextWrapping = TextWrapping.Wrap,
                    MaxWidth = 350
                },
                PrimaryButtonText = "Slett",
                CloseButtonText = "Avbryt",
                DefaultButton = ContentDialogButton.Close,
                XamlRoot = this.XamlRoot
            };

            if (await dialog.ShowAsync() == ContentDialogResult.Primary)
            {
                // NOTE: Data handling delegated to ViewModel
                await ViewModel.HandleChatDelete(currentChat);
            }
        }
    }
}