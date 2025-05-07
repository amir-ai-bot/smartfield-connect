
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { User } from '@/types/auth';

interface UserListProps {
  users: any[];
  onApproveSupplier: (userId: string) => Promise<void>;
  onRejectSupplier: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onApproveSupplier,
  onRejectSupplier,
  onDeleteUser
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | 'fournisseur' | 'pending_fournisseur' | null>(null);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const filteredUsers = selectedRole 
    ? users.filter(user => user.role === selectedRole) 
    : users;

  const handleApproveSupplier = async (userId: string) => {
    setIsProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      await onApproveSupplier(userId);
      toast.success('Fournisseur approuvé avec succès');
    } catch (error) {
      console.error('Error approving supplier:', error);
      toast.error('Erreur lors de l\'approbation du fournisseur');
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRejectSupplier = async (userId: string) => {
    setIsProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      await onRejectSupplier(userId);
      toast.success('Demande de fournisseur rejetée');
    } catch (error) {
      console.error('Error rejecting supplier request:', error);
      toast.error('Erreur lors du rejet de la demande de fournisseur');
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible.')) {
      return;
    }
    
    setIsProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      await onDeleteUser(userId);
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'fournisseur': return 'bg-blue-500 hover:bg-blue-600';
      case 'pending_fournisseur': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'fournisseur': return 'Fournisseur';
      case 'pending_fournisseur': return 'En attente';
      default: return 'Utilisateur';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Gestion des utilisateurs</CardTitle>
        <CardDescription>
          Total : {users.length} utilisateurs enregistrés
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={selectedRole === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole(null)}
          >
            Tous
          </Button>
          <Button
            variant={selectedRole === 'admin' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole('admin')}
            className={selectedRole === 'admin' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Administrateurs
          </Button>
          <Button
            variant={selectedRole === 'user' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole('user')}
          >
            Utilisateurs
          </Button>
          <Button
            variant={selectedRole === 'fournisseur' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole('fournisseur')}
            className={selectedRole === 'fournisseur' ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            Fournisseurs
          </Button>
          <Button
            variant={selectedRole === 'pending_fournisseur' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole('pending_fournisseur')}
            className={selectedRole === 'pending_fournisseur' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            En attente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.display_name} />
                          <AvatarFallback>{user.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          {user.phone_number && (
                            <p className="text-xs text-gray-500">{user.phone_number}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at && format(new Date(user.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {user.role === 'pending_fournisseur' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleApproveSupplier(user.id)}
                                disabled={isProcessing[user.id]}
                              >
                                Approuver comme fournisseur
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectSupplier(user.id)}
                                disabled={isProcessing[user.id]}
                              >
                                Rejeter la demande
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isProcessing[user.id]}
                            className="text-red-600 focus:text-red-600"
                          >
                            Supprimer l'utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
