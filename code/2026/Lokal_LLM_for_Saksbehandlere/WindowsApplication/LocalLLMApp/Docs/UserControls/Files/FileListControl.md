# FileListControl

## Description

### What does the file do?
`FileListControl` displays a scrollable list of files belonging to a case. Each file shows an icon based on file type, the file name, and a delete button.

### What does it interact with?
- Used in `CasePage.xaml` in the right panel ("Kilder")
- Bound to `ViewModel.FilesInfo` (files already uploaded to the case, not pending chat attachments)
- Uses `FileExtensionToGlyphConverter` (registered in `ResourceDictionary.xaml`) for icons
- Fires `RemoveSingleFile` and `RemoveMultipleFiles` handled by `CasePage`

### Why is it important?
It gives the user an overview of all files already associated with a case, and lets them remove individual files from the case context.

---

## DependencyProperties

| Property | Type | Default | Description |
|---|---|---|---|
| `Items` | `ObservableCollection<FilesInfo>` | `null` | The list of case files to display |

---

## Events

### `RemoveSingleFile`
- **Fired when:** user clicks the delete button on a single file
- **Payload:** `FilesInfo` — the file object to remove
- **Handled by:** `CasePage.FileListControl_FileRemoved` → `ViewModel.RemoveSingleFileAsync()`

### `RemoveMultipleFiles`
- **Fired when:** multiple files are selected and deleted (currently not active in UI)
- **Payload:** `IEnumerable<FilesInfo>`
- **Handled by:** `CasePage.FileListControl_FilesRemoved` → `ViewModel.RemoveMultipleFiles()`

---

## Functions

### `RemoveButton_Click`
- **Purpose:** fires `RemoveSingleFile` with the file that was clicked
- **Arguments:** the clicked file is retrieved from the button's `DataContext`
- **Returns:** nothing

### `FileItem_Clicked`
- **Purpose:** handles click on a file item (currently opens file or placeholder)
- **Returns:** nothing
