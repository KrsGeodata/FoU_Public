# WinUI 3 Project Structure

**LocalLLMApp** - A WinUI 3 desktop application built on .NET 8 with MVVM architecture and MCP integration.

## Tech Stack

- **WinUI 3** - Modern Windows UI framework
- **CommunityToolkit.Mvvm** - MVVM implementation
- **Microsoft.Extensions.DependencyInjection** - Service management
- **StreamJsonRpc** - MCP communication

## Architecture

```
LocalLLMApp/
??? Views/          # XAML UI components
??? ViewModels/     # MVVM view models
??? Services/       # Business logic (MCP client, etc.)
??? Models/         # Data models
??? Docs/           # Documentation
```

## Key Files

- **App.xaml.cs** - Application startup, DI container setup
- **MainWindow.xaml** - Main application window
- **ViewModelBase.cs** - Base class for all ViewModels

## Dependency Injection

Services are registered in `App.xaml.cs` and accessed via:

```csharp
var service = App.Current.Services.GetService<TService>();
```

## Getting Started

```bash
# Restore packages
dotnet restore

# Build
dotnet build

# Run
dotnet run
```

