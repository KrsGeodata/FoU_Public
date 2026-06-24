using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

// <Purpose>
// This class gets added to the options of a JsonSerializer to be able to parse 
// null values as 0. Needed so there are no issues with the data recieved from some
// of the APIs, and so the whole application doesn't need to account for possible null
// values for integers in objects.
// </Purpose>

namespace LocalLLMApp.Converters.Json
{
    class NullToZeroIntConverter : JsonConverter<int>
    {
        public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null) return 0;
            if (reader.TokenType == JsonTokenType.String)
            {
                var str = reader.GetString();
                return int.TryParse(str, out int parsed) ? parsed : 0;
            }
            return reader.GetInt32();
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
            => writer.WriteNumberValue(value);
    }
}
