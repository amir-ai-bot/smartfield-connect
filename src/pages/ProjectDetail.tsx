
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, CalendarClock, Users, FilePenLine, Leaf } from 'lucide-react';
import { LoadingImage } from '@/components/ui/LoadingImage';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectData } from '@/types/auth';
import { getUserProjects, getPublicProjects } from '@/services/projectService';
import { toast } from 'sonner';
import { createSupplierConversation, searchSuppliers } from '@/services/supplierService';
import { Supplier } from '@/types/supabase';
import AuthDialog from '@/components/auth/AuthDialog';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedSuppliers, setRelatedSuppliers] = useState<Supplier[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from user projects first
        if (isAuthenticated && user) {
          const userProjects = await getUserProjects(user.id);
          const foundProject = userProjects.find(p => p.id === id);
          if (foundProject) {
            setProject(foundProject);
            setLoading(false);
            await fetchRelatedSuppliers(foundProject.crop);
            return;
          }
        }
        
        // If not found or not authenticated, try public projects
        const publicProjects = await getPublicProjects();
        const foundPublicProject = publicProjects.find(p => p.id === id);
        
        if (foundPublicProject) {
          setProject(foundPublicProject);
          await fetchRelatedSuppliers(foundPublicProject.crop);
        } else {
          toast.error("Projet non trouvé");
          navigate('/projects');
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Erreur lors du chargement du projet");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id, user, isAuthenticated, navigate]);

  const fetchRelatedSuppliers = async (cropType: string) => {
    try {
      const suppliers = await searchSuppliers(cropType);
      setRelatedSuppliers(suppliers.slice(0, 3)); // Show top 3 related suppliers
    } catch (error) {
      console.error("Error fetching related suppliers:", error);
    }
  };

  const handleContactSupplier = async (supplierId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      const conversationId = await createSupplierConversation(user!.id, supplierId);
      navigate(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Error contacting supplier:", error);
      toast.error("Erreur lors de la création de la conversation");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Projet non trouvé</h2>
        <p className="text-gray-600 mb-8">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate('/projects')}>Retour aux projets</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                ← Retour
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
            </div>
            <Badge className={`
              ${project.status === 'active' ? 'bg-green-100 text-green-800' : ''}
              ${project.status === 'planning' ? 'bg-blue-100 text-blue-800' : ''}
              ${project.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
              px-3 py-1 text-sm font-medium
            `}>
              {project.status === 'active' ? 'Actif' : 
               project.status === 'planning' ? 'Planification' : 'Terminé'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Début: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <CalendarClock className="h-4 w-4 mr-1" />
              <span>Fin: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Leaf className="h-4 w-4 mr-1" />
              <span>Culture: {project.crop}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Visibilité: {project.isPublic ? 'Publique' : 'Privée'}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 mb-4">
            {project.image ? (
              <LoadingImage
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <FilePenLine className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {project.description || "Aucune description fournie pour ce projet."}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avancement</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-agri-green-500 h-2.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type de culture</dt>
                    <dd className="mt-1">{project.crop}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                    <dd className="mt-1">{project.location || "Non spécifiée"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                    <dd className="mt-1">{new Date(project.startDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de fin prévue</dt>
                    <dd className="mt-1">{new Date(project.endDate).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommandations pour cette culture</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Vérifiez régulièrement l'humidité du sol</li>
                  <li>Surveillez l'apparition de parasites, particulièrement en période chaude</li>
                  <li>Planifiez des rotations de culture pour la saison prochaine</li>
                  <li>Consultez les prévisions météo avant d'entreprendre des travaux importants</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fournisseurs recommandés</CardTitle>
              </CardHeader>
              <CardContent>
                {relatedSuppliers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedSuppliers.map(supplier => (
                      <Card key={supplier.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {supplier.avatar ? (
                                <img 
                                  src={supplier.avatar} 
                                  alt={supplier.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 font-medium">{supplier.name?.[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{supplier.name}</p>
                              <p className="text-sm text-gray-500">{supplier.category}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleContactSupplier(supplier.id)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun fournisseur trouvé pour cette culture.</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Documents utiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Guide de culture - {project.crop}</span>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Calendrier de plantation</span>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Conseils techniques</span>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        initialView="login" 
      />
    </div>
  );
};

export default ProjectDetail;
