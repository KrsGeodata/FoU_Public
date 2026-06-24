using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.ObjectModel;
using System.Data.OleDb;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

// <Purpose>
// This ViewModel is responsible for managing the data and logic for the CaseOverviewPage.
// </Purpose>
// Uses:
// - Models/Case.cs

namespace LocalLLMApp.ViewModels
{
    public partial class CaseOverviewPageViewModel : ObservableObject
    {
        [ObservableProperty]
        private ObservableCollection<Case> _openCases = new();

        [ObservableProperty]
        private ObservableCollection<Case> _archivedCases= new();

        private readonly DataService _dataService;
        private readonly ViewNavigationService _viewNavService;

        // Returns true when there are no open cases, used to show empty state in the view
        public bool IsOpenCasesEmpty => OpenCases.Count == 0;

        // Returns true when there are no archived cases, used to show empty state in the view
        public bool IsArchivedCasesEmpty => ArchivedCases.Count == 0;


        public CaseOverviewPageViewModel()
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
            OpenCases = new ObservableCollection<Case>();
            ArchivedCases = new ObservableCollection<Case>();
            LoadCases();
        }

        // Loads cases from the DataService and populates
        // the OpenCases and ArchivedCases collections based on their status
        public void LoadCases()
        {
            // Fetch all cases from DataService
            var loadCases = _dataService.GetCases();
            if (loadCases is null or []) return;

            // Sort by date descending so newest cases appear first in ISO format
            var sorted = loadCases.OrderByDescending(c =>
                DateTime.TryParse(c.CreatedAt, out var date) ? date : DateTime.MinValue);

            foreach (var c in sorted)
            {
                // Get chat count for each case
                c.ChatCount = (int)_dataService.GetChatCountForCase(c.CaseId);

                if (c.Status == CaseStatus.Active) 
                {
                    OpenCases.Add(c);
                }
                else if (c.Status == CaseStatus.Archived)
                {
                    ArchivedCases.Add(c);
                }
            }
        }

        // Deletes a Case from the DB and then removes it from the list in UI
        public async Task DeleteCaseAsync(Case deleteCase) 
        { 
            if (deleteCase == null) return;

            try
            {
                // Ask data service to remove the case from the persistent/cache layer.
                // The service method is async void today, so we call it and don't await.
                var success = await _dataService.DeleteCaseAsync(deleteCase);
                if (success == false) 
                {
                    return;
                }

                // Remove from OpenCases if present
                var existingOpen = OpenCases.FirstOrDefault(c => c.CaseId == deleteCase.CaseId);
                if (existingOpen is not null)
                {
                    OpenCases.Remove(existingOpen);
                    OnPropertyChanged(nameof(IsOpenCasesEmpty));
                }

                // Remove from ArchivedCases if present
                var existingArchived = ArchivedCases.FirstOrDefault(c => c.CaseId == deleteCase.CaseId);
                if (existingArchived is not null)
                {
                    ArchivedCases.Remove(existingArchived);
                    OnPropertyChanged(nameof(IsArchivedCasesEmpty));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error deleting case in ViewModel: {ex.Message}");
            }
        }

        // Archive a case and update the ObservableCollections
        public async Task ArchiveCase(Case archiveCase) 
        {
            var originalStatue = archiveCase.Status;

            if(archiveCase.Status == CaseStatus.Active) 
            {
                var existingOpen = OpenCases.FirstOrDefault(c => c.CaseId == archiveCase.CaseId);
                if (existingOpen is not null)
                {
                    archiveCase.Status = CaseStatus.Archived;
                    bool success = await _dataService.UpdateCase(archiveCase);

                    if (success)
                    {
                        OpenCases.Remove(existingOpen);
                        OnPropertyChanged(nameof(IsOpenCasesEmpty));
                        ArchivedCases.Add(archiveCase);
                        OnPropertyChanged(nameof(IsArchivedCasesEmpty));
                    } 
                    else
                    {
                        archiveCase.Status = originalStatue;
                    }
                }
            }
            else if(archiveCase.Status == CaseStatus.Archived) 
            {
                var existingArchived = ArchivedCases.FirstOrDefault(c => c.CaseId == archiveCase.CaseId);
                if (existingArchived is not null)
                {
                    archiveCase.Status = CaseStatus.Active;
                    bool success = await _dataService.UpdateCase(archiveCase);

                    if (success) 
                    {
                        ArchivedCases.Remove(existingArchived);
                        OnPropertyChanged(nameof(IsArchivedCasesEmpty));
                        OpenCases.Add(archiveCase);
                        OnPropertyChanged(nameof(IsOpenCasesEmpty));
                    }
                    else
                    {
                        archiveCase.Status = originalStatue;
                    }
                }
            }
        }


        // Navigates to CasePage with the selected Case object
        public void NavigateToCase(Case selectedCase, Frame frame)
        {
            _viewNavService.NavigateTo(typeof(CasePage), frame, selectedCase);
        }

        // Called when the rename case option is selected, should trigger UI to allow inline renaming of the case title
        public async Task SaveRenameCaseAsync(Case caseItem, string newTitle)
        {
            var oldTitle = caseItem.Title;
            caseItem.Title = newTitle;

            bool success = await _dataService.UpdateCase(caseItem);
            if (!success)
            {
                caseItem.Title = oldTitle;
            }
            await Task.CompletedTask;
        }
    } 
}

        