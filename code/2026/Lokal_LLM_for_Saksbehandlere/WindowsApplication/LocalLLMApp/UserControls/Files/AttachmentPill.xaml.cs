using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

// Single file attachment pill control used in AttachmentPillsPanel or ChatMessageControl
// to display attached files with an option to remove them
// Displays file icon, name, and optionally a remove button
// IsReadOnly property controls whether the pill is editable or read-only
namespace LocalLLMApp.UserControls.Files
{
    // Added INotifyPropertyChanged so the control can notify the UI when the remove button visibility changes
    public sealed partial class AttachmentPill : UserControl, INotifyPropertyChanged
    {
        public static readonly DependencyProperty FileNameProperty =
            DependencyProperty.Register(nameof(FileName), typeof(string), typeof(AttachmentPill), new PropertyMetadata(string.Empty));

        public static readonly DependencyProperty UploadTimeProperty =
            DependencyProperty.Register(nameof(UploadTime), typeof(string), typeof(AttachmentPill), new PropertyMetadata(string.Empty));

        public static readonly DependencyProperty FileExtensionProperty =
            DependencyProperty.Register(nameof(FileExtension), typeof(string), typeof(AttachmentPill), new PropertyMetadata(string.Empty));

        // DP to control whether the pill is in read-only mode (no remove button) or editable mode (shows remove button)
        public static readonly DependencyProperty IsReadOnlyProperty =
            DependencyProperty.Register(
                nameof(IsReadOnly),
                typeof(bool),
                typeof(AttachmentPill),
                new PropertyMetadata(false, OnIsReadOnlyChanged));

        // Fires when this specific pill becomes read-only or editable
        private static void OnIsReadOnlyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AttachmentPill pill)
            {
                // Forces XAML to re-evaluate the visibility properties of the remove button
                pill.OnPropertyChanged(nameof(IsReadOnly));
                pill.OnPropertyChanged(nameof(IsEditable));
                pill.OnPropertyChanged(nameof(RemoveButtonVisibility));
            }
        }

        // Events
        public event EventHandler<string> RemoveRequested;
        public event PropertyChangedEventHandler PropertyChanged;

        public AttachmentPill()
        {
            this.InitializeComponent();
        }

        public string FileName
        {
            get => (string)GetValue(FileNameProperty);
            set => SetValue(FileNameProperty, value);
        }

        public string UploadTime
        {
            get => (string)GetValue(UploadTimeProperty);
            set => SetValue(UploadTimeProperty, value);
        }

        public string FileExtension
        {
            get => (string)GetValue(FileExtensionProperty);
            set => SetValue(FileExtensionProperty, value);
        }

        public bool IsReadOnly
        {
            get => (bool)GetValue(IsReadOnlyProperty);
            set => SetValue(IsReadOnlyProperty, value);
        }

        // Inverted logic for x:Load binding
        public bool IsEditable => !IsReadOnly;

        // Property for either showing or hiding the x button
        public Visibility RemoveButtonVisibility => IsEditable ? Visibility.Visible : Visibility.Collapsed;

        private void RemoveButton_Click(object sender, RoutedEventArgs e)
        {
            RemoveRequested?.Invoke(this, FileName);
        }

        // Helper method to raise PropertyChanged events
        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}