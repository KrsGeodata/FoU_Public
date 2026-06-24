# Task: CMS selection for "Min eiendom" modular solution

## User question

I need a list of suitable cms systems for my students to develop a modularized version of our internal section "Min eiendom" in... I recommended them basing their solution on a cms system because such innbygger facing public pages (with login) will both present static information which needs to be updated and organized by non technical people and some "pages" (modules) will need to be specially developed with functionality which talks with backend modules thru api's etc to present information and functionality to the public (overview of their property, data pulled from matrikkelen, ability to generate neighbour lists, varsling av matrikkelfeil (impacts possibly matrikkel quality and taxation)...etc... Point is that the cms system they base their solution on must serve multiple purposes in a professional way.... We prefer python based solutions and containerization.

---

## Direct answer

A solid approach is to base the student solutions on a mature Python/Django CMS such as Django CMS or Wagtail, and treat “Min eiendom” as one or more custom Django apps integrated into the CMS. These systems give non‑technical editors a good UI for static content while allowing developers to build authenticated, API‑backed modules for property data, neighbour lists, and matrikkel error reporting in a containerized deployment. [web:1]

---

## Recommended Python CMS options

### Django CMS

Django CMS is an enterprise‑oriented CMS built on Django with a plugin architecture and strong support for custom apps and integrations. [web:1]  
- Provides page tree management and drag‑and‑drop editing so non‑technical staff can update and organize public‑facing content. [web:1]  
- Designed to be extended via standard Django apps, which fits well for custom “Min eiendom” modules that call REST/GraphQL APIs for matrikkel data, neighbour lists, and similar functionality. [web:1]  

### Wagtail

Wagtail is a widely used Django CMS adopted by many public institutions and larger organizations. [web:1]  
- Offers a strong editor experience and flexible content modeling (e.g. StreamField) so editors can maintain static and semi‑structured pages without developer involvement. [web:1]  
- Provides a clean integration with Django, making it straightforward to embed authenticated dashboards and API‑backed views (for property overview, matrikkel quality reports, etc.) as part of the same project. [web:1]  

### Lighter‑weight Python CMSs

There are smaller Python CMSs (including some Flask‑based or minimalist Django‑based systems) that emphasize modular design and plugins. [web:1]  
- These can be useful as learning tools but often lack the maturity, ecosystem, and robust permission model typically expected for municipal “innbygger” solutions. [web:1]  
- For a serious “Min eiendom” prototype with authentication, roles, and multiple backend integrations, Django CMS or Wagtail will usually be more **appropriate** choices. [web:1]  

---

## Fit for the “Min eiendom” scenario

For your “Min eiendom” use case (citizen‑facing, with login, static info plus custom functional pages), the platform should support:  
- Robust page and menu management so non‑technical staff can maintain and reorganize informational content over time. [web:1]  
- Custom Django apps for:
  - Property overview screens that query internal services or mock APIs. [web:1]  
  - Matrikkel data views and forms for reporting quality issues that can affect taxation. [web:1]  
  - Neighbour list generation, export, and possible notifications. [web:1]  
- Role‑based permissions and workflow for editors, admins, and potentially case workers or technical staff. [web:1]  

Django CMS and Wagtail both satisfy these requirements and also a
