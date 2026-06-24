using CommunityToolkit.Mvvm.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LocalLLMApp.Models;
using LocalLLMApp.Models.ApiModels;

namespace LocalLLMApp.Services
{
    public class ChatService
    {
        private readonly DataService _dataService;
        private readonly APIService _apiService;

        public ChatService() 
        { 
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _apiService = Ioc.Default.GetRequiredService<APIService>();
        }

        public async Task<APIChatResponse?> SendChatMessageWithFiles(ChatMessage message, int? caseId) 
        {
            APIChatResponse? response = await _dataService.SendChatV2(message, caseId);

            if (response == null)
            {
                return null;
            }
            return response;
        }
    }
}
