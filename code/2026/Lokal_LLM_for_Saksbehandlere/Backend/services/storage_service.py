"""
services/storage_service.py
----------------
Manages all read and writes to the local filesystem.

"""
from pathlib import Path
from fastapi import File
from typing import Literal, Iterator
import os
from dotenv import load_dotenv

load_dotenv() # needed for finding STORAGE_DIR & STORAGE_ENVIRONMENT

# ========================================== #
#           Constants and Variables          #
# ========================================== #
# In containerized production the deploy script mounts a host folder to /app/storage
# and the container's .env should set STORAGE_DIR=/app/storage and STORAGE_ENVIRONMENT accordingly.
storage_dir = os.getenv("STORAGE_DIR", "./local_storage")                  # The directory the file will be stored in
storage_environment = os.getenv("STORAGE_ENVIRONMENT")  # Used with one of the database columns to see what machine it is stored on


# ========================================== #
#                   CREATE                   #
# ========================================== #
async def store_file_to_disk(user_id: int, file_variant: Literal["raw", "processed"], upload_file: File):
  """Store a raw file to the filesystem"""
  dir_user_id = "user_" + str(user_id) # Create the dir name for the user
  file_path = Path(storage_dir) / file_variant / storage_environment / dir_user_id / upload_file.filename

  # Read the contents of the file and exit if nothing there
  contents = await upload_file.read()

  if not contents:
    return False
  
  # Make sure the file_path exists and write contents to file_path
  file_path.parent.mkdir(parents=True, exist_ok=True)
  file_path.write_bytes(contents)

  return True



# ========================================== #
#                   READ                     #
# ========================================== #
async def retrieve_file_from_disk(user_id: int, file_variant: Literal["raw", "processed"], filename: str):
  """Fetches a file from the filesystem and returns it"""
  dir_user_id = "user_" + str(user_id) # Create the dir name for the user
  file_path = Path(storage_dir) / file_variant / storage_environment / dir_user_id / filename

  # Check if there is a file at file_path
  if not file_path.is_file():
    raise FileNotFoundError(f"File not found: {file_path}")

  # Read the physical file and return it
  return_file = file_path.read_bytes()
  
  return return_file


def get_file_stream(user_id: int, file_variant: Literal["raw", "processed"], filename: str) -> Iterator[bytes]:
  """Reads a file from disk and returns a stream of the file being read"""
  dir_user_id = "user_" + str(user_id) # Create the dir name for the user
  file_path = Path(storage_dir) / file_variant / storage_environment / dir_user_id / filename

  if not file_path.is_file():
    raise FileNotFoundError(f"File not found: {file_path}")
  
  # Read and return the file in chunks
  def iter_file():
    with file_path.open("rb") as f:
      while chunk := f.read(8192):  # 8kb at a time
        yield chunk

  return iter_file()


def does_file_exist(user_id: int, file_variant: Literal["raw", "processed"], filename: str) -> bool:
  """Returns a bool of whether or not the file exists"""
  dir_user_id = "user_" + str(user_id)
  file_path = Path(storage_dir) / file_variant / storage_environment / dir_user_id / filename

  if file_path.exists():
    return True
  return False



# ========================================== #
#                   UPDATE                   #
# ========================================== #



# ========================================== #
#                   DELETE                   #
# ========================================== #
def delete_file_from_disk(user_id: int, file_variant: Literal["raw", "processed"], filename: str) -> bool:
  """Deletes a file based on filename and user_id, then cleans up dirs if empty"""
  dir_user_id = "user_" + str(user_id)
  file_path = Path(storage_dir) / file_variant / storage_environment / dir_user_id / filename

  if file_path.exists():
    file_path.unlink()
    cleanup_empty_dirs(file_path)
    return True

  return False


def cleanup_empty_dirs(start_path: Path = None):
  """
  Remove empty dirs from storage.
  - If start_path is given, walks up from that path to storage_dir.
  - If no start_path, scans the entire storage_dir.
  """
  base = Path(storage_dir)

  if not base.exists():
    return
  
  if start_path:
    # Walk up from start_path to storage_dir
    current = start_path if start_path.is_dir () else start_path.parent

    while current != base.parent and current.is_relative_to(base):
      if not current.exists() or any(current.iterdir()):
        break # Stop of dir has contents
      current.rmdir()
      current = current.parent
  else:
    # Scan the whole storage_dir bottom-up
    for dir_path in sorted(base.rglob("*"), reverse=True):
      if dir_path.is_dir() and not any(dir_path.iterdir()):
        dir_path.rmdir()

    # Check storage_dir itself last
    if base.exists() and not any(base.iterdir()):
      base.rmdir()



# ========================================== #
#                   OTHER                    #
# ========================================== #



# ========================================== #