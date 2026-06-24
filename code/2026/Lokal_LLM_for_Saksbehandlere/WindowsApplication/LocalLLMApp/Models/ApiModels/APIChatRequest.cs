using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LocalLLMApp.Models.ApiModels
{
    public class APIChatRequest
    {
        public ChatMessage chat_message { get; set; } = new();
        public int user_id { get; set; } = 0;
        public int chat_id { get; set; } = 0;
        public int? case_id { get; set; } = null;
    }
}
