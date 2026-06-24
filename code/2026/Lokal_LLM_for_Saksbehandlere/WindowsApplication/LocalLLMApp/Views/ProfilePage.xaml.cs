using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Services;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;

// <Purpose>
// This is the code-behind for the ProfilePage.xaml view.
// It is responsible for handling events and interactions on the ProfilePage,
// should only contain logic for interacting with the UI elements defined in the XAML file,
// and should not contain any business logic or data manipulation (which should be handled in the ViewModel).
// </Purpose>

// Note:
// - Currently it only contains a call to create a JSON file from the cache
//   when navigating to the page, for debugging purposes.
//   REMOVE THIS LATER!!!

namespace LocalLLMApp.Views
{
    public sealed partial class ProfilePage : Page
    {
        public ProfilePageViewModel ViewModel { get; }

        // Constructor, initializes the page
        public ProfilePage()
        {
            ViewModel = new ProfilePageViewModel();
            InitializeComponent();
        }
        
        protected override void OnNavigatedTo(NavigationEventArgs e) 
        {
            // Do something?
        }
    }
}
