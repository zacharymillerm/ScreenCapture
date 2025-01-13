using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace EmployeeApp.ViewModels
{
	public class MainWindowViewModel : INotifyPropertyChanged
	{
		private string serverIp;
		private string employeeId;

		public string ServerIp
		{
			get => serverIp;
			set
			{
				serverIp = value;
				OnPropertyChanged();
			}
		}

		public string EmployeeId
		{
			get => employeeId;
			set
			{
				employeeId = value;
				OnPropertyChanged();
			}
		}

		public event PropertyChangedEventHandler PropertyChanged;

		protected void OnPropertyChanged([CallerMemberName] string name = null)
		{
			PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
		}
	}
}
