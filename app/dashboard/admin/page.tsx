'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, useRealtimeCollection } from '@/hooks/useFirestore';
import { LoadingPage } from '@/components/Loading';
import { Card, StatCard } from '@/components/Card';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { Input, TextArea, Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import { PHILIPPINE_CHAPTERS, VOLUNTEER_STATUS } from '@/utils/helpers';

export default function AdminDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { createDocument, updateDocument } = useFirestore();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'projects'>('overview');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);

  // Fetch data in real-time
  const { data: volunteers, loading: volunteersLoading } = useRealtimeCollection('volunteers');
  const { data: projects, loading: projectsLoading } = useRealtimeCollection('projects');

  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    chapter: '',
    status: 'open',
  });
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && userProfile && userProfile.role !== 'Admin' && userProfile.role !== 'Chapter Head') {
      toast.error('Access denied. Admin access required.');
      router.push('/dashboard/volunteer');
    }
  }, [user, userProfile, authLoading, router, toast]);

  if (authLoading || volunteersLoading || projectsLoading) return <LoadingPage />;
  if (!user || !userProfile) return null;

  // Stats
  const pendingVolunteers = volunteers.filter((v: any) => v.status === 'pending').length;
  const approvedVolunteers = volunteers.filter((v: any) => v.status === 'approved').length;
  const openProjects = projects.filter((p: any) => p.status === 'open').length;
  const totalApplications = projects.reduce((sum: number, p: any) => sum + (p.applicants?.length || 0), 0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Image size should be less than 100MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setProjectImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectForm.name || !projectForm.description || !projectForm.chapter) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreatingProject(true);
    setUploadProgress(0);

    try {
      let imageUrl = '';

      // Upload image to Cloudinary if selected
      if (projectImage) {
        try {
          setUploadProgress(30);
          
          // Cloudinary upload - No API key needed for unsigned uploads!
          const cloudName = 'dbeqtr18g'; // Use 'demo' for testing, or your own cloud name
          const uploadPreset = 'ysp_projects'; // Default unsigned preset
          
          const formData = new FormData();
          formData.append('file', projectImage);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'ysp-projects');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            imageUrl = data.secure_url;
            setUploadProgress(70);
            toast.success('Image uploaded successfully!');
          } else {
            console.error('Cloudinary upload failed');
            toast.warning('Image upload failed. Creating project without image.');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.warning('Image upload failed. Creating project without image.');
          // Continue creating project without image
        }
      }

      setUploadProgress(80);

      // Create project (with or without image)
      await createDocument('projects', {
        name: projectForm.name,
        description: projectForm.description,
        chapter: projectForm.chapter,
        status: projectForm.status,
        image: imageUrl,
        applicants: [],
        assignedVolunteers: [],
      });

      setUploadProgress(100);
      toast.success('Project created successfully!');
      setShowCreateProjectModal(false);
      setProjectForm({ name: '', description: '', chapter: '', status: 'open' });
      setProjectImage(null);
      setImagePreview('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleApproveVolunteer = async (volunteerId: string, approve: boolean) => {
    try {
      await updateDocument('volunteers', volunteerId, {
        status: approve ? VOLUNTEER_STATUS.APPROVED : VOLUNTEER_STATUS.REJECTED,
      });

      toast.success(`Volunteer ${approve ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      toast.error('Failed to update volunteer status');
    }
  };

  const handleApproveApplication = async (projectId: string, volunteerId: string) => {
    try {
      const project = projects.find((p: any) => p.id === projectId);
      const volunteer = volunteers.find((v: any) => v.id === volunteerId);

      if (!project || !volunteer) {
        toast.error('Project or volunteer not found');
        return;
      }

      // Remove from applicants, add to assignedVolunteers
      await updateDocument('projects', projectId, {
        applicants: project.applicants.filter((id: string) => id !== volunteerId),
        assignedVolunteers: [...(project.assignedVolunteers || []), volunteerId],
      });

      // Update volunteer's assignedProjects
      await updateDocument('volunteers', volunteerId, {
        assignedProjects: [...(volunteer.assignedProjects || []), projectId],
      });

      toast.success('Application approved! Volunteer assigned to project.');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleRejectApplication = async (projectId: string, volunteerId: string) => {
    try {
      const project = projects.find((p: any) => p.id === projectId);
      const volunteer = volunteers.find((v: any) => v.id === volunteerId);

      if (!project || !volunteer) {
        toast.error('Project or volunteer not found');
        return;
      }

      // Remove from applicants and appliedProjects
      await updateDocument('projects', projectId, {
        applicants: project.applicants.filter((id: string) => id !== volunteerId),
      });

      await updateDocument('volunteers', volunteerId, {
        appliedProjects: volunteer.appliedProjects.filter((id: string) => id !== projectId),
      });

      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const sidebarLinks = [
    {
      href: '/dashboard/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/projects',
      label: 'All Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

  const chapterOptions = [
    { value: '', label: 'Select chapter' },
    ...PHILIPPINE_CHAPTERS.map(chapter => ({ value: chapter, label: chapter }))
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar links={sidebarLinks} />
      <MobileSidebar links={sidebarLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {userProfile.name} • {userProfile.role}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Volunteers"
              value={volunteers.length}
              icon={
                <svg className="w-8 h-8 text-yspBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard
              title="Pending Approvals"
              value={pendingVolunteers}
              icon={
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Active Projects"
              value={openProjects}
              icon={
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              title="Total Applications"
              value={totalApplications}
              icon={
                <svg className="w-8 h-8 text-yspOrange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-yspOrange-500 border-b-2 border-yspOrange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'volunteers'
                  ? 'text-yspOrange-500 border-b-2 border-yspOrange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Volunteers {pendingVolunteers > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {pendingVolunteers}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'projects'
                  ? 'text-yspOrange-500 border-b-2 border-yspOrange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Projects
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowCreateProjectModal(true)}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('volunteers')}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Review Volunteers
                  </Button>
                </div>
              </Card>

              {/* Recent Applications */}
              <Card>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Applications</h3>
                <div className="space-y-3">
                  {projects
                    .filter((p: any) => p.applicants && p.applicants.length > 0)
                    .slice(0, 5)
                    .map((project: any) => (
                      <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {project.applicants.length} pending application(s)
                            </p>
                          </div>
                          <Button size="sm" onClick={() => setActiveTab('projects')}>
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  {projects.every((p: any) => !p.applicants || p.applicants.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No pending applications
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Volunteer Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Chapter</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((volunteer: any) => (
                        <tr key={volunteer.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{volunteer.name}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{volunteer.email}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{volunteer.chapter}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              volunteer.status === 'approved'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : volunteer.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {volunteer.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {volunteer.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApproveVolunteer(volunteer.id, true)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleApproveVolunteer(volunteer.id, false)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Project Management</h3>
                <Button onClick={() => setShowCreateProjectModal(true)}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Project
                </Button>
              </div>

              {projects.map((project: any) => (
                <Card key={project.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {project.chapter}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'open'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Applications */}
                  {project.applicants && project.applicants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Pending Applications ({project.applicants.length})
                      </h5>
                      <div className="space-y-2">
                        {project.applicants.map((volunteerId: string) => {
                          const volunteer = volunteers.find((v: any) => v.id === volunteerId);
                          if (!volunteer) return null;
                          
                          return (
                            <div key={volunteerId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{volunteer.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{volunteer.email} • {volunteer.chapter}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApproveApplication(project.id, volunteerId)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleRejectApplication(project.id, volunteerId)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assigned Volunteers */}
                  {project.assignedVolunteers && project.assignedVolunteers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Assigned Volunteers ({project.assignedVolunteers.length})
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {project.assignedVolunteers.map((volunteerId: string) => {
                          const volunteer = volunteers.find((v: any) => v.id === volunteerId);
                          if (!volunteer) return null;
                          
                          return (
                            <span key={volunteerId} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                              {volunteer.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProjectModal}
        onClose={() => {
          setShowCreateProjectModal(false);
          setProjectForm({ name: '', description: '', chapter: '', status: 'open' });
          setProjectImage(null);
          setImagePreview('');
          setUploadProgress(0);
        }}
        title="Create New Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateProjectModal(false)} disabled={isCreatingProject}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} isLoading={isCreatingProject}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            placeholder="e.g., Tree Planting - Cebu"
            fullWidth
            required
          />
          <TextArea
            label="Description"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            placeholder="Describe the project and its goals..."
            rows={4}
            fullWidth
            required
          />
          <Select
            label="Chapter"
            value={projectForm.chapter}
            onChange={(e) => setProjectForm({ ...projectForm, chapter: e.target.value })}
            options={chapterOptions}
            fullWidth
            required
          />
          <Select
            label="Status"
            value={projectForm.status}
            onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
            options={[
              { value: 'open', label: 'Open (Volunteers can apply)' },
              { value: 'closed', label: 'Closed (No new applications)' },
            ]}
            fullWidth
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Image (Optional)
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProjectImage(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG or WEBP (MAX. 100MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yspOrange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Upload an image to make your project more attractive to volunteers!
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
