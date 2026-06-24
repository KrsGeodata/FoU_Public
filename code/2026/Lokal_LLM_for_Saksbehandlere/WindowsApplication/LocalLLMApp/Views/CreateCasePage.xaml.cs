using CommunityToolkit.Mvvm.DependencyInjection;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System.Collections.Generic;
using System.Windows.Navigation;
using Windows.Storage;

/* 
 * CreateCasePage - View for creating new cases
 * 
 * This page provides:
 * - Title and description input fields
 * - File attachment via FileDragAndDropControl
 * - Create and Cancel action buttons
 * 
 * Note: File collection and business logic are handled by CreateCaseViewModel.
 */

namespace LocalLLMApp.Views
{
    public sealed partial class CreateCasePage : Page
    {
        public CreateCaseViewModel ViewModel { get; }
        private readonly ViewNavigationService _viewNavService;

        public CreateCasePage()
        {
            ViewModel = new CreateCaseViewModel();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            InitializeComponent();
        }

        // Event handler for files added via FileDragAndDropControl - delegates to ViewModel
        public void FileDragAndDropControl_AddFiles(object sender, StorageFile[] files)
        {
            ViewModel.AddFiles(files);
        }

        // Event handler for file removal from FileListControl - delegates to ViewModel
        private void FileListControl_RemovedSingleFile(object sender, FilesInfo fileName)
        {
            ViewModel.RemoveSingleFile(fileName);
        }

        // Event handler for multiple file removal from FileListControl - delegates to ViewModel
        private void FileListControl_RemoveMultipleFiles(object sender, IEnumerable<FilesInfo> fileNames) 
        {
            ViewModel.RemoveMultipleFiles(fileNames);
        }
        

        // Event handler for creating a new case - delegates to ViewModel
        private async void CreateCaseButton_Click(object sender, RoutedEventArgs e)
        {
            var newCase = await ViewModel.CreateCase();
            if (newCase != null) 
            { 
                _viewNavService.NavigateTo(typeof(CasePage), Frame, newCase);
            }
        }

        // Navigates back to the previous page when Cancel is clicked

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            _viewNavService.NavigateTo(typeof(CaseOverviewPage), Frame);
        }
    }
}