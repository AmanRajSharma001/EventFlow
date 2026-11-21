# EventFlow Query Execution Output: Query 11

## 1. Query Title & Operational Intent
**Campus Venue Scheduling Conflict and Space Utilization Audit**

* **Description**: Performs a relational self-join on Event to detect scheduling overlaps where two distinct active events are booked in the same campus facility on conflicting dates.
* **Execution Timestamp**: 2026-11-21T17:57:20.495Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 2 ms
* **Rows Returned**: 90

---

## 2. SQL Query Source
```sql
SELECT 
    e1.location AS venue,
    e1.id AS event_1_id,
    e1.title AS event_1_title,
    e1."startDate" AS event_1_start,
    e1."endDate" AS event_1_end,
    e2.id AS event_2_id,
    e2.title AS event_2_title,
    e2."startDate" AS event_2_start,
    e2."endDate" AS event_2_end
FROM "Event" e1
JOIN "Event" e2 ON e1.location = e2.location 
    AND e1.id < e2.id
    AND e1.status <> 'CANCELLED'
    AND e2.status <> 'CANCELLED'
    AND (
        (e1."startDate" <= e2."endDate" AND e1."endDate" >= e2."startDate")
        OR (e1."endDate" IS NULL AND e1."startDate"::DATE = e2."startDate"::DATE)
    )
ORDER BY e1.location, e1."startDate";
```

---

## 3. Actual Tabular Execution Output

| venue | event_1_id | event_1_title | event_1_start | event_1_end | event_2_id | event_2_title | event_2_start | event_2_end |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 |
| Campus Arena Complex | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 |
| Campus Arena Complex | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | 2026-11-24 13:55:06 | 2026-11-25 13:55:06 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | 2026-11-24 15:10:39 | 2026-11-25 15:10:39 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 |
| Campus Arena Complex | 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | 2026-11-24 15:19:40 | 2026-11-25 15:19:40 | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 |
| Campus Arena Complex | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 |
| Campus Arena Complex | 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | 2026-11-24 16:26:37 | 2026-11-25 16:26:37 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 |
| Campus Arena Complex | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 | dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | 2026-11-24 16:22:23 | 2026-11-25 16:22:23 |
| Campus Arena Complex | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 | d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | 2026-11-24 16:08:07 | 2026-11-25 16:08:07 |
| Campus Arena Complex | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Campus Arena Complex | 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | 2026-11-24 16:58:50 | 2026-11-25 16:58:50 | a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | 2026-11-24 15:22:38 | 2026-11-25 15:22:38 |
| Campus Arena Complex | e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | 2026-11-24 17:49:21 | 2026-11-25 17:49:21 | fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | 2026-11-24 16:08:48 | 2026-11-25 16:08:48 |
| Lab Complex 4 | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | 2026-11-19 15:22:38 | *NULL* | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* |
| Lab Complex 4 | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* |
| Lab Complex 4 | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | 2026-11-19 16:08:07 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | 2026-11-19 15:19:40 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | 2026-11-19 15:10:40 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | 2026-11-19 13:55:06 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |
| Lab Complex 4 | 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | 2026-11-19 16:22:23 | *NULL* | 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | 2026-11-19 16:08:48 | *NULL* |
| Lab Complex 4 | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* | e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | 2026-11-19 16:26:37 | *NULL* |
| Lab Complex 4 | d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | 2026-11-19 17:49:21 | *NULL* | d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | 2026-11-19 16:58:50 | *NULL* |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "startDate", "endDate", "Event"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
