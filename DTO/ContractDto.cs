public class ContractDto
{
    public string RequestId { get; set; }
    public string StartDate { get; set; }  // nhận dạng string thay vì DateOnly
    public string? EndDate { get; set; }
    public decimal Fee { get; set; }
    public string Schedule { get; set; }
    public string Location { get; set; }
}
