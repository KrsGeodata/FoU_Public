using System;

namespace LocalLLMApp.Models.Services
{
    // Immutable snapshot of active-window metadata collected from Win32.
    public record WindowContextSnapshot
    {
        // Native window handle (HWND) used for later capture calls.
        public nint Handle { get; init; }

        // Visible window title text.
        public string Title { get; init; } = string.Empty;

        // Win32 window class name.
        public string ClassName { get; init; } = string.Empty;

        // Owning process name for the active window.
        public string ProcessName { get; init; } = string.Empty;

        // Screen bounds (left/top/right/bottom) for the window.
        public WindowRect Bounds { get; init; }

        // Window DPI at the moment of capture.
        public int Dpi { get; init; }

        // Timestamp of when metadata was captured.
        public DateTimeOffset CapturedAt { get; init; } = DateTimeOffset.Now;
    }

    // Simple rectangle model mapped from Win32 RECT.
    public record WindowRect(int Left, int Top, int Right, int Bottom)
    {
        // Computed width based on right-left.
        public int Width => Right - Left;

        // Computed height based on bottom-top.
        public int Height => Bottom - Top;
    }
}
