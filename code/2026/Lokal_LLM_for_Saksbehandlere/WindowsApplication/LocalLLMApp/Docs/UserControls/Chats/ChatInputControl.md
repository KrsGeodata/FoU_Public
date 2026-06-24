# ChatInputControl

## Description

### What does the file do?
`ChatInputControl` is a reusable input area used on both `CasePage` and `ChatPage`. It contains an `AttachmentPillsPanel` (shown when files are attached), a text input field, an attach button, and a send button.

### What does it interact with?
- Used in `CasePage.xaml` to compose a new chat with an optional first message and attachments
- Used in `ChatPage.xaml` to send messages in an existing chat
- Contains `AttachmentPillsPanel` internally, which receives the `Attachments` collection
- Fires events that are handled by the parent page (`CasePage`/`ChatPage`)

### Why is it important?
It is the single reusable entry point for all user input in the application. By being self-contained, both `CasePage` and `ChatPage` can use it without duplicating input logic.

---

## DependencyProperties

| Property | Type | Default | Description |
|---|---|---|---|
| `MessageInput` | `string` | `""` | Two-way bound to `ViewModel.MessageInput` |
| `PlaceholderText` | `string` | `"Skriv en melding..."` | Placeholder shown in the text field when empty |
| `SendCommand` | `ICommand` | `null` | Used by `ChatPage` to bind `ViewModel.SendMessageCommand`. Enables/disables send button via `CanExecute` |
| `Attachments` | `ObservableCollection<FilesInfo>` | `null` | Passed to `AttachmentPillsPanel` to display pending attachments |

---

## Events

### `SendRequested`
- **Fired when:** send button is clicked or Enter is pressed
- **Used by:** `CasePage` to call `ViewModel.CreateChat()`
- **Note:** `ChatPage` uses `SendCommand` instead

### `AddFilesRequested`
- **Fired when:** user clicks "Legg til filer" in the attach dropdown
- **Handled by:** parent page opens file picker and calls `ViewModel.AddChatAttachment()`

### `AttachmentRemoved`
- **Fired when:** a pill's X button is clicked (bubbled up from `AttachmentPillsPanel`)
- **Handled by:** parent page removes file from `ViewModel.ChatAttachments`

---

## Functions

### `SendButton_Click`
- **Purpose:** fires `SendRequested` and executes `SendCommand` if available
- **Returns:** nothing

### `SendOnEnter`
- **Purpose:** same as `SendButton_Click` but triggered by the Enter key in the text field
- **Returns:** nothing

### `AddFilesMenuItem_Click`
- **Purpose:** fires `AddFilesRequested` when the "Legg til filer" menu item is clicked
- **Returns:** nothing

### `AttachmentPills_RemoveRequested`
- **Purpose:** receives `AttachmentRemoved` from `AttachmentPillsPanel` and re-fires it as `AttachmentRemoved` on this control, bubbling it up to the parent page
- **Arguments:** `string` fileName
- **Returns:** nothing
