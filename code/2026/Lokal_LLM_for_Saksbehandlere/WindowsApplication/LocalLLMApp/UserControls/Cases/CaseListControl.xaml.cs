using LocalLLMApp.Models;
using LocalLLMApp.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.ObjectModel;
using System.Windows.Input;
using System.Diagnostics;

namespace LocalLLMApp.UserControls.Cases
{
    public sealed partial class CaseListControl : UserControl
    {
        public CaseListControl()
        {
            InitializeComponent();
        }

        public static readonly DependencyProperty ItemsProperty =
            DependencyProperty.Register(nameof(Items), typeof(ObservableCollection<Case>),
                typeof(CaseListControl), new PropertyMetadata(null));

        public ObservableCollection<Case> Items
        {
            get => (ObservableCollection<Case>)GetValue(ItemsProperty);
            set => SetValue(ItemsProperty, value);
        }


        // Event raised when a case item is clicked, passing the clicked Case to the parent
        public event EventHandler<Case>? CaseItemClicked;


        // Handles item click and raises CaseItemClicked event with the clicked Case
        private void CaseListView_ItemClick(object sender, ItemClickEventArgs e)
        {
            if (e.ClickedItem is Case clickedCase)
            {
                CaseItemClicked?.Invoke(this, clickedCase);
            }
        }

        // Event raised when the delete case button is clicked, passing the clicked Case to the parent
        public event EventHandler<Case>? DeleteCaseRequested;
        
        private void DeleteCaseMenuItem_Click(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.DataContext is Case clickedCase)
            {
                DeleteCaseRequested?.Invoke(this, clickedCase);
                return;
            }

            if (sender is FrameworkElement fe && fe.DataContext is Case clickedCaseFromFE)
            {
                DeleteCaseRequested?.Invoke(this, clickedCaseFromFE);
            }
        }

        // Event raised when the rename case button is clicked, passing the clicked Case to the parent
        public event EventHandler<Case> RenameCaseRequested;

        private void RenameCaseMenuFlyoutItem_Click(object sender, RoutedEventArgs e)
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.DataContext is Case clickedCase)
            {
                RenameCaseRequested?.Invoke(this, clickedCase);
                return;
            }

            if (sender is FrameworkElement fe && fe.DataContext is Case clickedCaseFromFE)
            {
                RenameCaseRequested?.Invoke(this, clickedCaseFromFE);
            }
        }

        // Event raise when the archive case button is clicked, passing the clicked Case to the parent
        public event EventHandler<Case> ArchiveCaseRequested;

        private void ArchiveCaseMenuFlyoutItem_Click(object sender, RoutedEventArgs e) 
        {
            if (sender is MenuFlyoutItem menuItem && menuItem.DataContext is Case clickedCase)
            {
                ArchiveCaseRequested?.Invoke(this, clickedCase);
                return;
            }

            if (sender is FrameworkElement fe && fe.DataContext is Case clickedCaseFromFE)
            {
                ArchiveCaseRequested?.Invoke(this, clickedCaseFromFE);
            }
        }
    }

}