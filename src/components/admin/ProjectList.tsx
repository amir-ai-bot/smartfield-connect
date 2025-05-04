
import { ProjectData } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteProject } from '@/services/adminService';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectListProps {
  projects: ProjectData[];
  onRefresh: () => void;
}

export function ProjectList({ projects, onRefresh }: ProjectListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return;
    }
    
    setDeletingId(id);
    try {
      await deleteProject(id);
      toast.success("Projet supprimé avec succès");
      onRefresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Erreur lors de la suppression du projet");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="secondary">Planification</Badge>;
      case 'active':
        return <Badge variant="success">Actif</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{project.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{project.creator_name || project.user_name || 'Anonyme'}</div>
                <div className="text-sm text-gray-500">{project.creator_email || ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(project.created_at || '').toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(project.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                >
                  {deletingId === project.id ? "..." : "Supprimer"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
