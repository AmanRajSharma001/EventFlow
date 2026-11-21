# EventFlow Query Execution Output: Query 07

## 1. Query Title & Operational Intent
**Tag-Based Event Discovery Using PostgreSQL Native Array Containment**

* **Description**: Leverages PostgreSQL's native array overlap operator (&&) to search events tagged with Technology, Coding, Hackathon, or Arts keywords.
* **Execution Timestamp**: 2026-11-21T17:57:20.490Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 2

---

## 2. SQL Query Source
```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.category,
    e.location,
    e.tags,
    e."startDate" AS start_date,
    e.status
FROM "Event" e
WHERE e.tags && ARRAY['Coding', 'Hackathon', 'Arts', 'Startup', 'Photography']::TEXT[]
ORDER BY e."startDate" ASC;
```

---

## 3. Actual Tabular Execution Output

| event_id | title | category | location | tags | start_date | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 5958f784-7cb6-4768-bd4d-8d9f63e92c4f | Chroma Lens: Annual Campus Photography Contest | Competitions | Exhibition Hall, Fine Arts Wing | ["Photography","Arts","Exhibition"] | 2026-11-04 13:54:40 | COMPLETED |
| 0b71fa81-6e08-4e0c-b069-26cc960ce37b | Hackathon 2026: 36-Hour National Code Sprint | Technical | Computing Hub, Block 4 | ["Hackathon","AI & ML","Software","Coding"] | 2026-12-05 13:54:40 | PUBLISHED |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "startDate", "Event"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
