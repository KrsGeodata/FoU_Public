using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Runtime.CompilerServices;

// <Purpose>
// Defines a model for a chat message in the application
// </Purpose>
namespace LocalLLMApp.Models
{
    public class ChatMessage //: INotifyPropertyChanged
    {
        //public event PropertyChangedEventHandler? PropertyChanged;
        // The text content of the chat message
        public int ChatMessageId { get; set; } = 0;
        public int ChatId { get; set; } = 0;
        public string MessageText { get; set; } = string.Empty;

        // Indicates if the message is from the user (true) or the system (false)
        public bool IsUserMessage { get; set; }

        public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

        // Changes alignment based on whether the message is from user or system (left: system, right: user)
        [System.Text.Json.Serialization.JsonIgnore]
        public HorizontalAlignment Alignment => 
            IsUserMessage ? HorizontalAlignment.Right : HorizontalAlignment.Left;

        // must convert from object to collection in order to use CollectionChanged event for UI updates when attachments are added/removed
        [System.Text.Json.Serialization.JsonIgnore]
        public System.Collections.ObjectModel.ObservableCollection<FilesInfo> Attachments { get; set; }
                = new System.Collections.ObjectModel.ObservableCollection<FilesInfo>();
    }
}
