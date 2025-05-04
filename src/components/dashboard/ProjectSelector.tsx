
import React from 'react';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/dashboard';

type ProjectSelectorProps = {
  projects: Project[] | null;
  activeProject: number;
  setActiveProject: (index: number) => void;
  isLoading: boolean;
};

const ProjectSelector = ({ projects, activeProject, setActiveProject, isLoading }: ProjectSelectorProps) => {
  return (
    <div className="mb-8 flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
      <div className="flex space-x-3">
        {isLoading ? (
          // Loading skeletons for project buttons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="px-4 py-3 rounded-lg flex-shrink-0 border border-gray-200 bg-white">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center mt-1">
                <Skeleton className="h-1.5 w-24 mr-2" />
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
          ))
        ) : (
          projects?.map((project, index) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(index)}
              className={`px-4 py-3 rounded-lg flex-shrink-0 border transition-all ${
                activeProject === index 
                  ? 'border-agri-green-300 bg-agri-green-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <h3 className={`font-medium ${activeProject === index ? 'text-agri-green-700' : 'text-gray-700'}`}>
                {project.name || project.title}
              </h3>
              <div className="flex items-center mt-1">
                <div className="relative h-1.5 w-24 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-agri-green-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{project.progress}%</span>
              </div>
            </button>
          ))
        )}
        
        <button className="px-4 py-3 rounded-lg flex items-center justify-center bg-white border border-dashed border-gray-300 hover:bg-gray-50 flex-shrink-0 text-gray-600 transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>
    </div>
  );
};

export default ProjectSelector;
