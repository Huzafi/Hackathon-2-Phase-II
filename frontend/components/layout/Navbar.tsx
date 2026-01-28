'use client';

/**
 * Navbar component with responsive design and mobile menu
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CheckSquare } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, signout } = useAuth();

  const handleLogout = () => {
    signout();
  };

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href="/tasks"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  My Tasks
                </Link>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="px-4 py-4 space-y-4">
            {!isAuthenticated && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href="/tasks"
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  My Tasks
                </Link>
                <Button onClick={handleLogout} variant="secondary" fullWidth>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button fullWidth className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
