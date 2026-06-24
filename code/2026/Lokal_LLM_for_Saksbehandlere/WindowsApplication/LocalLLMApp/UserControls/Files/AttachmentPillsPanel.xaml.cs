using LocalLLMApp.Models;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;

namespace LocalLLMApp.UserControls.Files
{
    /// <summary>
    /// Container for AttachmentPill components.
    /// Handles collapse/expand logic when there are more than 2 attachments.
    /// </summary>
    public sealed partial class AttachmentPillsPanel : UserControl, INotifyPropertyChanged
    {
        private const int CollapseThreshold = 2;
        public event PropertyChangedEventHandler PropertyChanged;
        public event EventHandler<string> AttachmentRemoved;

        private bool _isExpanded = false;

        // Dependency Property for Attachments - using 'object' type to prevent 
        // InvalidCastException during XAML binding from different collection types.
        public static readonly DependencyProperty AttachmentsProperty =
            DependencyProperty.Register(
                nameof(Attachments),
                typeof(object),
                typeof(AttachmentPillsPanel),
                new PropertyMetadata(null, OnAttachmentsChanged));

        public static readonly DependencyProperty IsReadOnlyProperty =
            DependencyProperty.Register(
                nameof(IsReadOnly),
                typeof(bool),
                typeof(AttachmentPillsPanel),
                new PropertyMetadata(false, OnIsReadOnlyChanged));

        public AttachmentPillsPanel()
        {
            this.InitializeComponent();
        }

        public object Attachments
        {
            get => GetValue(AttachmentsProperty);
            set => SetValue(AttachmentsProperty, value);
        }

        public bool IsReadOnly
        {
            get => (bool)GetValue(IsReadOnlyProperty);
            set => SetValue(IsReadOnlyProperty, value);
        }

        // Helper to count items in the loosely typed Attachments collection
        public int AttachmentCount => (Attachments as IEnumerable)?.Cast<object>().Count() ?? 0;

        // Visibility properties used by x:Bind in XAML
        public Visibility PanelVisibility => AttachmentCount > 0 ? Visibility.Visible : Visibility.Collapsed;
        public Visibility IsCollapsed => AttachmentCount > CollapseThreshold && !_isExpanded ? Visibility.Visible : Visibility.Collapsed;
        public Visibility IsExpanded => (AttachmentCount <= CollapseThreshold) || (AttachmentCount > CollapseThreshold && _isExpanded) ? Visibility.Visible : Visibility.Collapsed;
        public Visibility IsCollapsible => AttachmentCount > CollapseThreshold && _isExpanded ? Visibility.Visible : Visibility.Collapsed;

        private static void OnAttachmentsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is not AttachmentPillsPanel panel) return;

            // Unsubscribe from old collection events to prevent memory leaks
            if (e.OldValue is INotifyCollectionChanged oldNotify)
                oldNotify.CollectionChanged -= panel.OnCollectionChanged;

            // Subscribe to new collection events to ensure UI updates when items are added/removed
            if (e.NewValue is INotifyCollectionChanged newNotify)
                newNotify.CollectionChanged += panel.OnCollectionChanged;

            panel.NotifyAll();
        }

        private static void OnIsReadOnlyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AttachmentPillsPanel panel) panel.NotifyAll();
        }

        private void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            NotifyAll();
        }

        private void ToggleExpand_Click(object sender, RoutedEventArgs e)
        {
            _isExpanded = !_isExpanded;
            NotifyAll();
        }

        private void AttachmentPill_RemoveRequested(object sender, string fileName)
        {
            AttachmentRemoved?.Invoke(this, fileName);
        }

        /// <summary>
        /// Refreshes all calculated UI properties
        /// </summary>
        public void NotifyAll()
        {
            OnPropertyChanged(nameof(AttachmentCount));
            OnPropertyChanged(nameof(PanelVisibility));
            OnPropertyChanged(nameof(IsCollapsed));
            OnPropertyChanged(nameof(IsExpanded));
            OnPropertyChanged(nameof(IsCollapsible));
        }

        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}