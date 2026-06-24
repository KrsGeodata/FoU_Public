using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.DependencyInjection;
using CommunityToolkit.Mvvm.Input;
using LocalLLMApp.Models;
using LocalLLMApp.Services;
using LocalLLMApp.Views;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Windows.Storage;
using System.IO;
using System.Linq;


// <Purpose>
// This ViewModel is responsible for managing the data and logic for the CreateCasePage.
// </Purpose>

namespace LocalLLMApp.ViewModels
{
    public partial class CreateCaseViewModel : ObservableObject
    {
        [ObservableProperty]
        [NotifyCanExecuteChangedFor(nameof(CreateCaseCommand))] 
        private string _caseTitle= string.Empty;

        [ObservableProperty]
        private string _caseDescription = string.Empty;

        // Collection for attached files display (display string: path if available)
        public ObservableCollection<FilesInfo> AttachedFiles {  get; } = new();

        // Optional: keep actual FileInfo references if you need to open/read them later
        public ObservableCollection<StorageFile> AttachedFileObjects { get; } = new();

        private readonly DataService _dataService;
        private readonly ViewNavigationService _viewNavService;

        public CreateCaseViewModel() 
        {
            _dataService = Ioc.Default.GetRequiredService<DataService>();
            _viewNavService = Ioc.Default.GetRequiredService<ViewNavigationService>();
        }


        // Command to create a case, enabled only when CaseTitle is not empty
        private bool CanCreateCase() => !string.IsNullOrWhiteSpace(CaseTitle);


        [RelayCommand(CanExecute = nameof(CanCreateCase))]
        public async Task<Case> CreateCase() 
        {
            Case newCase = new Case
            {
                Title = CaseTitle,
                Description = CaseDescription
            };
            var registeredCase = await _dataService.AddCase(newCase);
            if (registeredCase != null && registeredCase is Case) 
            {
                // Upload all cases before navigating
                foreach (StorageFile f in AttachedFileObjects) 
                {
                    var display = string.IsNullOrEmpty(f.Path) ? f.Name : f.Path;
                    string fileNameWithExtension = Path.GetFileName(display);
                    await _dataService.AddNewFile(f, fileNameWithExtension, registeredCase.CaseId, 0);
                }

                return registeredCase;
            }
            return null;
        }

        // Command to cancel case creation, always enabled
        [RelayCommand()]
        private void CancelCase() { }
            

        // Adds files to AttachedFileObjects
        public void AddFiles(StorageFile[] files) 
        {
            
            if (files is null || files.Length == 0)
                return;

            foreach (var f in files)
            {
                // Use Path if available (desktop); fallback to Name
                var display = string.IsNullOrEmpty(f.Path) ? f.Name : f.Path;
                string fileNameWithExtension = Path.GetFileName(display);

                if (!AttachedFiles.Any(x => x.FileName == fileNameWithExtension))
                {
                    AttachedFiles.Add(new FilesInfo 
                    { 
                        FileName = fileNameWithExtension,
                    });
                    AttachedFileObjects.Add(f);
                }
            }
            
        }

        // Removes a file from AttachedFiles and AttachedFileObjects based on
        // the fileName stored in AttachedFiles
        public void RemoveSingleFile(FilesInfo fileName) 
        {
            if (fileName is null)
                return;

            var index = AttachedFiles.IndexOf(fileName);
            if (index >= 0)
            {
                AttachedFiles.RemoveAt(index);

                if (index < AttachedFileObjects.Count) 
                {
                    AttachedFileObjects.RemoveAt(index);
                }
            }
            
        }

        public void RemoveMultipleFiles(IEnumerable<FilesInfo> fileNames)
        {
            // Parse fileNames and call RemoveSingleFile for each string
        }
    }
}