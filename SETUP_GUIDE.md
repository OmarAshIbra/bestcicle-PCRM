# Setup Guide

This guide will walk you through setting up your Client Management MVP from scratch.

## Step 1: Database Setup

### Run SQL Scripts

The database schema needs to be set up before you can use the application. Execute the SQL scripts in order:

1. **Open the Supabase SQL Editor** (if needed for reference, but you can run scripts directly from v0)
   
2. **Run the schema script**:
   - The script `scripts/001-create-schema.sql` will:
     - Create all tables (users, clients, activities, email_templates)
     - Set up Row Level Security policies
     - Create indexes for performance
     - Add triggers for automatic timestamps

3. **The script creates the following structure**:
   - **users**: Stores user profiles linked to Supabase auth
   - **clients**: Client information and status
   - **activities**: All interactions with clients
   - **email_templates**: Reusable email templates

## Step 2: Create Your First Users

### Sign Up Process

1. **Navigate to `/signup`** in your browser

2. **Fill in the form**:
   - Full Name: Your name
   - Email: Your email address
   - Password: At least 6 characters
   - Role: Choose your role
     - **Admin**: Full access to everything
     - **Manager**: Can manage clients and activities
     - **Sales Rep**: Can manage assigned clients and own activities

3. **Confirm your email**:
   - Check your inbox for a confirmation email from Supabase
   - Click the confirmation link
   - You'll be redirected back to the app

4. **Sign in**:
   - Go to `/login`
   - Enter your email and password
   - You'll be redirected to the dashboard

### Create Additional Team Members

For testing different roles, create multiple accounts:
- 1 Admin account (full control)
- 1 Manager account (can manage clients)
- 1 Sales Rep account (limited access)

## Step 3: Add Your First Clients

Once you're signed in as an Admin or Manager:

1. **Navigate to Clients** (click "Clients" in the navigation)
2. **Click "Add Client"**
3. **Fill in the client information**:
   - Name (required)
   - Email (required)
   - Phone
   - Company
   - Industry
   - Status (Lead, Active, Inactive, Churned)
   - Lifetime Value (in dollars)
   - Assigned To (select a team member)
   - Notes

4. **Click "Create Client"**

Repeat this process to add 5-10 clients for testing.

## Step 4: Create Activities

Activities help you track all interactions with clients:

1. **Navigate to Activities**
2. **Click "Add Activity"**
3. **Fill in the details**:
   - Client (required)
   - Type: Email, Call, Meeting, Note, or Task
   - Subject (required)
   - Description (optional)
   - Scheduled Date & Time (optional)
   - Status: Scheduled, Completed, or Cancelled

4. **Click "Create Activity"**

Examples of activities to create:
- **Email**: "Sent proposal for Q2 services"
- **Call**: "Discovery call to understand needs"
- **Meeting**: "Quarterly business review"
- **Note**: "Client mentioned interest in enterprise plan"
- **Task**: "Follow up on contract renewal"

## Step 5: Set Up Email Templates

Create reusable email templates to save time:

1. **Navigate to Email**
2. **Click the "Templates" tab**
3. **Click "New Template"**
4. **Create a template**:
   - Template Name: "Welcome Email"
   - Subject: "Welcome to Our Platform!"
   - Body: Include {{client_name}} and {{user_name}} placeholders

5. **Click "Create"**

Example templates to create:
- Welcome Email
- Follow-up Email
- Meeting Confirmation
- Contract Renewal Reminder
- Check-in Email

## Step 6: Test the Email System

1. **Navigate to Email**
2. **Stay on the "Compose" tab**
3. **Select a client** from the dropdown
4. **Choose a template** (optional) or write a custom email
5. **The template variables will be replaced**:
   - {{client_name}} → Client's name
   - {{user_name}} → Your name
6. **Click "Send Email"**

Note: In this MVP, emails are simulated. The system will:
- Log the email to the console
- Create an activity record
- Show a success message

## Step 7: Explore the Dashboard

The dashboard shows:
- **Stats Cards**: Total clients, active clients, leads, revenue
- **Charts**: Client distribution by status, revenue trends
- **Recent Activity**: Last 5 activities
- **Upcoming Activities**: Activities in the next 7 days
- **Top Clients**: Clients with highest lifetime value

The dashboard automatically updates when you add clients or activities.

## Testing Different Roles

### As Admin:
- Can create, edit, and delete clients
- Can manage all activities
- Can manage all email templates
- Full access to everything

### As Manager:
- Can create and edit all clients
- Cannot delete clients
- Can view all activities, manage own activities
- Can use email system

### As Sales Rep:
- Can view all clients
- Can only edit clients assigned to them
- Cannot create new clients
- Can create and manage own activities
- Can use email system

## Common Workflows

### Adding a New Lead
1. Go to Clients → Add Client
2. Set Status to "Lead"
3. Assign to a sales rep
4. Create a follow-up activity
5. Send a welcome email

### Converting Lead to Active Client
1. Go to the client's detail page
2. Click "Edit Client"
3. Change Status to "Active"
4. Update Lifetime Value
5. Add a note about the conversion

### Scheduling a Meeting
1. Go to Activities → Add Activity
2. Select the client
3. Type: Meeting
4. Add date and time
5. Status: Scheduled

### Tracking Client Communication
1. After sending an email or making a call
2. Go to Activities → Add Activity
3. Select type (Email or Call)
4. Add details about the conversation
5. Mark as Completed

## Tips for Best Results

1. **Use consistent naming**: Keep client names and companies consistent
2. **Update statuses regularly**: Keep client statuses current
3. **Log all activities**: Every interaction should be tracked
4. **Use templates**: Save time with email templates
5. **Assign clients**: Ensure all clients have an owner
6. **Schedule follow-ups**: Set reminders for future activities
7. **Update lifetime value**: Keep revenue data accurate

## Next Steps

Now that you have the basics set up:
- Explore the different views and filters
- Try searching for clients and activities
- View client detail pages to see activity timelines
- Create custom email templates for your workflows
- Invite team members with different roles

## Need Help?

- Check the main README.md for detailed feature documentation
- Review the database schema in `scripts/001-create-schema.sql`
- Check the browser console for any error messages
- Verify your Supabase connection in the Connect section
