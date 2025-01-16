using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace EmployeeApp.Services
{
	public class ScreenshotService
	{
		private readonly string screenshotsFolder;
		private readonly string tempFolder;

		public ScreenshotService()
		{
			// Set the screenshots folder to the application's running directory
			string appDirectory = AppDomain.CurrentDomain.BaseDirectory;

			screenshotsFolder = Path.Combine(appDirectory, "Screenshots");
			tempFolder = Path.Combine(screenshotsFolder, "Temp");

			// Ensure the directories exist
			Directory.CreateDirectory(screenshotsFolder);
			Directory.CreateDirectory(tempFolder);
		}

		public string GetTempFolder() => tempFolder;

		// Overloaded method to specify the save directory
		public string CaptureScreenshot(string saveDirectory = null)
		{
			Rectangle bounds = GetTotalScreenBounds();
			string directory = saveDirectory ?? screenshotsFolder;
			string filePath = Path.Combine(directory, $"{DateTime.UtcNow:yyyy-MM-dd_HH-mm-ss}.jpg"); // Save in the specified folder

			using (Bitmap originalBitmap = new Bitmap(bounds.Width, bounds.Height))
			{
				using (Graphics g = Graphics.FromImage(originalBitmap))
				{
					g.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
				}

				// Resize the image to half its original size
				int newWidth = originalBitmap.Width / 2;
				int newHeight = originalBitmap.Height / 2;

				using (Bitmap resizedBitmap = new Bitmap(originalBitmap, new Size(newWidth, newHeight)))
				{
					// Compress and save the resized image
					SaveCompressedImage(resizedBitmap, filePath, 60);
				}
			}

			return filePath;

			// Method to save compressed image with resizing
			void SaveCompressedImage(Bitmap bitmap, string path, long quality)
			{
				// Get the JPEG codec
				ImageCodecInfo jpegCodec = ImageCodecInfo.GetImageDecoders()
					.FirstOrDefault(codec => codec.FormatID == ImageFormat.Jpeg.Guid);

				if (jpegCodec == null)
					throw new Exception("JPEG codec not found");

				// Set compression quality
				var encoderParameters = new EncoderParameters(1);
				encoderParameters.Param[0] = new EncoderParameter(Encoder.Quality, quality);

				// Save the image
				bitmap.Save(path, jpegCodec, encoderParameters);
			}
		}

		public string[] GetAllScreenshots(string directory = null)
		{
			string searchDirectory = directory ?? screenshotsFolder;
			return Directory.GetFiles(searchDirectory, "*.jpg");
		}

		public void DeleteScreenshot(string filePath)
		{
			if (File.Exists(filePath))
			{
				File.Delete(filePath);
			}
		}

		private Rectangle GetTotalScreenBounds()
		{
			int minX = int.MaxValue;
			int minY = int.MaxValue;
			int maxX = int.MinValue;
			int maxY = int.MinValue;

			foreach (Screen screen in Screen.AllScreens)
			{
				minX = Math.Min(minX, screen.Bounds.X);
				minY = Math.Min(minY, screen.Bounds.Y);
				maxX = Math.Max(maxX, screen.Bounds.X + screen.Bounds.Width);
				maxY = Math.Max(maxY, screen.Bounds.Y + screen.Bounds.Height);
			}

			return new Rectangle(minX, minY, maxX - minX, maxY - minY);
		}
	}
}
