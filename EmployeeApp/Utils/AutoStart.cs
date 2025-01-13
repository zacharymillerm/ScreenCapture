using Microsoft.Win32;

namespace EmployeeApp.Utils
{
	public static class AutoStart
	{
		public static void Register()
		{
			string appName = "EmployeeApp";
			string exePath = System.Reflection.Assembly.GetExecutingAssembly().Location;

			RegistryKey reg = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", true);
			reg.SetValue(appName, exePath);
		}
	}
}
