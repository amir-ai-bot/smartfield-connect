
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Check, Trash2, UserCheck, Shield } from 'lucide-react';
import { User } from '@/types/supabase';
import { toast } from 'sonner';
import { deleteUser, verifyUser, updateUserRole } from '@/services/adminService';
import { DataTable } from '@/components/ui/data-table';

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success('Utilisateur supprimé avec succès');
      setConfirmDelete(null);
      // You would typically refresh the user list here
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };
  
  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId);
      toast.success('Utilisateur vérifié avec succès');
      // You would typically refresh the user list here
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Erreur lors de la vérification de l\'utilisateur');
    }
  };
  
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Rôle mis à jour avec succès: ${newRole}`);
      // You would typically refresh the user list here
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };
  
  const columns = [
    {
      header: 'Utilisateur',
      accessorKey: 'name',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>{row.original.name ? row.original.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name || 'Sans nom'}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rôle',
      accessorKey: 'role',
      cell: ({ row }: { row: { original: User } }) => (
        <Badge variant={
          row.original.role === 'admin' 
            ? 'destructive' 
            : row.original.role === 'fournisseur' 
              ? 'default'
              : 'secondary'
        }>
          {row.original.role}
        </Badge>
      ),
    },
    {
      header: 'Statut',
      accessorKey: 'email_verified',
      cell: ({ row }: { row: { original: User } }) => (
        <Badge variant={row.original.email_verified ? 'success' : 'outline'}>
          {row.original.email_verified ? 'Vérifié' : 'Non vérifié'}
        </Badge>
      ),
    },
    {
      header: 'Date de création',
      accessorKey: 'created_at',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="text-sm">
          {row.original.created_at 
            ? new Date(row.original.created_at).toLocaleDateString() 
            : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex gap-2">
          {!row.original.email_verified && (
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => handleVerifyUser(row.original.id)}
              title="Vérifier l'utilisateur"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            size="icon" 
            variant="outline" 
            onClick={() => handleUpdateRole(
              row.original.id, 
              row.original.role === 'admin' ? 'user' : 'admin'
            )}
            title={row.original.role === 'admin' ? 'Révoquer admin' : 'Promouvoir admin'}
          >
            <Shield className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="outline" 
            className="text-red-500"
            onClick={() => setConfirmDelete(row.original.id)}
            title="Supprimer l'utilisateur"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={users}
          />
        </CardContent>
      </Card>
      
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmDelete && handleDeleteUser(confirmDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserList;
