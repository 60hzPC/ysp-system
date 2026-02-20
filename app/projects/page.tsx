'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, useRealtimeCollection } from '@/hooks/useFirestore';
import { LoadingPage } from '@/components/Loading';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/Modal';

export default function ProjectsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { data: projects, loading: projectsLoading } = useRealtimeCollection('projects');
  const { data: userProfiles } = useRealtimeCollection('volunteers');
  const currentUserProfile = userProfiles.find((v: any) => v.id === user?.uid) || userProfile;
  const { updateDocument } = useFirestore();
  const toast = useToast();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (authLoading || projectsLoading) return <LoadingPage />;

  // Filter open projects
  const openProjects = projects.filter((project: any) => project.status === 'open');

  const handleApplyClick = (project: any) => {
    if (!user) {
      toast.info('Please login to apply for projects');
      router.push('/auth/login');
      return;
    }

    if (currentUserProfile?.status !== 'approved') {
      toast.warning('Your account is pending approval. You cannot apply to projects yet.');
      return;
    }

    setSelectedProject(project);
    setShowConfirmModal(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedProject || !user || !currentUserProfile) return;

    setIsApplying(true);

    try {
      // Check if already applied
      if (currentUserProfile.appliedProjects?.includes(selectedProject.id)) {
        toast.info('You have already applied to this project');
        setShowConfirmModal(false);
        setIsApplying(false);
        return;
      }

      // Update volunteer's appliedProjects
      await updateDocument('volunteers', user.uid, {
        appliedProjects: [...(currentUserProfile.appliedProjects || []), selectedProject.id],
      });

      // Update project's applicants
      await updateDocument('projects', selectedProject.id, {
        applicants: [...(selectedProject.applicants || []), user.uid],
      });

      toast.success('Application submitted successfully!');
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const isApplied = (projectId: string) => {
    return currentUserProfile?.appliedProjects?.includes(projectId);
  };

  const isAssigned = (projectId: string) => {
    return currentUserProfile?.assignedProjects?.includes(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Volunteer Opportunities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse and apply to open projects across the Philippines
          </p>
        </div>

        {/* Project Grid */}
        {openProjects.length === 0 ? (
          <Card className="text-center py-16">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No open projects available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new volunteer opportunities!
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openProjects.map((project: any, index: number) => {
              // Placeholder images for different project types
              const projectImages = [
                'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=80',
                'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
                'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
                'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
                'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
                'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80',
              ];
              
              return (
                <Card key={project.id} hover className="flex flex-col overflow-hidden p-0 group">
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${project.image || projectImages[index % projectImages.length]})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        Open
                      </span>
                    </div>

                    {/* Chapter Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <svg className="w-4 h-4 text-yspOrange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.chapter}
                      </span>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-yspOrange-500 transition-colors">
                      {project.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                      {project.description}
                    </p>

                    {/* Project Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">{project.applicants?.length || 0}</span>
                        <span>applicants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">{project.assignedVolunteers?.length || 0}</span>
                        <span>assigned</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isAssigned(project.id) ? (
                      <Button variant="success" fullWidth disabled>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Assigned
                      </Button>
                    ) : isApplied(project.id) ? (
                      <Button variant="secondary" fullWidth disabled>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Applied - Pending
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => handleApplyClick(project)}
                      >
                        Apply Now
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApply}
        title="Confirm Application"
        message={`Are you sure you want to apply for "${selectedProject?.name}"? Admin will review your application.`}
        confirmText="Yes, Apply"
        cancelText="Cancel"
        variant="primary"
        isLoading={isApplying}
      />
    </div>
  );
}
