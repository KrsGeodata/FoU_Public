# AttachmentPill

## Description

### What does the file do?
`AttachmentPill` is a reusable UI component that displays a single file attachment as a "pill" — a small, rounded tag showing the file icon, file name, and a remove button.

### What does it interact with?
- Used inside `AttachmentPillsPanel.xaml` as a repeated item in the pills list
- Uses `FileExtensionToGlyphConverter` and `FileExtensionToColorConverter` (registered globally in `ResourceDictionary.xaml`) to show a colored icon based on file extension
- Fires `RemoveRequested` which bubbles up through `AttachmentPillsPanel` → `ChatInputControl` → `CasePage`/`ChatPage`

### Why is it important?
It is the visible representation of a pending chat attachment. The user interacts with it to see what files are attached and to remove them before sending a message.

---

## DependencyProperties

DependencyProperties allow parent controls to pass data into this control via XAML binding.

| Property | Type | Default | Description |
|---|---|---|---|
| `FileName` | `string` | `""` | Display name of the file, shown as text in the pill |
| `FileExtension` | `string` | `""` | File extension (e.g. `.pdf`), used by converters to pick icon and color |
| `UploadTime` | `string` | `""` | Timestamp from backend. Shows "Ukjent tidspunkt" if null or empty |

---

## Events

### `RemoveRequested`
- **Fired when:** user clicks the X button on the pill
- **Payload:** `string` — the `FileName` of the file to remove
- **Handled by:** `AttachmentPillsPanel` → bubbles up to `CasePage`/`ChatPage`

---

## Functions

### `RemoveButton_Click`
- **Purpose:** fires `RemoveRequested` with the current `FileName`
- **Arguments:** standard WinUI event args, not used directly
- **Returns:** nothing
