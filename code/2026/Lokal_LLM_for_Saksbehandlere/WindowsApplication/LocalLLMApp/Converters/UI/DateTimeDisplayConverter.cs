using Microsoft.UI.Xaml.Data;
using System;
using System.Diagnostics;
using System.Globalization;

// 
// Converter for displaying DateTime values in a user-friendly format in the UI
// It handles both DateTime objects and ISO 8601 formatted strings
//


namespace LocalLLMApp.Converters.UI
{
    public class DateTimeDisplayConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, string language)
        {

            if (value is DateTime dateTime)
            {
                return FormatDateTime(dateTime);
            }

            if (value is string dateString && !string.IsNullOrWhiteSpace(dateString))
            {
                // Try parsing ISO 8601 format: "yyyy-MM-ddTHH:mm:ss"
                if (DateTime.TryParseExact(
                    dateString,
                    "yyyy-MM-ddTHH:mm:ss",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedDate))
                {
                    return FormatDateTime(parsedDate);
                }

                // Fallback: Try general parsing
                if (DateTime.TryParse(dateString, out DateTime fallbackDate))
                {
                    return FormatDateTime(fallbackDate);
                }

                Debug.WriteLine($"DateTimeDisplayConverter: Failed to parse '{dateString}'");
            }

            return value?.ToString() ?? string.Empty;
        }

        // Formats the DateTime based on how recent it is, using Norwegian day names and time formatting
        private string FormatDateTime(DateTime dateTime)
        {
            // Check if date is invalid (MinValue or close to it)
            if (dateTime.Year < 1900)
            {
                return "Ukjent tidspunkt";
            }

            var now = DateTime.Now;
            var timeDifference = now - dateTime;

            // Today: show time only
            if (dateTime.Date == now.Date)
            {
                return $"I dag, {dateTime:HH:mm}";
            }

            // Yesterday
            if (dateTime.Date == now.AddDays(-1).Date)
            {
                return $"I går, {dateTime:HH:mm}";
            }

            // Within last 7 days: show day name
            if (timeDifference.TotalDays >= 0 && timeDifference.TotalDays < 7)
            {
                return $"{GetNorwegianDayName(dateTime.DayOfWeek)}, {dateTime:HH:mm}";
            }

            // Older: show date
            return dateTime.ToString("dd.MM.yyyy, HH:mm");
        }

        private string GetNorwegianDayName(DayOfWeek day)
        {
            return day switch
            {
                DayOfWeek.Monday => "Mandag",
                DayOfWeek.Tuesday => "Tirsdag",
                DayOfWeek.Wednesday => "Onsdag",
                DayOfWeek.Thursday => "Torsdag",
                DayOfWeek.Friday => "Fredag",
                DayOfWeek.Saturday => "Lørdag",
                DayOfWeek.Sunday => "Søndag",
                _ => day.ToString() 

            };
        }
        public object ConvertBack(object value, Type targetType, object parameter, string language)
            => throw new NotImplementedException();
    }
}