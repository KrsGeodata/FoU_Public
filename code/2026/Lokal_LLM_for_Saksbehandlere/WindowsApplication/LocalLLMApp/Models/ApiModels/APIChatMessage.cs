using Microsoft.UI.Xaml;
using System;
using System.Windows.Documents;
using System.Collections.Generic;

// <Purpose>
// Defines a model for a chat message used in API requests
// </Purpose>

namespace LocalLLMApp.Models.ApiModels
{
    public class APIChatMessage
    {
        public int? ChatId { get; set; }

        // The text content of the chat message
        public string message { get; set; } = string.Empty;

        public bool IsUserMessage { get; set; } = true;

        public int? chat_id { get; set; }

        public int? case_id { get; set; }
    }
}
