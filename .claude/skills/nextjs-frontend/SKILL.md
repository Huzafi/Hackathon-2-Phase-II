---
name: nextjs-landing-page-builder
description: Build responsive, attractive, and beautiful Next.js landing pages with modern design patterns, animations, and App Router conventions.
---

# Next.js Landing Page Builder

## Core Mission
Create stunning, responsive landing pages using Next.js 15+ App Router with modern design aesthetics, smooth animations, and optimal performance.

## Technology Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS (utility-first)
- **Icons:** Lucide React or Heroicons
- **Animations:** Framer Motion or CSS animations
- **Fonts:** Next.js Font Optimization (Google Fonts)

## Design Principles

### 1. Visual Hierarchy
- **Hero Section:** Large, bold headlines with gradient text
- **Clear CTAs:** High-contrast buttons with hover effects
- **Whitespace:** Generous spacing for breathing room
- **Typography Scale:** Consistent font sizing (text-sm to text-6xl)

### 2. Modern Aesthetics
- **Gradients:** Subtle background gradients (from-blue-50 to-purple-50)
- **Shadows:** Layered shadows for depth (shadow-lg, shadow-xl)
- **Rounded Corners:** Consistent border radius (rounded-lg, rounded-xl)
- **Glass Morphism:** backdrop-blur effects for modern look
- **Dark Mode:** Support for dark mode variants

### 3. Responsive Design (Mobile-First)
```tsx
// Mobile: base styles
// Tablet: md: prefix (768px+)
// Desktop: lg: prefix (1024px+)
// Large: xl: prefix (1280px+)

<div className="px-4 md:px-8 lg:px-16">
  <h1 className="text-3xl md:text-5xl lg:text-6xl">
    Responsive Heading
  </h1>
</div>
```

## Landing Page Structure

### Essential Sections
1. **Hero Section** - Above the fold, primary CTA
2. **Features Section** - 3-6 key features with icons
3. **Social Proof** - Testimonials, logos, stats
4. **CTA Section** - Secondary conversion point
5. **Footer** - Links, social media, legal

### Optional Sections
- **Pricing** - Tiered pricing cards
- **FAQ** - Accordion-style questions
- **Team** - Team member cards with photos
- **Blog Preview** - Latest articles grid
- **Newsletter** - Email capture form

## Component Patterns

### Hero Section Template
```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="block text-gray-900 dark:text-white">
            Build Something
          </span>
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Amazing Today
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Create beautiful, responsive landing pages with modern design patterns
          and best practices built right in.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
            Get Started Free
          </button>
          <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
            View Demo
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Features Grid Template
```tsx
// components/FeaturesSection.tsx
import { Zap, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with Next.js App Router and edge functions.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Built-in security features and best practices out of the box.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful Design',
    description: 'Modern, responsive design that works on all devices.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Powerful features to help you build faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### CTA Section Template
```tsx
// components/CTASection.tsx
export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of users building amazing products
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
            Start Free Trial
          </button>
          <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
```

## Styling Best Practices

### Color Palette
```tsx
// Use consistent color scales
const colors = {
  primary: 'blue-600',      // Main brand color
  secondary: 'purple-600',  // Accent color
  success: 'green-600',     // Success states
  warning: 'yellow-600',    // Warning states
  error: 'red-600',         // Error states
  neutral: 'gray-600',      // Text and borders
};
```

### Spacing System
```tsx
// Consistent spacing scale
<div className="space-y-4">      {/* 1rem vertical spacing */}
<div className="space-y-8">      {/* 2rem vertical spacing */}
<div className="space-y-12">     {/* 3rem vertical spacing */}

// Container padding
<div className="px-4 md:px-8 lg:px-16">  {/* Responsive horizontal padding */}
<div className="py-12 md:py-16 lg:py-20"> {/* Responsive vertical padding */}
```

### Animation Classes
```css
/* Add to globals.css */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
```

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  className="rounded-lg shadow-xl"
/>
```

### Font Optimization
```tsx
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Lazy Loading
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'));
const PricingSection = dynamic(() => import('@/components/PricingSection'));
```

## Accessibility Checklist

- [ ] Semantic HTML elements (header, nav, main, section, footer)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for all images
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Focus visible states
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Skip to main content link

## SEO Best Practices

```tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Product Name - Tagline',
  description: 'Compelling description under 160 characters',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Your Product Name',
    description: 'Social media description',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Product Name',
    description: 'Twitter description',
    images: ['/twitter-image.jpg'],
  },
};
```

## Common Patterns

### Navbar
```tsx
// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YourBrand
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              About
            </Link>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 space-y-4">
            <Link href="#features" className="block text-gray-700 dark:text-gray-300">
              Features
            </Link>
            <Link href="#pricing" className="block text-gray-700 dark:text-gray-300">
              Pricing
            </Link>
            <Link href="#about" className="block text-gray-700 dark:text-gray-300">
              About
            </Link>
            <button className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

### Footer
```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">YourBrand</h3>
            <p className="text-sm">Building amazing products for amazing people.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © 2024 YourBrand. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

## Execution Checklist

When building a landing page, follow this checklist:

- [ ] Set up Next.js App Router structure
- [ ] Configure Tailwind CSS with custom theme
- [ ] Add font optimization (Google Fonts)
- [ ] Create responsive Navbar component
- [ ] Build Hero section with gradient background
- [ ] Add Features section with icons
- [ ] Implement CTA section
- [ ] Create Footer component
- [ ] Add metadata for SEO
- [ ] Optimize images with next/image
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Add loading states and error boundaries
- [ ] Test dark mode support
- [ ] Optimize performance (Lighthouse score > 90)

## Common Pitfalls to Avoid

1. **Hydration Errors:** Use 'use client' for interactive components
2. **Layout Shift:** Reserve space for images with width/height
3. **Poor Mobile UX:** Test on real devices, not just browser resize
4. **Slow Load Times:** Lazy load below-the-fold content
5. **Missing Alt Text:** Always provide descriptive alt text
6. **Inconsistent Spacing:** Use Tailwind's spacing scale consistently
7. **Overuse of Animations:** Keep animations subtle and purposeful
8. **Poor Color Contrast:** Test with accessibility tools

## Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Lucide Icons:** https://lucide.dev
- **Color Palette Generator:** https://coolors.co
- **Gradient Generator:** https://cssgradient.io
- **Accessibility Checker:** https://wave.webaim.org

## Success Criteria

A successful landing page should:
- Load in < 2 seconds on 3G
- Score > 90 on Lighthouse (Performance, Accessibility, SEO)
- Work perfectly on mobile, tablet, and desktop
- Have clear visual hierarchy and CTAs
- Be accessible to screen readers
- Support dark mode
- Have smooth, purposeful animations
- Follow Next.js App Router best practices
