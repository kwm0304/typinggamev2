namespace server.Models.DTOs
{
    /// <summary>
    /// Game parameters that dictate how the text is generated and modified
    /// </summary>
    public class GameConfigurationDTO
    {
        public bool HasPunctuation { get; set; }
        public bool HasNumbers { get; set; }
        public bool IsTimed { get; set; }
        public bool IsWords { get; set; }
        public bool IsQuote { get; set; }
        public bool IsCustom { get; set; }
        public string? QuoteSize { get; set; }
        public int? GameTextLength { get; set; }
        public int? GameTimeLengthSeconds { get; set; }
    }
}
