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

// Import missing types
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
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    userCount: 0,
    projectCount: 0,
    registrationsByMonth: {}
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
    const usersData = await getAllUsers();
    setUsers(usersData);
  };

  const fetchProjects = async () => {
    const projectsData = await getAllProjects();
    const formattedProjects = projectsData.map(p => ({
      id: p.id,
      title: p.title || p.name || '',
      description: p.description || '',
      status: p.status as 'planning' | 'active' | 'completed',
      user_id: p.owner_id || '',
      created_at: p.created_at,
      updated_at: p.updated_at,
      image: p.image,
      crop: '',
      location: '',
      startDate: '',
      endDate: '',
      progress: 0,
      isPublic: false,
      user_name: p.creator_name,
      user_avatar: p.creator_avatar
    }));
    setProjects(formattedProjects);
  };

  const fetchPendingRequests = async () => {
    const requests = await getPendingFournisseurRequests();
    setPendingRequests(requests);
  };

  const fetchVerificationCodes = async () => {
    const codes = await getVerificationCodes();
    setVerificationCodes(codes as unknown as VerificationCode[]);
  };

  const fetchAnalyticsData = async () => {
    const data = await getAnalyticsData();
    // Convert to expected analytics format
    const adminAnalytics: AdminAnalytics = {
      userCount: data.userCount || 0,
      projectCount: data.projectCount || 0,
      registrationsByMonth: {},
      supplierCount: data.supplierCount,
      activeProjects: data.activeProjects,
      newUsersThisMonth: data.newUsersThisMonth,
      messagesSentToday: data.messagesSentToday,
      usersByRole: data.usersByRole,
      projectsByStatus: data.projectsByStatus
    };
    setAnalytics(adminAnalytics);
  };

  const handleApproveRequest = async (userId: string) => {
    const success = await approveFournisseurRequest(userId);
    if (success) {
      await fetchPendingRequests();
      await fetchUsers();
    }
  };

  const handleRejectRequest = async (userId: string) => {
    const success = await rejectFournisseurRequest(userId);
    if (success) {
      await fetchPendingRequests();
      await fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      await fetchUsers();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const success = await deleteProject(projectId);
    if (success) {
      await fetchProjects();
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      await fetchUsers();
    }
  };

  return (
    <div>Admin Dashboard</div>
  );
};

export default Admin;
