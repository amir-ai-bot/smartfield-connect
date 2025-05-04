
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllUsers, getAllProjects, getPendingFournisseurRequests, getVerificationCodes } from '@/services/adminService';
import { getAnalyticsData } from '@/services/adminService';
import { updateUserRole } from '@/services/adminService';
import { deleteUser } from '@/services/adminService';
import { deleteProject } from '@/services/adminService';
import { approveFournisseurRequest } from '@/services/adminService';
import { rejectFournisseurRequest } from '@/services/adminService';

import { User, ProjectData } from '@/types/auth';

// Define missing types
interface VerificationCode {
  id: string;
  user_id: string;
  email: string;
  code: string;
  type: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

interface AdminAnalytics {
  userCount: number;
  projectCount: number;
  registrationsByMonth: { [key: string]: number };
  supplierCount?: number;
  activeProjects?: number;
  newUsersThisMonth?: number;
  messagesSentToday?: number;
  usersByRole?: {
    user: number;
    admin: number;
    fournisseur: number;
    pending_fournisseur: number;
  };
  projectsByStatus?: {
    active: number;
    completed: number;
    planning: number;
  };
}

const Admin = () => {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [pendingRequests, setUsers] = useState<User[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    userCount: 0,
    projectCount: 0,
    registrationsByMonth: {},
    usersByRole: {
      user: 0,
      admin: 0,
      fournisseur: 0,
      pending_fournisseur: 0
    },
    projectsByStatus: {
      active: 0,
      completed: 0,
      planning: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      await fetchUsers();
      await fetchProjects();
      await fetchPendingRequests();
      await fetchVerificationCodes();
      await fetchAnalyticsData();
    };

    fetchDashboardData();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      // Add email_verified property to each user
      const usersWithVerification = usersData.map(user => ({
        ...user,
        email_verified: true // Default to true since we can't access auth.users
      }));
      setUsers(usersWithVerification);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await getAllProjects();
      // Map received data to ProjectData format
      const formattedProjects: ProjectData[] = projectsData.map(project => ({
        id: project.id,
        title: project.title || project.name || '',
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        owner_id: project.owner_id || '',
        user_id: project.owner_id || '',
        created_at: project.created_at || '',
        updated_at: project.updated_at || '',
        image: project.image || '',
        crop: project.crop || '',
        location: project.location || '',
        progress: project.progress || 0
      }));
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const requests = await getPendingFournisseurRequests();
      setUsers(requests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const fetchVerificationCodes = async () => {
    const codes = await getVerificationCodes();
    setVerificationCodes(codes as unknown as VerificationCode[]);
  };

  const fetchAnalyticsData = async () => {
    try {
      const data = await getAnalyticsData();
      // Fill in any missing properties with defaults
      setAnalytics({
        userCount: data.userCount || 0,
        projectCount: data.projectCount || 0,
        supplierCount: data.supplierCount || 0,
        activeProjects: data.activeProjects || 0,
        newUsersThisMonth: data.newUsersThisMonth || 0,
        messagesSentToday: data.messagesSentToday || 0,
        usersByRole: data.usersByRole || {
          user: 0,
          admin: 0,
          fournisseur: 0,
          pending_fournisseur: 0
        },
        projectsByStatus: data.projectsByStatus || {
          active: 0,
          completed: 0,
          planning: 0
        },
        registrationsByMonth: data.registrationsByMonth || {}
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      await approveFournisseurRequest(userId);
      await fetchPendingRequests();
      await fetchUsers();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      await rejectFournisseurRequest(userId);
      await fetchPendingRequests();
      await fetchUsers();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <div>Admin Dashboard</div>
  );
};

export default Admin;
