using LocalLLMApp.Models.Services;
using System;
using System.Buffers.Binary;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace LocalLLMApp.Services
{
    // Win32-backed implementation that captures the active window into BMP bytes.
    public sealed class WindowScreenshotService : IWindowScreenshotService
    {
        private readonly IWindowContextService _windowContextService;


    
        private const int SRCCOPY = 0x00CC0020;
        // Copies the srouce rectangle directly to the destination rectangle. (SRCCOPY))
        // For more info: 
        // https://www.imagekit.com/IK9Help/source/controlreference/imagekitcontrol/methodbidblt.htm


        private const int PW_RENDERFULLCONTENT = 0x00000002;
        // Flag which indicates the entire content of the window should be rendered to the bitmap
        private const uint DIB_RGB_COLORS = 0;
        /* DIB_RGB_COLORS (DependecyIndependentBitmap: The color table in the DIB contains literal RGB values.
           device-independent bitmap(DIB): A container for bitmapped graphics, which specifies characteristics of
           the bitmap such that it can be created using one application and
           loaded and displayed in another application, while retaining an identical appearance
           https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-wmf/bd05c35c-3eb1-49cc-90df-651b1f73f15a#gt_3a6934d5-cc59-4ab9-a54e-e062a09a4091 */
        private const uint BI_RGB = 0;
        // No compression is used (standard RGB bitmap)

        // Gets a device context for the full window (including non-client area).
        [DllImport("user32.dll")]
        private static extern nint GetWindowDC(nint hWnd);

        // Releases a device context acquired with GetWindowDC.
        [DllImport("user32.dll")]
        private static extern int ReleaseDC(nint hWnd, nint hDc);

        // Creates an in-memory compatible DC used as render target.
        [DllImport("gdi32.dll")]
        private static extern nint CreateCompatibleDC(nint hdc);

        // Creates a bitmap compatible with the source DC.
        [DllImport("gdi32.dll")]
        private static extern nint CreateCompatibleBitmap(nint hdc, int nWidth, int nHeight);

        [DllImport("gdi32.dll")]
        private static extern nint SelectObject(nint hdc, nint hgdiobj);

        [DllImport("gdi32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool DeleteObject(nint hObject);

        [DllImport("gdi32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool DeleteDC(nint hdc);

        [DllImport("gdi32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool BitBlt(
            nint hdcDest,
            int nXDest,
            int nYDest,
            int nWidth,
            int nHeight,
            nint hdcSrc,
            int nXSrc,
            int nYSrc,
            int dwRop);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool PrintWindow(nint hwnd, nint hdcBlt, uint nFlags);

        // Reads bitmap pixels into managed byte[] buffer.
        [DllImport("gdi32.dll")]
        private static extern int GetDIBits(
            nint hdc,
            nint hbm,
            uint start,
            uint cLines,
            byte[] lpvBits,
            ref BITMAPINFO lpbmi,
            uint usage);

        [StructLayout(LayoutKind.Sequential)]
        private struct BITMAPINFOHEADER
        {
            public uint biSize;
            public int biWidth;
            public int biHeight;
            public ushort biPlanes;
            public ushort biBitCount;
            public uint biCompression;
            public uint biSizeImage;
            public int biXPelsPerMeter;
            public int biYPelsPerMeter;
            public uint biClrUsed;
            public uint biClrImportant;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct BITMAPINFO
        {
            public BITMAPINFOHEADER bmiHeader;
        }

        public WindowScreenshotService(IWindowContextService windowContextService)
        {
            // Context service decides which window to capture.
            _windowContextService = windowContextService;
        }

        // Public entry: resolve context first, then capture and package result.
        public async Task<WindowCaptureResult?> CaptureActiveWindowAsync(int preCaptureDelayMs = 0, bool avoidCurrentAppWindow = true, int waitForExternalWindowMs = 0)
        {
            if (preCaptureDelayMs > 0)
                await Task.Delay(preCaptureDelayMs);

            var context = _windowContextService.GetCurrentContext(avoidCurrentAppWindow, waitForExternalWindowMs);
            if (context == null || context.Bounds.Width <= 0 || context.Bounds.Height <= 0)
                return null;

            var imageBytes = CaptureWindowToBmp(context);
            if (imageBytes == null)
                return null;

            return new WindowCaptureResult
            {
                Context = context,
                ImageData = imageBytes,
                ImageMimeType = "image/bmp"
            };
        }

        private static byte[]? CaptureWindowToBmp(WindowContextSnapshot context)
        {
            // Use the already-resolved metadata snapshot as capture input.
            var hWnd = context.Handle;
            var width = context.Bounds.Width;
            var height = context.Bounds.Height;

            var windowDc = GetWindowDC(hWnd);
            if (windowDc == nint.Zero)
                return null;

            // Used for cleanup in finally block, also nice since win32 apis use 0 as invalid. This is a bit messy with the try/catch blocks, but it works and ensures we don't leak any objects or device contexts. Maybe refacor in the future? 

            var memoryDc = nint.Zero;
            var hBitmap = nint.Zero;
            var oldObject = nint.Zero;

            try
            {
                memoryDc = CreateCompatibleDC(windowDc);
                if (memoryDc == nint.Zero)
                    return null;

                hBitmap = CreateCompatibleBitmap(windowDc, width, height);
                if (hBitmap == nint.Zero)
                    return null;

                oldObject = SelectObject(memoryDc, hBitmap);

                // PrintWindow is preferred for full content capture.
                var printed = PrintWindow(hWnd, memoryDc, PW_RENDERFULLCONTENT);
                if (!printed)
                {
                    // Fallback copy from window DC when PrintWindow fails.
                    BitBlt(
                        memoryDc,
                        0,
                        0,
                        width,
                        height,
                        windowDc,
                        0,
                        0,
                        SRCCOPY);
                }

                var bitmapInfo = new BITMAPINFO
                {
                    bmiHeader = new BITMAPINFOHEADER
                    {
                        biSize = (uint)Marshal.SizeOf<BITMAPINFOHEADER>(),
                        biWidth = width,
                        biHeight = -height, // Negative height to indicate a top-down DIB
                        biPlanes = 1,
                        biBitCount = 32,
                        biCompression = BI_RGB,
                        biSizeImage = (uint)(width * height * 4)
                    }
                };

                var pixelBytes = new byte[width * height * 4];
                var copied = GetDIBits(memoryDc, hBitmap, 0, (uint)height, pixelBytes, ref bitmapInfo, DIB_RGB_COLORS);
                if (copied == 0)
                    return null;

                return EncodeBmp(width, height, pixelBytes);
            }
            catch
            {
                return null;
            }
            finally
            {
                if (oldObject != nint.Zero)
                    SelectObject(memoryDc, oldObject);

                if (hBitmap != nint.Zero)
                    DeleteObject(hBitmap);

                if (memoryDc != nint.Zero)
                    DeleteDC(memoryDc);

                ReleaseDC(hWnd, windowDc);
            }
        }

        private static byte[] EncodeBmp(int width, int height, byte[] pixelData)
        {
            // 14-byte file header + 40-byte info header + pixel payload.
            const int fileHeaderSize = 14;
            const int infoHeaderSize = 40;
            var imageSize = pixelData.Length;
            var fileSize = fileHeaderSize + infoHeaderSize + imageSize;

            var output = new byte[fileSize];

            // BITMAPFILEHEADER
            // BM signature so Windows knows its a BMP. Signatures starts with BM (idk why)
            // Otherwise, this is just a bunch of fields that specifices the file size. I don't completely understand this myself, but it works (https://www.experts-exchange.com/questions/20971124/create-a-bmp-header-at-byte-level.html?utm_source=chatgpt.com and this https://en.wikipedia.org/wiki/BMP_file_format was very helpful)
            output[0] = (byte)'B';
            output[1] = (byte)'M';
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(2, 4), fileSize);
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(10, 4), fileHeaderSize + infoHeaderSize);

            // BITMAPINFOHEADER
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(14, 4), infoHeaderSize);
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(18, 4), width);
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(22, 4), -height);
            BinaryPrimitives.WriteInt16LittleEndian(output.AsSpan(26, 2), 1);
            BinaryPrimitives.WriteInt16LittleEndian(output.AsSpan(28, 2), 32);
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(30, 4), 0);
            BinaryPrimitives.WriteInt32LittleEndian(output.AsSpan(34, 4), imageSize);

            // Pixel data (already BGRA, bottom-up expectation handled via negative height earlier)
            pixelData.CopyTo(output.AsSpan(fileHeaderSize + infoHeaderSize));
            return output;
        }
    }
}
