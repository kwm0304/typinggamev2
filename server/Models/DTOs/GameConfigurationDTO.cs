namespace server.Models.DTOs
{
    public class GameConfigurationDTO
    {
        public bool HasPunctuation { get; set; }
        public bool HasNumbers { get; set; }
        public bool IsTimed { get; set; }
        public bool IsWords { get; set; }
        public bool IsQuote { get; set; }
        public string? QuoteSize { get; set; }
        public int? GameTextLength { get; set; }
        public int? GameTimeLengthSeconds { get; set; }
        //15=100 words,30=200 words; 1 minute= 400; 2 minutes= 800
    }
}
