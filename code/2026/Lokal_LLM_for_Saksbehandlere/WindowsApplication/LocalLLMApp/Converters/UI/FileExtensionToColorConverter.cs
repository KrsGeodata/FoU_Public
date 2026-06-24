using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI;
using System;

// Is used to convert file extensions to specific colors for the attachment pills in the UI
// Is supposed to return brushes, not glyphs, so that the pill background color can be set based on file type

namespace LocalLLMApp.Converters.UI
{
    public class FileExtensionToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, string language)
        {
            string rawExt = value as string ?? "";
            var ext = rawExt.StartsWith(".") ? rawExt.ToLowerInvariant() : "." + rawExt.ToLowerInvariant();

            return ext switch
            {
                ".pdf" => new SolidColorBrush(Colors.Red),
                ".docx" or ".doc" => new SolidColorBrush(Colors.Blue),
                ".xlsx" or ".xls" => new SolidColorBrush(Colors.Green),
                _ => new SolidColorBrush(Colors.Gray)
            };
        }

        public object ConvertBack(object value, Type targetType, object parameter, string language) => throw new NotImplementedException();
    }
}