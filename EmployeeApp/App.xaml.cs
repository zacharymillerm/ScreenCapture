using EmployeeApp.Models;
using EmployeeApp.Utils;
using EmployeeApp.Views;
using System;
using System.Windows;

namespace EmployeeApp
{
	public partial class App : Application
	{
		private void Application_Startup(object sender, StartupEventArgs e)
		{
			ConfigModel config = ConfigManager.LoadConfig();

			MainWindow mainWindow = new MainWindow();

			if (string.IsNullOrEmpty(config.ServerIp) || string.IsNullOrEmpty(config.EmployeeId))
			{
				// Show main window to set server IP and Employee ID
				mainWindow.Show();
			}
			else
			{
				// Initialize services with the saved IP and Employee ID
				mainWindow.InitializeServices(config);
				mainWindow.StartCapture();

				// Hide the window
				mainWindow.Hide();
			}
		}
	}
}
