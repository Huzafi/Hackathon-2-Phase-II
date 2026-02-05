# Chat UI Developer Quick Reference

## File Structure

```
frontend/
├── app/(protected)/tasks/
│   └── page.tsx                    # Main tasks page with chat interface
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx         # Individual message display
│   │   ├── ChatInput.tsx           # Message input with auto-resize
│   │   ├── ChatWindow.tsx          # Main chat container
│   │   ├── ConversationSidebar.tsx # Conversation list sidebar
│   │   └── index.ts                # Component exports
│   ├── tasks/
│   │   ├── TaskList.tsx            # Task list display (existing)
│   │   └── TaskItem.tsx            # Individual task item (existing)
│   └── ui/                         # Shared UI components (existing)
├── lib/api/
│   ├── chat.ts                     # Chat API client functions
│   ├── tasks.ts                    # Task API functions (existing)
│   └── client.ts                   # Base API client (existing)
└── types/
    ├── chat.ts                     # Chat-related types
    ├── entities.ts                 # Entity types (existing)
    └── api.ts                      # API types (existing)
```

## Key Components

### ChatMessage
**Purpose:** Display individual chat messages with proper styling and tool calls

**Props:**
```typescript
interface ChatMessageProps {
  message: Message;
}
```

**Features:**
- User messages: right-aligned, blue bubble
- Assistant messages: left-aligned, gray bubble, markdown support
- Expandable tool calls section
- Relative timestamps (e.g., "2 minutes ago")

**Usage:**
```tsx
<ChatMessage message={message} />
```

### ChatInput
**Purpose:** Text input for sending messages with auto-resize

**Props:**
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}
```

**Features:**
- Auto-resizing textarea (max 32px height)
- Character counter
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Loading state with spinner

**Usage:**
```tsx
<ChatInput
  onSendMessage={handleSendMessage}
  isLoading={isSending}
  disabled={false}
/>
```

### ChatWindow
**Purpose:** Main chat interface container with message list

**Props:**
```typescript
interface ChatWindowProps {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  isSending: boolean;
}
```

**Features:**
- Auto-scroll to bottom for new messages
- Detects user scroll position
- Empty state with examples
- Loading and error states
- "Thinking..." indicator

**Usage:**
```tsx
<ChatWindow
  conversationId={activeConversationId}
  messages={messages}
  isLoading={isLoadingMessages}
  error={chatError}
  onSendMessage={handleSendMessage}
  isSending={isSendingMessage}
/>
```

### ConversationSidebar
**Purpose:** List of user conversations with management features

**Props:**
```typescript
interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  isLoading?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
```

**Features:**
- Conversation list with timestamps
- Active conversation highlighting
- Delete with confirmation (click twice)
- Mobile overlay support
- New conversation button

**Usage:**
```tsx
<ConversationSidebar
  conversations={conversations}
  activeConversationId={activeConversationId}
  onSelectConversation={handleSelectConversation}
  onNewConversation={handleNewConversation}
  onDeleteConversation={handleDeleteConversation}
  isLoading={isLoadingConversations}
  isMobileOpen={isSidebarOpen}
  onMobileClose={() => setIsSidebarOpen(false)}
/>
```

## API Functions

### sendMessage
**Purpose:** Send a message to the AI agent

**Signature:**
```typescript
async function sendMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse>
```

**Parameters:**
- `message`: The user's message text
- `conversationId`: Optional conversation ID (creates new if omitted)

**Returns:**
```typescript
{
  conversation_id: string;
  message: string;
  tool_calls?: ToolCall[];
  created_at: string;
}
```

**Example:**
```typescript
const response = await sendMessage(
  "Create a task to buy groceries",
  activeConversationId
);
```

### getConversations
**Purpose:** Fetch all conversations for the authenticated user

**Signature:**
```typescript
async function getConversations(): Promise<Conversation[]>
```

**Returns:** Array of conversations with metadata

**Example:**
```typescript
const conversations = await getConversations();
```

### getConversation
**Purpose:** Fetch a single conversation with all messages

**Signature:**
```typescript
async function getConversation(
  conversationId: string
): Promise<ConversationDetail>
```

**Returns:** Conversation with full message history

**Example:**
```typescript
const conversation = await getConversation(conversationId);
setMessages(conversation.messages);
```

### deleteConversation
**Purpose:** Delete a conversation

**Signature:**
```typescript
async function deleteConversation(conversationId: string): Promise<void>
```

**Example:**
```typescript
await deleteConversation(conversationId);
await fetchConversations(); // Refresh list
```

## Type Definitions

### Message
```typescript
interface Message {
  id: number;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  created_at: string;
}
```

### ToolCall
```typescript
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
}
```

### ConversationDetail
```typescript
interface ConversationDetail extends Conversation {
  messages: Message[];
}
```

### ChatResponse
```typescript
interface ChatResponse {
  conversation_id: string;
  message: string;
  tool_calls?: ToolCall[];
  created_at: string;
}
```

## State Management Pattern

### Tasks Page State Structure
```typescript
// Task state
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoadingTasks, setIsLoadingTasks] = useState(true);
const [tasksError, setTasksError] = useState<string | null>(null);

// Conversation state
const [conversations, setConversations] = useState<Conversation[]>([]);
const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [isLoadingConversations, setIsLoadingConversations] = useState(true);
const [isLoadingMessages, setIsLoadingMessages] = useState(false);
const [isSendingMessage, setIsSendingMessage] = useState(false);
const [chatError, setChatError] = useState<string | null>(null);

// UI state
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
```

## Common Patterns

### Sending a Message
```typescript
const handleSendMessage = async (message: string) => {
  setIsSendingMessage(true);
  setChatError(null);

  try {
    const response = await sendMessage(message, activeConversationId || undefined);

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      conversation_id: response.conversation_id,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    // Add assistant message
    const assistantMessage: Message = {
      id: Date.now() + 1,
      conversation_id: response.conversation_id,
      role: 'assistant',
      content: response.message,
      tool_calls: response.tool_calls,
      created_at: response.created_at,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    // Update conversation ID if new
    if (!activeConversationId) {
      setActiveConversationId(response.conversation_id);
    }

    // Refresh data
    await Promise.all([fetchConversations(), fetchTasks()]);
  } catch (err: any) {
    setChatError(err.message || 'Failed to send message');
  } finally {
    setIsSendingMessage(false);
  }
};
```

### Loading a Conversation
```typescript
const fetchConversationMessages = async (conversationId: string) => {
  setIsLoadingMessages(true);
  setChatError(null);

  try {
    const conversation = await getConversation(conversationId);
    setMessages(conversation.messages);
    setActiveConversationId(conversationId);
  } catch (err: any) {
    setChatError(err.message || 'Failed to load conversation');
  } finally {
    setIsLoadingMessages(false);
  }
};
```

### Creating New Conversation
```typescript
const handleNewConversation = () => {
  setActiveConversationId(null);
  setMessages([]);
  setChatError(null);
};
```

### Deleting a Conversation
```typescript
const handleDeleteConversation = async (conversationId: string) => {
  try {
    await deleteConversation(conversationId);

    // Clear if active
    if (conversationId === activeConversationId) {
      handleNewConversation();
    }

    // Refresh list
    await fetchConversations();
  } catch (err: any) {
    console.error('Failed to delete conversation:', err);
  }
};
```

## Styling Guidelines

### Tailwind Classes Used

**Layout:**
- `flex`, `flex-col`, `flex-row` - Flexbox layouts
- `grid` - Grid layouts
- `gap-2`, `gap-3`, `gap-4` - Spacing between elements
- `p-4`, `px-4`, `py-2` - Padding
- `m-4`, `mb-4`, `mt-2` - Margins

**Responsive:**
- `lg:flex-row` - Desktop layout
- `md:grid-cols-2` - Tablet layout
- `sm:text-lg` - Small screen text

**Colors:**
- `bg-blue-600` - Primary blue
- `bg-gray-100` - Light gray background
- `text-gray-900` - Dark text
- `dark:bg-gray-900` - Dark mode background
- `dark:text-white` - Dark mode text

**Interactive:**
- `hover:bg-gray-100` - Hover states
- `focus:ring-2` - Focus indicators
- `disabled:opacity-50` - Disabled states
- `cursor-pointer` - Clickable elements

**Animations:**
- `transition-colors` - Color transitions
- `animate-spin` - Loading spinners
- `transform translate-x-0` - Slide animations

### Custom Styles

**Auto-resize Textarea:**
```typescript
const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setMessage(e.target.value);

  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
};
```

**Auto-scroll to Bottom:**
```typescript
useEffect(() => {
  if (shouldAutoScroll && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages, shouldAutoScroll]);
```

## Debugging Tips

### Check API Calls
```typescript
// Add logging to API functions
console.log('Sending message:', message);
const response = await sendMessage(message, conversationId);
console.log('Response:', response);
```

### Monitor State Changes
```typescript
useEffect(() => {
  console.log('Messages updated:', messages);
}, [messages]);

useEffect(() => {
  console.log('Active conversation:', activeConversationId);
}, [activeConversationId]);
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Send a message
5. Inspect request/response

### React DevTools
1. Install React DevTools extension
2. Open DevTools
3. Go to Components tab
4. Inspect component state and props

## Performance Optimization

### Memoization
```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive computations
const sortedConversations = useMemo(() => {
  return conversations.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}, [conversations]);

// Memoize callbacks
const handleSendMessage = useCallback(async (message: string) => {
  // Implementation
}, [activeConversationId]);
```

### Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### Debouncing
```typescript
import { debounce } from 'lodash';

const debouncedRefresh = debounce(() => {
  fetchTasks();
}, 500);
```

## Common Errors and Solutions

### Error: "Failed to send message"
**Cause:** Backend not running or JWT expired
**Solution:** Check backend status, verify token validity

### Error: "Cannot read property 'map' of undefined"
**Cause:** Messages array not initialized
**Solution:** Initialize with empty array: `useState<Message[]>([])`

### Error: "Hydration mismatch"
**Cause:** Server/client rendering mismatch
**Solution:** Use 'use client' directive, check for browser-only code

### Error: "Maximum update depth exceeded"
**Cause:** Infinite re-render loop
**Solution:** Check useEffect dependencies, use useCallback for functions

## Best Practices

1. **Always handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Provide retry mechanisms

2. **Optimize re-renders**
   - Use React.memo for expensive components
   - Memoize callbacks with useCallback
   - Memoize computed values with useMemo

3. **Maintain accessibility**
   - Add ARIA labels
   - Ensure keyboard navigation
   - Test with screen readers

4. **Keep components focused**
   - Single responsibility principle
   - Extract reusable logic
   - Limit component size (< 200 lines)

5. **Type everything**
   - Use TypeScript strictly
   - Define proper interfaces
   - Avoid 'any' type

## Useful Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Debugging
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for unused dependencies
npx depcheck

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Markdown Documentation](https://github.com/remarkjs/react-markdown)
- [date-fns Documentation](https://date-fns.org/docs)
