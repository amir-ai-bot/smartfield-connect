
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAllUsers, 
  promoteToAdmin, 
  demoteToUser, 
  getAllVerificationCodes, 
  updateUserRole, 
  deleteUser,
  getAnalyticsData
} from '@/services/adminService';
import Navbar from '@/components/Navbar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Shield, ShieldAlert, ShieldCheck, UserX, Users, List, BarChart3, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
  last_login?: string;
};

type VerificationCode = {
  id: string;
  code: string;
  email: string;
  created_at: string;
  expires_at: string;
  used: boolean;
};

type AnalyticsData = {
  userCount: number;
  projectCount: number;
  registrationsByMonth: Record<string, number>;
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [usersData, codesData, analyticsData] = await Promise.all([
          getAllUsers(),
          getAllVerificationCodes(),
          getAnalyticsData()
        ]);
        
        setUsers(usersData);
        setCodes(codesData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      // Update the user in the local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role: newRole } 
          : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };
  
  const handleDeleteUser = async (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success(`L'utilisateur ${selectedUser.email} a été supprimé`);
    } catch (error) {
      console.error('Error deleting user:', error);
      // The toast will be shown in the deleteUser function
    }
  };
  
  // Format analytics data for charts
  const getRegistrationChartData = () => {
    if (!analytics?.registrationsByMonth) return [];
    
    return Object.entries(analytics.registrationsByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Show only the last 12 months
  };
  
  const shouldAllowUserDeletion = (userEmail: string, userRole: string) => {
    // Don't allow deletion of admin users
    if (userRole === 'admin') {
      return false;
    }
    // Don't allow deletion of protected users
    if (userEmail === 'bahapro30@gmail.com') {
      return false;
    }
    return true;
  };
  
  const ROLES = {
    admin: { color: 'bg-red-100 text-red-800', icon: <ShieldAlert className="h-4 w-4" /> },
    user: { color: 'bg-green-100 text-green-800', icon: <Shield className="h-4 w-4" /> },
    moderator: { color: 'bg-blue-100 text-blue-800', icon: <ShieldCheck className="h-4 w-4" /> }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container mx-auto flex-1 p-4 pt-20">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="container mx-auto flex-1 p-4 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administration</h1>
          <p className="text-gray-500">Gérer les utilisateurs et les données de l'application</p>
        </div>
        
        {analytics && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col space-y-1">
                  <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                </div>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.userCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col space-y-1">
                  <CardTitle className="text-sm font-medium">Projets Total</CardTitle>
                </div>
                <List className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.projectCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col space-y-1">
                  <CardTitle className="text-sm font-medium">
                    Inscriptions ce mois
                  </CardTitle>
                </div>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getRegistrationChartData().length > 0 
                    ? getRegistrationChartData()[getRegistrationChartData().length - 1].count 
                    : 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="codes">Codes de vérification</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Voir et gérer tous les utilisateurs de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                ) : null}
                                <AvatarFallback className="bg-gray-100 text-gray-700">
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{user.name || 'Unnamed User'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLES[user.role as keyof typeof ROLES]?.color || 'bg-gray-100 text-gray-800'}`}>
                              {ROLES[user.role as keyof typeof ROLES]?.icon}
                              <span className="ml-1">{user.role}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.created_at 
                              ? format(new Date(user.created_at), 'dd/MM/yyyy') 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="h-8 w-28">
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Utilisateur</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="moderator">Modérateur</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {shouldAllowUserDeletion(user.email, user.role) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-gray-500">
                  <p className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Les administrateurs et les comptes protégés ne peuvent pas être supprimés.
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Total: {users.length} utilisateurs
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle>Codes de vérification</CardTitle>
                <CardDescription>
                  Voir tous les codes de vérification générés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Expire le</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>{code.code}</TableCell>
                        <TableCell>{code.email}</TableCell>
                        <TableCell>
                          {format(new Date(code.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(code.expires_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            code.used 
                              ? 'bg-gray-100 text-gray-800' 
                              : new Date(code.expires_at) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {code.used 
                              ? 'Utilisé' 
                              : new Date(code.expires_at) < new Date() 
                                ? 'Expiré' 
                                : 'Valide'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inscriptions mensuelles</CardTitle>
                  <CardDescription>
                    Nombre d'utilisateurs inscrits par mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getRegistrationChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des rôles</CardTitle>
                  <CardDescription>
                    Répartition des utilisateurs par rôle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
                            { name: 'User', value: users.filter(u => u.role === 'user').length },
                            { name: 'Moderator', value: users.filter(u => u.role === 'moderator').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
                            { name: 'User', value: users.filter(u => u.role === 'user').length },
                            { name: 'Moderator', value: users.filter(u => u.role === 'moderator').length },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à {selectedUser?.email} seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
