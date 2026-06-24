using System;
using System.Collections.Generic;
using Microsoft.UI.Xaml.Controls;

// <Purpose>
// Defines an interface for view navigation services.
// Providing the methods for managing navigation within the application.
// </Purpose>
// Does not include further logic for the implementation of the methods,
// this is done in ViewNavigationService.cs which implements this interface.

namespace LocalLLMApp.Services
{
    public interface IViewNavigationService
    {
        // Registers a Frame for navigation purposes.
        void RegisterFrame(Frame frame);

        // Navigates to a specified page type using the registered Frame.
        void NavigateTo(Type pageType);

        // Navigates to a specified page type using a provided Frame.
        void NavigateTo(Type pageType, Frame __frame);

        // Navigates to a specified page type using a provided Frame and passing a parameter to the target page.
        void NavigateTo(Type pageType, Frame __frame, object parameter);

        // Navigates back to the previous page if possible.
        void GoBack();

        // Indicates whether the registered Frame can navigate back to a previous page.
        bool CanGoBack { get; }
    }
}
