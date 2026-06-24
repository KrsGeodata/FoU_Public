using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Storage;

// <Purpose>
// A general structure for the data we want to receive from API calls
// </Purpose>

namespace LocalLLMApp.Models
{
    public class FilesInfo
    {
        public string FileId { get; set; } = string.Empty;
        public int UserId { get; set; } = 0;
        public int CaseId { get; set; } = 0;
        public int ChatId { get; set; } = 0;
        public int ChatMessageId { get; set; } = 0;
        public string OriginalFilename { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;

        // If retrieved from the backend then OriginalFilename and FileExtension will be set
        private string _fileName = string.Empty;
        public string FileName { 
            get 
            { 
                if (!string.IsNullOrEmpty(_fileName)) 
                {
                    return _fileName;
                }

                if (!string.IsNullOrEmpty(OriginalFilename) && !string.IsNullOrEmpty(FileExtension))
                {
                    return OriginalFilename + FileExtension;
                }

                return string.Empty;
            } 
            set => _fileName = value ?? string.Empty;
        }

        private string? _uploadedAt;
        public string UploadedAt
        {
            get => _uploadedAt ?? "Ukjent tidspunkt";  
            set => _uploadedAt = value;
        }

        // Used in the frontend to keep track of the StorageFile object associated with this FilesInfo
        [System.Text.Json.Serialization.JsonIgnore]
        public StorageFile? FileObject { get; set; }
    }
}
