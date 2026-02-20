'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeCollection } from '@/hooks/useFirestore';
import { LoadingPage } from '@/components/Loading';
import { Card, StatCard } from '@/components/Card';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function VolunteerDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch projects in real-time
  const { data: projects, loading: projectsLoading } = useRealtimeCollection('projects');

  // Also fetch user profile in real-time to get status updates
  const { data: userProfiles } = useRealtimeCollection('volunteers');
  const currentUserProfile = userProfiles.find((v: any) => v.id === user?.uid) || userProfile;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingPage />;
  if (!user || !currentUserProfile) return null;

  // Filter assigned projects
  const assignedProjects = projects.filter(project =>
    currentUserProfile.assignedProjects?.includes(project.id)
  );

  // Filter applied projects (pending)
  const appliedProjects = projects.filter(project =>
    currentUserProfile.appliedProjects?.includes(project.id) &&
    !currentUserProfile.assignedProjects?.includes(project.id)
  );

  const sidebarLinks = [
    {
      href: '/dashboard/volunteer',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/projects',
      label: 'Browse Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar links={sidebarLinks} />
      <MobileSidebar links={sidebarLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {currentUserProfile.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUserProfile.chapter} Chapter • {currentUserProfile.status === 'approved' ? 'Approved Volunteer' : currentUserProfile.status === 'pending' ? 'Pending Approval' : 'Status: ' + currentUserProfile.status}
            </p>
          </div>

          {/* Status Alert */}
          {currentUserProfile.status === 'pending' && (
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Account Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your volunteer account is waiting for admin approval. You'll be able to apply to projects once approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Assigned Projects"
              value={assignedProjects.length}
              icon={
                <svg className="w-8 h-8 text-yspOrange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              title="Pending Applications"
              value={appliedProjects.length}
              icon={
                <svg className="w-8 h-8 text-yspBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Chapter"
              value={currentUserProfile.chapter}
              icon={
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>

          {/* Assigned Projects */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Projects</h2>
            {assignedProjects.length === 0 ? (
              <Card className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start browsing available projects and apply to get started!
                </p>
                <Button onClick={() => router.push('/projects')}>
                  Browse Projects
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {assignedProjects.map((project: any) => (
                  <Card key={project.id} hover>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        Assigned
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {project.chapter}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pending Applications */}
          {appliedProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pending Applications</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {appliedProjects.map((project: any) => (
                  <Card key={project.id} hover>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {project.chapter}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
