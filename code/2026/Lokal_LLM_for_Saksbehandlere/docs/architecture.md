# Architecture Documentation

---

# 1. Overview

This system is designed to provide AI-assisted decision support for municipal case workers. The architecture follows a client/server model with a clear seperation of concerns for each module. 

- Desktop client (Windows / WinUI 3)
- Backend and orchestration layer
- External AI services
- Database storage

This setup ensures that context collection happens locally on the user’s machine, while data processing and AI-realated functionality happens in the backend. 

---

# 2. System Flow

1. A municipal worker interacts with the WinUI desktop client.
2. The client collects relevant context:
   - Active window information
   - Document metadata
   - User-initiated screenshots
3. The client sends context data to the backend API via FastAPI
4. The backend validates and structures the data using Pydantic.
5. The orchestration layer determines:
   - Whether an LLM should be invoked. In some cases the response can be denied due to for instance missing context or sensitive data
   - Which tools (via MCP) should be used
6. MCP acts as the interface between backend and LLM.
7. The external LLM generates a response.
8. The response is returned to the case worker

---


# 3. System Components and Responsibilities

---

## 3.1 Municipal Worker (User)

**Responsibilities:**

- Initiate AI requests such as document summaries or finding relevant information 
- Control when screenshots are captured
- The output of the AI model will facilitate the decision making process, and not replace it

---

## 3.2 WinUI 3 Desktop Client (.NET)
<img width="200" height="200" alt="Logo-winui svg" src="https://github.com/user-attachments/assets/12e24afd-ebf0-4c62-9ec1-27e09e11fb50" />

**Technologies:**
- WinUI 3
- MVVM architecture
- C#
- Windows APIs

**Responsibilities:**

- Present user interface
- Capture contextual information:
  - Active windows
  - Document titles
  - Metadata
  - Other relevant context
- Capture user-initiated screenshots
- Send requests to backend via FastAPI
- Display AI reponses from backend

---


## 3.2 Backend / Orchestration Layer

This is where the core system functionalities lie.

**Responsibilities:**

- Validate incoming data
- Structure the context to the LLM via Pydantic
- Decide:
  - Whether to call LLM
  - Which MCP tools to invoke
- Return AI reponse

---

## 3.5 FastAPI
<img width="1024" height="369" alt="logo-teal" src="https://github.com/user-attachments/assets/7621c052-75f1-4c28-a4f6-dac088f8c57f" />

**Technology:** Python + FastAPI

**Responsibilities:**

- Expose endpoints
- Validation of requests
- Handle authentication (auth will be mocked in the development phase) 
- Route requests to the orchestration layer
- Error handling


FastAPI serves as the entry point to the backend.

---

## 3.6 Pydantic (Contract and Orchestration Models)
![pydantic-ae96ag6mv67bf6hz5726v8](https://github.com/user-attachments/assets/c06e64d8-e857-4f86-b5f8-02ee37fd4685)

Pydantic is used for:

- JSON validation
- Orchestration
- Aid the LLM with returning deterministic responses

**Responsibilities:**
- Maintain structural integrity of the data
- [Fill in when we know more]


---

## 3.7 MCP (Model Context Protocol)
<img width="300" height="300" alt="mcp" src="https://github.com/user-attachments/assets/0054e778-e170-4122-99c2-2e23dc5fb5d3" />


MCP functions as a connector for AI applications to read files, query databases and use tools, which reduces the need for implementing custom integrations. 

**Responsibilities:**

- Returns responses back to the orchestration layer
- Isolation between orchestration and LLM
- [Fill in when we know more]

---

## 3.8 External LLM 

**Responsibilities:**

- Text summarization
- Context analysis
- Output generation


---

## 3.9 Supabase / PostgreSQL

**Responsibilities:**

- Store relevant data such as session data, prompt history and other logs

## 4.0 Architectural Constraints and Limitations

While the architecture establishes a clear seperation of concerns and a scalable structure, several limitations and contraints must be acknowledged. 

The system processes contextual information such as document metadata, active window information and user-initiated screenshots. This introduces several contraints such as:

- Sensitive data must not be transmitted unless necessary
- LLM invocation must be restricted if the data does not comply to privacy regulations such as    GDPR
- Storing sensitive data such as prompt history or session logs in Supabase must require  careful consideration

## 4.1 LLM Contraints
- Undetermenistic responses and risk of hallucination
- Limited control over behaviour
- Potential outages if using an external LLM during the development
- Unpredictable response latency

## 4.2 Windows-Only Client
- System is restricted to strictly Windows environments
- No cross platform support
- Deployment and maintenance is limited to Windows infrastructure

---


# 7. Future work

- Supplement more information for each module once we gain a broader understanding. 
- Depolyment test

---


