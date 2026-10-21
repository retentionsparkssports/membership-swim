# Sparks Sports Academy - Membership Swim

A modern React (Vite + TypeScript) web application for parents to check their children's swimming membership status and attendance history at Sparks Sports Academy.

## Features

- **WhatsApp Number Lookup**: Parents can enter their registered WhatsApp number (with automatic formatting, validation, and demo helper) to look up their children's memberships.
- **Family Dashboard**: Displays active memberships for all children registered under the same parent phone number, including center badges and membership expiry alerts.
- **Membership Expiry Tracker**: Color-coded expiry alerts indicating active status, upcoming expiration (within 30 and 14 days), same-day expiration, or expired memberships with guidance.
- **Detailed Attendance & Class Tracking**:
  - Filter attendance history by Term / Quarter with custom styled dropdown.
  - Class filter tabs: **Semua**, regular classes (e.g., Dolphins Level 2), **Trial**, and **Make Up**.
  - Attendance metrics chip summary displaying counts for Present, Absent, Leave, Trial, and Make Up sessions.
  - Detailed table view for regular classes and dedicated card layout for Make Up and Trial sessions (showing previous class date, replacement date, and reasons).
- **Direct Student Advisor & Support Integration**: Direct links to WhatsApp Student Advisors or Sparks Customer Support.
- **Supabase Integration**: Connected to live Supabase backend RPCs (`get_students_by_phone`, `get_student_by_id`, `get_attendance_by_student_id`) with built-in retry mechanism.

## Development

```bash
npm install
npm run dev
```

Runs on port 3000 at `http://localhost:3000`.

## Build

```bash
npm run build
```
