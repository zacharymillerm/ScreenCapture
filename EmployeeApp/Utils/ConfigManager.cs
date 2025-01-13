using EmployeeApp.Models;
using System.IO;
using System.Xml.Serialization;

namespace EmployeeApp.Utils
{
	public static class ConfigManager
	{
		private static readonly string configPath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "config.xml");

		public static ConfigModel LoadConfig()
		{
			if (!File.Exists(configPath))
			{
				return new ConfigModel();
			}

			XmlSerializer serializer = new XmlSerializer(typeof(ConfigModel));
			using (FileStream fs = new FileStream(configPath, FileMode.Open))
			{
				return (ConfigModel)serializer.Deserialize(fs);
			}
		}

		public static void SaveConfig(ConfigModel config)
		{
			XmlSerializer serializer = new XmlSerializer(typeof(ConfigModel));
			using (FileStream fs = new FileStream(configPath, FileMode.Create))
			{
				serializer.Serialize(fs, config);
			}
		}
	}
}
