using Microsoft.UI.Xaml.Data;
using System;

// It is used to convert file extensions to specific glyphs (icons) for the attachment pills in AttachmentPill.xaml

namespace LocalLLMApp.Converters.UI
{
    public class FileExtensionToGlyphConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, string language)
        {
            string rawExt = value as string ?? "";
            var ext = rawExt.StartsWith(".") ? rawExt.ToLowerInvariant() : "." + rawExt.ToLowerInvariant();

            // Returnerer STRENGER (Glyphs), ikke Brushes
            return ext switch
            {
                ".pdf" => "\uE8A5",
                ".docx" or ".doc" => "\uE8A5",
                ".xlsx" or ".xls" => "\uE9F9",
                _ => "\uE8A5"
            };
        }

        public object ConvertBack(object value, Type targetType, object parameter, string language) => throw new NotImplementedException();
    }
}