---
id: 019
title: Create Next.js Landing Page Skill
stage: general
date: 2026-01-25
surface: agent
model: claude-haiku-4-5
feature: none
branch: 003-frontend-integration
user: STAR
command: skill-creation
labels: ["skill", "nextjs", "frontend", "landing-page", "documentation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/nextjs-frontend/SKILL.md
tests:
  - None (documentation only)
---

## Prompt

Create a Skill for responsive Attractive and Beautiful Nextjs UI Frontend landing page.
Save it to .claude/skills/nextjs-frontend/

## Response snapshot

Created a comprehensive Next.js Landing Page Builder skill at `.claude/skills/nextjs-frontend/SKILL.md` (17KB).

The skill includes:

**Technology Stack:**
- Next.js 15+ (App Router)
- TypeScript 5.7+
- Tailwind CSS
- Lucide React icons
- Framer Motion animations

**Design Principles:**
- Visual hierarchy with gradient text and clear CTAs
- Modern aesthetics (glass morphism, shadows, gradients)
- Mobile-first responsive design
- Dark mode support

**Complete Component Templates:**
- Hero section with animated background blobs
- Features grid with hover effects and icons
- CTA sections with gradient backgrounds
- Responsive navbar with mobile hamburger menu
- Professional footer with multiple columns

**Best Practices:**
- Performance optimization (lazy loading, image optimization with next/image)
- SEO metadata templates with OpenGraph and Twitter cards
- Accessibility checklist (semantic HTML, ARIA labels, keyboard nav)
- Animation patterns (blob animations, hover effects)
- Color palette system (primary, secondary, success, warning, error)
- Consistent spacing system using Tailwind utilities

**Production-Ready Code:**
- Full TypeScript examples for all components
- Tailwind CSS classes with responsive breakpoints
- Next.js App Router conventions (metadata, dynamic imports)
- Font optimization using next/font
- Dark mode support with Tailwind dark: variants

**Execution Checklist:**
- 15-step checklist for building landing pages
- Common pitfalls to avoid (hydration errors, layout shift, poor mobile UX)
- Success criteria (Lighthouse scores > 90, load time < 2s)

The skill provides production-ready code templates that can be copied and customized for any landing page project, following modern web development best practices.

## Outcome

- ✅ Impact: Created comprehensive skill documentation for building beautiful Next.js landing pages with modern design patterns
- 🧪 Tests: None (documentation artifact)
- 📁 Files: Created 1 new skill file (17KB)
- 🔁 Next prompts: Skill can now be invoked for landing page development tasks
- 🧠 Reflection: The skill provides extensive templates and best practices that will accelerate landing page development while ensuring consistency and quality

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (documentation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test the skill by building an actual landing page to validate the templates and patterns
