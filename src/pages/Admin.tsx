import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, ProjectData } from "@/types/auth";
import { UserList } from "@/components/admin/UserList";
import { ProjectList } from "@/components/admin/ProjectList";
import { AdminStats } from "@/components/admin/AdminStats";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { getAdminUsers, getAdminProjects, getAdminStats } from "@/services/adminService";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for charts
const userRegistrationData = [
  { month: 'Jan', count: 4 },
  { month: 'Feb', count: 7 },
  { month: 'Mar', count: 5 },
  { month: 'Apr', count: 10 },
  { month: 'May', count: 12 },
  { month: 'Jun', count: 8 },
];

const projectCreationData = [
  { month: 'Jan', count: 2 },
  { month: 'Feb', count: 4 },
  { month: 'Mar', count: 3 },
  { month: 'Apr', count: 5 },
  { month: 'May', count: 8 },
  { month: 'Jun', count: 6 },
];

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | AgriSmart';
    if (!authLoading && isAdmin()) {
      fetchData();
    }
  }, [authLoading, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, projectsData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminProjects(),
        getAdminStats()
      ]);

      const usersWithVerification = usersData.map(user => ({
        ...user,
        email_verified: !!user.email_verified
      }));
      
      setUsers(usersWithVerification);
      
      // Map project names and handle data cleanup
      const processedProjects = projectsData.map(project => {
        return {
          ...project,
          title: project.title || project.name,
          name: project.name || project.title,
          status: (project.status === 'planning' || 
                  project.status === 'active' || 
                  project.status === 'completed') 
                 ? project.status 
                 : 'planning' as 'planning' | 'active' | 'completed'
        };
      });
      
      setProjects(processedProjects);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          <AdminStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <h2 className="text-lg font-semibold">Nouvelles inscriptions</h2>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userRegistrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h2 className="text-lg font-semibold">Nouveaux projets</h2>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectCreationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="projects">Projets</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserList users={users} onRefresh={fetchData} />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectList projects={projects} onRefresh={fetchData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
