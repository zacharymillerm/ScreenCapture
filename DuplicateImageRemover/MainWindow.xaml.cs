using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media.Imaging;
using System.Diagnostics;

namespace DuplicateImageRemover
{
	public partial class MainWindow : Window
	{
		private string selectedDirectory = string.Empty;
		private List<string> duplicateFiles = new List<string>();

		public MainWindow()
		{
			InitializeComponent();
		}

		// Generate potential file names with 30-second differences
		private List<string> GeneratePreviousFileNames(string fileName)
		{
			var result = new List<string>();
			var timestamp = Path.GetFileNameWithoutExtension(fileName);
			var parts = timestamp.Split('_');
			if (parts.Length != 2) return result;

			// Assuming the timestamp is in format "yyyy-MM-dd_HH-mm-ss"
			var datePart = parts[0];
			var timePart = parts[1];

			var dateTimeString = $"{datePart}T{timePart.Replace('-', ':')}.000Z";

			// Split the date and time into individual components
			var dateTimeParts = dateTimeString.Split('T');
			var date = dateTimeParts[0];  // yyyy-MM-dd
			var time = dateTimeParts[1].Substring(0, 8);  // HH:mm:ss

			// Separate out the hours, minutes, and seconds
			var timeComponents = time.Split(':');
			int hour = int.Parse(timeComponents[0]);
			int minute = int.Parse(timeComponents[1]);
			int second = int.Parse(timeComponents[2]);

			// Simulate subtracting seconds without worrying about time zones
			for (int secondsToSubtract = 29; secondsToSubtract <= 32; secondsToSubtract++)
			{
				// Adjust seconds
				int newSecond = second - secondsToSubtract;
				int newMinute = minute;
				int newHour = hour;

				if (newSecond < 0)
				{
					newSecond += 60;
					newMinute--;
				}
				if (newMinute < 0)
				{
					newMinute += 60;
					newHour--;
				}
				if (newHour < 0)
				{
					newHour += 24;
					// Optionally handle the day change here
					var dateComponents = date.Split('-');
					int year = int.Parse(dateComponents[0]);
					int month = int.Parse(dateComponents[1]);
					int day = int.Parse(dateComponents[2]);

					// Subtract one day
					var previousDay = new DateTime(year, month, day).AddDays(-1);
					date = previousDay.ToString("yyyy-MM-dd");
				}

				// Rebuild the new time string
				string newTime = $"{newHour:D2}-{newMinute:D2}-{newSecond:D2}";
				result.Add($"{date}_{newTime}.jpg");
			}

			return result;
		}


		// Compare images with cropping using System.Drawing for better performance
		bool AreImagesIdentical(string filePath1, string filePath2)
		{
			try
			{
				using (var img1 = new Bitmap(filePath1))
				using (var img2 = new Bitmap(filePath2))
				{
					// Quick check for dimensions
					if (img1.Width != img2.Width || img1.Height != img2.Height)
						return false;

					// Convert to smaller size for faster comparison
					int targetWidth = 64;
					int targetHeight = 64;

					using (var resized1 = ResizeImage(img1, targetWidth, targetHeight))
					using (var resized2 = ResizeImage(img2, targetWidth, targetHeight))
					{
						// Compare pixels directly
						for (int x = 0; x < targetWidth; x++)
						{
							for (int y = 0; y < targetHeight - (60 * targetHeight / img1.Height); y++)
							{
								if (resized1.GetPixel(x, y) != resized2.GetPixel(x, y))
								{
									return false;
								}
							}
						}
						return true;
					}
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error comparing images: {ex.Message}");
				return false;
			}
		}

		private static Bitmap ResizeImage(Image image, int width, int height)
		{
			var destRect = new Rectangle(0, 0, width, height);
			var destImage = new Bitmap(width, height);

			destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

			using (var graphics = Graphics.FromImage(destImage))
			{
				graphics.CompositingMode = CompositingMode.SourceCopy;
				graphics.CompositingQuality = CompositingQuality.HighSpeed;
				graphics.InterpolationMode = InterpolationMode.Low;
				graphics.SmoothingMode = SmoothingMode.None;
				graphics.PixelOffsetMode = PixelOffsetMode.None;

				using (var wrapMode = new ImageAttributes())
				{
					wrapMode.SetWrapMode(WrapMode.TileFlipXY);
					graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
				}
			}

			return destImage;
		}

		private void SelectDirectory_Click(object sender, RoutedEventArgs e)
		{
			var dialog = new Ookii.Dialogs.Wpf.VistaFolderBrowserDialog();
			if (dialog.ShowDialog() == true)
			{
				selectedDirectory = dialog.SelectedPath;
				DirectoryPathTextBox.Text = selectedDirectory;
			}
		}

		private void CheckDuplicates_Click(object sender, RoutedEventArgs e)
		{
			if (string.IsNullOrWhiteSpace(selectedDirectory) || !Directory.Exists(selectedDirectory))
			{
				MessageBox.Show("Please select a valid directory.");
				return;
			}

			// Start the stopwatch to measure time
			var stopwatch = Stopwatch.StartNew();

			DuplicatesListBox.Items.Clear();
			duplicateFiles.Clear();

			var files = Directory.GetFiles(selectedDirectory, "*.jpg");
			foreach (var currentFile in files)
			{
				var possiblePreviousFiles = GeneratePreviousFileNames(Path.GetFileName(currentFile));
				foreach (var prevFile in possiblePreviousFiles)
				{
					var prevFilePath = Path.Combine(selectedDirectory, prevFile);
					if (File.Exists(prevFilePath) && AreImagesIdentical(currentFile, prevFilePath))
					{
						duplicateFiles.Add(prevFilePath);
						DuplicatesListBox.Items.Add(prevFile);
						break; // Stop once a duplicate is found
					}
				}
			}

			// Stop the stopwatch and get the elapsed time
			stopwatch.Stop();

			MessageBox.Show($"Duplicate check completed. Time taken: {stopwatch.Elapsed.TotalSeconds:F2} seconds.");
		}

		private void DeleteSelected_Click(object sender, RoutedEventArgs e)
		{
			foreach (var file in duplicateFiles)
			{
				try
				{
					File.Delete(file);
				}
				catch (Exception ex)
				{
					MessageBox.Show($"Error deleting file {file}: {ex.Message}");
					return;
				}
			}
			DuplicatesListBox.Items.Clear();
			duplicateFiles.Clear();
			MessageBox.Show("Duplicated files are removed.");
		}
	}
}
