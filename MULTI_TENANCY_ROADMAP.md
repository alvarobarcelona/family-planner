# Future Roadmap: Multi-Tenancy Architecture

This document outlines the architectural strategies to enable multiple families to use the Family Planner application with data isolation.

## Objective

Transition from a Single-Tenant architecture (current: one database = one family) to a Multi-Tenant architecture (one app instance serving multiple families securely).

---

## Option 1: Shared Database (Logical Separation) - **RECOMMENDED**

All families share the same database instance and tables. Data isolation is enforced at the application level (API/Query layer).

### How it works

Every row in the database belongs to a specific "Household" (Family).

### Implementation Steps

1.  **Database Schema Updates**:

    - Ensure the `households` table is the root entity.
    - Add a `household_id` column (Foreign Key) to **ALL** data tables:
      - `tasks`
      - `shopping_items`
      - `shopping_favorites`
      - `family_members`
    - Add indexes on `household_id` for performance.

2.  **Authentication & Context**:

    - Update the JWT token generation to include the user's `household_id` upon login.
    - Create an Express middleware (`authMiddleware`) that extracts `household_id` from the token and attaches it to `req.user`.

3.  **Backend Refactoring (Critical)**:

    - Modify **every** SQL query to include the tenant filter.
    - _Example Conversion:_
      - Current: `SELECT * FROM tasks`
      - New: `SELECT * FROM tasks WHERE household_id = $1`

4.  **Onboarding Flow**:
    - Implement a "Sign Up" flow where a new user creates a new `Household` entry, effectively becoming the admin of that new family.

### Pros

- **Cost Effective**: One database instance to pay for.
- **Maintainability**: Database migrations (schema changes) run once for everyone.
- **Scalability**: Standard approach for modern SaaS (e.g., Slack, Linear, Notion).

### Cons

- **Risk**: A bug in a SQL query (`WHERE` clause missing) could leak data between families. Strict code reviews and testing are required.

---

## Option 2: Separate Databases (Physical Separation)

Each family gets their own dedicated PostgreSQL database.

### How it works

The application maintains a "Catalog" database to look up which database a user belongs to, then connects to that specific database for their session.

### Implementation Steps

1.  **Catalog Service**: Create a master database that stores User credentials and their assigned Database Connection String.
2.  **Dynamic Connection**: Middleware must instantiate or retrieve a database connection pool specific to the incoming request's tenant.
3.  **Provisioning**: Scripting required to spin up a new Postgres instance (or schema) whenever a user signs up.

### Pros

- **Isolation**: impossible for one family to query another's data by accident.
- **Performance**: One heavy-usage family won't affect others (if on separate hardware).

### Cons

- **Complexity**: Managing connections to hundreds of databases is difficult.
- **Maintenance**: Schema migrations must be run script-wise across hundreds of databases. If one fails, the system enters an inconsistent state.
- **Cost**: Higher infrastructure costs.

---

## Recommendation

**Proceed with Option 1 (Shared Database)**. It is the industry standard for this type of application, easier to maintain, and significantly cheaper to host.
