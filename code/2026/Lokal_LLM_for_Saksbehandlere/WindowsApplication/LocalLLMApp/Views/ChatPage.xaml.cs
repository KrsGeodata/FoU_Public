using LocalLLMApp.Models;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.Pickers;

// Code-behind for ChatPage.xaml view.
// Handles UI events and delegates business logic to ChatViewModel.

namespace LocalLLMApp.Views
{
    public sealed partial class ChatPage : Page
    {
        public ChatViewModel ViewModel { get; set; }

        // Used when navigating from CasePage after creating new chat with first message
        private Chat? _pendingChat;
        private ChatMessage? _pendingMessage;

        public ChatPage()
        {
            ViewModel = new ChatViewModel();
            this.InitializeComponent();
            this.Bindings.Update();
        }

        // Loads chat data when navigating to this page
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);

            if (e.Parameter is Chat selectedChat)
            {
                _pendingChat = selectedChat;
                ViewModel = new ChatViewModel(selectedChat);
                this.Bindings.Update();
            }
            else if (e.Parameter is object[] many)
            {
                var chat = many.OfType<Chat>().FirstOrDefault();
                var message = many.OfType<ChatMessage>().FirstOrDefault();

                if ((chat != null && chat is Chat) && (message != null && message is ChatMessage))
                {
                    _pendingChat = chat;
                    _pendingMessage = message;
                    ViewModel = new ChatViewModel(chat);
                    this.Bindings.Update();
                }
                else if (chat != null && chat is Chat)
                {
                    _pendingChat = chat;
                    ViewModel = new ChatViewModel(chat);
                    this.Bindings.Update();
                }
            }
        }

        // Handles first message LLM response when navigating from CasePage
        private async void ChatPage_Loaded(object sender, RoutedEventArgs e)
        {
            if (_pendingChat != null)
            {
                await ViewModel.LoadChat(_pendingChat);

                // If chat has exactly one message (first user message from CasePage), send to LLM
                if (ViewModel.Messages.Count == 0 && _pendingMessage is ChatMessage)
                {
                    await ViewModel.SendFirstMessageAsync(_pendingMessage);
                }
            }

            ScrollToBottom();
        }

        // Auto-scrolls to bottom when new messages are added
        private void MessageItemsControl_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            if (e.PreviousSize.Height < e.NewSize.Height)
            {
                ScrollToBottom();
            }
        }

        // Scrolls message view to bottom
        private void ScrollToBottom()
        {
            if (MessageScrollViewer != null)
            {
                MessageScrollViewer.ScrollTo(0, MessageScrollViewer.ScrollableHeight);
            }
        }

        // Opens file picker and adds selected files to pending attachments
        private async void ChatInputControl_AddFilesRequested(object sender, EventArgs e)
        {
            var picker = new FileOpenPicker();

            // Get window handle for file picker (WinUI 3 requirement)
            var contentIsland = this.XamlRoot.ContentIslandEnvironment;
            var windowId = contentIsland.AppWindowId;
            var hwnd = Microsoft.UI.Win32Interop.GetWindowFromWindowId(windowId);
            WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);

            picker.FileTypeFilter.Add("*");

            var files = await picker.PickMultipleFilesAsync();
            if (files != null && files.Count > 0)
            {
                ViewModel.AddFilesToPendingAttachments(files.ToArray());
            }
        }

        // Removes attachment from pending attachments when X button clicked
        private void ChatInputControl_AttachmentRemoved(object sender, string fileName)
        {
            var file = ViewModel.PendingAttachments.FirstOrDefault(f => f.FileName == fileName);
            if (file is not null)
                ViewModel.PendingAttachments.Remove(file);
        }

        // Clears all attachments when "Fjern alle" is clicked
        private void ChatInputControl_ClearAllRequested(object sender, EventArgs e)
        {
            ViewModel.PendingAttachments.Clear();
        }

        // Content Dialog for editing chat title
        private async void EditTitleButton_Click(object sender, RoutedEventArgs e)
        {
            // Create ContentDialog for editing title
            var dialog = new ContentDialog
            {
                Title = "Endre chat-tittel",
                PrimaryButtonText = "Lagre",
                CloseButtonText = "Avbryt",
                DefaultButton = ContentDialogButton.Primary,
                XamlRoot = this.XamlRoot
            };

            // TextBox for input
            var textBox = new TextBox
            {
                Text = ViewModel.CurrentChatTitle,
                PlaceholderText = "Skriv ny tittel...",
                SelectionStart = 0,
                MaxWidth = 400,
                TextWrapping = TextWrapping.Wrap,
                SelectionLength = ViewModel.CurrentChatTitle?.Length ?? 0
            };

            dialog.Content = textBox;

            // Show dialog
            var result = await dialog.ShowAsync();

            if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(textBox.Text))
            {
                await ViewModel.SaveRenameChatAsync(textBox.Text);
            }
        }               
    }
}