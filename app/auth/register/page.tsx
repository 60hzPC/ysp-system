'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFirestore } from '@/hooks/useFirestore';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { useToast } from '@/hooks/useToast';
import { validateRegisterForm, hasErrors } from '@/utils/validation';
import { PHILIPPINE_CHAPTERS, VOLUNTEER_STATUS } from '@/utils/helpers';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { setDocument } = useFirestore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    chapter: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateRegisterForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.chapter
    );
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create volunteer profile in Firestore
      await setDocument('volunteers', userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        role: 'Volunteer',
        chapter: formData.chapter,
        status: VOLUNTEER_STATUS.PENDING,
        appliedProjects: [],
        assignedProjects: [],
      });

      toast.success('Registration successful! Welcome to YSP!');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard/volunteer');
      }, 1000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error('Failed to register. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const chapterOptions = [
    { value: '', label: 'Select your chapter' },
    ...PHILIPPINE_CHAPTERS.map(chapter => ({ value: chapter, label: chapter }))
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yspBlue-50 via-white to-yspOrange-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-yspOrange-500 to-yspOrange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">YSP</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Join YSP Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start your volunteer journey with us
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Juan Dela Cruz"
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="juan@example.com"
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Select
              label="Chapter"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              error={errors.chapter}
              options={chapterOptions}
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 mr-2 rounded border-gray-300 text-yspOrange-500 focus:ring-yspOrange-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-yspOrange-500 hover:text-yspOrange-600 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-yspOrange-500 hover:text-yspOrange-600 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-yspOrange-500 hover:text-yspOrange-600 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
