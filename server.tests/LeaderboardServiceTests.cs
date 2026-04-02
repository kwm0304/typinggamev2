using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NUnit.Framework;
using server.Data;
using server.Models.DTOs;
using server.Models.Entities;
using server.Enums; // adjust if your enum lives elsewhere
using server.Services;
using server.Models;

namespace server.tests
{
    [TestFixture]
    public class LeaderboardServiceTests
    {
        private AppDbContext _context = null!;
        private LeaderboardService _service = null!;
        private ILogger<LeaderboardService> _fakeLogger = null!;
        private AppUser _user1 = null!;
        private AppUser _user2 = null!;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _fakeLogger = Substitute.For<ILogger<LeaderboardService>>();

            // Seed users
            _user1 = new AppUser { Id = Guid.NewGuid().ToString(), UserName = "user1" };
            _user2 = new AppUser { Id = Guid.NewGuid().ToString(), UserName = "user2" };
            _context.Users.AddRange(_user1, _user2);

            // Seed test results (mix of dates and stats)
            _context.TestResults.AddRange(
                new TestResult
                {
                    UserId = _user1.Id,
                    User = _user1,
                    WPM = 100,
                    RawWPM = 110,
                    Accuracy = 0.95m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters { Correct = 100, Incorrect = 5, Extra = 0, Missed = 2 },
                    TestType = "time",
                    TestModifier = "30",
                    PlayedAt = DateTime.UtcNow.AddDays(-1)
                },
                new TestResult
                {
                    UserId = _user1.Id,
                    User = _user1,
                    WPM = 120,
                    RawWPM = 130,
                    Accuracy = 0.97m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters { Correct = 120, Incorrect = 2, Extra = 0, Missed = 1 },
                    TestType = "time",
                    TestModifier = "30",
                    PlayedAt = DateTime.UtcNow.AddDays(-2)
                },
                new TestResult
                {
                    UserId = _user2.Id,
                    User = _user2,
                    WPM = 90,
                    RawWPM = 95,
                    Accuracy = 0.9m,
                    TimeTaken = 60,
                    TestCharacters = new TestCharacters { Correct = 90, Incorrect = 10, Extra = 0, Missed = 5 },
                    TestType = "time",
                    TestModifier = "30",
                    PlayedAt = DateTime.UtcNow.AddDays(-3)
                }
            );

            _context.SaveChanges();

            _service = new LeaderboardService(_context, _fakeLogger);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public async Task GetLeaderboardForTimePeriod_AllTime_ReturnsAggregatedEntries()
        {
            // Act
            var entries = await _service.GetLeaderboardForTimePeriod(LeaderboardTimePeriod.AllTime);

            // Assert
            Assert.IsNotNull(entries);
            Assert.IsNotEmpty(entries);

            // Should have one entry per user
            Assert.AreEqual(2, entries.Count);

            var user1Entry = entries.Single(e => e!.Username == _user1.UserName);
            var user2Entry = entries.Single(e => e!.Username == _user2.UserName);

            // User1 average WPM = (100 + 120) / 2 = 110
            Assert.AreEqual(110m, user1Entry!.WPM);
            Assert.AreEqual(90m, user2Entry!.WPM);
        }

        [Test]
        public async Task GetLeaderboardForTimePeriod_Weekly_FiltersByDate()
        {
            // Arrange
            // all seeded results are within last 7 days in this setup,
            // so both users should appear.
            var entries = await _service.GetLeaderboardForTimePeriod(LeaderboardTimePeriod.Weekly);

            // Assert
            Assert.IsNotNull(entries);
            Assert.AreEqual(2, entries.Count);
        }

        [Test]
        public async Task GetUserLeaderboard_ReturnsOnlyUsersResults_OrderedByPlayedAt()
        {
            // Act
            var entries = await _service.GetUserLeaderboard(_user1.Id);

            // Assert
            Assert.IsNotNull(entries);
            // user1 has 2 results
            Assert.AreEqual(2, entries.Count);

            // Ordered descending by PlayedAt, so the most recent should be first
            var first = entries[0]!;
            var second = entries[1]!;

            Assert.AreEqual(_user1.UserName, first.Username);
            Assert.GreaterOrEqual(DateTime.Parse(first.PlayedAt), DateTime.Parse(second.PlayedAt));
        }

        [Test]
        public async Task GetUserLeaderboard_WithNoResults_ReturnsEmptyList()
        {
            // Act
            var entries = await _service.GetUserLeaderboard("non-existent-user");

            // Assert
            Assert.IsNotNull(entries);
            Assert.IsEmpty(entries);
        }
    }
}
