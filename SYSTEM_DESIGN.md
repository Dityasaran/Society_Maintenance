# System Design — Society Maintenance Tracker

This document describes the key architectural decisions and implementations for the Society Maintenance Tracker application.

---

## 1. Complaint Status History Model

To ensure transparency and maintain a reliable audit log of all actions taken on a maintenance request, we implement an append-only transaction history model.

```
+---------------+           1:N           +----------------------------+
|   Complaint   | ----------------------> |   ComplaintStatusHistory   |
+---------------+                         +----------------------------+
| id            |                         | id                         |
| residentId    |                         | complaintId (FK)           |
| category      |                         | oldStatus (Nullable Status)|
| status        |                         | newStatus (Status)         |
| priority      |                         | note (Nullable String)     |
| resolvedAt    |                         | changedBy (FK User)        |
+---------------+                         | changedAt                  |
                                          +----------------------------+
```

### Key Decisions
- **Unified Actions**: Both status modifications and priority updates write rows to the history table.
- **Nullability**: `oldStatus` is nullable to represent the initial creation event (`null` to `OPEN`).
- **Actors**: The `changedBy` field references a foreign key to the `User` model, recording the administrator or resident who initiated the state change.
- **Resolution Lock**: Once a complaint transitions to `RESOLVED`, the system populates the `resolvedAt` timestamp. Further changes to the complaint's status are blocked at both database transaction and API level.

---

## 2. Overdue Detection Approach

A complaint is considered "overdue" if it has not been marked as `RESOLVED` and the duration since its creation exceeds the configured days threshold.

### Operational Querying
Instead of setting up recurring cron jobs that update state fields in the database (which can cause synchronization lag and require dedicated worker runtimes), the overdue flag is computed dynamically at read time. 

- **Calculation**: 
  $$\text{Current Date} - \text{Created Date} > \text{OVERDUE\_THRESHOLD\_DAYS}$$
- **API Filtering & Sorting**:
  The admin complaints endpoint fetches the threshold from environment variables (defaulting to 3 days if missing) and maps over the results. Active complaints with matching criteria are flagged with `isOverdue = true`.
- **Priority Pinned Sorting**:
  ```typescript
  complaints.sort((a, b) => {
    const aOverdue = a.isOverdue && a.status !== 'RESOLVED';
    const bOverdue = b.isOverdue && b.status !== 'RESOLVED';
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  ```
  This sorting pins all overdue complaints to the top of the queue, ensuring urgent attention while maintaining chronological order for the rest of the list.

---

## 3. Photo Handling & Upload Strategy

To simplify deployments across diverse platforms (e.g., local developer environments vs Vercel Serverless), we implement a dual-storage strategy behind a single interface.

```
                    +-------------------+
                    |   validateFile()  | (Max 5MB, JPG/PNG/WEBP)
                    +-------------------+
                              |
                              v
                    +-------------------+
                    |   uploadFile()    |
                    +-------------------+
                              |
             +----------------+----------------+
             |                                 |
    [CLOUDINARY_URL Env Set]         [CLOUDINARY_URL Env Empty]
             |                                 |
             v                                 v
   +-------------------+             +-------------------+
   | Cloudinary upload |             | Local Disk write  |
   | (Production mode) |             | (/public/uploads) |
   +-------------------+             +-------------------+
```

### Key Decisions
- **Validation**: Incoming uploads are validated on size (max 5MB) and mime-type (`image/jpeg`, `image/png`, `image/webp`) on both client and server before processing.
- **Unified Interface**: The `lib/upload.ts` module exports an `uploadFile(file: File)` wrapper.
- **Graceful Fallback**: If `CLOUDINARY_URL` is set, the wrapper uploads the file to Cloudinary. Otherwise, it writes the file locally to `/public/uploads` using unique timestamps to prevent name collisions.

---

## 4. Notification Flow

Email notifications keep residents informed of status updates and major building announcements.

### Architectural Decisions
- **Asynchronous Execution**: Email dispatch processes are detached from the primary thread (`Promise.catch(...)`) so that slow SMTP server handshakes never block database writes or delay UI response times.
- **Graceful Error Recovery**: All mailing calls are wrapped in robust `try/catch` layers. Failure to deliver an email will log a detailed error to the console but will not disrupt the user's workflow.
- **SMTP Provider**: Utilizes `nodemailer` with Gmail SMTP and App Passwords for zero-cost operation.
- **Broadcast Scopes**:
  - *Complaint Updates*: Status transitions trigger an email alert to the specific filer.
  - *Notice Broadcasts*: Important notices trigger a parallelised email dispatch to all users with the `RESIDENT` role.
