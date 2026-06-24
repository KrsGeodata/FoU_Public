using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;

// A service class to handle file attachment operations such as validation, upload, and staging.
// This class centralizes all 4 attachment-related logic:
//    1. Validating file types and sizes before allowing attachments
//    2. Uploading files to the backend and creating FilesInfo objects with the uploaded file metadata
//    3. Staging files in CasePage when ChatId is not yet available
//    4. Formatting file sizes for display in the UI
// Helps to avoid code duplication across different ViewModels (e.g., ChatViewModel and CasePageViewModel)

namespace LocalLLMApp.Services
{
    // Handles file attachment operations: validation, upload, and staging.
    // Centralizes attachment logic to avoid duplication across ViewModels.
    public class AttachmentService
    {
        private readonly DataService _dataService;

        // 1. Validation constraints
        private const long MaxFileSizeInBytes = 20 * 1024 * 1024; // 20MB
        private const int MaxAttachmentCount = 5;
        private readonly HashSet<string> AllowedFileExtensions = new()
        {
            ".pdf", ".docx", ".doc",
            ".xlsx", ".xls",
            ".txt",
            ".jpg", ".jpeg", ".png"
        };

        public AttachmentService()
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
        }

        // Validates file before adding to attachment list.
        // Returns success status and error message if validation fails.
        public (bool IsValid, string ErrorMessage) ValidateFile(StorageFile file, int currentAttachmentCount)
        {
            if (currentAttachmentCount >= MaxAttachmentCount)
                return (false, $"Maksimalt {MaxAttachmentCount} vedlegg tillatt");

            string fileExtension = Path.GetExtension(file.Name).ToLower();
            if (!AllowedFileExtensions.Contains(fileExtension))
                return (false, $"Filtype {fileExtension} er ikke tillatt");

            return (true, string.Empty);
        }

        // Validates file size asynchronously (requires async file properties access).
        public async Task<(bool IsValid, string ErrorMessage)> ValidateFileSizeAsync(StorageFile file)
        {
            var properties = await file.GetBasicPropertiesAsync();
            if (properties.Size > MaxFileSizeInBytes)
            {
                string maxSizeReadable = FormatFileSizeForDisplay(MaxFileSizeInBytes);
                string actualSizeReadable = FormatFileSizeForDisplay((long)properties.Size);
                return (false, $"Filen er for stor ({actualSizeReadable}). Maks {maxSizeReadable}");
            }
            return (true, string.Empty);
        }

        // 2. Uploads file to backend and creates FilesInfo with uploaded file metadata.
        //    Used when ChatId is known (existing chat in ChatPage).
        public async Task<FilesInfo?> UploadFileAndCreateFilesInfoAsync(
            StorageFile file,
            int caseId = 0,
            int chatId = 0)
        {
            try
            {
                string fileName = Path.GetFileName(
                    string.IsNullOrEmpty(file.Path) ? file.Name : file.Path);

                Debug.WriteLine($"[AttachmentService] Uploading file: {fileName} to ChatId: {chatId}");

                //string fileId = await _dataService.AddNewFile(file, fileName, caseId, chatId);
                string fileId = "";

                if (string.IsNullOrEmpty(fileId))
                {
                    Debug.WriteLine($"[AttachmentService] Upload failed for {fileName}");
                    return null;
                }

                Debug.WriteLine($"[AttachmentService] Upload successful: FileId={fileId}");

                return new FilesInfo
                {
                    FileId = fileId,
                    FileName = fileName,
                    FileExtension = Path.GetExtension(fileName),
                    CaseId = caseId,
                    ChatId = chatId,
                    ChatMessageId = 0  // Pending (not attached to message yet)
                };
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"[AttachmentService] Error uploading file {file.Name}: {ex.Message}");
                return null;
            }
        }

        // 3. Creates FilesInfo WITHOUT uploading to backend (stores StorageFile reference)
        //    Used in CasePage where ChatId is not yet known (chat created on first message send)
        //    File will be uploaded later in CreateChat() once ChatId is available
        public FilesInfo CreatePendingFilesInfoWithoutUpload(StorageFile file)
        {
            string fileName = Path.GetFileName(
                string.IsNullOrEmpty(file.Path) ? file.Name : file.Path);

            return new FilesInfo
            {
                FileName = fileName,
                FileExtension = Path.GetExtension(fileName).ToLower(),
                CaseId = 0,
                ChatId = 0,
                ChatMessageId = 0,
                FileObject = file  // Store reference for later upload
            };
        }

        // 4. Formats file size in bytes to human-readable format (B, KB, MB, GB).
        //    Useful for displaying file sizes in UI.
        public string FormatFileSizeForDisplay(long fileSizeInBytes)
        {
            string[] sizeUnits = { "B", "KB", "MB", "GB" };
            double size = fileSizeInBytes;
            int unitIndex = 0;

            while (size >= 1024 && unitIndex < sizeUnits.Length - 1)
            {
                unitIndex++;
                size = size / 1024;
            }

            return $"{size:0.##} {sizeUnits[unitIndex]}";
        }
    }
}