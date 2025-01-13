using EmployeeApp.Models;
using EmployeeApp.Services;
using EmployeeApp.Utils;
using EmployeeApp.ViewModels;
using Hardcodet.Wpf.TaskbarNotification;
using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;

namespace EmployeeApp.Views
{
	public partial class MainWindow : Window
	{
		public ConfigModel config;
		public ScreenshotService screenshotService;
		public SyncService syncService;
		private DispatcherTimer timer;
		private TaskbarIcon taskbarIcon;

		public MainWindow()
		{
			InitializeComponent();

			// Load existing config or set default
			config = ConfigManager.LoadConfig();
			DataContext = new MainWindowViewModel
			{
				ServerIp = config.ServerIp,
				EmployeeId = config.EmployeeId,
			};

			// Initialize tray icon
			InitializeTrayIcon();

			if (!string.IsNullOrWhiteSpace(config.ServerIp) && !string.IsNullOrWhiteSpace(config.EmployeeId))
			{
				InitializeServices(config);
				SaveButton_Click(null, null); // Simulate button click
			}
		}

		private void InitializeTrayIcon()
		{
			var assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
			var embeddedIcon = System.Drawing.Icon.ExtractAssociatedIcon(assemblyLocation);

			taskbarIcon = new TaskbarIcon
			{
				Icon = embeddedIcon,
				Visibility = Visibility.Visible,
				ToolTipText = "Eagle Vision"
			};

			taskbarIcon.TrayMouseDoubleClick += TaskbarIcon_TrayMouseDoubleClick;
			taskbarIcon.ContextMenu = new System.Windows.Controls.ContextMenu();
			var openMenuItem = new System.Windows.Controls.MenuItem { Header = "Open" };
			openMenuItem.Click += MenuItem_Open_Click;
			taskbarIcon.ContextMenu.Items.Add(openMenuItem);
		}

		public void InitializeServices(ConfigModel config)
		{
			this.config = config;
			screenshotService = new ScreenshotService();
			syncService = new SyncService(config.ServerIp, config.EmployeeId, screenshotService.GetTempFolder());
		}

		private void SaveButton_Click(object sender, RoutedEventArgs e)
		{
			var viewModel = DataContext as MainWindowViewModel;
			config.ServerIp = viewModel.ServerIp.Trim();
			config.EmployeeId = viewModel.EmployeeId.Trim();
			ConfigManager.SaveConfig(config);

			InitializeServices(config);

			AutoStart.Register();

			employeeIdText.IsEnabled = false;
			startButton.IsEnabled = false;
			serverIPText.IsEnabled = false;

			this.Hide();

			StartCapture();
		}

		public void StartCapture()
		{
			timer = new DispatcherTimer
			{
				Interval = TimeSpan.FromSeconds(30)
			};
			timer.Tick += async (s, e) => await CaptureAndSyncAsync();
			timer.Start();
		}

		private async Task CaptureAndSyncAsync()
		{
			try
			{
				// Capture the screenshot and save to a temporary location
				string tempFolder = screenshotService.GetTempFolder();
				string screenshotPath = screenshotService.CaptureScreenshot(tempFolder);
				Console.WriteLine($"Captured screenshot: {screenshotPath}");

				// Attempt to send the current screenshot
				bool isSent = await syncService.SendScreenshotAsync(screenshotPath).ConfigureAwait(false);

				if (isSent)
				{
					// If sent successfully, delete the temp screenshot
					screenshotService.DeleteScreenshot(screenshotPath);
					Console.WriteLine($"Uploaded and deleted: {screenshotPath}");
				}
				else
				{
					// If sending failed, ensure it's saved to Temp (already saved by CaptureScreenshot)
					Console.WriteLine($"Failed to upload: {screenshotPath}. It remains in Temp for retry.");
				}

				// Retry sending any unsent screenshots in the temp folder
				await syncService.RetryFailedUploadsAsync().ConfigureAwait(false);
			}
			catch (Exception ex)
			{
				// Log the exception or handle it appropriately
				Console.WriteLine($"Error during CaptureAndSyncAsync: {ex.Message}");
			}
		}

		private void TaskbarIcon_TrayMouseDoubleClick(object sender, RoutedEventArgs e)
		{
			ShowWindow();
		}

		private void MenuItem_Open_Click(object sender, RoutedEventArgs e)
		{
			ShowWindow();
		}

		private void ShowWindow()
		{
			this.Show();
			this.WindowState = WindowState.Normal;
			this.Activate();
		}

		protected override void OnStateChanged(EventArgs e)
		{
			if (WindowState == WindowState.Minimized)
			{
				this.Hide();
			}
			base.OnStateChanged(e);
		}

		protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
		{
			timer?.Stop();
			taskbarIcon.Dispose();
			base.OnClosing(e);
		}
	}
}
