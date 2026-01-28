---
name: database-skill
description: Design and manage database schemas, tables, and migrations. Use for backend data modeling.
---

# Database Skill

## Instructions

1. **Schema design**
   - Identify entities and relationships
   - Define primary and foreign keys
   - Normalize where appropriate

2. **Table creation**
   - Choose correct data types
   - Apply constraints (NOT NULL, UNIQUE)
   - Add indexes for common queries

3. **Migrations**
   - Create versioned migrations
   - Support up and down changes
   - Keep migrations reversible and minimal

## Best Practices
- Prefer explicit schemas over implicit behavior
- Avoid premature denormalization
- Keep migrations small and incremental
- Never edit applied migrations
- Ensure consistency across environments

## Example Structure
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL
);
