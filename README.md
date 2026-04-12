# Online Course Registration System

Production-oriented monorepo for a university online course registration system with three roles:
- Student
- AAO Officer
- Admin

## Architecture

- `apps/api`: Express + TypeScript + Prisma + MySQL
  - Session authentication with secure HTTP-only cookie
  - 5-minute inactivity timeout (sliding)
  - Role-based authorization middleware
  - Transactional approval flow with capacity conflict protection
- `apps/web`: Next.js 14 App Router + TypeScript + TailwindCSS + React Hook Form
  - Login page
  - Student dashboard (course catalog, form editing, submit/status)
  - AAO dashboard (pending queue, approve/reject)
  - Admin dashboard (user management)
- Database: MySQL with Prisma schema, migration SQL, and seed script

## Folder Structure

```
apps/
  api/
    prisma/
    src/
    tests/
  web/
    app/
    lib/
    tests/
docker-compose.yml
.env.example
```

## Features Implemented

### Authentication & Authorization
- Username/password login
- Password hashing: `SHA-256(salt:password)` with per-user random salt
- Session cookie auth (`ocrs_session`)
- Session auto-expiry after 5 minutes inactivity
- Logout destroys server session
- RBAC on all protected API routes

### Student
- Browse current-semester active courses with pagination
- View course details including remaining slots
- Add/remove courses in registration form
- Prevent duplicate course entries in same form
- One registration form per student per semester
- Submit registration form with seat availability checks
- View registration status (`DRAFT`, `PENDING`, `APPROVED`, `REJECTED`)
- Approved and pending forms are read-only

### AAO Officer
- View pending forms FCFS by `submitted_at ASC`
- View form details
- Approve/reject pending forms
- Transactional approval:
  - re-check capacity at decision time
  - atomic `enrolled_count` increment
  - enrollment creation in same transaction
  - rollback on conflict
- Create/update/delete courses
- Safe delete rule blocks deletion when historical references exist

### Admin
- Create users
- Delete users
- List all users
- Role management at create-time

## API Endpoints

Auth:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Student:
- `GET /api/student/courses`
- `GET /api/student/courses/:id`
- `GET /api/student/form`
- `POST /api/student/form/items`
- `DELETE /api/student/form/items/:itemId`
- `POST /api/student/form/submit`
- `GET /api/student/form/status`

AAO:
- `GET /api/aao/registration-forms?status=pending`
- `GET /api/aao/registration-forms/:id`
- `POST /api/aao/registration-forms/:id/approve`
- `POST /api/aao/registration-forms/:id/reject`
- `POST /api/aao/courses`
- `PATCH /api/aao/courses/:id`
- `DELETE /api/aao/courses/:id`

Admin:
- `GET /api/admin/users`
- `POST /api/admin/users`
- `DELETE /api/admin/users/:id`

## Setup (Local)

1. Copy env:
   - `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
2. Install dependencies:
   - `npm install`
3. Start MySQL (Docker):
   - `docker compose up -d mysql`
4. Run migration and seed:
   - `npm run prisma:generate -w apps/api`
   - `npm run prisma:migrate -w apps/api`
   - `npm run prisma:seed -w apps/api`
5. Run apps:
   - API: `npm run dev:api`
   - Web: `npm run dev:web`

## Docker Full Stack

- `docker compose up --build`
- Compose sets `DATABASE_URL` for the **api** service to `mysql:3306` (the Docker network hostname). Your `.env` / `.env.example` can keep `localhost` for running the API on the host machine.
- MySQL has a **healthcheck** so migrations run only after the database accepts connections.

## Seeded Accounts

- Admin: `admin@university.edu / Admin@123`
- AAO: `aao1@university.edu / Aao@12345`
- Students:
  - `student1@university.edu / Student@123`
  - `student2@university.edu / Student@123`
  - `student3@university.edu / Student@123`

## Business Rule Notes / Assumptions

- Pending forms are **locked** (read-only) until AAO decision.
- Rejected forms are editable and can be re-submitted.
- Course deletion uses **soft delete** (`deleted_at`, `is_active=false`) and is blocked when referenced by historical data for safety.
- Approval conflict fails safely when any selected course reaches full capacity during approval.
- Current semester is the one marked `is_current=true`.

## Testing

- API tests (Vitest + Supertest) cover:
  - invalid credentials
  - RBAC checks
  - domain rules (capacity, duplicate courses, read-only statuses, session timeout)
- Web tests (Vitest + RTL) cover login page rendering.

Run:
- `npm test`

## Deployment / Reliability Considerations

- Use managed MySQL backups or periodic dump schedules (`mysqldump`) in production.
- Run API behind TLS reverse proxy and set secure cookie over HTTPS.
- Add centralized logging and metrics.
- Scale API and web separately via stateless containers; MySQL can be scaled with replication.
