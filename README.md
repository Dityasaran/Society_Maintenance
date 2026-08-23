# Society Maintenance Tracker

A comprehensive, full-stack Next.js web application for apartment societies to streamline and manage resident maintenance complaints, announcements, and notice board bulletins.

## Project Overview

The **Society Maintenance Tracker** enables residents of an apartment complex to log and track complaints (such as plumbing, electrical, cleaning, and security). Administrators are provided with a dedicated management portal containing status tracking, priority controls, automated email updates, notice publishing, and system dashboards displaying status counts and category breakdowns.

---

## Setup & Installation Guide

Follow these steps to run the application locally:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **PostgreSQL** database (running locally or hosted on Neon/Supabase)

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your environment variables:
```bash
cp .env.example .env
```
Fill in the configuration details inside `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A long secure secret key used to sign Auth tokens.
- `CLOUDINARY_URL`: (Optional) Cloudinary credentials. If omitted, files will automatically fallback to local `/public/uploads` disk storage.
- `SMTP_USER` & `SMTP_PASS`: Your Gmail address and Google SMTP app password (for email notifications).
- `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Credentials for the default administrator account.
- `OVERDUE_THRESHOLD_DAYS`: Expiry threshold (default is 3 days).

### 4. Database Setup & Seed
Apply the schema migrations to your database and seed it with sample categories, residents, and the admin account:
```bash
# Push schema changes to database
npx prisma db push

# Run the seed script
npx prisma db seed
```
*(The seed command uses typescript via `ts-node` configured under `prisma/seed.ts`).*

### 5. Running the Application
Launch the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema Explanation

The application relies on the following Prisma-defined models:

1. **User**: Stores information about residents and administrators. Role-based privileges are enforced via the `Role` enum (`RESIDENT` / `ADMIN`). Includes names, flat numbers, and encrypted password hashes.
2. **Complaint**: Logs the specific category, description, status, priority, resolution date, and optional photo URLs. Linked to the filing `User` as a resident.
3. **ComplaintStatusHistory**: Tracks every status transition, priority change, notes, timestamps, and the user who executed the action (providing audit-log logs).
4. **Notice**: Houses general announcement updates. Important notices pin at the top and trigger email broadcasts.

---

## API Documentation

All routes return standard JSON responses and status codes.

### Authentication Endpoints

#### `POST /api/auth/register`
*Registers a new resident.*
- **Request Body**:
  ```json
  {
    "name": "Jane Resident",
    "email": "jane@resident.com",
    "password": "SecurePassword123",
    "flatNumber": "C-302"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": "cuid...",
      "name": "Jane Resident",
      "email": "jane@resident.com",
      "role": "RESIDENT",
      "flatNumber": "C-302"
    }
  }
  ```

#### `POST /api/auth/login`
*Signs in a resident or admin. Returns a JWT stored in an HTTP-only cookie.*
- **Request Body**:
  ```json
  {
    "email": "admin@society.com",
    "password": "SecureAdminPassword@1234"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "cuid...",
      "name": "Society Admin",
      "email": "admin@society.com",
      "role": "ADMIN",
      "flatNumber": null
    }
  }
  ```

#### `POST /api/auth/logout`
*Clears the authentication token cookie.*
- **Response (200 OK)**:
  ```json
  { "success": true }
  ```

---

### Resident Endpoints

#### `GET /api/complaints`
*Lists all complaints raised by the logged-in resident.*
- **Response (200 OK)**: List of complaint objects.

#### `POST /api/complaints`
*Lodge a new complaint (multipart/form-data).*
- **Form Data**:
  - `category`: Plumbing / Electrical / Cleaning / Security / Other
  - `description`: Text explanation
  - `photo`: (Optional) Image file (max 5MB, PNG/JPG/WEBP)
- **Response (201 Created)**: Created complaint object.

#### `GET /api/complaints/[id]`
*Retrieves a specific complaint with its chronological status change audit logs.*
- **Response (200 OK)**: Complaint details with status histories.

---

### Notices Board Endpoints

#### `GET /api/notices`
*Fetches notices board.*
- **Response (200 OK)**: Array of notice objects.

#### `POST /api/notices` *(Admin Only)*
*Publishes a notice and triggers email broadcast if marked important.*
- **Request Body**:
  ```json
  {
    "title": "Scheduled Power Cut",
    "body": "Electrical maintenance on Friday.",
    "isImportant": true
  }
  ```
- **Response (201 Created)**: Created notice details.

---

### Admin-Only Endpoints

#### `GET /api/admin/complaints`
*Lists all complaints, with filters (`category`, `status`, `startDate`, `endDate`), with overdue items pinned at the top.*
- **Response (200 OK)**: Complaint arrays.

#### `PATCH /api/admin/complaints/[id]`
*Updates priority or status. Writes history log. Sends status change email alerts.*
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "note": "Scheduled electrician check"
  }
  ```
- **Response (200 OK)**: Updated complaint object.

#### `GET /api/admin/dashboard`
*Aggregates status counts, overdue statistics, recent log alerts, and category chart counts.*
- **Response (200 OK)**: Dashboard metrics summary.
