
<details>
<summary><strong>Database_setup</strong></summary>
  
<strong>docker-compose-yml</strong>
  - Defined parameters such as:
    - build parameters
    - when to run restart
    - environmental parameters like username, password and database name (will be changed later and added to a .env)
    - ports
    - volume for persistent data
    - which network to communicate on
    - _Parts of the file was fetched from Stack Overflow_
  
<strong>Dockerfile-db</strong>
- Uses the official PostgreSQL 14.20-image
- Runs an update and installs the PostGIS 3 extension that supports PostgreSQL's ability to work with geographical objects
- Initialization of entry point using login criterion from docker-compose.yml
  
</details>


<details>
  <summary><strong>Database_picture</strong></summary>

<img width="600" height="300" alt="image" src="https://github.com/user-attachments/assets/4816c123-89ea-456b-b14d-ced179ef6fee" />
</details>

<details>
<summary><strong>Database_design_code</strong></summary>

```dbml
// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table properties {
  id integer [primary key]
  adress varchar
  postal_code varchar
  city varchar
  gnr_bnr varchar
  owner varchar
  property_area varchar
  use_area varchar
  built_square_meters varchar // bygninger kvm
}

Table cases {
  case_id integer [primary key]
  property_id integer [not null]
  gnr_bnr varchar
  case_type varchar
  case_number integer
  case_officer varchar
  origin varchar // hvilken kommune
  date date
}

Table documents {
  id integer [primary key]
  access_code varchar
  document_type varchar
  sender varchar
  receiver varchar
  main_document varchar
  appendix varchar
  case_id integer [not null]
}

Table neighbour_list {
  id integer [primary key]
  property_id integer [not null]
  neighbour_property_id integer [not null]

  indexes {
    (property_id, neighbour_property_id) [unique]
  }
}

Table regulation_plans {
  id integer [primary key]
  property_id integer [not null]
  archived_at timestamp
  plan_name varchar
}

/* Relationships */
Ref: properties.gnr_bnr < cases.gnr_bnr
Ref: cases.property_id > properties.id
Ref: documents.case_id > cases.case_id
Ref: neighbour_list.property_id > properties.id
Ref: neighbour_list.neighbour_property_id > properties.id
Ref: regulation_plans.property_id > properties.id

