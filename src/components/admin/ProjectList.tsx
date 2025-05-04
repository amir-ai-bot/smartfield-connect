
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Trash2 } from 'lucide-react';
import { ProjectData } from '@/types/dashboard';
import { toast } from 'sonner';
import { deleteProject } from '@/services/projectService';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';

interface ProjectListProps {
  projects: ProjectData[];
}

const ProjectList = ({ projects }: ProjectListProps) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success('Projet supprimé avec succès');
      setConfirmDelete(null);
      // You would typically refresh the project list here
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };
  
  const columns = [
    {
      header: 'Projet',
      accessorKey: 'title',
      cell: ({ row }: { row: { original: ProjectData } }) => (
        <div className="flex items-center gap-2">
          {row.original.image && (
            <div className="h-10 w-10 rounded overflow-hidden">
              <img 
                src={row.original.image} 
                alt={row.original.title} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.original.description || 'Pas de description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: ProjectData } }) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          planning: 'bg-blue-100 text-blue-800',
          completed: 'bg-gray-100 text-gray-800'
        };
        
        const statusLabels = {
          active: 'Actif',
          planning: 'Planification',
          completed: 'Terminé'
        };
        
        const color = statusColors[row.original.status] || 'bg-gray-100 text-gray-800';
        const label = statusLabels[row.original.status] || row.original.status;
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Propriétaire',
      cell: ({ row }: { row: { original: ProjectData } }) => (
        <div className="text-sm">
          {row.original.user_name || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Culture',
      accessorKey: 'crop',
    },
    {
      header: 'Lieu',
      accessorKey: 'location',
    },
    {
      header: 'Date de création',
      accessorKey: 'created_at',
      cell: ({ row }: { row: { original: ProjectData } }) => (
        <div className="text-sm">
          {row.original.created_at 
            ? new Date(row.original.created_at).toLocaleDateString() 
            : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: ProjectData } }) => (
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={() => navigate(`/projects/${row.original.id}`)}
            title="Voir le projet"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="outline" 
            className="text-red-500"
            onClick={() => setConfirmDelete(row.original.id)}
            title="Supprimer le projet"
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
          <CardTitle>Projets ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={projects}
          />
        </CardContent>
      </Card>
      
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à ce projet seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmDelete && handleDeleteProject(confirmDelete)}
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

export default ProjectList;
