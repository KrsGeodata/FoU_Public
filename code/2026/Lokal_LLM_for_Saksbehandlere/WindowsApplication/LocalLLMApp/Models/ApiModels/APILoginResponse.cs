namespace LocalLLMApp.Models.ApiModels
{
    public class APILoginResponse
    {
        public bool Success { get; set; }

        public string ErrorMessage { get; set; } = string.Empty;

        public long? UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
}
