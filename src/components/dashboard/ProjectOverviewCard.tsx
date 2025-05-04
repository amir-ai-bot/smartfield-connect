
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, Sprout } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/dashboard';

type ProjectOverviewCardProps = {
  project: Project | null;
  isLoading: boolean;
};

const ProjectOverviewCard = ({ project, isLoading }: ProjectOverviewCardProps) => {
  return (
    <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '100ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center">
          <Sprout className="h-5 w-5 mr-2 text-agri-green-500" />
          Aperçu du projet
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              
              <Skeleton className="h-2 w-full my-2" />
              
              <div className="flex justify-between mt-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12 mt-1" />
                </div>
              </div>
            </div>
            
            <Skeleton className="h-9 w-full mt-2" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">{project?.name || project?.title}</h4>
                <span className="text-xs bg-agri-green-100 text-agri-green-700 px-2 py-0.5 rounded-full">
                  {project?.status}
                </span>
              </div>
              
              <Progress value={project?.progress} className="h-2 transition-all duration-500 ease-out" />
              
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Progression</span>
                <span className="text-xs font-medium">{project?.progress}%</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Irrigation</p>
                  <div className="flex items-center">
                    <Droplet className="h-4 w-4 mr-1.5 text-agri-blue-500" />
                    <span className="text-sm font-medium">{project?.irrigation || 'Non définie'}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prochaine tâche</p>
                  <p className="text-sm font-medium">{project?.nextTask || 'Aucune tâche'}</p>
                  <p className="text-xs text-agri-green-600">{project?.taskDate || ''}</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-2">
              Voir tous les détails
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
