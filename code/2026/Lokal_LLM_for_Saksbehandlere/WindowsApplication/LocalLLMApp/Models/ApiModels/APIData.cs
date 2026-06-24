using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// <Purpose>
// A general structure for the data we want to receive from API calls
// </Purpose>

namespace LocalLLMApp.Models.ApiModels
{
    public class APIData
    {
        public User? User { get; set; } = new();
        public List<Case>? Cases { get; set; } = new();
        public List<Chat>? Chats { get; set; } = new();
        public List<ChatMessage>? Messages { get; set; } = new();
        public List<FilesInfo>? Files { get; set; } = new();
    }
}
