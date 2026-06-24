using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Navigation;
using System.Diagnostics;

// <Purpose>
// This is the code-behind for the LoginPage.xaml view.
// It is responsible for handling events and interactions on the LoginPage,
// should only contain logic for interacting with the UI elements defined in the XAML file,
// and should not contain any business logic or data manipulation (which should be handled in the ViewModel).
// </Purpose>

namespace LocalLLMApp.Views
{
    public sealed partial class LoginPage : Page
    {
        // ViewModel property for data binding to the LoginViewModel
        public LoginViewModel ViewModel { get; } = new LoginViewModel();
        public LoginPage()
        {
            InitializeComponent();
        }

        // When the page is navigated to, log the parameter passed (for debugging purposes)
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            Debug.WriteLine($"Navigated to LoginPage with {e.Parameter}");
        }

        // Handles Enter key in email field to move focus to password
        private void EmailTextBox_KeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                PasswordBox.Focus(FocusState.Programmatic);
                e.Handled = true;
            }
        }

        // Enables pressing Enter in the password box to trigger the login command
        private void PasswordBox_KeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                if (ViewModel.NavigateToDashboardCommand.CanExecute(null))
                {
                    ViewModel.NavigateToDashboardCommand.Execute(null);
                }
                e.Handled = true;
            }
        }

        // Shows or hides the password based on the state of the revealModeCheckBox
        private void CheckBox_Changed(object sender, RoutedEventArgs e)
        {
            if (revealModeCheckBox.IsChecked == true)
            {
                PasswordBox.PasswordRevealMode = PasswordRevealMode.Visible;
            }
            else
            {
                PasswordBox.PasswordRevealMode = PasswordRevealMode.Hidden;
            }
        }
    }
}