# Client Management MVP

A comprehensive CRM system built with Next.js 16, Supabase, and TypeScript. This application provides complete client relationship management with role-based access control, activity tracking, analytics dashboards, and email management.

## Features

### Authentication & Authorization
- Email/password authentication with Supabase Auth
- Role-based access control (Admin, Manager, Sales Rep)
- Protected routes with middleware
- User profile management

### Dashboard & Analytics
- Key metrics overview (total clients, active clients, leads, revenue)
- Interactive charts showing client distribution and revenue trends
- Recent activity timeline
- Upcoming activities (next 7 days)
- Top clients by lifetime value

### Client Management
- Full CRUD operations for clients
- Searchable and filterable client list
- Detailed client profiles with contact information
- Status tracking (Lead, Active, Inactive, Churned)
- Client assignment to team members
- Activity timeline per client

### Activity Tracking
- Log emails, calls, meetings, notes, and tasks
- Schedule future activities with date/time
- Mark activities as completed
- Filter by type and status
- Automatic linking to clients

### Email System
- Compose emails to clients (simulated in MVP)
- Reusable email templates
- Variable substitution ({{client_name}}, {{user_name}})
- Automatic activity logging for sent emails
- Template management (create, edit, delete)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - The Supabase integration is already connected
   - Run the SQL scripts to set up your database schema

3. **Run database migrations**
   - The SQL scripts are located in the `scripts` folder
   - Execute them in order:
     - `001-create-schema.sql` - Creates all tables and RLS policies
     - `002-seed-data.sql` - (Optional) Contains seed data instructions

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Create your first user**
   - Navigate to `/signup`
   - Create an account with your preferred role
   - Confirm your email (check spam folder)
   - Sign in at `/login`

### Initial Setup Steps

After signing up, you'll need to sync your user profile:

1. Sign in to your account
2. The system will automatically create your user profile in the database
3. You can now start using the application

### Creating Sample Data

To test the application with sample data:

1. Sign up 2-3 users with different roles (admin, manager, sales_rep)
2. As an admin or manager, navigate to `/clients/new` to add clients
3. Create activities for those clients at `/activities/new`
4. Set up email templates at `/email` (Templates tab)

## Database Schema

### Tables

- **users** - Extends Supabase auth.users with profile information and roles
- **clients** - Client information and contact details
- **activities** - All client interactions (emails, calls, meetings, notes, tasks)
- **email_templates** - Reusable email templates

### Row Level Security (RLS)

The application uses Supabase RLS policies for security:

- **Users**: Can view all users, update their own profile
- **Clients**: 
  - All users can view clients
  - Admins and managers can create/update all clients
  - Sales reps can update their assigned clients
  - Only admins can delete clients
- **Activities**:
  - All users can view activities
  - Users can create/update/delete their own activities
  - Admins can update/delete all activities
- **Email Templates**:
  - All users can view templates
  - Users can manage their own templates
  - Admins can manage all templates

## User Roles

### Admin
- Full access to all features
- Can manage all clients and activities
- Can delete records
- Can update any user's data

### Manager
- Can create and update all clients
- Can view all activities
- Can create their own activities
- Cannot delete clients

### Sales Rep
- Can view all clients
- Can update clients assigned to them
- Can create and manage their own activities
- Cannot create or delete clients

## Project Structure

```
app/
├── (auth)/
│   ├── login/          # Login page
│   └── signup/         # Signup page
├── dashboard/          # Main dashboard with analytics
├── clients/            # Client management pages
│   ├── [id]/          # Client detail and edit pages
│   └── new/           # Create new client
├── activities/         # Activity management pages
│   ├── [id]/edit/     # Edit activity
│   └── new/           # Create new activity
├── email/             # Email composer and templates
└── api/
    └── sync-user/     # User profile sync endpoint

components/
├── dashboard/         # Dashboard components (charts, stats, etc.)
├── clients/           # Client-related components
├── activities/        # Activity-related components
├── email/            # Email-related components
└── ui/               # Reusable UI components (shadcn)

lib/
├── supabase/         # Supabase client and server utilities
│   ├── client.ts     # Browser client
│   ├── server.ts     # Server client
│   └── proxy.ts      # Middleware session management
└── auth.ts           # Auth helper functions

scripts/
├── 001-create-schema.sql   # Database schema
└── 002-seed-data.sql       # Sample data (instructions)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Date Handling**: date-fns

## Environment Variables

The following environment variables are automatically provided by the Supabase integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- And other Postgres connection strings

## Features by Role

| Feature | Admin | Manager | Sales Rep |
|---------|-------|---------|-----------|
| View Dashboard | ✅ | ✅ | ✅ |
| View All Clients | ✅ | ✅ | ✅ |
| Create Clients | ✅ | ✅ | ❌ |
| Edit All Clients | ✅ | ✅ | ❌ |
| Edit Assigned Clients | ✅ | ✅ | ✅ |
| Delete Clients | ✅ | ❌ | ❌ |
| Create Activities | ✅ | ✅ | ✅ |
| Edit Own Activities | ✅ | ✅ | ✅ |
| Edit All Activities | ✅ | ❌ | ❌ |
| Send Emails | ✅ | ✅ | ✅ |
| Manage Templates | ✅ | ✅ | ✅ |

## Development Notes

### Email System
In this MVP, emails are simulated. When you "send" an email:
1. The email content is logged to the console
2. An activity record is created with type "email"
3. The email is marked as completed

To implement real email sending, you would integrate with a service like:
- Resend
- SendGrid
- AWS SES

### Future Enhancements
- Real email integration (SMTP/API)
- File attachments for clients
- Advanced filtering and search
- Export data to CSV/Excel
- Calendar view for activities
- Mobile-responsive improvements
- Real-time notifications
- Email tracking (opens, clicks)
- Custom fields for clients
- Pipeline/deal management

## Troubleshooting

### "User profile not found" error
- Make sure you've confirmed your email after signup
- Try signing out and back in
- Check the users table in Supabase to ensure your profile exists

### Cannot create clients
- Verify your user role is "admin" or "manager"
- Check the users table in Supabase dashboard

### RLS policy errors
- Ensure all SQL scripts have been executed
- Verify your user ID exists in the users table
- Check Supabase logs for specific RLS policy violations

## Support

For issues or questions:
1. Check the Supabase integration in the Connect section of the in-chat sidebar
2. Verify environment variables in the Vars section
3. Check the browser console for error messages
4. Review Supabase logs in the dashboard

## License

This is an MVP project built for demonstration purposes.
