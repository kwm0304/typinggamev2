using server.Models.DTOs;
using System.Text.RegularExpressions;

namespace server.Services
{
    public static class TextUtility
    {

        private static readonly Regex PunctuationRegex = new(@"\p{P}+");
        private static readonly Regex NumberRegex = new(@"\d+");
        private static readonly Regex RemoveExtraSpace = new(@"\s+");
        private static readonly Regex AddAmpersand = new(@"\band\b", RegexOptions.IgnoreCase);
        public static string GetExactLength(string text, int wordAmount)
        {
            if (string.IsNullOrWhiteSpace(text) || wordAmount <= 0)
                return string.Empty;

            var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            Console.WriteLine("word amount: ", wordAmount);
            if (words.Length <= wordAmount)
                return string.Join(' ', words);

            return string.Join(' ', words.Take(wordAmount));
        }
        public static string ConfigureTextForGame(string gameText, GameConfigurationDTO config)
        {
            ArgumentNullException.ThrowIfNull(gameText);
            ArgumentNullException.ThrowIfNull(config);
            var formatted = FormatText(gameText);

            if (config.HasPunctuation)
                formatted = AddPunctuation(formatted);
            else
                formatted = RemovePunctuation(formatted);
            if (config.HasNumbers)
                formatted = AddNumbers(formatted);
            else
                formatted = RemoveNumbers(formatted);
            return formatted;
        }
        public static int GetTextLengthFromConfiguration(GameConfigurationDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (dto.IsQuote)
            {
                if (dto.QuoteSize is null)
                    return 200;

                return GetTextFromQuoteSize(dto.QuoteSize);
            }
            if (dto.IsTimed)
            {
                if (dto.GameTimeLengthSeconds is null)
                    return 200;
                return GetTextSizeFromTimeLimit(dto.GameTimeLengthSeconds.Value.ToString());
            }
            if (dto.IsWords)
            {
                if (dto.GameTextLength is null)
                {
                    return 200;
                }
                else
                {
                    return Convert.ToInt32(dto.GameTextLength);
                }
            }
            return 200;
        }
        public static string FormatText(string gameText)
        {
            if (string.IsNullOrWhiteSpace(gameText))
                return string.Empty;
            var normalized = RemoveExtraSpace.Replace(gameText, " ");
            return normalized.Trim();
        }
        private static int GetTextSizeFromTimeLimit(string timeLimit)
        {
            return timeLimit switch
            {
                "15" => 100,
                "30" => 200,
                "60" => 400,
                "120" => 800,
                _ => 200
            };
        }
        public static int GetTextFromQuoteSize(string quoteSize)
        {
            return quoteSize switch
            {
                "short" => 100,
                "medium" => 200,
                "long" => 400,
                "thicc" or "all" => 600,
                _ => 200
            };
        }
        
        public static string RemovePunctuation(string gameText)
        {
            if (gameText is null) return string.Empty;
            return PunctuationRegex.Replace(gameText, "");
        }
        public static string RemoveNumbers(string gameText)
        {
            if (gameText is null) return string.Empty;
            return NumberRegex.Replace(gameText, "");
        }
        public static string AddPunctuation(string gameText)
        {
            if (string.IsNullOrWhiteSpace(gameText))
                return string.Empty;

            var result = gameText;

            // Add parentheses around the first 2 consecutive words
            result = Regex.Replace(
                result,
                @"\b(\w+)\s+(\w+)\b",
                "($1 $2)",
                RegexOptions.None,
                TimeSpan.FromMilliseconds(100));

            // replace 2 periods with exclamation marks
            result = result.Replace("..", "!!", StringComparison.Ordinal);
            //replace 2 'ands' with ampersands
            var andRegex = AddAmpersand;
            for (int i = 0; i < 2; i++)
            {
                var match = andRegex.Match(result);
                if (!match.Success)
                    break;

                result = andRegex.Replace(result, "&", 1);
            }

            return result;
        }
        public static string AddNumbers(string gameText)
        {
            if (string.IsNullOrWhiteSpace(gameText))
                return string.Empty;

            // separating into words
            var parts = gameText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0)
                return string.Empty;

            var rnd = new Random();

            // Choose up to 2 distinct words
            var indices = Enumerable.Range(0, parts.Length).OrderBy(_ => rnd.Next()).Take(2).ToArray();

            foreach (var idx in indices)
            {
                var digit = rnd.Next(0, 10); // 0-9
                parts[idx] = parts[idx] + digit.ToString();
            }

            return string.Join(' ', parts);
        }

    }
}