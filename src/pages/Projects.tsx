
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, SlidersHorizontal, ImageOff } from 'lucide-react';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/auth';

const Projects = () => {
  const { isAuthenticated, user } = useAuth();
  const { t, language, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        let query;
        
        if (isAuthenticated && user) {
          // Fetch both user's projects and public projects
          const { data: userProjects, error: userError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id);
          
          const { data: publicProjects, error: publicError } = await supabase
            .from('public_projects_view')
            .select('*');
            
          if (userError) throw userError;
          if (publicError) throw publicError;
          
          // Combine and deduplicate projects (user might see their own public projects twice)
          const combinedProjects = [...(userProjects || [])];
          
          // Add public projects that aren't already in user projects
          publicProjects?.forEach(publicProject => {
            if (!combinedProjects.some(p => p.id === publicProject.id)) {
              combinedProjects.push(publicProject);
            }
          });
          
          setProjects(combinedProjects.map(transformProjectData));
        } else {
          // Fetch only public projects for non-authenticated users
          const { data: publicProjects, error } = await supabase
            .from('public_projects_view')
            .select('*');
            
          if (error) throw error;
          setProjects((publicProjects || []).map(transformProjectData));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error(t('errorFetchingProjects') || 'Error fetching projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [isAuthenticated, user]);
  
  const transformProjectData = (project: any): ProjectData => {
    // Verify image URL and set fallback if invalid
    let imageUrl = project.image;
    
    return {
      id: project.id,
      title: project.title,
      crop: project.crop,
      location: project.location,
      startDate: project.start_date,
      endDate: project.end_date,
      progress: project.progress || 0,
      status: project.status as 'planning' | 'active' | 'completed',
      image: imageUrl,
      description: project.description,
      user_id: project.user_id,
      isPublic: project.is_public,
      user_name: project.user_name,
      user_avatar: project.user_avatar
    };
  };
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      (project.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (project.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (project.crop?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
                         
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCrop = cropFilter === 'all' || project.crop === cropFilter;
    
    return matchesSearch && matchesStatus && matchesCrop;
  });
  
  const uniqueCrops = Array.from(new Set(projects.map(project => project.crop))).filter(Boolean);
  
  const handleAddProject = () => {
    if (isAuthenticated) {
      setCreateDialogOpen(true);
    } else {
      setAuthDialogOpen(true);
    }
  };

  const handleProjectCreated = (newProject: ProjectData) => {
    setProjects(prev => [newProject, ...prev]);
    toast.success(t('projectCreated') || 'Project created successfully');
  };
  
  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{t('projects')}</h1>
            <p className="text-gray-600">{t('projectsDescription') || 'Manage and track all your projects in one place'}</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 bg-agri-green-500 hover:bg-agri-green-600 text-white flex items-center"
            onClick={handleAddProject}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addProject')}
          </Button>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card mb-8 p-4 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder={t('searchProjects')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="border-gray-200">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder={t('status')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="planning">{t('planning')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger id="crop" className="border-gray-200">
                    <div className="flex items-center">
                      <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder={t('crop')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    {uniqueCrops.map(crop => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow h-64"></div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-8 text-center animate-slide-up">
            <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{t('noProjectsFound')}</h3>
            <p className="text-gray-600 mb-4">{t('noProjectsMessage') || 'No projects match your search criteria.'}</p>
            <Button onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCropFilter('all');
            }}>
              {t('resetFilters')}
            </Button>
          </div>
        )}
      </main>
      
      <CreateProjectDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        initialView="login"
      />
      
      <Footer />
    </div>
  );
};

export default Projects;
