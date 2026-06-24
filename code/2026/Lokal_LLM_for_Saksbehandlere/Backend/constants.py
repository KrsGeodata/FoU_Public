"""
root/constants.py
----------------
Stores shared, project-wide uppercase variables, allowing for consistent configuration management.
"""

# Allowed file types for file APIs and file storage
ALLOWED_FILE_TYPES = {
  #("Extension", "MIME Type"),  # Kind of document
  (".pdf", "application/pdf"),  # Portable Document Format
  (".txt", "text/plain"), # Plain Text File
  (".doc", "application/msword"), # Microsoft Word - legacy
  (".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), # Microsoft Word (OpenXML)
  (".ppt", "application/vnd.ms-powerpoint"),  # Microsoft PowerPoint - legacy
  (".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"), # Microsoft PowerPoint (OpenXML)
  (".xls", "application/vnd.ms-excel"), # Microsoft Excel - legacy
  (".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),  # Microsoft Excel (OpenXML)
  (".csv", "text/csv"), # Comma-separated values
  (".md", "text/markdown"), # Markdown
  (".json", "application/json"),  # JSON format
  (".jpg", "image/jpeg"), # JPEG images
  (".jpeg", "image/jpeg"),  # JPEG images
  (".png", "image/png"),  # Portable Network Graphics
  (".bmp", "image/bmp"),  # Windows OS/2 Bitmap Graphics
  (".svg", "image/svg+xml"),  # Scalable Vector Graphics (SVG)
}

# Max size allowed for an uploaded file
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB in bytes