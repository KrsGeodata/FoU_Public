using LocalLLMApp.Models;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using LocalLLMApp.Converters.UI;
using System.Linq;

/*
 * FileListControl - Reusable UserControl for displaying a list of files with delete functionality
 * 
 * This control provides:
 * - Display of file names in a ListView
 * - Single file deletion via an "X" button next to each file
 * - Events for notifying parent components when files are removed
 * - Items property for binding the list of file names (ObservableCollection<FilesInfo>)
 */

namespace LocalLLMApp.UserControls.Files
{
    public sealed partial class FileListControl : UserControl
    {
        // Event raised when a single file is removed
        public event EventHandler<FilesInfo>? RemoveSingleFile;

        // Event raised when multiple files are removed
        public event EventHandler<IEnumerable<FilesInfo>>? RemoveMultipleFiles;

        // Raised when user clicks a file to open it
        public event EventHandler<FilesInfo>? FileOpenRequested;

        // DependencyProperty for Items binding
        public static readonly DependencyProperty ItemsProperty =
            DependencyProperty.Register(
            nameof(Items),
            typeof(ObservableCollection<FilesInfo>),
            typeof(FileListControl),
            new PropertyMetadata(null));


        // Dynamic list of file names to display
        public ObservableCollection<FilesInfo> Items 
        {
            get => (ObservableCollection<FilesInfo>)GetValue(ItemsProperty);
            set => SetValue(ItemsProperty, value);
        }

        public FileListControl()
        {
            InitializeComponent();
        }

        //  Handle file click
        private void FileItem_Clicked(object sender, ItemClickEventArgs e)
        {
            if (e.ClickedItem is FilesInfo file)
            {
                FileOpenRequested?.Invoke(this, file);
            }
        }
        // Handler for single file removal (X button)
        private void RemoveButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.DataContext is FilesInfo fileName)
            {
                RemoveSingleFile?.Invoke(this, fileName);
            }
        }
    }
}
