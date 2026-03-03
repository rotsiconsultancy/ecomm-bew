import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 rounded-[8px]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-brand-navy">Welcome Back</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-600">
            Log in to your Bewama account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email-address">
                  Email address
                </label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  className="rounded-[8px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="rounded-[8px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-brand-orange hover:text-brand-orange-hover">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button asChild className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-sm font-bold rounded-[8px] text-white bg-brand-navy hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-all">
                <Link href="/admin/dashboard">
                  Sign in
                </Link>
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="#" className="font-medium text-brand-orange hover:text-brand-orange-hover">
                Register your business
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
