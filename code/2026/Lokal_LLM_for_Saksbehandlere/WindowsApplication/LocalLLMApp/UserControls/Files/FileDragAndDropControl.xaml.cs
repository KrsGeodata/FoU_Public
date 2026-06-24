using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Linq;
using System.Threading.Tasks;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage;
using Windows.Storage.Pickers;

/* 
 * FileDragAndDropControl - Reusable UserControl for file drag-and-drop functionality
 * 
 * This control provides:
 * - Drag-and-drop file input with visual feedback
 * - Browse button for manual file selection 
 * - Configurable placeholder text via DependencyProperty
 * - FileAdded event for parent components to handle selected files
 * 
 * The control only handles file input - file list display is handled by parent component. 
 */

namespace LocalLLMApp.UserControls.Files
{
    public sealed partial class FileDragAndDropControl : UserControl
    {
        // This event is raised when files are dropped onto the control
        public event EventHandler<StorageFile[]>? FilesAdded;

        // Dependency Property for placeholder text 
        public static readonly DependencyProperty PlaceholderTextProperty =
            DependencyProperty.Register(
                nameof(PlaceholderText),
                typeof(string),
                typeof(FileDragAndDropControl),
                new PropertyMetadata("Slipp filer her, eller klikk for å velge"));

        // Dependency Property for compact mode: toggles between default and compact visual states
        public static readonly DependencyProperty IsCompactProperty =
            DependencyProperty.Register(
                nameof(IsCompact),
                typeof(bool),
                typeof(FileDragAndDropControl),
                new PropertyMetadata(false, OnIsCompactChanged));

        // Callback for IsCompact property changes, updates visual state based on the new value
        private static void OnIsCompactChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FileDragAndDropControl control)
            {
                var stateName = (bool)e.NewValue ? "Compact" : "Default";
                VisualStateManager.GoToState(control, stateName, true);
            }
        }


        // Public properties for the Dependency Properties, allowing get/set access in XAML and code
        public bool IsCompact
        {
            get => (bool)GetValue(IsCompactProperty);
            set => SetValue(IsCompactProperty, value);
        }
        public string PlaceholderText
        {
            get => (string)GetValue(PlaceholderTextProperty);
            set => SetValue(PlaceholderTextProperty, value);
        }

        public FileDragAndDropControl()
        {
            this.InitializeComponent();
            Loaded += OnLoaded;             
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            var stateName = IsCompact ? "Compact" : "Default";
            VisualStateManager.GoToState(this, stateName, true);
        }

        // Handles DragEnter event - validates data and sets visual state
        private void DropBorder_DragEnter(object sender, DragEventArgs e)
        {
            // Check if the data package contains files
            if (e.DataView.Contains(StandardDataFormats.StorageItems))
            {
                e.AcceptedOperation = DataPackageOperation.Copy;

                // Change to DragOver visual state
                VisualStateManager.GoToState(this, "DragOver", true);

                // Show caption during drag operation
                e.DragUIOverride.Caption = "Slipp filer her";
                e.DragUIOverride.IsCaptionVisible = true;
                e.DragUIOverride.IsContentVisible = true;

            }
            else
            {
                e.AcceptedOperation = DataPackageOperation.None;
            }
        }

        // Handles DragOver event - maintains visual feedback during drag
        private void DropBorder_DragOver(object sender, DragEventArgs e)
        {
            if (e.DataView.Contains(StandardDataFormats.StorageItems))
            {
                e.AcceptedOperation = DataPackageOperation.Copy;

                VisualStateManager.GoToState(this, "DragOver", true);
            }
            else
            {
                e.AcceptedOperation = DataPackageOperation.None;
            }
        }

        // Handles DragLeave event - resets visual state when drag exits the border
        private void DropBorder_DragLeave(object sender, DragEventArgs e)
        {
            VisualStateManager.GoToState(this, "Normal", true);
        }

        // Handles Drop event - processes dropped files and raises FileAdded event
        private async void DropBorder_Drop(object sender, DragEventArgs e)
        {
            VisualStateManager.GoToState(this, "Normal", true);

            // Check if the data package contains files
            if (e.DataView.Contains(StandardDataFormats.StorageItems))
            {

                var items = await e.DataView.GetStorageItemsAsync();

                // filter only files, not folders
                var files = items.OfType<StorageFile>().ToArray();

                if (files.Length > 0)
                {
                    FilesAdded?.Invoke(this, files);
                }
            }
        }

        // Opens a FileOpenPicker() and returns the selected files from your file explorer
        public async Task<StorageFile[]?> PickFilesAsync()
        {
            // Try to get the window handle (hwnd) for initialization when running as a desktop app
            IntPtr hwnd = IntPtr.Zero;
            var contentIsland = this.XamlRoot.ContentIslandEnvironment;
            if (contentIsland is not null)
            {
                var windowId = contentIsland.AppWindowId;
                hwnd = Microsoft.UI.Win32Interop.GetWindowFromWindowId(windowId);
            }

            var picker = new FileOpenPicker();

            // Initialize with window handle when available
            if (hwnd != IntPtr.Zero)
            {
                WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);
            }

            // Configurations for the picker
            picker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
            picker.ViewMode = PickerViewMode.List;
            picker.FileTypeFilter.Add("*");

            // Pick and return files if any
            var pickedFiles = await picker.PickMultipleFilesAsync();
            if (pickedFiles is null || pickedFiles.Count == 0)
                return null;

            return pickedFiles.OfType<StorageFile>().ToArray();
        }

        // Handles Browse button click - opens file picker
        // Deactivates the button while the selection is ongoing
        private async void OpenFilesButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button button)
                return;

            button.IsEnabled = false;

            try
            {
                var files = await PickFilesAsync();

                if (files is not null && files.Length > 0)
                {
                    FilesAdded?.Invoke(this, files);
                }
            }
            finally
            {
                button.IsEnabled = true;
            }
        }
    }

}

