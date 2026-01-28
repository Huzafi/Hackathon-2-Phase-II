# Quickstart Guide: Frontend Application and Integration

**Feature**: 003-frontend-integration
**Date**: 2026-01-21
**Audience**: Developers setting up and running the Next.js frontend

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18.0+ (check with `node --version`)
- **npm**: Version 9.0+ (check with `npm --version`)
- **Backend API**: FastAPI backend from Spec 2 running on `http://localhost:8000`
- **Database**: Neon PostgreSQL database configured and accessible by backend
- **Git**: For version control

## Initial Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15.1+ (React 19.0+)
- Better Auth 1.0.7+
- TypeScript 5.7+
- ESLint and other dev tools

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration (if needed)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Verify Backend is Running

Ensure the FastAPI backend is running:

```bash
# In a separate terminal, navigate to backend directory
cd ../backend

# Start the backend server
uvicorn src.main:app --reload --port 8000
```

Verify backend is accessible:
```bash
curl http://localhost:8000/docs
```

You should see the FastAPI Swagger documentation.

## Running the Application

### Development Mode

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

**Development Features**:
- Hot module replacement (HMR) - changes reflect immediately
- Fast refresh - preserves component state during edits
- Detailed error messages in browser
- Source maps for debugging

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

**Production Features**:
- Optimized bundle size
- Server-side rendering (SSR)
- Static generation where possible
- Minified and compressed assets

## Project Structure Overview

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public auth pages (signin, signup)
│   ├── (protected)/       # Protected pages (tasks)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── tasks/            # Task components
│   ├── ui/               # Generic UI components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── api/              # API client with JWT injection
│   ├── auth/             # Better Auth config
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── .env.local            # Environment variables (not committed)
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Key Files and Their Purpose

### Authentication

- `lib/auth/config.ts` - Better Auth configuration
- `lib/api/client.ts` - API client with automatic JWT injection
- `app/(auth)/signin/page.tsx` - Signin page
- `app/(auth)/signup/page.tsx` - Signup page
- `middleware.ts` - Route protection and auth checks

### Task Management

- `app/(protected)/tasks/page.tsx` - Task list page
- `components/tasks/TaskList.tsx` - Task list component
- `components/tasks/TaskItem.tsx` - Individual task component
- `components/tasks/TaskForm.tsx` - Create/edit task form
- `lib/api/tasks.ts` - Task API functions

### Type Definitions

- `types/entities.ts` - Core entities (User, Task)
- `types/api.ts` - Request/response types
- `types/ui.ts` - UI state types

## Common Development Tasks

### Adding a New Page

1. Create a new directory in `app/`:
   ```bash
   mkdir -p app/(protected)/new-page
   ```

2. Create `page.tsx`:
   ```tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

3. Access at `http://localhost:3000/new-page`

### Adding a New Component

1. Create component file in `components/`:
   ```bash
   touch components/ui/Button.tsx
   ```

2. Define component:
   ```tsx
   export function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
     return <button onClick={onClick}>{children}</button>;
   }
   ```

3. Import and use:
   ```tsx
   import { Button } from '@/components/ui/Button';
   ```

### Making API Calls

Use the centralized API client:

```tsx
import { getTasks, createTask } from '@/lib/api/tasks';

// In a component or server action
const tasks = await getTasks();
const newTask = await createTask({ title: 'New Task', description: 'Description' });
```

The API client automatically:
- Injects JWT token from localStorage
- Handles 401 errors (redirects to signin)
- Formats error messages

## Testing

### Running Tests (when implemented)

```bash
# Unit and integration tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Signup with new email creates account and redirects to tasks
- [ ] Signin with valid credentials redirects to tasks
- [ ] Signin with invalid credentials shows error
- [ ] Unauthenticated users redirected to signin when accessing /tasks
- [ ] Task list displays all user's tasks
- [ ] Create task form adds new task to list
- [ ] Edit task form updates task in list
- [ ] Complete checkbox toggles task completion status
- [ ] Delete button removes task from list
- [ ] Responsive design works on mobile (320px), tablet (768px), desktop (1920px)

## Troubleshooting

### Issue: "Cannot connect to backend API"

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS configuration in backend allows `http://localhost:3000`

### Issue: "401 Unauthorized" on all API requests

**Solution**:
1. Check JWT token is stored in localStorage: Open DevTools → Application → Local Storage
2. Verify token is valid: Decode at jwt.io
3. Check backend JWT secret matches frontend configuration
4. Try signing out and signing in again

### Issue: "Module not found" errors

**Solution**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Issue: Hot reload not working

**Solution**:
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Check file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Issue: TypeScript errors in IDE

**Solution**:
1. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Verify `tsconfig.json` is correct
3. Run type check: `npx tsc --noEmit`

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` | Yes |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | `your-secret-key` | Yes |
| `BETTER_AUTH_URL` | Frontend URL for Better Auth | `http://localhost:3000` | Yes |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

## Development Workflow

1. **Start Backend**: Ensure FastAPI backend is running on port 8000
2. **Start Frontend**: Run `npm run dev` in frontend directory
3. **Make Changes**: Edit files in `app/`, `components/`, or `lib/`
4. **Test Changes**: Verify in browser at `http://localhost:3000`
5. **Commit Changes**: Use git to commit changes to feature branch
6. **Create PR**: Push to remote and create pull request

## Next Steps

After setup is complete:

1. **Review Architecture**: Read `plan.md` and `data-model.md` in `specs/003-frontend-integration/`
2. **Review API Contracts**: Read `contracts/auth-api.md` and `contracts/tasks-api.md`
3. **Generate Tasks**: Run `/sp.tasks` to generate implementation tasks
4. **Implement Features**: Use specialized agents to implement tasks
5. **Test Integration**: Verify full-stack integration with backend

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **Better Auth Documentation**: https://better-auth.com/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

## Support

For issues or questions:
1. Check this quickstart guide
2. Review feature specification in `specs/003-frontend-integration/spec.md`
3. Review implementation plan in `specs/003-frontend-integration/plan.md`
4. Check backend API documentation at `http://localhost:8000/docs`
