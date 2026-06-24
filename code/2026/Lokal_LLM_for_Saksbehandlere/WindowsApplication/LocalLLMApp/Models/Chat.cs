using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// <Purpose>
// Class for handling chats and their related attributes.
// ChatMessages are not included in this class, as they are handled separately
// in the ChatDetail class, which bundles together a chat and its related messages.
// And ChatMessages are stored with a referencial ChatId, so they can be easily linked together when needed.
// </Purpose>

namespace LocalLLMApp.Models
{
    public class Chat : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;
        public int ChatId { get; set; } = 0;
        public int CaseId { get; set; } = 0;
        public int UserId { get; set; } = 0;
        private string _title = string.Empty;
        // Raises OnPropertChanged when the value is changed
        // Used to sync UI
        public string Title 
        {
            get => _title;
            set
            {
                if (_title != value)
                {
                    _title = value;
                    OnPropertyChanged();
                }
            }
        }
        private string _description = string.Empty;
        public string Description
        {
            // Change "Koblet til sak" to not be a default 
            get => _description;
            set
            {
                if (_description != value)
                {
                    _description = value;
                    OnPropertyChanged();
                }
            }
        }
        public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
