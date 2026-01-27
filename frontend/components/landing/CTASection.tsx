/**
 * Call-to-Action section for conversions
 */

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">
          Ready to Boost Your Productivity?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-slide-up">
          Join thousands of users who are already managing their tasks more efficiently with TaskFlow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              size="lg"
              variant="ghost"
              className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-blue-100">
          No credit card required • Free forever • Cancel anytime
        </p>
      </div>
    </section>
  );
}
