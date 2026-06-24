using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using Microsoft.UI.Xaml.Shapes;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;
using Windows.Foundation;
using Windows.Foundation.Collections;

// <Purpose>
//  This is the main application class for the Local LLM App.
//  This is the entry point of the application,
//  responsible for initializing the app and handling its lifecycle events.
//  It sets up the application, configures services for dependency injection,
//  and handles the launch event to initialize the main window and navigation.
// </Purpose>

namespace LocalLLMApp
{
    public partial class App : Application
    {
        // The main application window
        private Window? m_window;

        // Service provider for dependency injection
        public IServiceProvider? Services { get; set; }

        // Root frame for navigation
        public Frame? rootFrame;

        // Constructor for the App class
        public App()
        {
            this.InitializeComponent();
        }

        // Static property to access the current instance of the App class
        // Allows other parts of the application to access the App instance and its services
        public new static App Current => (App)Application.Current;

        // Set up services for dependency injection
        private static IServiceProvider ConfigureServices()
        {
            var services = new ServiceCollection();

            services.AddSingleton<APIService>();
            services.AddSingleton<AttachmentService>();
            services.AddSingleton<ChatService>();

            services.AddSingleton<DataService>();

            services.AddSingleton<ViewNavigationService>();

            return services.BuildServiceProvider();
        }

        // This functions gets invoked when the application is launched.
        // It initializes the main window, sets up the root frame for navigation,
        // configures services for dependency injection, and activates the window.
        protected override void OnLaunched(Microsoft.UI.Xaml.LaunchActivatedEventArgs args)
        {
            Services = ConfigureServices();
            Ioc.Default.ConfigureServices(Services);

            m_window = new MainWindow();
            rootFrame = ((MainWindow)m_window).GetFrame();


            m_window.Activate();
        }
    }
}
