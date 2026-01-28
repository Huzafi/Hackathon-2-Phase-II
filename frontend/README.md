# Task Manager Frontend

A modern, responsive task management application built with Next.js 15+ App Router, TypeScript, and Tailwind CSS.

## Features

- **User Authentication**: Secure signup and signin with JWT tokens
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Task Completion**: Mark tasks as complete/incomplete with visual feedback
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Real-time Updates**: Automatic task list refresh after operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during API operations
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation support

## Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS 4
- **Authentication**: Better Auth with JWT tokens
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API with custom wrapper

## Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Backend API running on `http://localhost:8000` (FastAPI from Spec 2)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to version control.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                  # Public authentication pages
│   │   ├── signin/              # Sign in page
│   │   └── signup/              # Sign up page
│   ├── (protected)/             # Protected pages (require auth)
│   │   └── tasks/               # Task management pages
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Landing page with redirect logic
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── SigninForm.tsx       # Sign in form
│   │   └── SignupForm.tsx       # Sign up form
│   ├── tasks/                   # Task management components
│   │   ├── TaskList.tsx         # Task list container
│   │   ├── TaskItem.tsx         # Individual task item
│   │   ├── TaskForm.tsx         # Create/edit task form
│   │   ├── CreateTaskModal.tsx  # Create task modal
│   │   └── EditTaskModal.tsx    # Edit task modal
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx           # Button component
│       ├── FormInput.tsx        # Form input component
│       ├── ErrorMessage.tsx     # Error message component
│       ├── LoadingSpinner.tsx   # Loading spinner component
│       ├── EmptyState.tsx       # Empty state component
│       └── Modal.tsx            # Modal dialog component
├── lib/                         # Utility functions and configurations
│   ├── api/                     # API client and functions
│   │   ├── client.ts            # Centralized API client with JWT injection
│   │   ├── auth.ts              # Authentication API functions
│   │   └── tasks.ts             # Task API functions
│   ├── auth/                    # Authentication utilities
│   │   ├── AuthContext.tsx      # Auth context provider
│   │   └── token.ts             # Token storage utilities
│   └── hooks/                   # Custom React hooks
│       └── useAuth.ts           # Authentication hook
├── types/                       # TypeScript type definitions
│   ├── entities.ts              # Core entities (User, Task)
│   ├── api.ts                   # API request/response types
│   ├── ui.ts                    # UI state types
│   ├── errors.ts                # Error types
│   ├── validation.ts            # Validation functions
│   └── index.ts                 # Type exports
├── middleware.ts                # Next.js middleware for route protection
├── .env.local                   # Environment variables (not committed)
├── .env.local.example           # Environment variables template
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

## Key Features Implementation

### Authentication Flow

1. **Sign Up**: Users create an account with email and password
2. **Sign In**: Users authenticate with credentials
3. **JWT Storage**: Access token stored in localStorage
4. **Auto-redirect**: Authenticated users redirected to `/tasks`
5. **Sign Out**: Clears token and redirects to `/signin`

### Task Management

1. **View Tasks**: Display all tasks for authenticated user
2. **Create Task**: Modal form to add new tasks
3. **Edit Task**: Modal form to update existing tasks
4. **Complete Task**: Checkbox to toggle completion status
5. **Delete Task**: Remove tasks with confirmation dialog

### Security

- JWT tokens automatically injected in all API requests
- Protected routes redirect unauthenticated users to signin
- User isolation enforced by backend (JWT validation)
- No secrets hardcoded in frontend code

### Responsive Design

- **Mobile First**: Optimized for 320px-375px screens
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: 44px minimum touch targets
- **Fluid Typography**: Scales naturally across devices

### Accessibility

- **Semantic HTML**: Proper use of nav, main, article, section
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Escape)
- **Focus Indicators**: Visible focus states for interactive elements
- **Color Contrast**: WCAG 2.1 AA compliant (4.5:1 ratio)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the FastAPI backend from Spec 2:

### Authentication Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate user
- `GET /api/auth/me` - Get current user details

### Task Endpoints

- `GET /api/tasks` - List all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

All protected endpoints require JWT token in `Authorization: Bearer <token>` header.

## Development Guidelines

### Adding New Components

1. Create component file in appropriate directory (`components/ui/`, `components/tasks/`, etc.)
2. Use TypeScript with proper prop types
3. Follow naming convention: PascalCase for components
4. Add accessibility attributes (ARIA labels, roles)
5. Implement responsive design with Tailwind CSS

### Making API Calls

Use the centralized API client:

```typescript
import { getTasks, createTask } from '@/lib/api/tasks';

// Fetch tasks
const tasks = await getTasks();

// Create task
const newTask = await createTask({ title: 'New Task', description: 'Description' });
```

The API client automatically:
- Injects JWT token from localStorage
- Handles 401 errors (redirects to signin)
- Formats error messages

### State Management

Use React Context for global state:

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, signin, signout } = useAuth();
  // ...
}
```

## Troubleshooting

### "Cannot connect to backend API"

1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS configuration in backend allows `http://localhost:3000`

### "401 Unauthorized" on all requests

1. Check JWT token in localStorage (DevTools → Application → Local Storage)
2. Verify token is valid at jwt.io
3. Try signing out and signing in again

### Build errors

1. Delete `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
3. Run build again: `npm run build`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Page Load**: < 2 seconds on standard connection
- **API Operations**: < 2 seconds with visual feedback
- **UI Interactions**: 60fps during animations

## License

This project is part of the Hackathon Phase II implementation.

## Support

For issues or questions:
1. Check this README
2. Review feature specification in `specs/003-frontend-integration/spec.md`
3. Review implementation plan in `specs/003-frontend-integration/plan.md`
4. Check backend API documentation at `http://localhost:8000/docs`
