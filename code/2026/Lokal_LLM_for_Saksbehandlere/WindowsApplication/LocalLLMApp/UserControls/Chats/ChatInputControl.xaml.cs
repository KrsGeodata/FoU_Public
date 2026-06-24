using LocalLLMApp.Models;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Windows.Input;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.System;

// To learn more about WinUI, the WinUI project structure,
// and more about our project templates, see: http://aka.ms/winui-project-info.

namespace LocalLLMApp.UserControls.Chats
{
    public sealed partial class ChatInputControl : UserControl
    {
        public ChatInputControl()
        {
            InitializeComponent();
        }

        public static readonly DependencyProperty MessageInputProperty =
            DependencyProperty.Register(nameof(MessageInput), typeof(string),
                typeof(ChatInputControl), new PropertyMetadata(string.Empty));

        public string MessageInput
        {
            get => (string)GetValue(MessageInputProperty);
            set => SetValue(MessageInputProperty, value);
        }

        public static readonly DependencyProperty SendCommandProperty =
            DependencyProperty.Register(nameof(SendCommand), typeof(ICommand),
                typeof(ChatInputControl), new PropertyMetadata(null));

        // Dependency property for PlaceholderText, includes a default value for Chatpage to use
        public static readonly DependencyProperty PlaceholderTextProperty =
            DependencyProperty.Register(
                nameof(PlaceholderText),
                typeof(string),
                typeof(ChatInputControl),
                new PropertyMetadata("Skriv en melding..."));

        // Allows getting and setting the placeholder text for the input box
        public string PlaceholderText
        {
            get => (string)GetValue(PlaceholderTextProperty);
            set => SetValue(PlaceholderTextProperty, value);
        }

        public static readonly DependencyProperty AttachmentsProperty =
            DependencyProperty.Register(
                nameof(Attachments),
                typeof(object),
                typeof(ChatInputControl),
                new PropertyMetadata(null));

        public object Attachments
        {
            get => GetValue(AttachmentsProperty);
            set => SetValue(AttachmentsProperty, value);
        }

        public event EventHandler<string>? AttachmentRemoved;

        private void AttachmentPills_RemoveRequested(object sender, string fileName)
        {
            AttachmentRemoved?.Invoke(this, fileName);
        }

        // Dependency property that accepts an ICommand from the parent page via XAML binding
        // Enables CanExecute, the send button is automatically disabled when the command cannot execute
        public ICommand SendCommand
        {
            get => (ICommand)GetValue(SendCommandProperty);
            set => SetValue(SendCommandProperty, value);
        }

        // This Event is raised when the user press send, CasePage uses it to create a new Chat 
        public event EventHandler? SendRequested;

        // Fires both SendRequested and executes SendCommand because the control
        // needs to support both creating a new chat (handled by CasePage) and sending a message in an existing chat (handled by ChatPage)
        private void SendButton_Click(object sender, RoutedEventArgs e)
        {
            SendRequested?.Invoke(this, EventArgs.Empty);
            if (SendCommand?.CanExecute(null) == true)
                SendCommand.Execute(null);
        }

        // Same dual-trigger logic as SendButton_Click, applied to Enter key press
        private void SendOnEnter(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                SendRequested?.Invoke(this, EventArgs.Empty);
                if (SendCommand?.CanExecute(null) == true)
                    SendCommand.Execute(null);
                e.Handled = true;
            }
        }

        // This Event is raised when the user clicks the "Legg til filer" button
        public event EventHandler? AddFilesRequested;

        private void AddFilesMenuItem_Click(object sender, RoutedEventArgs e)
        {
            AddFilesRequested?.Invoke(this, EventArgs.Empty);
        }

        public event EventHandler? ClearAllRequested;
        private void AttachmentPills_ClearAllRequested(object sender, EventArgs e)
        {
            ClearAllRequested?.Invoke(this, EventArgs.Empty);
        }

        // Raised when the user clicks an attachment pill to open the file.
        // TODO: no page currently handles this event
        public event EventHandler<string>? AttachmentOpenRequested;



        private void AttachmentPills_OpenRequested(object sender, string fileName)
        {
            AttachmentOpenRequested?.Invoke(this, fileName);
        }
    }
}
