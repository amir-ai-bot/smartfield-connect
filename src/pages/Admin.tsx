
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStats from '@/components/admin/AdminStats';
import UserList from '@/components/admin/UserList';
import ProjectList from '@/components/admin/ProjectList';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getAllUsers, getAllProjects, getAdminStats } from '@/services/adminService';

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [adminData, setAdminData] = useState({
    users: [],
    projects: [],
    stats: null,
    loading: true,
  });

  useEffect(() => {
    document.title = 'Administration | AgriSmart';
    
    const fetchAdminData = async () => {
      if (!isAdmin) return;
      
      try {
        const [users, projects, stats] = await Promise.all([
          getAllUsers(),
          getAllProjects(),
          getAdminStats()
        ]);
        
        setAdminData({
          users,
          projects,
          stats,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setAdminData(prev => ({ ...prev, loading: false }));
      }
    };
    
    if (!isLoading && isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Administration</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <AdminStats stats={adminData.stats} loading={adminData.loading} />
          </TabsContent>
          
          <TabsContent value="users">
            <UserList users={adminData.users} />
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectList projects={adminData.projects} />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
