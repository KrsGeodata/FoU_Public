using LocalLLMApp.Models.Services;

namespace LocalLLMApp.Services
{
    // Contract for reading metadata about the current foreground window.
    public interface IWindowContextService
    {
        // Gets a snapshot of the current target window context.
        // avoidCurrentAppWindow: if true, tries to skip this app's own window.
        // waitForExternalWindowMs: polling timeout when waiting for an external window.
        WindowContextSnapshot? GetCurrentContext(bool avoidCurrentAppWindow = false, int waitForExternalWindowMs = 0);
    }
}
