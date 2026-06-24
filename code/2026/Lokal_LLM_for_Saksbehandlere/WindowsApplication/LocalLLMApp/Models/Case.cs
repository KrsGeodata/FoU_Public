using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

// <Purpose>
// A general structure for the data we want to receive from API calls
// </Purpose>
namespace LocalLLMApp.Models
{
    // Cases for left panel (archived and ongoing cases)
    public class Case : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;


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
        public string Description { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        public CaseStatus Status { get; set; } = CaseStatus.Active;
        public int ChatCount { get; set; } = 0;

        // Temporary fix for formatting purposes
        public string ChatCountDisplay => ChatCount == 1 ? "1 samtale" : $"{ChatCount} samtaler";

        // Properties to determine the text and glyph for the archive menu item based on the case status
        public string ArchiveMenuText => Status == CaseStatus.Archived ? "Åpne sak" : "Avslutt Sak";
        public string ArchiveMenuGlyph => Status == CaseStatus.Archived ? "\uE8DA" : "\uE7B8";

        // Raises an event when the property has changed
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

    }


    // Separate case status for scalability
    // Using JsonStringEnumConverter to serialize the enum as a string in JSON,
    // which is more readable and maintainable than using numeric values
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum CaseStatus
    {
        Active,
        Archived,
        Deleted
    }
}
