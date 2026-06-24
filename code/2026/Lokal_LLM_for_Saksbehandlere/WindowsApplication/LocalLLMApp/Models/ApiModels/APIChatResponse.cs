using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LocalLLMApp.Models;

namespace LocalLLMApp.Models.ApiModels
{
    public class APIChatResponse
    {
        public ChatMessage? UserMessage { get; set; } = null;
        public ChatMessage? AIResponse { get; set; } = null;
        public List<FilesInfo>? FilesInfos { get; set; } = null;

    }
}
