# TripExpense - Split Expenses with Friends

A modern web application for tracking and splitting trip expenses with friends. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### ✅ Completed Features

- **🔐 Google Authentication** - Secure sign-in with Supabase Auth
- **🏖️ Trip Management** - Create and manage trips with dates
- **💰 Expense Tracking** - Add expenses with categories, amounts, and descriptions
- **👥 Member Management** - Invite friends to trips via shareable links
- **⚖️ Balance Calculation** - Automatic calculation of who owes what
- **💡 Settlement Suggestions** - Smart suggestions for minimal payments
- **📊 CSV Export** - Export expenses and balances as CSV files
- **📱 Mobile Responsive** - Works great on all devices
- **🎨 Modern UI** - Clean, intuitive interface with Tailwind CSS

### 🔄 Core Functionality

1. **Trip Creation**: Users can create trips with names and dates
2. **Expense Logging**: Add expenses with equal splitting among members
3. **Balance Tracking**: Real-time calculation of net balances
4. **Member Invites**: Generate shareable invite links for friends
5. **Data Export**: Download expenses and balances as CSV files

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, Supabase
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Database Schema

The app uses the following main tables:

- `profiles` - User profiles with display names
- `trips` - Trip information (name, dates, owner)
- `trip_members` - Trip membership and roles
- `expenses` - Individual expenses with amounts and categories
- `expense_shares` - How expenses are split among members
- `invites` - Pending trip invitations

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Google OAuth credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TripExpense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database schema from `database-schema.sql`
   - Configure Google OAuth in Supabase Auth settings
   - Disable RLS temporarily for development (see `simple-disable-rls.sql`)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Trip
1. Sign in with Google
2. Click "Create New Trip"
3. Enter trip name and dates
4. Click "Create Trip"

### Adding Expenses
1. Navigate to your trip
2. Go to the "Expenses" tab
3. Click "Add Expense"
4. Fill in amount, category, and description
5. Select who paid
6. Expense is automatically split equally among members

### Inviting Friends
1. Go to the "Members" tab
2. Enter friend's email address
3. Click "Invite"
4. Share the generated invite link

### Viewing Balances
1. Go to the "Balances" tab
2. See net balances for each member
3. View suggested settlements for minimal payments

### Exporting Data
1. Go to the "Export" tab
2. Click "Export Expenses" or "Export Balances"
3. CSV file will download automatically

## Security

- Row Level Security (RLS) policies protect data access
- Users can only access trips they're members of
- Authentication required for all operations
- Server-side validation of all inputs

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)
- Database and authentication handled by Supabase
- No additional backend deployment needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
