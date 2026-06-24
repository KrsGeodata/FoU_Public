# Description - agents.py

## What does the file do?
Agents.py defines AI agents for the backend using Pydantic AI. An agent is provided with at least a system prompt and a connection to a LLM provider/model (through specified environment variables). Additionally, agents can access FastMCP server tools, and utilise specified Pydantic models to structure and validat output from the LLM. See the extended explanation of Pydantic AI agents below for more details.

## What does it interact with?
- **`.env`** — used to configure model access, API keys, base URLs, and model selection.
- **`fastmcp_server.py`** — imports the `mcp` FastMCP instance directly, exposing registered tools to the agent through the `FastMCPToolset`.
- **`main.py`** — imports and executes agents through FastAPI endpoints such as `/chat`.

## Why is it important?
Pydantic AI agents act as the application's 'mcp client'; it provides the connection to the LLMs, and structures how the system handles requests to and from the desktop client. 

---

## Agents
### *agent* 
The main 'orchestrator' agent for handling requests from the desktop client, used in the main FastAPI app /chat endpoint (main.py)

Parameters:
    - `model` — the LLM model used for the agent's reasoning and responses, configured through environment variables. This determines the capabilities and performance of the agent.
    - `system_prompt` — a string that provides the agent with context and instructions for how to respond to user requests. This is crucial for guiding the agent's behavior and ensuring it understands its role and the expectations for its responses.
    - `toolsets` — a list of toolsets that the agent can access and call during a run. In this case, it includes the `mcp` FastMCP instance, which allows the agent to utilize any tools registered on the FastMCP server. This enhances the agent's capabilities by enabling it to perform actions or retrieve information as needed.
    - `output_type` — a Pydantic model that defines the expected structure of the agent
    - `model_settings` — additional settings for the agent's interaction with the LLM, such as temperature, max tokens, etc.

---

### Extended explanation of Pydantic AI agents
Pydantic AI agents can be run in several ways (see https://pydantic.dev/docs/ai/core-concepts/agent/#running-agents), though in our application we utilize the `agent.run()` method. When an agent is run, it processes the provided input (e.g a user request from the desktop client) based on its own agent configuration (model, system promt, toolsets etc.), awaiting a response from the specified LLM model.

Agents exchange information with the LLM through a `ModelMessage` object (see https://pydantic.dev/docs/ai/api/pydantic-ai/messages/). This enables the agent to send structured and detailed information to the LLM, as well as gather useful metadata for each interaction. Utilzing the ModelMessage format also enables essential functionality such as specifying conversation id or logging tool usage. In our application, client requests are converted into the ModelMessage objects using Backend/services/converter_service.py. 

---

### Possible use cases/future extensions:
- Define specialized agents and output models for specific tasks, for example: `DispensationAgent`, `ArchiveAgent`, `RegulatoryLookupAgent`
- Define specialized agents based on the different LLM models and their strengths/capabilities
- Look into Agent() parameters like `max_retries`, `stop_on_tool_use`, `streaming` etc. and how they can be used to configure agent behavior
- Extend the output model with new fields as agent responses become more complex and detailed
- Utilize 'Logfire' to log agent interactions and decisions for debugging and improvement purposes
- Look into additional agent configurations (for example regarding concurrent agent calls and how this should be handled when multiple client requests are made at the same time)