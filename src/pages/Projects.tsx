
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/dashboard';
import Navbar from '@/components/Navbar';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Define the mapper function to transform database fields to our ProjectData interface
const mapDbProjectToProjectData = (dbProject: any): ProjectData => {
  return {
    id: dbProject.id,
    title: dbProject.title,
    crop: dbProject.crop || '',
    location: dbProject.location || '',
    start_date: dbProject.start_date,
    end_date: dbProject.end_date,
    // For backward compatibility
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    progress: dbProject.progress || 0,
    status: dbProject.status || 'planning',
    image: dbProject.image,
    description: dbProject.description,
    user_id: dbProject.user_id,
    is_public: dbProject.is_public,
    created_at: dbProject.created_at,
    updated_at: dbProject.updated_at,
    last_modified: dbProject.last_modified,
    user_name: dbProject.user_name,
    user_avatar: dbProject.user_avatar
  };
};

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [publicProjects, setPublicProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    
    try {
      // Fetch user's projects
      let userProjectsData: ProjectData[] = [];
      if (user) {
        const { data: userProjectsResult, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        userProjectsData = (userProjectsResult || []).map(mapDbProjectToProjectData);
        setProjects(userProjectsData);
      }
      
      // Fetch public projects using the projects view
      const { data: publicProjectsData, error: publicError } = await supabase
        .from('public_projects_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (publicError) throw publicError;
      
      // Map the projects with our helper function
      const mappedPublicProjects = (publicProjectsData || []).map(mapDbProjectToProjectData);
      setPublicProjects(mappedPublicProjects);
      
      // Extract unique crops for filter
      const allProjects = [...userProjectsData, ...mappedPublicProjects];
      const crops = [...new Set(allProjects.map(p => p.crop))].filter(Boolean);
      setAvailableCrops(crops);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredProjects = () => {
    const allProjects = [...projects, ...publicProjects.filter(p => !projects.some(up => up.id === p.id))];
    
    return allProjects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCrop = cropFilter === 'all' || project.crop === cropFilter;
      return matchesSearch && matchesStatus && matchesCrop;
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCropFilter('all');
  };

  const handleCreateProject = async (projectData: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          // Convert camelCase to snake_case for database
          start_date: projectData.startDate || projectData.start_date,
          end_date: projectData.endDate || projectData.end_date,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new project to the state
      const newProject = mapDbProjectToProjectData(data);
      setProjects(prev => [newProject, ...prev]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const filteredProjects = getFilteredProjects();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">{t('projects')}</h1>
          
          {user && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-agri-green-500 hover:bg-agri-green-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('addProject')}
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder={t('searchProjects')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{t('status')}:</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'active', 'planning', 'completed'].map(status => (
                    <Badge 
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className={`cursor-pointer ${statusFilter === status ? 'bg-agri-green-500 hover:bg-agri-green-600' : ''}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {t(status)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {availableCrops.length > 0 && (
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{t('crop')}:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={cropFilter === 'all' ? "default" : "outline"}
                      className={`cursor-pointer ${cropFilter === 'all' ? 'bg-agri-green-500 hover:bg-agri-green-600' : ''}`}
                      onClick={() => setCropFilter('all')}
                    >
                      {t('all')}
                    </Badge>
                    
                    {availableCrops.map(crop => (
                      <Badge 
                        key={crop}
                        variant={cropFilter === crop ? "default" : "outline"}
                        className={`cursor-pointer ${cropFilter === crop ? 'bg-agri-green-500 hover:bg-agri-green-600' : ''}`}
                        onClick={() => setCropFilter(crop)}
                      >
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {(searchTerm || statusFilter !== 'all' || cropFilter !== 'all') && (
              <Button variant="ghost" onClick={resetFilters} className="h-8 px-2">
                <X className="w-4 h-4 mr-1" />
                {t('resetFilters')}
              </Button>
            )}
          </div>
        </div>
        
        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <Skeleton className="h-40 w-full rounded-md mb-4" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id}
                  title={project.title}
                  crop={project.crop || ''}
                  location={project.location || ''}
                  startDate={project.startDate || project.start_date || ''}
                  endDate={project.endDate || project.end_date || ''}
                  progress={project.progress}
                  status={project.status as 'active' | 'planning' | 'completed'}
                  image={project.image}
                  user_name={project.user_name}
                  user_avatar={project.user_avatar}
                  onClick={() => navigate(`/dashboard?projectId=${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('noProjectsFound')}</p>
              {user && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                  className="border-agri-green-500 text-agri-green-500 hover:bg-agri-green-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('createProject')}
                </Button>
              )}
            </div>
          )
        )}
      </main>
      
      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
