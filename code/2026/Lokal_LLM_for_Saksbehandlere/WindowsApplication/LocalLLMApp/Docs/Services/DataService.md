# DataService

## Overview

`DataService` is a centralized data management service responsible for handling all application data related to users, cases, chats, messages, and maybe files. It acts as a single source of truth between data storage (local or remote) and the rest of the application (e.g., ViewModels).

The service abstracts how data is retrieved, stored, and manipulated, allowing other parts of the application to interact with structured data without needing to know where it comes from or how it is persisted.

---

## Responsibilities

### 1. Data Loading & Initialization

- Loads initial data from a JSON source
- Parses and normalizes the data into strongly typed models.
- Populates an in-memory cache for fast access.

### 2. In-Memory Caching

- Uses a `CacheService` to store all data in memory.
- Stores:
  - **Dictionaries** (e.g. Dictionary<int objectId, object>   ->   Dictionary<int, Case>)
- Maintains derived data such as:
  - ChatMessages related to chat
  - Files related to chat
  - Files related to case

### 3. Data Access Layer

Provides a consistent interface for retrieving:

- Single entities (by ID)
- Collections (all items of a type)
- Filtered data (e.g., chats for a case, messages for a chat)

### 4. Data Mutation

Handles creation and deletion of:

- Users
- Cases
- Chats
- Messages
- FilesInfo

Key behaviors:

- Automatically updates IDs from API responses from `APIService`
- Keeps collection and individual cache entries in sync
- Maintains relationships and derived values (e.g., chat counts)

### 5. Data Transformation

- Converts JSON → domain models (`LoadCacheFromJson`)

---

## Architectural Role

`DataService` sits between:

- **Data Source Layer**
  - `APIService`

- **Application Layer**
  - ViewModels and UI components

It acts as:

- A **repository-like abstraction**
- A **state manager for domain data**
- A **facade over caching and data orchestration**

---

## Data Model Relationships

The service manages hierarchical relationships:
User
└── Cases
└── Chats

Chats
└── Messages

Cases
└── Files

---

## Summary

`DataService` is the backbone of data handling in the application. It centralizes:

- Data loading
- Caching
- Retrieval
- Mutation
- Transformation

By encapsulating all data-related logic, it simplifies the rest of the application and prepares the system for future scalability (e.g., API integration, async operations, and more advanced state management).
