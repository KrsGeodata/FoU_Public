using LocalLLMApp.Models;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using Windows.Storage;

// Code-behind for CasePage.xaml view.
// Handles UI events and delegates business logic to CasePageViewModel.

namespace LocalLLMApp.Views
{
    public sealed partial class CasePage : Page
    {
        public CasePageViewModel ViewModel { get; }

        public CasePage()
        {
            ViewModel = new CasePageViewModel();
            InitializeComponent();
        }

        // Event handler for single file removal from case files
        private async void FileListControl_FileRemoved(object sender, FilesInfo fileName)
        {
             await ViewModel.RemoveSingleFileAsync(fileName);
        }

        // Event handler for multiple file removal from case files
        private void FileListControl_FilesRemoved(object sender, IEnumerable<FilesInfo> fileNames)
        {
            ViewModel.RemoveMultipleFiles(fileNames);
        }

        // Removes attachment from pending chat attachments when X button clicked
        private void ChatInputControl_AttachmentRemoved(object sender, string fileName)
        {
            var fileToRemove = ViewModel.PendingChatAttachments.FirstOrDefault(f => f.FileName == fileName);
            if (fileToRemove != null)
                ViewModel.PendingChatAttachments.Remove(fileToRemove);
        }

        // Opens file picker and adds selected files to pending chat attachments
        private async void ChatInputControl_AddFilesRequested(object sender, EventArgs e)
        {
            var files = await FileDropControl.PickFilesAsync();
            if (files is not null && files.Length > 0)
                ViewModel.AddFilesToPendingChatAttachments(files);
        }

        // Loads case data when navigating to this page
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            if (e.Parameter is Case selectedCase)
            {
                ViewModel.LoadCase(selectedCase);
            }
        }

        // Navigates to ChatPage when chat item is clicked
        private void ChatListControl_ChatItemClicked(object sender, Chat selectedChat)
        {
            ViewModel.NavigateToChat(selectedChat, Frame);
        }

        // Creates new chat and navigates to it when send button clicked
        private void ChatInputControl_SendRequested(object sender, EventArgs e)
        {
            ViewModel.CreateChatAndNavigate(Frame);
        }

        // Shows confirmation dialog and deletes chat if confirmed
        private async void DeleteChatMenuFlyoutItem_Clicked(object sender, Chat deleteChat)
        {
            var dialog = new ContentDialog
            {
                Title = "Er du sikker?",
                Content = new TextBlock
                {
                    Text = $"Vil du slette samtalen '{deleteChat.Title}'? Denne handlingen kan ikke angres.",
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
                await ViewModel.DeleteChatAsync(deleteChat);
            }
        }

        // Shows dialog to rename chat
        private async void ChatListControl_RenameChatRequested(object sender, Chat renameChat)
        {
            var textBox = new TextBox
            {
                Text = renameChat.Title,
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
                await ViewModel.SaveRenameChatAsync(renameChat, textBox.Text);
            }
        }

        // Adds files to case files (right panel) when dropped or picked
        private void FileDragAndDropControl_FilesAdded(object sender, StorageFile[] files)
        {
            ViewModel.AddCaseFiles(files);
        }
    }
}