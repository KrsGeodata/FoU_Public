using LocalLLMApp.Models.EventArguments;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

// <Purpose>
// This implements the IViewNavigationService interface,
// providing the actual logic for navigating between views in the application.
// </Purpose>

namespace LocalLLMApp.Services
{
    public class ViewNavigationService //: IViewNavigationService
    {
        // The Frame that is registered for navigation.
        // This is the main Frame used for navigating between views.
        private Frame? _registeredFrame;

        // Indicates whether the registered Frame can navigate back to a previous page.
        public bool CanGoBack => _registeredFrame != null && _registeredFrame.CanGoBack;

        public event EventHandler<NavigationChangedEventArgs> NavigationChanged;

        // Contructor for the ViewNavigationServices class
        // Does nothing at the moment, but can be used for initializing any necessary components in the future
        public ViewNavigationService()
        {
        }

        // Raises an event when navigating showing what the properties of the navigation was.
        // Listened to on DashboardPage.xaml.cs to update NavigationView UI
        protected virtual void OnNavigationChanged(Type pageType, object sentObject = null)
        {
            Debug.WriteLine($"OnNavigationChanged: {pageType}, {sentObject}");
            NavigationChanged?.Invoke(this, new NavigationChangedEventArgs(pageType, sentObject));
        }

        // Registers a Frame for navigation purposes.
        public void RegisterFrame(Frame frame) => _registeredFrame = frame;

        private void NavigateCore(Frame frame, Type pageType, params object[] parameters)
        {
            if (frame is null)
                throw new InvalidOperationException("No frame available for navigation.");

            // Unwrap: single item = treat as a direct parameter, multiple = pass as array, none = null
            object? parameter = parameters.Length switch
            {
                0 => null,
                1 => parameters[0],
                _ => parameters
            };

            Debug.WriteLine($"NavigateCore: {pageType}, param={parameter}");
            OnNavigationChanged(pageType, parameter);
            frame.Navigate(pageType, parameter);
        }

        // 1. Registered frame, no parameter
        public void NavigateTo(Type pageType)
        {
            EnsureFrame();
            NavigateCore(_registeredFrame, pageType);
        }

        // 2. Registered frame, with parameter
        public void NavigateTo(Type pageType, params object[] parameters)
        {
            EnsureFrame();
            NavigateCore(_registeredFrame, pageType, parameters);
        }

        // 3. Explicit frame, no parameter
        public void NavigateTo(Type pageType, Frame frame)
        {
            NavigateCore(frame, pageType);
        }

        // 4. Explicit frame, with parameter
        public void NavigateTo(Type pageType, Frame frame, params object[] parameters)
        {
            NavigateCore(frame, pageType, parameters);
        }

        private void EnsureFrame()
        {
            if (_registeredFrame is null)
                throw new InvalidOperationException(
                    "Navigation frame not registered. Call RegisterFrame before navigating.");
        }
        
        // Navigates back to the previous page if possible.
        public void GoBack()
        {
            if (_registeredFrame != null && _registeredFrame.CanGoBack)
            {
                _registeredFrame.GoBack();
            }
        }

        // Clear the registered frame
        public void ClearRegisteredFrame() 
        {
            if (_registeredFrame != null) 
            { 
                _registeredFrame = null;
            }
        }
    }
}
