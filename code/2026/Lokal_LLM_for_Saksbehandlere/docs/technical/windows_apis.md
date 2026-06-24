# Windows API Usage

This document describes relevant Windows APIs used for capturing context in connection with our project. 

## Window Detection and Metadata

### `GetForegroundWindow()`

**Description**  
Returns a handle (`HWND`) to the window currently in the foreground.

**Use case**
- Identify which window the user is currently active in

### `GetWindowText()`

**Description**  
Retrieves the title text of a specified window.

**Use case**
- Can extract useful context from windows titles


### `GetClassName()`

**Description**  
Returns the window class name.

**Use case**
- Identify the type of application (WinUI, Chrome, etc).
- Filter out irrelevant windows

### `GetWindowRect()`

**Description**  
Retrieves the dimensions and screen position of a window.

**Use case**
- Determine window size and position.
- Crop screenshots to the size of the window

## Screenshot Capture

### `Windows.Graphics.Capture`

**Description**  
Windows 10+ API used for screenshots

**Use case**
- Capture screenshots of the active window.
- Provide screenshot-based input to be passed forward to MCP


## Input Monitoring 

### `SetWindowsHookEx()`

**Description**  
Installs a hook procedure that allows the application to monitor system events such as mouse and keyboard activity.

**Hook types**
- `WH_KEYBOARD_LL` Keyboard hook
- `WH_MOUSE_LL` Mouse hook

**Use case**
- Detect mouse movement, clicks, and scroll activity.
- Monitor keyboard events.
- Trigger context events based on user input

**Important!!**  
Hooks are system-wide and very intrusive for the user. They should only be used if explicitly required. Improper implementation causes huge security and performance concerns

## Summary
- `GetForegroundWindow()`
- `GetWindowText()`
- `GetClassName()`
- `GetWindowRect()`
- `Windows.Graphics.Capture`
- `Keep.Expanding.If.More.Relevant.APIs.Are.Discovered()`
