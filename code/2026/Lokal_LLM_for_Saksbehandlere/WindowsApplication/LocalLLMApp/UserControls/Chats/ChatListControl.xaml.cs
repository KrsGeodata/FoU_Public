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
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using LocalLLMApp.Models;

// Code-behind for ChatListControl
// UserControl that displays a list of chats and handles user interactions (clicking on a chat or requesting to delete a chat)
// It defines dependency properties for the chat list
// and empty state, and raises events to notify the parent page of user actions

namespace LocalLLMApp.UserControls.Chats
{
    public sealed partial class ChatListControl : UserControl
    {
        // Dependency Properties 

        // List of chats
        public static readonly DependencyProperty ItemsProperty =
            DependencyProperty.Register(nameof(Items), typeof(ObservableCollection<Chat>),
                typeof(ChatListControl), new PropertyMetadata(null));

        // Indicates whether the chat list is empty (UI)
        public static readonly DependencyProperty IsEmptyProperty =
            DependencyProperty.Register(
                nameof(IsEmpty),
                typeof(bool),
                typeof(ChatListControl),
                new PropertyMetadata(false));



        // Public Properties

        // Chat list bound from parent page
        public ObservableCollection<Chat> Items
        {
            get => (ObservableCollection<Chat>)GetValue(ItemsProperty);
            set => SetValue(ItemsProperty, value);
        }

        // Controls empty state visibility, set from parent ViewModel
        public bool IsEmpty
        {
            get => (bool)GetValue(IsEmptyProperty);
            set => SetValue(IsEmptyProperty, value);
        }


        // Constructor 
        public ChatListControl()
        {
            InitializeComponent();
        }


        // Events 
        public event EventHandler<Chat>? DeleteChatRequested;
        public event EventHandler<Chat>? ChatItemClicked;
        public event EventHandler<Chat>? RenameChatRequested;


        //  Event Handlers 

        // Raises ChatItemClicked when a chat is clicked
        private void ChatListView_ItemClick (object sender, ItemClickEventArgs e) 
        {
            if (e.ClickedItem is Chat clickedChat)
            {
                ChatItemClicked?.Invoke(this, clickedChat);
            }
        }

        // Raises DeleteChatRequested when delete is selected from flyout
        private void DeleteChatMenuFlyoutItem_Click(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.DataContext is Chat clickedChat)
            {
                DeleteChatRequested?.Invoke(this, clickedChat);
                return;
            }

            if (sender is FrameworkElement fe && fe.DataContext is Chat clickedChatFromFE)
            {
                DeleteChatRequested?.Invoke(this, clickedChatFromFE);
            }
        }

        // Raises RenameChatRequested when rename is selected from flyout
        private void RenameChatMenuFlyoutItem_Click(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.DataContext is Chat clickedChat)
            {
                RenameChatRequested?.Invoke(this, clickedChat);
                return;
            }

            if (sender is FrameworkElement fe && fe.DataContext is Chat clickedChatFromFE)
            {
                RenameChatRequested?.Invoke(this, clickedChatFromFE);
            }
        }
    }
}
