using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;


// <Purpose>
// Code-behind for ChatOverviewPage.xaml.
// Handles UI events and delegates to ChatOverviewPageViewModel.
// Contains no business logic.
// </Purpose>

namespace LocalLLMApp.Views
{
    public sealed partial class ChatOverviewPage : Page
    {
        public ChatOverviewPageViewModel ViewModel { get; }
        private readonly ViewNavigationService _viewNavService;

        public ChatOverviewPage()
        {
            ViewModel = new ChatOverviewPageViewModel();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            InitializeComponent();
        }

        // Loads chats when page is navigated to
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            ViewModel.LoadChats();
        }


        // Navigates to CreateChatPage when "Ny samtale" is clicked
        private void NewChatButton_Click(object sender, RoutedEventArgs e)
        {
            ViewModel.CreateChat(Frame);

        }

        // Called when a filter RadioButton is selected
        private void FilterRadioButton_Checked(object sender, RoutedEventArgs e)
        {
            if (sender is RadioButton rb && rb.Tag is string tag)
            {
                var filter = tag switch
                {
                    "LinkedToCase" => ChatFilterOption.LinkedToCase,
                    "ChatsWithoutCase" => ChatFilterOption.ChatsWithoutCase,
                    _ => ChatFilterOption.All
                };

                ViewModel.SetFilter(filter);
            }
        }


        // Called when a sort ToggleSplitButton option is selected
        private void SortAscending_Click(object sender, RoutedEventArgs e)
        {
            ViewModel.SetSort(descending: false);
        }

        private void SortDescending_Click(object sender, RoutedEventArgs e)
        {
            ViewModel.SetSort(descending: true);
        }


        // Called when a chat item is clicked — navigates to ChatPage with selected chat
        private void ChatListControl_ChatItemClicked(object sender, Chat selectedChat)
        {
            _viewNavService.NavigateTo(typeof(ChatPage), Frame, selectedChat);
        }

        // Handlers for chat item actions

        // Called when the user requests to rename a chat — delegates to ViewModel
        private async void ChatListControl_RenameChatRequested(object sender, Chat chat)
        {
            var textBox = new TextBox
            {
                Text = chat.Title,
                PlaceholderText = "Skriv inn nytt navn",
                MaxWidth = 400,              
                TextWrapping = TextWrapping.Wrap
            };

            var dialog = new ContentDialog
            {
                Title = "Gi nytt navn",
                Content = textBox,
                PrimaryButtonText = "Lagre",
                CloseButtonText = "Avbryt",
                XamlRoot = this.XamlRoot
            };

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary)
            {
                await ViewModel.SaveRenameChatAsync(chat, textBox.Text);
            }
        }

        // Called when the user requests to delete a chat — delegates to ViewModel
        private async void ChatListControl_DeleteChatRequested(object sender, Chat chat)
        {
            var dialog = new ContentDialog
            {
                Title = "Er du sikker?",
                Content = new TextBlock
                {
                    Text = $"Vil du slette samtalen '{chat.Title}'? Denne handlingen kan ikke angres.",
                    TextWrapping = TextWrapping.Wrap,
                    MaxWidth = 350
                },
                PrimaryButtonText = "Slett",
                CloseButtonText = "Avbryt",
                DefaultButton = ContentDialogButton.Close,
                XamlRoot = this.XamlRoot
            };

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary)
            {
                await ViewModel.DeleteChatAsync(chat);
            }
        }
    }
}