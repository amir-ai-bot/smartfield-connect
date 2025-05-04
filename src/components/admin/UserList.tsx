
import { useState } from 'react';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteUser, verifyUser, updateUserRole } from '@/services/adminService';

interface UserListProps {
  users: User[];
  onRefresh: () => void;
}

export function UserList({ users, onRefresh }: UserListProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleVerify = async (userId: string) => {
    setProcessing(userId);
    try {
      await verifyUser(userId);
      toast.success("Email vérifié avec succès");
      onRefresh();
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error("Erreur lors de la vérification de l'email");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }
    
    setProcessing(userId);
    try {
      await deleteUser(userId);
      toast.success("Utilisateur supprimé avec succès");
      onRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setProcessing(null);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setProcessing(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success("Rôle mis à jour avec succès");
      onRefresh();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vérifié</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.display_name || user.email} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-lg">{(user.display_name || user.email || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.display_name || 'Anonyme'}</div>
                    <div className="text-sm text-gray-500">Créé le {new Date(user.created_at || '').toLocaleDateString()}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select 
                  className="text-sm text-gray-900 border rounded p-1" 
                  value={user.role || 'user'}
                  onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                  disabled={processing === user.id}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                  <option value="fournisseur">Fournisseur</option>
                  <option value="pending_fournisseur">En attente (four.)</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.email_verified ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Vérifié
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVerify(user.id)}
                    disabled={processing === user.id}
                  >
                    Vérifier
                  </Button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  disabled={processing === user.id}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
