using LocalLLMApp.Views;
using Microsoft.UI;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using Microsoft.UI.Windowing;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using WinRT.Interop;

// <Purpose>
// The MainWindow class is the primary window for the LocalLLMApp.
// Upon launching the app, it directs users to the LoginPage.
// Also exposes a RootFrame for navigation.
// </Purpose>

namespace LocalLLMApp
{
    public sealed partial class MainWindow : Window
    {
        // Constructor for MainWindow
        // Initializes the MainWindow and navigates to the LoginPage
        public MainWindow()
        {
            Title = "Local LLM App";

            InitializeComponent();
            SetWindowIcon();

            // Navigate to the LoginPage on startup
            RootFrame.Navigate(typeof(LoginPage));
        }

        // Set the icon for the application
        private void SetWindowIcon()
        {
            string? iconPath = Environment.GetEnvironmentVariable("APPLICATION_ICON_PATH");

            if (string.IsNullOrEmpty(iconPath) || !File.Exists(iconPath))
            {
                return;
            }

            // Get the AppWindow for this Window
            IntPtr hWnd = WindowNative.GetWindowHandle(this);
            WindowId windowId = Win32Interop.GetWindowIdFromWindow(hWnd);
            AppWindow appWindow = AppWindow.GetFromWindowId(windowId);

            appWindow.SetIcon(iconPath);
        }

        // Exposing the RootFrame for navigation purposes
        public Frame GetFrame() => RootFrame;
    }
}
