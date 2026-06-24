using LocalLLMApp.Models.Services;
using System.Threading.Tasks;

namespace LocalLLMApp.Services
{
    // Contract for capturing image bytes from the active/target window.
    public interface IWindowScreenshotService
    {
        // Captures the target window and returns context + image bytes.
        // preCaptureDelayMs: optional delay before capture starts.
        // avoidCurrentAppWindow: if true, try to capture an external foreground window.
        // waitForExternalWindowMs: max wait time while searching for external window.
        Task<WindowCaptureResult?> CaptureActiveWindowAsync(int preCaptureDelayMs = 0, bool avoidCurrentAppWindow = true, int waitForExternalWindowMs = 0);
    }
}
