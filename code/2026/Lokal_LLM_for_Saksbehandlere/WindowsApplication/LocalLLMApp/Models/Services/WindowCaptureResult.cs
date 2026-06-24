using System;

namespace LocalLLMApp.Models.Services
{
    // Represents the final payload produced by screenshot capture.
    public record WindowCaptureResult
    {
        // Metadata about which window was captured (title, process, bounds, etc.).
        public required WindowContextSnapshot Context { get; init; }

        // Raw image bytes for the captured window.
        public required byte[] ImageData { get; init; }

        // MIME type for ImageData 
        public string ImageMimeType { get; init; } = "image/bmp";

        
        public string? UserPrompt { get; init; }
    }
}
