# Description - fastmcp_server.py

## What does the file do?
The file creates an instance of a FastMCP server, which hosts MCP tools accessible to agents. The agents can decide to call available tools during a run based on each function's docstring description. 

## What does it interact with?
- **`main.py`** — the FastMCP instance is mounted on the FastAPI app instance
- **`agents.py`** — the FastMCP tools are made available to Pydantic AI agents within their `toolsets` field.

## Why is it important?
FastMCP tools can be used to retrieve external data, perform actions, or interact with other systems as needed. Since tools are accessible during runtime, they enhance the agents' capabilities and lay the groundwork for more complex functionality and better agent responses.

---

### Possible use cases/future extensions:
- Define organized toolsets for different purposes
- Enable agents to call external APIs, queries, or other specialized agents
- Enable agents to initiate specialized workflows
