using LocalLLMApp.Models;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System.Collections.ObjectModel;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;

// The code behind endables building the visual layout of the usercontrol

namespace LocalLLMApp.UserControls.Chats
{
    public sealed partial class ChatMessageControl : UserControl
    {
        public ChatMessageControl()
        {
            InitializeComponent();
        }
        // Dependency properties for the ChatMessageControl, allowing data binding from the view model
        // MessageText
        public static readonly DependencyProperty MessageTextProperty =
            DependencyProperty.Register(nameof(MessageText), typeof(string),
                typeof(ChatMessageControl), new PropertyMetadata(string.Empty));

        public string MessageText
        {
            get => (string)GetValue(MessageTextProperty);
            set => SetValue(MessageTextProperty, value);
        }

        // Alignment
        public static readonly DependencyProperty AlignmentProperty =
            DependencyProperty.Register(nameof(Alignment), typeof(HorizontalAlignment),
                typeof(ChatMessageControl), new PropertyMetadata(HorizontalAlignment.Left));

        public HorizontalAlignment Alignment
        {
            get => (HorizontalAlignment)GetValue(AlignmentProperty);
            set => SetValue(AlignmentProperty, value);
        }

        // Attachments
        public static readonly DependencyProperty AttachmentsProperty =
            DependencyProperty.Register(
                nameof(Attachments),
                typeof(object), 
                typeof(ChatMessageControl),
                new PropertyMetadata(null));

        public object Attachments
        {
            get => GetValue(AttachmentsProperty);
            set => SetValue(AttachmentsProperty, value);
        }

        // Created At 
        public static readonly DependencyProperty CreatedAtProperty = 
            DependencyProperty.Register(nameof(CreatedAt), typeof(string),
                typeof(ChatMessageControl), new PropertyMetadata(string.Empty));

        public string CreatedAt
        {
            get => (string)GetValue(CreatedAtProperty); 
            set => SetValue(CreatedAtProperty, value); 
        }
    }
}