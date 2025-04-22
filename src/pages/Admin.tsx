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
  getAnalyticsData,
  getAllProjects,
  deleteProject,
  approveFournisseurRequest,
  rejectFournisseurRequest,
  addFournisseur
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Shield, ShieldAlert, ShieldCheck, UserX, Users, List, BarChart3, Trash2, AlertCircle, Sprout, CheckCircle, XCircle, UserPlus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
};

type VerificationCode = {
  id: string;
  code: string;
  email: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  type: string;
  user_id: string;
};

type AnalyticsData = {
  userCount: number;
  projectCount: number;
  registrationsByMonth: Record<string, number>;
};

type Project = {
  id: string;
  title: string;
  crop: string;
  location: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'active' | 'planning' | 'completed';
  image?: string;
  user_name?: string;
  user_id: string;
  created_at: string;
  description?: string;
  is_public?: boolean;
  updated_at?: string;
  user_email?: string;
};

type ProjectWithUser = {
  id: string;
  title: string;
  crop: string;
  location: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'active' | 'planning' | 'completed';
  image?: string;
  user_name?: string;
  user_id: string;
  created_at: string;
  description?: string;
  is_public?: boolean;
  updated_at?: string;
  user_email?: string;
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [showNewFournisseurDialog, setShowNewFournisseurDialog] = useState(false);
  const [newFournisseurForm, setNewFournisseurForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Gafsa Centre',
    category: 'Engrais',
    products: '',
    password: ''
  });
  const [pendingFournisseurs, setPendingFournisseurs] = useState<User[]>([]);

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
        
        const [usersData, codesData, analyticsData, projectsData] = await Promise.all([
          getAllUsers(),
          getAllVerificationCodes(),
          getAnalyticsData(),
          getAllProjects()
        ]);
        
        setUsers(usersData);
        setCodes(codesData);
        setAnalytics(analyticsData);
        
        const pendingUsers = usersData.filter(u => u.role === 'pending_fournisseur');
        setPendingFournisseurs(pendingUsers);
        
        const typedProjects = projectsData.map(project => ({
          ...project,
          user_name: project.creator_name || 'Unknown',
          user_email: project.creator_email,
          status: (project.status as string || 'planning').toLowerCase() === 'active' ? 'active' :
                 (project.status as string || 'planning').toLowerCase() === 'planning' ? 'planning' : 
                 'completed'
        })) as ProjectWithUser[];
        
        setProjects(typedProjects);
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
    }
  };

  const handleDeleteProject = async (project: ProjectWithUser) => {
    setSelectedProject(project);
    setIsDeleteProjectDialogOpen(true);
  };
  
  const confirmDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await deleteProject(selectedProject.id);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setIsDeleteProjectDialogOpen(false);
      setSelectedProject(null);
      toast.success(`Le projet ${selectedProject.title} a été supprimé`);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  
  const getRegistrationChartData = () => {
    if (!analytics?.registrationsByMonth) return [];
    
    return Object.entries(analytics.registrationsByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  };
  
  const shouldAllowUserDeletion = (userEmail: string, userRole: string) => {
    if (userRole === 'admin') {
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
  
  const handleApproveFournisseur = async (userId: string) => {
    try {
      await approveFournisseurRequest(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role: 'fournisseur' } 
          : u
      ));
      
      setPendingFournisseurs(prevPending => 
        prevPending.filter(f => f.id !== userId)
      );
      
      toast.success('Demande approuvée avec succès');
    } catch (error) {
      console.error('Error approving fournisseur request:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  };
  
  const handleRejectFournisseur = async (userId: string) => {
    try {
      await rejectFournisseurRequest(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role: 'user' } 
          : u
      ));
      
      setPendingFournisseurs(prevPending => 
        prevPending.filter(f => f.id !== userId)
      );
      
      toast.success('Demande rejetée avec succès');
    } catch (error) {
      console.error('Error rejecting fournisseur request:', error);
      toast.error('Erreur lors du rejet de la demande');
    }
  };

  const handleAddFournisseur = async () => {
    try {
      if (!newFournisseurForm.name || !newFournisseurForm.email || !newFournisseurForm.password) {
        toast.error('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      const productsArray = newFournisseurForm.products
        ? newFournisseurForm.products.split(',').map(p => p.trim())
        : [];

      await addFournisseur({
        name: newFournisseurForm.name,
        email: newFournisseurForm.email,
        password: newFournisseurForm.password,
        phone: newFournisseurForm.phone,
        location: newFournisseurForm.location,
        category: newFournisseurForm.category,
        products: productsArray
      });

      setShowNewFournisseurDialog(false);
      setNewFournisseurForm({
        name: '',
        email: '',
        phone: '',
        location: 'Gafsa Centre',
        category: 'Engrais',
        products: '',
        password: ''
      });

      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      toast.success('Fournisseur ajouté avec succès');
    } catch (error) {
      console.error('Error adding fournisseur:', error);
      toast.error('Erreur lors de l\'ajout du fournisseur');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="container mx-auto flex-1 p-2 sm:p-4 pt-20 overflow-x-hidden">
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
        
        <Tabs defaultValue="users" className="w-full overflow-x-auto">
          <TabsList className="mb-4 flex w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="users" className="whitespace-nowrap">Utilisateurs</TabsTrigger>
            <TabsTrigger value="fournisseur-requests" className="whitespace-nowrap">Demandes fournisseur{pendingFournisseurs.length > 0 && 
              <Badge variant="destructive" className="ml-1">{pendingFournisseurs.length}</Badge>
            }</TabsTrigger>
            <TabsTrigger value="projects" className="whitespace-nowrap">Projets</TabsTrigger>
            <TabsTrigger value="codes" className="whitespace-nowrap">Codes vérification</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap">Analytiques</TabsTrigger>
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
                                  <SelectItem value="fournisseur">Fournisseur</SelectItem>
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
              <CardFooter className="flex justify-between items-center flex-wrap gap-2">
                <div className="text-xs text-gray-500">
                  <p className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Les administrateurs ne peuvent pas être supprimés.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-auto" 
                  onClick={() => setShowNewFournisseurDialog(true)}
                >
                  <UserPlus size={16} className="mr-2" />
                  Ajouter un fournisseur
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="fournisseur-requests">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de fournisseurs</CardTitle>
                <CardDescription>
                  Gérer les demandes d'utilisateurs qui souhaitent devenir fournisseurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingFournisseurs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date de demande</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingFournisseurs.map((fournisseur) => (
                          <TableRow key={fournisseur.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  {fournisseur.avatar ? (
                                    <AvatarImage src={fournisseur.avatar} alt={fournisseur.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-gray-100 text-gray-700">
                                    {fournisseur.name ? fournisseur.name.charAt(0).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{fournisseur.name || 'Unnamed User'}</div>
                              </div>
                            </TableCell>
                            <TableCell>{fournisseur.email}</TableCell>
                            <TableCell>
                              {fournisseur.created_at 
                                ? format(new Date(fournisseur.created_at), 'dd/MM/yyyy') 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApproveFournisseur(fournisseur.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRejectFournisseur(fournisseur.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune demande de fournisseur en attente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectsTab />
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead>Expire le</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>{code.code}</TableCell>
                          <TableCell>{code.type}</TableCell>
                          <TableCell>
                            {format(new Date(code.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(code.expires_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              code.used 
                                ? 'secondary' 
                                : new Date(code.expires_at) < new Date() 
                                  ? 'destructive' 
                                  : 'success'
                            }>
                              {code.used 
                                ? 'Utilisé' 
                                : new Date(code.expires_at) < new Date() 
                                  ? 'Expiré' 
                                  : 'Valide'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

      <AlertDialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées au projet "{selectedProject?.title}" seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProject} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNewFournisseurDialog} onOpenChange={setShowNewFournisseurDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            <DialogDescription>
              Créez un compte fournisseur qui apparaîtra dans la liste des fournisseurs
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nom *
              </label>
              <Input
                id="name"
                className="col-span-3"
                value={newFournisseurForm.name}
                onChange={(e) => setNewFournisseurForm({...newFournisseurForm, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email" 
                className="col-span-3"
                value={newFournisseurForm.email}
                onChange={(e) => setNewFournisseurForm({...newFournisseurForm, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right text-sm font-medium">
                Mot de passe *
              </label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                value={newFournisseurForm.password}
                onChange={(e) => setNewFournisseurForm({...newFournisseurForm, password: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm font-medium">
                Téléphone
              </label>
              <Input
                id="phone" 
                className="col-span-3"
                value={newFournisseurForm.phone}
                onChange={(e) => setNewFournisseurForm({...newFournisseurForm, phone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Catégorie
              </label>
              <Select 
                value={newFournisseurForm.category} 
                onValueChange={(value) => setNewFournisseurForm({...newFournisseurForm, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engrais">Engrais</SelectItem>
                  <SelectItem value="Semences">Semences</SelectItem>
                  <SelectItem value="Équipement">Équipement</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Machines">Machines</SelectItem>
                  <SelectItem value="Conseil">Conseil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="location" className="text-right text-sm font-medium">
                Localisation
              </label>
              <Select 
                value={newFournisseurForm.location} 
                onValueChange={(value) => setNewFournisseurForm({...newFournisseurForm, location: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gafsa Centre">Gafsa Centre</SelectItem>
                  <SelectItem value="Gafsa Sud">Gafsa Sud</SelectItem>
                  <SelectItem value="Gafsa Nord">Gafsa Nord</SelectItem>
                  <SelectItem value="Gafsa Est">Gafsa Est</SelectItem>
                  <SelectItem value="El Guettar">El Guettar</SelectItem>
                  <SelectItem value="Metlaoui">Metlaoui</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="products" className="text-right text-sm font-medium">
                Produits
              </label>
              <Textarea
                id="products"
                placeholder="Séparez les produits par des virgules"
                className="col-span-3"
                value={newFournisseurForm.products}
                onChange={(e) => setNewFournisseurForm({...newFournisseurForm, products: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowNewFournisseurDialog(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleAddFournisseur}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProjectsTab = () => {
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const allProjects = await getAllProjects();
        
        const typedProjects = allProjects.map(project => ({
          ...project,
          user_name: project.creator_name || 'Unknown',
          user_email: project.creator_email,
          status: (project.status as string || 'planning').toLowerCase() === 'active' ? 'active' :
                 (project.status as string || 'planning').toLowerCase() === 'planning' ? 'planning' : 
                 'completed'
        })) as ProjectWithUser[];
        
        setProjects(typedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des projets</CardTitle>
        <CardDescription>
          Voir et gérer tous les projets de l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Culture</TableHead>
                <TableHead>Créateur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Sprout className="mr-1 h-4 w-4 text-green-500" />
                      <span>{project.crop}</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.user_name || project.creator_name || "Utilisateur inconnu"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        project.status === 'active' ? "success" :
                        project.status === 'planning' ? "info" :
                        "secondary"
                      }
                    >
                      {project.status === 'active' ? "Actif" :
                       project.status === 'planning' ? "Planification" :
                       "Complété"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.created_at ? format(new Date(project.created_at), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-gray-500">
          Total: {projects.length} projets
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminPage;
