# Future development

This will be a mix of different thoughts and ideas for future development and things that may need changing.

---

## Planned features / recommended changes / other ideas

**1. File processing**
Currently file processing is awaited when uploading files and sending chats.
Maybe switch out with a queue and background workers. Will add complexity, but will be better in the long run if done properly.

**2. Add more tools for better testability of agent workflow**
Can be simple tools, but having more to choose from will better reflect the state that the program will be in its later stages.

**3. Shorten the context of the conversations in cases where the conversation is very long**
Especially in cases where there are a lot of documents.

**4. Have different data structures for cases, chats, etc. in backend and frontend**
Currently the database, backend and frontend all use the same objects with the exact same structures and values. This may be a security risk since the APIs expose the structure of the database. Maybe split this up in some way, but everything is developed around this system so may be more work that it is worth.

**5. Split up case_service, chat_service etc. into two separate parts**
Currently the services work as both a repository for database calls and as a general service for data handling. Maybe split this up so changes to make things a bit cleaner, and so that potential future changes in the database are easier to handle. Will help with scalability and such.

**6. Rate limit endpoints**

**7. Stop exposing errors in API endpoints**
For easy testing and debugging purposes we took the lazy approach of returning internal backend error messages in API responses. This is a huge security risk if not changed. We did it this way so we could see what went wrong, especially for the deployed server in the VM. This was a lazy approach and should be fixed/improved upon before the project is “finished”. You may choose how you want to handle this, but it’s important for us that you are aware of this.

**8. Add external file storage**
The current file storage stores directly to the VMs local file system, or your own if localhosting. Switch out with something else if need be. The implementation for file storage is in '/Backend/services/storage_service.py'

**9. Add sessions and session tokens**
Use sessions and session tokens to see if you are allowed to call the APIs you want and fetch the data you are requesting. Currently there is nothing that indicates whether you can fetch data "you are not supposed to have access to” if you call one of the endpoints. This was done “intentionally” as some sort of token system should be the best or at least a good way of handling it.

---
