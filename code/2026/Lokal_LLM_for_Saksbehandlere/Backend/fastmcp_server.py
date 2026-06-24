"""
fastmcp_server.py
-------------
Defines the FastMCP server and registers all tools; 'mcp' is imported in main.py to mount it on FastAPI,
and in agents.py to give the agent access to tools.
"""

from fastmcp import FastMCP
from db.queries.file_text import get_file_text_chunks
from db.queries.file_processing import get_file_processing_status

mcp = FastMCP()


@mcp.tool()
async def get_file_content(file_id: str) -> str:
    """
    Hent hele det analyserte tekstinnholdet fra et dokument lastet opp av brukeren.
    
    Kall dette verktøyet når brukereren refererer til en opplastet fil eller stiller et spørsmål som krever at innholdet leser (feks. "Oppsummer dokumentet mitt", "hva sier pdf-en om x", "analyser den opplastede CSV-filen").

    Parameters
    ----------
    file_id : str
        UUID-en til filen slik den allerede er oppgitt i samtalekonteksten. Bruk denne direkte og be aldri brukeren om å skrive inn UUID-en manuelt.

    Returnerer
    -------
    str
        Hele den utpakkedene teksten fra filen (eller chunksene slått i sammen), eller en informativ melding dersom filen ikke er ferdig prosessert, evt feilet. 
    """
    status_record = await get_file_processing_status(file_id)

    if not status_record:
        return f"[File {file_id}: not found. The file may not have been uploaded yet.]"

    status = status_record.get("Status")

    if status in ("UPLOADED", "PROCESSING"):
        return (
            f"[File {file_id}: is still being processed (status: {status}). "
            "Please try again in a moment.]"
        )

    if status == "FAILED":
        error = status_record.get("ErrorMessage") or "unknown error"
        return f"[File {file_id}: processing failed — {error}]"

    if status != "READY":
        return f"[File {file_id}: unexpected status '{status}']"

    chunks = await get_file_text_chunks(file_id)
    if not chunks:
        return f"[File {file_id}: processing completed but no text content was extracted.]"

    return "\n\n".join(chunk["Content"] for chunk in chunks)
