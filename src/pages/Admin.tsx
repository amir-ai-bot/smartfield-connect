
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  XCircle,
  Trash2,
  Edit,
  EyeIcon,
  Lock,
  RefreshCcw,
  Check,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User } from "@/types/auth";

interface ProjectWithUser {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  owner_id: string;
  image?: string;
  crop?: string;
  location?: string;
  progress: number;
  start_date: string;
  end_date: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_display_name: string;
  user_email: string;
  user_avatar?: string;
}

interface VerificationCode {
  id: string;
  code: string;
  user_id: string;
  expires_at: string;
  used: boolean;
  type: string;
}

const createUserSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "L'email doit être valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  role: z.enum(["user", "admin", "fournisseur"]),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [pendingFournisseurs, setPendingFournisseurs] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });
  
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });
  
  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!user || !isAdmin())) {
      toast.error('Accès non autorisé');
      navigate('/');
    } else if (user && isAdmin()) {
      fetchAllData();
    }
  }, [user, isAdmin]);
  
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchProjects(),
        fetchVerificationCodes(),
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      // Get all users
      const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedUsers = allUsers as User[];
      
      // Filter pending fournisseurs
      const pending = typedUsers.filter(user => user.role === 'pending_fournisseur');
      setPendingFournisseurs(pending);
      
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };
  
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:owner_id (
            display_name,
            email,
            avatar
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const projectsWithUser = data.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          owner_id: project.owner_id,
          image: project.image,
          crop: project.crop,
          location: project.location,
          progress: project.progress,
          start_date: project.start_date,
          end_date: project.end_date,
          is_public: project.is_public,
          created_at: project.created_at,
          updated_at: project.updated_at,
          user_display_name: project.profiles?.display_name || 'Inconnu',
          user_email: project.profiles?.email || 'Inconnu',
          user_avatar: project.profiles?.avatar || '',
        }));
        
        setProjects(projectsWithUser);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    }
  };
  
  const fetchVerificationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setVerificationCodes(data as VerificationCode[]);
      }
    } catch (error) {
      console.error('Error fetching verification codes:', error);
    }
  };
  
  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    try {
      // Create user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: values.role
          }
        }
      });
      
      if (error) throw error;
      
      // The trigger will create the profile automatically,
      // but we need to update the role
      if (values.role !== 'user') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: values.role })
          .eq('id', data.user?.id);
        
        if (updateError) throw updateError;
      }
      
      toast.success('Utilisateur créé avec succès');
      setCreateDialogOpen(false);
      createUserForm.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Erreur: ${error.message || 'Création impossible'}`);
    }
  };
  
  const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!selectedUser) return;
    
    try {
      // Use the RPC function to update the password
      const { error } = await supabase.rpc(
        'admin_update_user_password',
        { 
          user_id: selectedUser.id, 
          new_password: values.password 
        }
      );
      
      if (error) throw error;
      
      toast.success('Mot de passe modifié avec succès');
      setResetPasswordDialogOpen(false);
      resetPasswordForm.reset();
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Erreur: ${error.message || 'Modification impossible'}`);
    }
  };
  
  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      if (isVerified) {
        // Already verified, nothing to do
        return;
      }
      
      // Call verify user function
      const { error } = await supabase.rpc(
        'admin_verify_user',
        { user_id: userId }
      );
      
      if (error) throw error;
      
      toast.success('Utilisateur vérifié avec succès');
      fetchUsers();
    } catch (error: any) {
      console.error('Error verifying user:', error);
      toast.error(`Erreur: ${error.message || 'Vérification impossible'}`);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Get the user's data before deletion (for confirmation messages)
      const userEmail = selectedUser.email;
      
      // Call delete user function
      const { error } = await supabase.rpc(
        'admin_delete_user',
        { user_id: selectedUser.id }
      );
      
      if (error) throw error;
      
      toast.success(`Utilisateur ${userEmail} supprimé avec succès`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Erreur: ${error.message || 'Suppression impossible'}`);
    }
  };
  
  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Rôle mis à jour avec succès');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Erreur: ${error.message || 'Mise à jour impossible'}`);
    }
  };
  
  const handleApproveFournisseur = async (userId: string) => {
    try {
      // Update the user role from pending_fournisseur to fournisseur
      await handleUpdateUserRole(userId, 'fournisseur');
      
      // Also create a supplier entry if it doesn't exist
      const { data: existingSupplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!existingSupplier) {
        // Get user data for supplier
        const { data: userData } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', userId)
          .single();
        
        if (userData) {
          await supabase
            .from('suppliers')
            .insert({
              user_id: userId,
              name: userData.display_name,
              category: 'Divers',
              location: 'Non spécifié',
              phone: 'Non spécifié',
              products: []
            });
        }
      }
      
      toast.success('Fournisseur approuvé avec succès');
      fetchUsers();
    } catch (error: any) {
      console.error('Error approving supplier:', error);
      toast.error(`Erreur: ${error.message || 'Approbation impossible'}`);
    }
  };
  
  const handleRejectFournisseur = async (userId: string) => {
    try {
      // Change role back to regular user
      await handleUpdateUserRole(userId, 'user');
      toast.success('Demande rejetée');
      fetchUsers();
    } catch (error: any) {
      console.error('Error rejecting supplier:', error);
      toast.error(`Erreur: ${error.message || 'Rejet impossible'}`);
    }
  };
  
  const filterUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(userFilter.toLowerCase()) || 
    user.email?.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  const filterProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectFilter.toLowerCase()) ||
    (project.user_email && project.user_email.toLowerCase().includes(projectFilter.toLowerCase()))
  );
  
  // Check if page is loading or if user is not admin
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-agri-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user || !isAdmin()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Button onClick={() => navigate('/')}>Retourner à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="fournisseurs">
            Demandes Fournisseurs
            {pendingFournisseurs.length > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingFournisseurs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="verification">Codes de vérification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-8 w-full sm:w-64"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-agri-green-500 hover:bg-agri-green-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un utilisateur
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterUsers.length > 0 ? (
                  filterUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.display_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={user.role} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="user">Utilisateur</SelectItem>
                              <SelectItem value="fournisseur">Fournisseur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVerifyUser(user.id, Boolean(user.email_verified))}
                        >
                          {user.email_verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordDialogOpen(true);
                        }}>
                          <Lock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="fournisseurs" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date de demande</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFournisseurs.length > 0 ? (
                  pendingFournisseurs.map((fournisseur) => (
                    <TableRow key={fournisseur.id}>
                      <TableCell className="font-medium">{fournisseur.display_name}</TableCell>
                      <TableCell>{fournisseur.email}</TableCell>
                      <TableCell>{new Date(fournisseur.updated_at || '').toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-500"
                          onClick={() => handleApproveFournisseur(fournisseur.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRejectFournisseur(fournisseur.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      Aucune demande de fournisseur en attente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un projet..."
              className="pl-8 w-full sm:w-64"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterProjects.length > 0 ? (
                  filterProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.user_display_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {project.is_public ? (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            Public
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            Privé
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(project.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Aucun projet trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="verification" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button onClick={fetchVerificationCodes} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Utilisé</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Utilisateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationCodes.length > 0 ? (
                  verificationCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>{code.type}</TableCell>
                      <TableCell>
                        {code.used ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(code.expires_at).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>{code.user_id}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Aucun code de vérification trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for creating a user */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer un nouvel utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={createUserForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="fournisseur">Fournisseur</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for resetting a password */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>Définir un nouveau mot de passe pour {selectedUser.email}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Réinitialiser</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert dialog for confirming user deletion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser.email} ? 
                  Cette action est irréversible et supprimera également toutes les données associées.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
