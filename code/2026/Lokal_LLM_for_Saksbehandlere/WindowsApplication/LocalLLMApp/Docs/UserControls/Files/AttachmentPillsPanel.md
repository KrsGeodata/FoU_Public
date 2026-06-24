# AttachmentPillsPanel

## Description

### What does the file do?
`AttachmentPillsPanel` is a container that displays a list of `AttachmentPill` components. It handles collapse/expand behaviour when there are more than 3 attachments, and hides itself completely when there are no attachments.

### What does it interact with?
- Contains `AttachmentPill` as repeated items
- Receives `Attachments` (a list of `FilesInfo`) from `ChatInputControl`
- Fires `AttachmentRemoved` which bubbles up to `ChatInputControl`

### Why is it important?
It manages the visual presentation of all pending attachments and gives the user a clear overview without taking up too much space when many files are attached.

---

## DependencyProperties

| Property | Type | Default | Description |
|---|---|---|---|
| `Attachments` | `ObservableCollection<FilesInfo>` | `null` | The list of files to display as pills |

---

## Computed Properties

These are read-only properties used by `x:Bind` in the XAML to control visibility.

| Property | Type | Description |
|---|---|---|
| `PanelVisibility` | `Visibility` | `Collapsed` when 0 files, `Visible` otherwise |
| `IsCollapsed` | `Visibility` | `Visible` when count > 3 and not expanded |
| `IsExpanded` | `Visibility` | `Visible` when count <= 3, or count > 3 and expanded |
| `IsCollapsible` | `Visibility` | `Visible` only when count > 3 and currently expanded (shows "Show less") |
| `AttachmentCount` | `int` | Current number of attachments |

---

## Events

### `AttachmentRemoved`
- **Fired when:** a pill's X button is clicked
- **Payload:** `string` — file name
- **Handled by:** `ChatInputControl.AttachmentPills_RemoveRequested`

---

## Functions

### `OnAttachmentsChanged` (static)
- **Purpose:** called when the `Attachments` DP is set to a new collection. Subscribes to `CollectionChanged` on the new collection and unsubscribes from the old one, so UI updates when items are added/removed
- **Arguments:** `DependencyObject`, `DependencyPropertyChangedEventArgs`
- **Returns:** nothing

### `OnCollectionChanged`
- **Purpose:** called when items are added or removed from `Attachments`. Triggers `NotifyAll()` to refresh all computed properties
- **Arguments:** standard `NotifyCollectionChangedEventArgs`
- **Returns:** nothing

### `NotifyAll`
- **Purpose:** fires `PropertyChanged` for all computed properties so the UI re-evaluates visibility
- **Returns:** nothing

### `ToggleExpand_Click`
- **Purpose:** toggles `_isExpanded` between true/false and calls `NotifyAll()`
- **Returns:** nothing

### `AttachmentPill_RemoveRequested`
- **Purpose:** receives remove event from a child `AttachmentPill` and re-fires it as `AttachmentRemoved`
- **Arguments:** `string` fileName
- **Returns:** nothing
