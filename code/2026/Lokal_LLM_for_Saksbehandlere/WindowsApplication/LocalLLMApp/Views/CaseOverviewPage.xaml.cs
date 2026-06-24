using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
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
// This is the code-behind for the CaseOverviewPage.xaml view.
// It is responsible for handling events and interactions on the CaseOverviewPage,
// should only contain logic for interacting with the UI elements defined in the XAML file,
// and should not contain any business logic or data manipulation (which should be handled in the ViewModel).
// </Purpose>

namespace LocalLLMApp.Views
{
    public sealed partial class CaseOverviewPage : Page
    {
        // The ViewModel for this page, which will be used for data binding in the XAML file
        public CaseOverviewPageViewModel ViewModel { get; }
        private readonly ViewNavigationService _viewNavService;

        // Constructor, initializes the ViewModel and the page
        public CaseOverviewPage()
        {
            ViewModel = new CaseOverviewPageViewModel();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            InitializeComponent();
        }

        // Navigates to CreateCasePage when the "Ny sak" button is clicked
        private void NewCaseButton_Click(object sender, RoutedEventArgs e)
        {
            _viewNavService.NavigateTo(typeof(CreateCasePage), Frame);
        }

        // Navigates to CasePage with the selected Case object when a case item is clicked
        private void CaseListControl_CaseItemClicked(object sender, Case selectedCase)
        {
            ViewModel.NavigateToCase(selectedCase, Frame);
        }

        // Called when the rename case option is selected, executes the StartRenameCaseCommand with the selected Case
        private async void CaseListControl_RenameCaseRequested(object sender, Case caseItem)
        {
            var textBox = new TextBox
            {
                Text = caseItem.Title,
                PlaceholderText = "Skriv inn nytt navn",
                MaxWidth = 400,
                TextWrapping = TextWrapping.Wrap
            };

            var dialog = new ContentDialog
            {
                Title = "Gi nytt navn",
                Content = textBox,
                PrimaryButtonText = "Lagre",
                CloseButtonText = "Avbryt",
                XamlRoot = this.XamlRoot
            };

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary)
            {
                await ViewModel.SaveRenameCaseAsync(caseItem, textBox.Text);
            }
        }

        // Deletes a Case from the persistence layer with the selected Case object
        private async void DeleteCaseMenuFlyoutItem_Clicked(object sender, Case deleteCase)
        {
            var dialog = new ContentDialog
            {
                Title = "Er du sikker?",
                Content = new TextBlock
                {
                    Text = $"Vil du slette saken '{deleteCase.Title}'? Denne handlingen kan ikke angres.",
                    TextWrapping = TextWrapping.Wrap,
                    MaxWidth = 350
                },
                PrimaryButtonText = "Slett",
                CloseButtonText = "Avbryt",
                DefaultButton = ContentDialogButton.Close,
                XamlRoot = this.XamlRoot
            };

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary)
            {
                await ViewModel.DeleteCaseAsync(deleteCase);
            }
        }

        // Switch a case status between Active and Archived
        private async void ArchiveCaseMenuFlyoutItem_Clicked(object sender, Case archiveCase)
        {
            await ViewModel.ArchiveCase(archiveCase);
        }
    }
}