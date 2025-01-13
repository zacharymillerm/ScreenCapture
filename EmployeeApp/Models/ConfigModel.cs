using System.Xml.Serialization;

namespace EmployeeApp.Models
{
	[XmlRoot("Config")]
	public class ConfigModel
	{
		public string ServerIp { get; set; }
		public string EmployeeId { get; set; }
	}
}
