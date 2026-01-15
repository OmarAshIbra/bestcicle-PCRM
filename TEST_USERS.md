# Test Users for Client Management MVP

This document contains the credentials for test users created by the seed data script.

## Test User Accounts

### Admin User

- **Email**: admin@test.com
- **Password**: Admin123!
- **Role**: Admin
- **Full Name**: Admin User
- **Permissions**: Full access to all features

### Manager User

- **Email**: manager@test.com
- **Password**: Manager123!
- **Role**: Manager
- **Full Name**: Manager User
- **Permissions**: Can manage clients, approve projects/tasks, view analytics

### Sales Representatives

#### Sales Rep 1

- **Email**: sales1@test.com
- **Password**: Sales123!
- **Role**: Sales Rep
- **Full Name**: Sarah Johnson
- **Assigned Clients**: Acme Corporation, TechStart Inc, Brown Manufacturing, Wilson Real Estate, Jackson Construction

#### Sales Rep 2

- **Email**: sales2@test.com
- **Password**: Sales123!
- **Role**: Sales Rep
- **Full Name**: Mike Chen
- **Assigned Clients**: Global Finance Ltd, HealthPlus Medical, Martinez Consulting, Community Nonprofit Org

#### Sales Rep 3

- **Email**: sales3@test.com
- **Password**: Sales123!
- **Role**: Sales Rep
- **Full Name**: Emily Rodriguez
- **Assigned Clients**: RetailMax, EduTech Solutions, Taylor Logistics, Thomas Marketing Agency, Harris Automotive Group

## Setup Instructions

1. **Create Auth Users in Supabase**:

   - Go to your Supabase Dashboard
   - Navigate to Authentication > Users
   - Create each user with the emails and passwords listed above
   - Note the UUID assigned to each user

2. **Update Seed Script**:

   - Open `scripts/004-seed-test-data.sql`
   - Replace the placeholder UUIDs with the actual UUIDs from Supabase Auth
   - The placeholder UUIDs are:
     - Admin: `11111111-1111-1111-1111-111111111111`
     - Manager: `22222222-2222-2222-2222-222222222222`
     - Sales1: `33333333-3333-3333-3333-333333333333`
     - Sales2: `44444444-4444-4444-4444-444444444444`
     - Sales3: `55555555-5555-5555-5555-555555555555`

3. **Run Database Scripts**:

   ```bash
   # Run the enhancement schema
   psql -U postgres -d your_database -f scripts/003-enhancement-schema.sql

   # Run the seed data
   psql -U postgres -d your_database -f scripts/004-seed-test-data.sql
   ```

## Sample Data Included

- **15 Clients** across various industries
- **8 Projects** in different states (pending, approved, in progress, completed)
- **9+ Tasks** with various statuses and priorities
- **6 Activities** (emails, calls, meetings, notes)
- **5 Notifications** for testing the notification system
- **3 Email Templates** for testing email functionality

## Testing Scenarios

### As Admin

- Log in as admin@test.com
- View all clients, projects, and tasks
- Approve pending projects
- Delete any record
- View analytics dashboard

### As Manager

- Log in as manager@test.com
- Create and manage clients
- Approve projects created by sales reps
- View team analytics
- Cannot delete clients

### As Sales Rep

- Log in as any sales rep account
- View all clients (can only edit assigned ones)
- Create projects (requires approval)
- Create and manage tasks
- Send emails to clients
