using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;

// <Purpose>
// This ViewModel is responsible for managing the data and logic for the ProfilePage.
// </Purpose>

namespace LocalLLMApp.ViewModels
{
    public partial class ProfilePageViewModel : ObservableObject
    {
        [ObservableProperty]
        private string _name = string.Empty;

        [ObservableProperty]
        private string _email = string.Empty;

        private readonly DataService _dataService;

        public ProfilePageViewModel() 
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            LoadUserInfo();
        }

        // Get the user information from the Dataservice to put in the UI
        public void LoadUserInfo() 
        { 
            User currentUser = _dataService.FetchUser();

            if (currentUser.Name != null && currentUser.Name != string.Empty)
            {
                Name = currentUser.Name;
            } else
            {
                Name = "No Name";
            }

            if (currentUser.Email != null && currentUser.Email != string.Empty)
            {
                Email = currentUser.Email;
            } else 
            {
                Email = "No Email";
            }
        }

    // Derived property to get the initials (e.g OL) from the Name property
        public string Initials => string.Concat(
        Name.Split(' ')
        .Where(w => !string.IsNullOrEmpty(w))
        .Take(2)
        .Select(w => w[0]));

    }
}