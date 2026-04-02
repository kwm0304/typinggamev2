using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NUnit.Framework;
using server.Data;
using server.Http;
using server.Models;
using server.Models.DTOs;
using server.Models.Entities;
using server.Services;

namespace server.tests
{
    [TestFixture]
    public class GameServiceTests
    {
        private AppDbContext _context = null!;
        private GameService _service = null!;
        private ILogger<GameService> _fakeLogger = null!;
        private AppUser _testUser = null!;
        private HttpClient _httpClient = null!;

        // Simple stub handler we control
        private sealed class StubHttpMessageHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage> _handler;

            public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
            {
                _handler = handler;
            }

            protected override Task<HttpResponseMessage> SendAsync(
                HttpRequestMessage request,
                System.Threading.CancellationToken cancellationToken)
            {
                return Task.FromResult(_handler(request));
            }
        }

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _fakeLogger = Substitute.For<ILogger<GameService>>();

            // Seed a test user
            _testUser = new AppUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "test-user"
            };
            _context.Users.Add(_testUser);
            _context.SaveChanges();

            // Stub HTTP: always return "some raw text"
            var handler = new StubHttpMessageHandler(_ =>
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("some raw text")
                });

            _httpClient = new HttpClient(handler)
            {
                BaseAddress = new Uri("http://localhost")
            };

            var gameTextClient = new GameTextApiClient(_httpClient);
            _service = new GameService(gameTextClient, _context, _fakeLogger);
        }

        [TearDown]
        public void TearDown()
        {
            _httpClient.Dispose();
            _context.Dispose();
        }

        [Test]
        public async Task CreateGameAsync_ReturnsConfiguredText()
        {
            // Arrange
            var config = new GameConfigurationDTO
            {
                IsQuote = false,
                IsTimed = true,
                IsWords = true,
                GameTextLength = 50
            };

            // Act
            var result = await _service.CreateGameAsync(config);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsFalse(string.IsNullOrWhiteSpace(result.Text));
        }

        [Test]
        public async Task SaveSinglePlayer_WithValidUser_PersistsResult()
        {
            var dto = new TestResultDTO
            {
                UserId = _testUser.Id,
                WPM = 100,
                RawWPM = 110,
                Accuracy = 0.95m,
                TimeTaken = 60,
                TestCharacters = new TestCharacters
                {
                    Correct = 100,
                    Incorrect = 5,
                    Extra = 0,
                    Missed = 2
                },
                TestType = "time",
                TestModifier = "30"
            };

            var message = await _service.SaveSinglePlayer(dto);

            Assert.AreEqual("Test result saved successfully.", message);
            var saved = await _context.TestResults.FirstOrDefaultAsync();
            Assert.IsNotNull(saved);
            Assert.AreEqual(dto.WPM, saved!.WPM);
            Assert.AreEqual(dto.UserId, saved.UserId);
        }

        [Test]
        public void SaveSinglePlayer_WithInvalidUser_Throws()
        {
            var dto = new TestResultDTO
            {
                UserId = "non-existent",
                WPM = 100,
                RawWPM = 110,
                Accuracy = 0.95m,
                TimeTaken = 60,
                TestCharacters = new TestCharacters
                {
                    Correct = 100,
                    Incorrect = 5,
                    Extra = 0,
                    Missed = 2
                },
                TestType = "time",
                TestModifier = "30"
            };

            Assert.ThrowsAsync<ArgumentException>(() => _service.SaveSinglePlayer(dto));
        }

        [Test]
        public async Task SaveMultiplayer_WithValidUsers_PersistsAllResults()
        {
            var otherUser = new AppUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "opponent-user"
            };
            _context.Users.Add(otherUser);
            _context.SaveChanges();

            var dto = new MultiplayerTestResultDTO
            {
                WinningTestResult = new TestResultDTO
                {
                    UserId = _testUser.Id,
                    WPM = 120,
                    RawWPM = 130,
                    Accuracy = 0.97m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters
                    {
                        Correct = 120,
                        Incorrect = 2,
                        Extra = 0,
                        Missed = 1
                    },
                    TestType = "time",
                    TestModifier = "30"
                },
                LosingTestResult = new TestResultDTO
                {
                    UserId = otherUser.Id,
                    WPM = 90,
                    RawWPM = 95,
                    Accuracy = 0.9m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters
                    {
                        Correct = 90,
                        Incorrect = 10,
                        Extra = 0,
                        Missed = 5
                    },
                    TestType = "time",
                    TestModifier = "30"
                }
            };

            var message = await _service.SaveMultiplayer(dto);

            Assert.AreEqual("Test result saved successfully.", message);

            var testResults = await _context.TestResults.ToListAsync();
            Assert.AreEqual(2, testResults.Count);

            var mp = await _context.MultiplayerTestResults
                .Include(m => m.WinningTestResult)
                .Include(m => m.LosingTestResult)
                .FirstOrDefaultAsync();

            Assert.IsNotNull(mp);
            Assert.AreEqual(testResults[0].Id, mp!.WinningTestResultId);
            Assert.AreEqual(testResults[1].Id, mp.LosingTestResultId);
        }

        [Test]
        public void SaveMultiplayer_WithMissingWinner_Throws()
        {
            var otherUser = new AppUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "opponent-user"
            };
            _context.Users.Add(otherUser);
            _context.SaveChanges();

            var dto = new MultiplayerTestResultDTO
            {
                WinningTestResult = new TestResultDTO
                {
                    UserId = "non-existent-user",
                    WPM = 120,
                    RawWPM = 130,
                    Accuracy = 0.97m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters
                    {
                        Correct = 120,
                        Incorrect = 2,
                        Extra = 0,
                        Missed = 1
                    },
                    TestType = "time",
                    TestModifier = "30"
                },
                LosingTestResult = new TestResultDTO
                {
                    UserId = otherUser.Id,
                    WPM = 90,
                    RawWPM = 95,
                    Accuracy = 0.9m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters
                    {
                        Correct = 90,
                        Incorrect = 10,
                        Extra = 0,
                        Missed = 5
                    },
                    TestType = "time",
                    TestModifier = "30"
                }
            };

            Assert.ThrowsAsync<ArgumentException>(() => _service.SaveMultiplayer(dto));
        }
    }
}
