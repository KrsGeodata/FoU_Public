using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Text.Json;

// <Purpose>
// This ViewModel is responsible for managing the data and logic for the LoginPage.
// </Purpose>
// Uses the ViewNavigationService for navigation

namespace LocalLLMApp.ViewModels
{
    public partial class LoginViewModel : ObservableObject
    {
        private readonly APIService _apiService;
        private readonly DataService _dataService;
        private readonly ViewNavigationService _viewNavService;
        // Properties for username and password input fields
        [ObservableProperty]
        private string username = string.Empty;

        [ObservableProperty]
        private string password = string.Empty;


        // Properties for error handling
        [ObservableProperty]
        private string errorMessage = string.Empty;

        [ObservableProperty]
        private bool hasError = false;


        // Command to navigate to the DashboardPage after a successful login
        public ICommand NavigateToDashboardCommand { get; }

        // Constructor initializing the command
        public LoginViewModel()
        {
            _apiService = Ioc.Default.GetRequiredService<APIService>();
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            NavigateToDashboardCommand = new AsyncRelayCommand(NavigateToDashboardAsync, CanLogin);
        }

        // Method to check if the user can log in (currently checks against test users)
        private bool CanLogin() =>
            !string.IsNullOrWhiteSpace(Username) &&
            !string.IsNullOrWhiteSpace(Password);

        // Methods to notify the command that the username or password has changed,
        // which affects whether the login button should be enabled
        // The old implementation checked against hardcoded test users. Now it checks against the API response. Button still gets enabled or disabled based on input
        partial void OnUsernameChanged(string value) =>
            ((AsyncRelayCommand)NavigateToDashboardCommand).NotifyCanExecuteChanged();

        partial void OnPasswordChanged(string value)
        {
            ((AsyncRelayCommand)NavigateToDashboardCommand).NotifyCanExecuteChanged();
        }

        private async Task NavigateToDashboardAsync()
        {
            var loginResult = await _apiService.LoginAsync(Username, Password);
            if (!loginResult.Success)
            {
                HasError = true;
                ErrorMessage = string.IsNullOrWhiteSpace(loginResult.ErrorMessage)
                    ? "Feil brukernavn eller passord."
                    : loginResult.ErrorMessage;
                return;
            }

            User loggedInUser = new User { 
                Name = loginResult.Name,
                Email = loginResult.Email,
                UserId = (int)loginResult.UserId
            };
            string jsonString = JsonSerializer.Serialize(loggedInUser);
            Debug.WriteLine(jsonString);

            // The cache got called after rendering the dashboard page, which caused the cases to not be loaded
            // Got solved by awaiting the cache, but I'll keep my comment in here incase it breaks some other functionality and we don't know why. 

            await _dataService.FillTheCacheWithUserData(loggedInUser);


            HasError = false;
            ErrorMessage = string.Empty;
            _viewNavService.NavigateTo(typeof(DashboardPage), App.Current.rootFrame);
        }
    }
}
