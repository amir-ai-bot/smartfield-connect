
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, getAllProjects, getAnalyticsData, updateUserRole, deleteUser, deleteProject, approveFournisseurRequest, rejectFournisseurRequest, getAllVerificationCodes } from '@/services/adminService';
import { User, Project as ProjectType } from '@/types/supabase';
import { formatDate } from '@/utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Search, UserPlus, Check, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AddFournisseurForm from '@/components/forms/AddFournisseurForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProjectWithUser extends ProjectType {
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
}

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>({
    userCount: 0,
    projectCount: 0,
    registrationsByMonth: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmOperation, setConfirmOperation] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);
  const [filterPendingFournisseurs, setFilterPendingFournisseurs] = useState(false);
  const [addFournisseurOpen, setAddFournisseurOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, projectsData, analyticsResult, codesData] = await Promise.all([
        getAllUsers(),
        getAllProjects(),
        getAnalyticsData(),
        getAllVerificationCodes()
      ]);
      
      // Set users data
      setUsers(usersData);
      
      // Set projects data - handle potential missing fields
      const typedProjects: ProjectWithUser[] = projectsData.map(project => ({
        id: project.id,
        name: project.name || '',
        status: project.status || '',
        description: project.description || '',
        owner_id: project.owner_id || '',
        created_at: project.created_at || '',
        updated_at: project.updated_at || '',
        creator_name: project.creator_name || 'Unknown',
        creator_email: project.creator_email || '',
        creator_avatar: project.creator_avatar || ''
      }));
      
      setProjects(typedProjects);
      
      // Set analytics data
      setAnalyticsData(analyticsResult);
      
      // Set verification codes
      if (Array.isArray(codesData)) {
        setVerificationCodes(codesData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Erreur lors du chargement des données administratives');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchData();
    } else if (isAuthenticated && !isAdmin()) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!isAdmin()) return;
    
    try {
      await updateUserRole(userId, newRole);
      // Refresh users list after update
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin()) return;
    
    try {
      await deleteUser(userId);
      // Refresh users list after deletion
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setConfirmOperation(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!isAdmin()) return;
    
    try {
      await deleteProject(projectId);
      // Refresh projects list after deletion
      const updatedProjects = await getAllProjects();
      setProjects(updatedProjects as ProjectWithUser[]);
      toast.success('Projet supprimé avec succès');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    } finally {
      setConfirmOperation(null);
    }
  };

  const handleApproveFournisseurRequest = async (userId: string) => {
    if (!isAdmin()) return;
    
    try {
      await approveFournisseurRequest(userId);
      // Refresh users list after update
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      toast.success('Demande approuvée avec succès');
    } catch (error) {
      console.error('Error approving supplier request:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleRejectFournisseurRequest = async (userId: string) => {
    if (!isAdmin()) return;
    
    try {
      await rejectFournisseurRequest(userId);
      // Refresh users list after update
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      toast.success('Demande rejetée avec succès');
    } catch (error) {
      console.error('Error rejecting supplier request:', error);
      toast.error('Erreur lors du rejet de la demande');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPendingFournisseurs) {
      return matchesSearch && user.role === 'pending_fournisseur';
    }
    
    return matchesSearch;
  });

  const filteredProjects = projects.filter(project => 
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVerificationCodes = verificationCodes.filter(code => 
    code.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate user role distribution for pie chart
  const userRoleDistribution = [
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
    { name: 'User', value: users.filter(u => u.role === 'user').length },
    { name: 'Fournisseur', value: users.filter(u => u.role === 'fournisseur').length },
    { name: 'En attente', value: users.filter(u => u.role === 'pending_fournisseur').length },
  ];

  // Calculate project status distribution for pie chart
  const projectStatusDistribution = [
    { name: 'Active', value: projects.filter(p => p.status === 'active').length },
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
  ];

  // Convert monthly registrations to chart data
  const registrationChartData = Object.entries(analyticsData.registrationsByMonth || {}).map(([month, count]) => ({
    month,
    count: count as number
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administration</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={addFournisseurOpen} onOpenChange={setAddFournisseurOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter un fournisseur</DialogTitle>
              </DialogHeader>
              <AddFournisseurForm onSuccess={() => {
                setAddFournisseurOpen(false);
                fetchData();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="verification">Codes de vérification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{analyticsData.userCount}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total des utilisateurs enregistrés
                  </p>
                  <div className="h-[200px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userRoleDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userRoleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Projets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{analyticsData.projectCount}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total des projets créés
                  </p>
                  <div className="h-[200px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#82ca9d"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {projectStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Inscriptions mensuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={registrationChartData}>
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
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={filterPendingFournisseurs ? "default" : "outline"} 
                  onClick={() => setFilterPendingFournisseurs(!filterPendingFournisseurs)}
                  size="sm"
                >
                  {filterPendingFournisseurs ? "Tous les utilisateurs" : "Demandes en attente"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : user.role === 'fournisseur'
                                    ? 'bg-green-100 text-green-800'
                                    : user.role === 'pending_fournisseur'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role === 'admin' 
                                ? 'Administrateur' 
                                : user.role === 'fournisseur'
                                  ? 'Fournisseur'
                                  : user.role === 'pending_fournisseur'
                                    ? 'Demande fournisseur'
                                    : 'Utilisateur'
                              }
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at || '')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {user.role !== 'admin' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(user.id, 'admin')}
                                >
                                  Promouvoir admin
                                </Button>
                              )}
                              
                              {user.role !== 'fournisseur' && user.role !== 'pending_fournisseur' && user.role !== 'moderator' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(user.id, 'fournisseur')}
                                >
                                  Promouvoir fournisseur
                                </Button>
                              )}
                              
                              {user.role === 'admin' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(user.id, 'user')}
                                >
                                  Rétrograder
                                </Button>
                              )}
                              
                              {user.role === 'pending_fournisseur' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="bg-green-50 hover:bg-green-100 text-green-600"
                                    onClick={() => handleApproveFournisseurRequest(user.id)}
                                    title="Approuver"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="bg-red-50 hover:bg-red-100 text-red-600"
                                    onClick={() => handleRejectFournisseurRequest(user.id)}
                                    title="Rejeter"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                  >
                                    Supprimer
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera définitivement l'utilisateur {user.name} et toutes ses données associées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Projets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucun projet trouvé</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du projet</TableHead>
                        <TableHead>Créateur</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.creator_name || 'Inconnu'}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs ${
                                project.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : project.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {project.status === 'active' 
                                ? 'Actif' 
                                : project.status === 'completed'
                                  ? 'Terminé'
                                  : 'En planification'
                              }
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(project.created_at || '')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                Voir
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                  >
                                    Supprimer
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera définitivement le projet {project.name} et toutes ses données associées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Codes de vérification</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredVerificationCodes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucun code de vérification trouvé</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date d'expiration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerificationCodes.map((code) => {
                        const isExpired = new Date(code.expires_at) < new Date();
                        
                        return (
                          <TableRow key={code.id}>
                            <TableCell>{code.email}</TableCell>
                            <TableCell>{code.type}</TableCell>
                            <TableCell>{code.code}</TableCell>
                            <TableCell>
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  code.used 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : isExpired
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {code.used 
                                  ? 'Utilisé' 
                                  : isExpired
                                    ? 'Expiré'
                                    : 'Valide'
                                }
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(code.expires_at)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog */}
      {confirmOperation && (
        <AlertDialog open={!!confirmOperation} onOpenChange={() => setConfirmOperation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmOperation.type === 'delete-user' && (
                  `Êtes-vous sûr de vouloir supprimer l'utilisateur ${confirmOperation.name}?`
                )}
                {confirmOperation.type === 'delete-project' && (
                  `Êtes-vous sûr de vouloir supprimer le projet ${confirmOperation.name}?`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (confirmOperation.type === 'delete-user') {
                    handleDeleteUser(confirmOperation.id);
                  } else if (confirmOperation.type === 'delete-project') {
                    handleDeleteProject(confirmOperation.id);
                  }
                }}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminPage;
