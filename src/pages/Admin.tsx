import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getAllUsers,
  getAllVerificationCodes,
  getAnalyticsData,
  getAllProjects,
  updateUserRole,
  deleteUser,
  deleteProject,
  approveFournisseurRequest,
  rejectFournisseurRequest,
} from '@/services/adminService';
import { User, VerificationCode, ProjectWithUser } from '@/types/supabase';
import { formatDate, getTimeAgo } from '@/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from '@/contexts/LanguageContext';
import AddFournisseurForm from '@/components/forms/AddFournisseurForm';

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    userCount: number;
    projectCount: number;
    registrationsByMonth: { [key: string]: number };
  }>({ userCount: 0, projectCount: 0, registrationsByMonth: {} });
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddFournisseurDialogOpen, setIsAddFournisseurDialogOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);

      const verificationCodesData = await getAllVerificationCodes();
      setVerificationCodes(verificationCodesData);

      const analytics = await getAnalyticsData();
      setAnalyticsData(analytics);

      const projectsData = await getAllProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      // Optimistically update the state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success('Projet supprimé avec succès');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };

  const handleApproveFournisseur = async (userId: string) => {
    try {
      await approveFournisseurRequest(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: 'fournisseur' } : user
      ));
      toast.success('Demande approuvée avec succès');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleRejectFournisseur = async (userId: string) => {
    try {
      await rejectFournisseurRequest(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: 'user' } : user
      ));
      toast.success('Demande rejetée avec succès');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erreur lors du rejet de la demande');
    }
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenAddFournisseurDialog = () => {
    setIsAddFournisseurDialogOpen(true);
  };

  const handleCloseAddFournisseurDialog = () => {
    setIsAddFournisseurDialogOpen(false);
  };

  const handleAddFournisseurSuccess = () => {
    loadData();
    setIsAddFournisseurDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">{t('admin')}</h1>

      {/* Analytics Dashboard */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">User Count</h3>
            <p className="text-3xl font-bold">{analyticsData.userCount}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Project Count</h3>
            <p className="text-3xl font-bold">{analyticsData.projectCount}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Monthly Registrations</h3>
            <ul>
              {Object.entries(analyticsData.registrationsByMonth).map(([month, count]) => (
                <li key={month} className="flex justify-between">
                  <span>{month}</span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* User Management */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        <Table>
          <TableCaption>A list of all registered users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isAdmin = user.role === 'admin';
              const isFournisseur = user.role === 'fournisseur';
              const isPendingFournisseur = user.role === 'pending_fournisseur';
              const isModerator = user?.role === 'admin';

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isAdmin ? <Badge variant="default">Admin</Badge> :
                      isFournisseur ? <Badge variant="secondary">Fournisseur</Badge> :
                        isPendingFournisseur ? <Badge variant="outline">Pending</Badge> :
                          'User'}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at || new Date(), 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, isAdmin ? 'user' : 'admin')} disabled={isModerator}>
                          <Edit className="mr-2 h-4 w-4" />
                          {isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        {isPendingFournisseur && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveFournisseur(user.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Approve Fournisseur
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectFournisseur(user.id)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Reject Fournisseur
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenDeleteDialog(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Total {users.length} users
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input type="text" id="name" value={selectedUser?.name || ''} className="col-span-3" disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input type="email" id="email" value={selectedUser?.email || ''} className="col-span-3" disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={handleCloseDeleteDialog}>
                Cancel
              </Button>
              <Button type="submit" className="ml-2" onClick={handleDeleteUser}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Verification Codes */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Verification Codes</h2>
        <ScrollArea>
          <Table>
            <TableCaption>A list of all verification codes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>{code.user_id}</TableCell>
                  <TableCell>{code.email}</TableCell>
                  <TableCell>{code.code}</TableCell>
                  <TableCell>{code.type}</TableCell>
                  <TableCell>{formatDate(code.created_at, 'PPP')}</TableCell>
                  <TableCell>{formatDate(code.expires_at, 'PPP')}</TableCell>
                  <TableCell>{code.used ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Total {verificationCodes.length} codes
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
      </section>

      {/* Projects Management */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Projects Management</h2>
        <Table>
          <TableCaption>A list of all projects.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>{project.user_name || project.creator_name || 'Unknown'} ({project.user_email || project.creator_email || 'Unknown'})</TableCell>
                <TableCell>{formatDate(project.created_at || new Date(), 'PPP')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Total {projects.length} projects
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      {/* Add Fournisseur Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Add Fournisseur</h2>
        <Dialog open={isAddFournisseurDialogOpen} onOpenChange={setIsAddFournisseurDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Fournisseur</DialogTitle>
              <DialogDescription>
                Create a new fournisseur account.
              </DialogDescription>
            </DialogHeader>
            <AddFournisseurForm onSuccess={handleAddFournisseurSuccess} onCancel={handleCloseAddFournisseurDialog} />
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
};

export default Admin;
