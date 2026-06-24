using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.IO;
using System.Text.Json;

namespace LocalLLMApp.Views
{
    // Simple class to hold the application settings for JSON serialization
    public class AppSettings
    {
        public bool IsDarkMode { get; set; } = false;
    }

    public sealed partial class SettingsPage : Page
    {
        // Path to the JSON configuration file in the user's local AppData folder
        private readonly string _settingsFilePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "LocalLLMApp",
            "settings.json"
        );

        public SettingsPage()
        {
            this.InitializeComponent();
            LoadCurrentTheme();
        }

        // 1. Load the correct theme when user navigates to settings
        private void LoadCurrentTheme()
        {
            try
            {
                if (File.Exists(_settingsFilePath))
                {
                    string json = File.ReadAllText(_settingsFilePath);
                    var settings = JsonSerializer.Deserialize<AppSettings>(json);

                    if (settings != null)
                    {
                        DarkModeToggle.IsOn = settings.IsDarkMode;
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load theme: {ex.Message}");
            }

            // Default fallback if file does not exist: Light mode
            DarkModeToggle.IsOn = false;
        }

        // 2. Ensure the theme is changed when the toggle button is pressed
        private void DarkModeToggle_Toggled(object sender, RoutedEventArgs e)
        {
            // Finds the content in the app window
            if (this.XamlRoot?.Content is FrameworkElement rootElement)
            {
                // Changes the theme dynamically
                rootElement.RequestedTheme = DarkModeToggle.IsOn ? ElementTheme.Dark : ElementTheme.Light;
            }

            // Stores the choice in the background, so it is remembered when the app starts
            try
            {
                string folder = Path.GetDirectoryName(_settingsFilePath);
                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                }

                var settings = new AppSettings { IsDarkMode = DarkModeToggle.IsOn };
                string json = JsonSerializer.Serialize(settings);
                File.WriteAllText(_settingsFilePath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to save theme: {ex.Message}");
            }
        }
    }
}