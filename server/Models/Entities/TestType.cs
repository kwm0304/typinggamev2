using server.Enums;

namespace server.Models.Entities
{
    public class TestType
    {
        public TestTypeEnum TestName { get; set; }
        public string Modifier { get; set; } = string.Empty;
    }
}
