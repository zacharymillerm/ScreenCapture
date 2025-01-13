using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace EmployeeApp.Services
{
	public class SyncService
	{
		private readonly HttpClient httpClient;
		private readonly string serverIp;
		private readonly string employeeId;
		private readonly string tempFolder;

		public SyncService(string serverIp, string employeeId, string tempFolder)
		{
			httpClient = new HttpClient();
			this.serverIp = serverIp;
			this.employeeId = employeeId;
			this.tempFolder = tempFolder;

			Directory.CreateDirectory(tempFolder);
		}

		public async Task<bool> SendScreenshotAsync(string filePath)
		{
			if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
				return false;

			try
			{
				using (var content = new MultipartFormDataContent())
				{
					// Asynchronously read the file as bytes using FileStream
					byte[] imageData;
					using (FileStream fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4096, useAsync: true))
					{
						imageData = new byte[fs.Length];
						int bytesRead = await fs.ReadAsync(imageData, 0, imageData.Length);
						if (bytesRead != imageData.Length)
						{
							Console.WriteLine($"Warning: Expected to read {imageData.Length} bytes, but read {bytesRead} bytes.");
						}
					}

					string timestampedFileName = Path.GetFileName(filePath);

					// Add form data
					content.Add(new StringContent(employeeId), "employeeId");
					content.Add(new ByteArrayContent(imageData), "screenshot", timestampedFileName);

					// Send the POST request to the server
					HttpResponseMessage response = await httpClient.PostAsync($"http://{serverIp}/api/upload", content);

					// Log the response status
					Console.WriteLine($"Uploading {filePath}: {(int)response.StatusCode} {response.ReasonPhrase}");

					// If the upload is successful, return true
					if (response.IsSuccessStatusCode)
					{
						return true;
					}
					else
					{
						// Optionally, log the server response for debugging
						string responseContent = await response.Content.ReadAsStringAsync();
						Console.WriteLine($"Server response: {responseContent}");
					}
				}
			}
			catch (Exception ex)
			{
				// Log the exception (optional)
				Console.WriteLine($"Error sending screenshot {filePath}: {ex.Message}");
			}

			// Return false if there was any failure
			return false;
		}

		public void SaveToLocalTemp(string filePath)
		{
			string fileName = Path.GetFileName(filePath);
			string tempFilePath = Path.Combine(tempFolder, fileName);

			if (!File.Exists(tempFilePath))
			{
				File.Copy(filePath, tempFilePath, true);
				Console.WriteLine($"Saved to Temp: {tempFilePath}");
			}
			else
			{
				Console.WriteLine($"File already exists in Temp: {tempFilePath}");
			}
		}

		public async Task RetryFailedUploadsAsync()
		{
			if (!await IsServerAvailable().ConfigureAwait(false))
			{
				Console.WriteLine("Server is still unavailable. Skipping retry.");
				return;
			}

			// Create a copy of the file list to prevent modification during iteration
			var files = Directory.GetFiles(tempFolder).ToList();

			Console.WriteLine($"Retrying upload for {files.Count} files.");

			foreach (string file in files)
			{
				bool success = await SendScreenshotAsync(file).ConfigureAwait(false);
				if (success)
				{
					try
					{
						File.Delete(file);
						Console.WriteLine($"Successfully uploaded and deleted: {file}");
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error deleting file {file}: {ex.Message}");
					}
				}
				else
				{
					Console.WriteLine($"Failed to upload: {file}. It will remain in Temp for future retries.");
				}
			}
		}

		private async Task<bool> IsServerAvailable()
		{
			try
			{
				HttpResponseMessage response = await httpClient.GetAsync($"http://{serverIp}/api/ping").ConfigureAwait(false);
				Console.WriteLine($"Server ping: {(int)response.StatusCode} {response.ReasonPhrase}");
				return response.IsSuccessStatusCode;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Server ping failed: {ex.Message}");
				return false;
			}
		}
	}
}
