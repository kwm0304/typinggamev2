namespace server.Http
{
    public sealed class GameTextApiClient
    {
        private readonly HttpClient _http;
        public GameTextApiClient(HttpClient http) 
        { 
            this._http = http;
        }

        public async Task<string> GetExternalText(int wordTarget, CancellationToken ct)
        {
            int paragraphs = wordTarget / 100;
            if (paragraphs == 1)
                paragraphs = 2;
            var url = $"api/?type=meat-and-filler&paras={paragraphs}";
            using var response = await _http.GetAsync(url,ct);
            response.EnsureSuccessStatusCode();
            var payload = await response.Content.ReadAsStringAsync();

            if (payload is null)
                throw new InvalidOperationException("Fetching text failed");
            return payload;
        }
    }
}
