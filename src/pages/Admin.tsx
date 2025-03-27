
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Clipboard, Settings, DatabaseZap, 
  CheckCircle, XCircle, Trash2, Edit, Loader2, UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';

const Admin = () => {
  const { user } = useAuth();
  const [isVerifyingUser, setIsVerifyingUser] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    document.title = 'Administration - AgriSmart';
  }, []);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Erreur lors du chargement des utilisateurs');
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in fetchUsers:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        return [];
      }
    }
  });

  // Fetch all projects
  const { data: projects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:user_id (name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          toast.error('Erreur lors du chargement des projets');
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in fetchProjects:', error);
        toast.error('Erreur lors du chargement des projets');
        return [];
      }
    }
  });

  const verifyUser = async (userId: string) => {
    try {
      setIsVerifyingUser(userId);
      
      // First, get the user's email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (userError || !userData?.email) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Update the auth.users table to mark email as verified
      // This is done through an RPC function to avoid auth schema restrictions
      const { error } = await supabase.rpc('admin_verify_user', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error verifying user:', error);
        throw new Error(error.message);
      }
      
      toast.success('Email de l\'utilisateur vérifié avec succès');
      refetchUsers();
    } catch (error) {
      console.error('Error in verifyUser:', error);
      toast.error('Échec de la vérification: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsVerifyingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setIsDeletingUser(userId);
      
      // Use RPC function to delete user (since auth.users can't be accessed directly)
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id: userId
      });
      
      if (error) throw new Error(error.message);
      
      toast.success('Utilisateur supprimé avec succès');
      refetchUsers();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      toast.error('Échec de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsDeletingUser(null);
    }
  };

  const createNewUser = async () => {
    try {
      setIsCreatingUser(true);
      
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        throw new Error('Veuillez remplir tous les champs requis');
      }
      
      // Call RPC function to create user
      const { error } = await supabase.rpc('admin_create_user', {
        user_name: newUserData.name,
        user_email: newUserData.email,
        user_password: newUserData.password,
        user_role: newUserData.role
      });
      
      if (error) throw new Error(error.message);
      
      toast.success('Nouvel utilisateur créé avec succès');
      setNewUserDialog(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
      refetchUsers();
    } catch (error) {
      console.error('Error in createNewUser:', error);
      toast.error('Échec de la création: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw new Error(error.message);
      
      toast.success('Projet supprimé avec succès');
      refetchProjects();
    } catch (error) {
      console.error('Error in deleteProject:', error);
      toast.error('Échec de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'fournisseur':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-14 md:mt-20">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600">
          Bienvenue, {user?.name}. Gérez votre application depuis ce panneau d'administration.
        </p>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center justify-center">
              <Clipboard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Projets</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center justify-center">
              <DatabaseZap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Base de données</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Consultez et gérez les comptes utilisateurs de l'application
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setNewUserDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    {isLoadingUsers ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {user.avatar ? (
                                      <AvatarImage src={user.avatar} alt={user.name} />
                                    ) : (
                                      <AvatarFallback>
                                        {user.name?.charAt(0) || '?'}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                              <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => verifyUser(user.id)}
                                    disabled={!!isVerifyingUser}
                                  >
                                    {isVerifyingUser === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => deleteUser(user.id)}
                                    disabled={!!isDeletingUser || user.id === user?.id}
                                  >
                                    {isDeletingUser === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                Aucun utilisateur trouvé
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un utilisateur</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte utilisateur pour l'application
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nom
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="col-span-3"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Mot de passe
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="col-span-3"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Rôle
                    </Label>
                    <Select 
                      value={newUserData.role} 
                      onValueChange={(value) => setNewUserData({...newUserData, role: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="fournisseur">Fournisseur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewUserDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createNewUser} disabled={isCreatingUser}>
                    {isCreatingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer utilisateur'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des projets</CardTitle>
                <CardDescription>
                  Consultez et gérez tous les projets de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    {isLoadingProjects ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Projet</TableHead>
                            <TableHead className="hidden md:table-cell">Culture</TableHead>
                            <TableHead className="hidden md:table-cell">Utilisateur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{project.title}</p>
                                  <p className="text-xs text-gray-500 md:hidden">
                                    {project.crop} • {(project.profiles as any)?.name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{project.crop}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {(project.profiles as any)?.name}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(project.status)}>
                                  {project.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => deleteProject(project.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {projects.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                Aucun projet trouvé
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Base de données</CardTitle>
                <CardDescription>
                  Consultez et gérez les données de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tables principales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-gray-600">{users.length} enregistrements</p>
                          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => refetchUsers()}>
                            Rafraîchir
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Projets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-gray-600">{projects.length} enregistrements</p>
                          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => refetchProjects()}>
                            Rafraîchir
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Conversations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-gray-600">Informations sur les messages</p>
                          <Button variant="outline" size="sm" className="mt-2 w-full">
                            Rafraîchir
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Statistiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Utilisateurs actifs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-semibold">{users.length}</p>
                          <p className="text-xs text-gray-600">Tous les comptes</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Fournisseurs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-semibold">
                            {users.filter(u => u.role === 'fournisseur').length}
                          </p>
                          <p className="text-xs text-gray-600">Tous les fournisseurs</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Projets actifs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-semibold">
                            {projects.filter(p => p.status === 'active').length}
                          </p>
                          <p className="text-xs text-gray-600">Tous les projets actifs</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informations de l'application</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="app-name">Nom de l'application</Label>
                          <Input id="app-name" value="AgriSmart" className="mt-1" readOnly />
                        </div>
                        <div>
                          <Label htmlFor="app-version">Version</Label>
                          <Input id="app-version" value="1.0.0" className="mt-1" readOnly />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Statut du système</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Base de données</span>
                          <Badge className="bg-green-100 text-green-800">Connectée</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Stockage</span>
                          <Badge className="bg-green-100 text-green-800">Actif</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Authentification</span>
                          <Badge className="bg-green-100 text-green-800">Fonctionnelle</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-end">
                      <Button>Sauvegarder les paramètres</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
