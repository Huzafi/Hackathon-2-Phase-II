# Chat UI Testing Guide

## Quick Start

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 3. Access the Application
1. Open browser to `http://localhost:3000`
2. Sign up for a new account or sign in
3. Navigate to `/tasks` page
4. Start chatting with the AI assistant

## Testing Scenarios

### Scenario 1: Create Tasks via Chat
**Steps:**
1. Navigate to `/tasks` page
2. In the chat input, type: "Create a task to buy groceries"
3. Press Enter or click Send
4. Observe:
   - Message appears in chat (right side, blue bubble)
   - AI responds (left side, gray bubble)
   - Task appears in right panel
   - Conversation is saved in left sidebar

**Expected Result:**
- New task created with title "Buy groceries"
- Task visible in right panel
- Conversation persists in sidebar

### Scenario 2: List Tasks via Chat
**Steps:**
1. Type: "Show me all my tasks"
2. Send message
3. Observe AI response listing all tasks

**Expected Result:**
- AI lists all current tasks
- Task count matches right panel

### Scenario 3: Update Task via Chat
**Steps:**
1. Type: "Mark the first task as completed"
2. Send message
3. Observe:
   - AI confirms completion
   - Task in right panel updates (checked)

**Expected Result:**
- Task marked as completed
- Visual update in task list

### Scenario 4: Delete Task via Chat
**Steps:**
1. Type: "Delete the completed tasks"
2. Send message
3. Observe:
   - AI confirms deletion
   - Tasks removed from right panel

**Expected Result:**
- Completed tasks deleted
- Task count decreases

### Scenario 5: Multiple Conversations
**Steps:**
1. Click "New Conversation" in sidebar
2. Start a new chat about different tasks
3. Switch between conversations using sidebar
4. Observe:
   - Each conversation maintains its own history
   - Active conversation highlighted
   - Messages load correctly

**Expected Result:**
- Conversations are independent
- History persists
- Switching works smoothly

### Scenario 6: Delete Conversation
**Steps:**
1. Click trash icon on a conversation
2. Click again to confirm
3. Observe:
   - Conversation removed from sidebar
   - If active, chat clears

**Expected Result:**
- Conversation deleted
- UI updates appropriately

### Scenario 7: Mobile Responsive Testing
**Steps:**
1. Resize browser to mobile width (375px)
2. Observe:
   - Only chat visible by default
   - Menu button opens sidebar
   - Task list button opens task panel
3. Test interactions on mobile

**Expected Result:**
- Mobile layout works correctly
- Overlays function properly
- Touch interactions responsive

### Scenario 8: Error Handling
**Steps:**
1. Stop backend server
2. Try sending a message
3. Observe error message
4. Restart backend
5. Try again

**Expected Result:**
- User-friendly error message
- Ability to retry
- No data loss

### Scenario 9: Long Conversations
**Steps:**
1. Send 10+ messages in a conversation
2. Observe:
   - Auto-scroll to bottom
   - Scroll up manually
   - Send new message
   - Check if auto-scroll respects user position

**Expected Result:**
- Auto-scroll works intelligently
- User can scroll up without interruption
- Performance remains smooth

### Scenario 10: Tool Calls Visibility
**Steps:**
1. Send: "Create 3 tasks: buy milk, walk dog, read book"
2. Expand tool calls section in AI response
3. Observe:
   - Tool name displayed
   - Arguments shown
   - Results visible

**Expected Result:**
- Tool calls expandable
- JSON formatted properly
- Easy to understand

## Keyboard Shortcuts Testing

### Chat Input
- **Enter**: Send message ✓
- **Shift+Enter**: New line ✓
- **Tab**: Navigate to send button ✓

### Navigation
- **Tab**: Move between interactive elements ✓
- **Escape**: Close modals/overlays ✓
- **Arrow keys**: Scroll messages ✓

## Accessibility Testing

### Screen Reader Testing
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through chat interface
3. Verify:
   - Messages announced correctly
   - Buttons have proper labels
   - Roles are appropriate

### Keyboard Navigation
1. Use only keyboard (no mouse)
2. Navigate entire interface
3. Verify:
   - All interactive elements reachable
   - Focus indicators visible
   - Logical tab order

### Color Contrast
1. Use browser DevTools or WAVE extension
2. Check all text elements
3. Verify WCAG AA compliance (4.5:1 ratio)

## Performance Testing

### Load Time
- Initial page load: < 2 seconds
- Message send/receive: < 1 second
- Conversation switch: < 500ms

### Memory Usage
- Monitor browser memory
- Send 50+ messages
- Check for memory leaks

### Network
- Monitor Network tab
- Verify API calls are efficient
- Check for unnecessary requests

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Common Issues and Solutions

### Issue: "Failed to send message"
**Solution:**
- Check backend is running
- Verify JWT token is valid
- Check browser console for errors
- Try signing out and back in

### Issue: Tasks not updating
**Solution:**
- Click refresh button in task panel
- Check AI response for errors
- Verify backend logs

### Issue: Sidebar not opening on mobile
**Solution:**
- Clear browser cache
- Check for JavaScript errors
- Verify z-index in DevTools

### Issue: Messages not scrolling
**Solution:**
- Scroll to bottom manually
- Check console for errors
- Refresh page

### Issue: Markdown not rendering
**Solution:**
- Verify react-markdown installed
- Check browser console
- Test with simple markdown

## API Testing with cURL

### Send Message
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Create a task to test API"}'
```

### Get Conversations
```bash
curl -X GET http://localhost:8000/api/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Conversation Details
```bash
curl -X GET http://localhost:8000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Conversation
```bash
curl -X DELETE http://localhost:8000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Visual Regression Testing

### Desktop Layout (1920x1080)
- Sidebar: 320px width
- Chat: Flexible center
- Tasks: 384px width
- All elements aligned properly

### Tablet Layout (768x1024)
- Chat and tasks visible
- Sidebar as overlay
- Proper spacing

### Mobile Layout (375x667)
- Single column
- Overlays functional
- Touch targets 44px minimum

## Automated Testing (Future)

### Unit Tests
```typescript
// Example test structure
describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    // Test implementation
  });

  it('renders assistant message with markdown', () => {
    // Test implementation
  });

  it('shows tool calls when expanded', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Chat Flow', () => {
  it('sends message and receives response', async () => {
    // Test implementation
  });

  it('creates new conversation', async () => {
    // Test implementation
  });

  it('updates task list after AI operation', async () => {
    // Test implementation
  });
});
```

### E2E Tests (Playwright/Cypress)
```typescript
test('complete chat workflow', async ({ page }) => {
  await page.goto('/tasks');
  await page.fill('[placeholder*="Type your message"]', 'Create a task');
  await page.click('button[aria-label="Send message"]');
  await expect(page.locator('.task-item')).toBeVisible();
});
```

## Performance Benchmarks

### Target Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### Lighthouse Score Targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

## Security Testing

### Authentication
- [ ] JWT token required for all endpoints
- [ ] Token expiration handled correctly
- [ ] Unauthorized access redirects to signin

### Data Isolation
- [ ] Users only see their own conversations
- [ ] Users only see their own tasks
- [ ] No data leakage between users

### Input Validation
- [ ] Message length limits enforced
- [ ] XSS prevention in markdown rendering
- [ ] SQL injection prevention (backend)

## Deployment Checklist

Before deploying to production:
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance metrics met
- [ ] Accessibility score 95+
- [ ] Mobile responsive verified
- [ ] Error handling tested
- [ ] Loading states implemented
- [ ] Environment variables configured
- [ ] API rate limiting enabled
- [ ] Monitoring and logging set up

## Success Criteria

The implementation is ready for production when:
1. All test scenarios pass
2. No critical bugs found
3. Performance metrics met
4. Accessibility compliance verified
5. Mobile experience smooth
6. Error handling robust
7. User feedback positive

## Next Steps After Testing

1. Gather user feedback
2. Monitor error rates
3. Track performance metrics
4. Iterate on UX improvements
5. Add advanced features
6. Optimize performance
7. Enhance accessibility
