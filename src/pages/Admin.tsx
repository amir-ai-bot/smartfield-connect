
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserList from '@/components/admin/UserList';
import ProjectList from '@/components/admin/ProjectList';
import AdminStats from '@/components/admin/AdminStats';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, getAllProjects } from '@/services/adminService';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    // Redirect if not an admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, projectsData] = await Promise.all([
          getAllUsers(),
          getAllProjects()
        ]);
        
        setUsers(usersData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <>
      <NavBar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Administration</h1>
        
        <AdminStats />
        
        <Tabs defaultValue="users" className="mt-8">
          <TabsList>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>
            ) : (
              <UserList users={users} />
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="mt-4">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Projets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>
            ) : (
              <ProjectList projects={projects} />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
