import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Clipboard, Settings, DatabaseZap, 
  CheckCircle, XCircle, Trash2, Edit, Loader2, UserPlus, UserX
} from 'lucide-react';
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
import { fetchAllUsers, fetchAllProjects, deleteProject, verifyUserEmail, deleteUser, createUser } from '@/services/adminService';

const Admin = () => {
  const { user } = useAuth();
  const [isVerifyingUser, setIsVerifyingUser] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState<string | null>(null);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, email: string, name: string} | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
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

  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers
  });

  const { data: projects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: fetchAllProjects
  });

  const handleVerifyUser = async (userId: string) => {
    try {
      setIsVerifyingUser(userId);
      await verifyUserEmail(userId);
      toast.success('Email de l\'utilisateur vérifié avec succès');
      refetchUsers();
    } catch (error) {
      console.error('Error in verifyUser:', error);
      toast.error('Échec de la vérification: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsVerifyingUser(null);
    }
  };

  const openDeleteUserDialog = (userId: string, userName: string, userEmail: string) => {
    if (userId === user?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    
    setUserToDelete({
      id: userId,
      name: userName,
      email: userEmail
    });
    setConfirmEmail('');
    setDeleteUserDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeletingUser(userToDelete.id);
      await deleteUser(userToDelete.id);
      toast.success('Utilisateur supprimé avec succès');
      refetchUsers();
      refetchProjects(); // Also refresh projects as they might have been deleted
      setDeleteUserDialog(false);
      setUserToDelete(null);
      setConfirmEmail('');
    } catch (error) {
      console.error('Error in deleteUser:', error);
      toast.error('Échec de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsDeletingUser(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeletingProject(projectId);
      
      // Confirm before deleting
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        await deleteProject(projectId);
        toast.success('Projet supprimé avec succès');
        refetchProjects();
      }
    } catch (error) {
      console.error('Error in deleteProject:', error);
      toast.error('Échec de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsDeletingProject(null);
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

  const getVerificationBadgeColor = (isVerified: boolean) => {
    return isVerified 
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="container mx-auto px-2 py-4 pb-20 md:pb-8 mt-14 md:mt-16">
      <div className="flex flex-col space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Administration</h1>
        <p className="text-sm text-gray-600">
          Bienvenue, {user?.name}. Gérez votre application depuis ce panneau d'administration.
        </p>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center justify-center">
              <Clipboard className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Projets</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center justify-center">
              <DatabaseZap className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Base de données</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between px-3 py-3">
                <div>
                  <CardTitle className="text-base">Gestion des utilisateurs</CardTitle>
                  <CardDescription className="text-xs">
                    Consultez et gérez les comptes utilisateurs
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setNewUserDialog(true)}
                  size="sm"
                  className="text-xs"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="px-3 py-2">
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    {isLoadingUsers ? (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Utilisateur</TableHead>
                            <TableHead className="hidden md:table-cell text-xs">Email</TableHead>
                            <TableHead className="text-xs">Rôle</TableHead>
                            <TableHead className="hidden md:table-cell text-xs">Statut</TableHead>
                            <TableHead className="text-right text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    {user.avatar ? (
                                      <AvatarImage src={user.avatar} alt={user.name} />
                                    ) : (
                                      <AvatarFallback className="text-xs">
                                        {user.name?.charAt(0) || '?'}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-xs">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 md:hidden">{user.email}</p>
                                    <div className="md:hidden mt-1">
                                      <Badge className={`${getVerificationBadgeColor(user.email_verified || false)} text-[10px] px-1 py-0`}>
                                        {user.email_verified ? 'Vérifié' : 'Non vérifié'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs">{user.email}</TableCell>
                              <TableCell>
                                <Badge className={`${getRoleBadgeColor(user.role)} text-[10px] px-1 py-0`}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge className={`${getVerificationBadgeColor(user.email_verified || false)} text-[10px] px-1 py-0`}>
                                  {user.email_verified ? 'Vérifié' : 'Non vérifié'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {!user.email_verified && (
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleVerifyUser(user.id)}
                                      disabled={!!isVerifyingUser}
                                    >
                                      {isVerifyingUser === user.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      )}
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    className="h-7 text-xs"
                                    onClick={() => openDeleteUserDialog(user.id, user.name || '', user.email || '')}
                                    disabled={!!isDeletingUser || user.id === user?.id}
                                  >
                                    <UserX className="h-3 w-3 text-red-600 mr-1" />
                                    Supprimer
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-gray-500 text-xs">
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
          </TabsContent>
          
          <TabsContent value="projects" className="mt-3">
            <Card>
              <CardHeader className="px-3 py-3">
                <CardTitle className="text-base">Gestion des projets</CardTitle>
                <CardDescription className="text-xs">
                  Consultez et gérez tous les projets de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 py-2">
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    {isLoadingProjects ? (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Projet</TableHead>
                            <TableHead className="hidden md:table-cell text-xs">Culture</TableHead>
                            <TableHead className="hidden md:table-cell text-xs">Utilisateur</TableHead>
                            <TableHead className="text-xs">Statut</TableHead>
                            <TableHead className="text-right text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="py-2">
                                <div>
                                  <p className="font-medium text-xs">{project.title}</p>
                                  <p className="text-[10px] text-gray-500 md:hidden">
                                    {project.crop} • {project.user_name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs">{project.crop}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs">
                                {project.user_name}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(project.status)} text-[10px] px-1 py-0`}>
                                  {project.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleDeleteProject(project.id)}
                                    disabled={!!isDeletingProject}
                                  >
                                    {isDeletingProject === project.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : (
                                      <Trash2 className="h-3 w-3 text-red-600 mr-1" />
                                    )}
                                    Supprimer
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {projects.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-gray-500 text-xs">
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

      <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription className="text-xs">
              Créez un compte utilisateur avec les informations de base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Nom complet</Label>
              <Input 
                id="name" 
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                className="text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs">Mot de passe</Label>
              <Input 
                id="password" 
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                className="text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role" className="text-xs">Rôle</Label>
              <Select 
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({...newUserData, role: value})}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user" className="text-sm">Utilisateur</SelectItem>
                  <SelectItem value="fournisseur" className="text-sm">Fournisseur</SelectItem>
                  <SelectItem value="admin" className="text-sm">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewUserDialog(false)}
              className="text-xs"
              size="sm"
            >
              Annuler
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsCreatingUser(true);
                  await createUser(
                    newUserData.name,
                    newUserData.email,
                    newUserData.password,
                    newUserData.role
                  );
                  toast.success('Utilisateur créé avec succès');
                  setNewUserDialog(false);
                  setNewUserData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user'
                  });
                  refetchUsers();
                } catch (error) {
                  console.error('Error creating user:', error);
                  toast.error('Erreur lors de la création de l\'utilisateur: ' + 
                    (error instanceof Error ? error.message : 'Erreur inconnue'));
                } finally {
                  setIsCreatingUser(false);
                }
              }}
              disabled={isCreatingUser || !newUserData.name || !newUserData.email || !newUserData.password}
              className="text-xs"
              size="sm"
            >
              {isCreatingUser ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer l\'utilisateur'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-red-600">Supprimer un utilisateur</DialogTitle>
            <DialogDescription className="text-xs">
              Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm font-medium text-amber-800">Attention !</p>
              <p className="text-xs text-amber-700">
                Vous êtes sur le point de supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ({userToDelete?.email}).
                Cette action supprimera également tous ses projets, messages et autres données associées.
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="confirm-email" className="text-xs">
                Pour confirmer, saisissez l'adresse email de l'utilisateur :
              </Label>
              <Input 
                id="confirm-email" 
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="text-sm h-8"
                placeholder={userToDelete?.email}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteUserDialog(false);
                setUserToDelete(null);
                setConfirmEmail('');
              }}
              className="text-xs"
              size="sm"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={confirmEmail !== userToDelete?.email || isDeletingUser !== null}
              className="text-xs"
              size="sm"
            >
              {isDeletingUser ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
