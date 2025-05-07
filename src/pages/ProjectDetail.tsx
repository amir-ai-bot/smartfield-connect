
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectData } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, MapPin, User, MessageSquare, Bookmark, Share2 } from 'lucide-react';
import { createSupplierConversation } from '@/services/supplierService';
import { getSuppliers } from '@/services/supplierService';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Supplier } from '@/services/supplierService';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<ProjectData[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchSuppliers();
    }
  }, [id]);
  
  const fetchProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects_with_users')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const projectData: ProjectData = {
          id: data.id,
          title: data.title,
          crop: data.crop || '',
          location: data.location || '',
          startDate: data.start_date || '',
          endDate: data.end_date || '',
          progress: data.progress || 0,
          status: data.status as 'planning' | 'active' | 'completed',
          image: data.image || '',
          description: data.description || '',
          user_id: data.user_id,
          isPublic: data.is_public,
          user_name: data.creator_name,
          user_avatar: data.creator_avatar
        };
        
        setProject(projectData);
        document.title = `${projectData.title} | AgriSmart`;
        
        // Fetch related projects with the same crop
        fetchRelatedProjects(data.crop, projectId);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error("Erreur lors du chargement du projet");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSuppliers = async () => {
    try {
      const suppliersList = await getSuppliers();
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };
  
  const fetchRelatedProjects = async (crop: string | null, currentProjectId: string) => {
    if (!crop) return;
    
    try {
      const { data, error } = await supabase
        .from('projects_with_users')
        .select('*')
        .eq('crop', crop)
        .eq('is_public', true)
        .neq('id', currentProjectId)
        .limit(3);
        
      if (error) throw error;
      
      const mappedProjects: ProjectData[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        crop: item.crop || '',
        location: item.location || '',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        progress: item.progress || 0,
        status: item.status as 'planning' | 'active' | 'completed',
        image: item.image || '',
        description: item.description || '',
        user_id: item.user_id,
        isPublic: item.is_public,
        user_name: item.creator_name,
        user_avatar: item.creator_avatar
      }));
      
      setRelatedProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching related projects:', error);
    }
  };
  
  const handleContactSupplier = async (supplierId: string) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour contacter un fournisseur");
      return;
    }
    
    try {
      const conversationId = await createSupplierConversation(user.id, supplierId);
      navigate(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Erreur lors de la création de la conversation");
    }
  };
  
  const handleSaveProject = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Projet retiré des favoris" : "Projet ajouté aux favoris");
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-60 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Projet non trouvé</h1>
          <p className="mb-6">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/projects')}>
            Retour aux projets
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-gray-600">
                {project.crop}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${
                  project.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {project.status === 'active' ? 'Actif' : 
                 project.status === 'completed' ? 'Complété' : 'Planification'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              className={isSaved ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-amber-500" : ""}`} />
              {isSaved ? "Enregistré" : "Enregistrer"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
        
        {/* Project Image */}
        {project.image && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-md h-64 md:h-80">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Project Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{project.description || "Aucune description disponible"}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Période</p>
                      <p className="font-medium">{project.startDate} - {project.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Localisation</p>
                      <p className="font-medium">{project.location || "Non spécifié"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Progression</h3>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fournisseurs recommandés</CardTitle>
                <CardDescription>
                  Contactez ces fournisseurs pour ce type de projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suppliers.length > 0 ? (
                  <div className="space-y-4">
                    {suppliers.slice(0, 3).map(supplier => (
                      <div key={supplier.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          {supplier.avatar ? (
                            <img 
                              src={supplier.avatar} 
                              alt={supplier.name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.category}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleContactSupplier(supplier.id)}
                          className="bg-agri-green-500 hover:bg-agri-green-600"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> 
                          Contacter
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    Aucun fournisseur disponible pour le moment
                  </p>
                )}
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/suppliers')}
                    className="mt-2"
                  >
                    Voir tous les fournisseurs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Creator and Related Projects */}
          <div className="space-y-6">
            {/* Creator Card */}
            <Card>
              <CardHeader>
                <CardTitle>Créateur du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  {project.user_avatar ? (
                    <img 
                      src={project.user_avatar} 
                      alt={project.user_name || "Utilisateur"} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{project.user_name || "Utilisateur"}</p>
                    <p className="text-sm text-gray-600">Agriculteur</p>
                  </div>
                </div>
                
                {user && user.id !== project.user_id && (
                  <Button 
                    className="w-full bg-agri-green-500 hover:bg-agri-green-600"
                    onClick={() => {
                      // Implement contact creator functionality
                      toast.info("Fonctionnalité à venir");
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter le créateur
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Projets similaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedProjects.map(relatedProject => (
                      <div 
                        key={relatedProject.id} 
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/projects/${relatedProject.id}`)}
                      >
                        {relatedProject.image ? (
                          <img 
                            src={relatedProject.image} 
                            alt={relatedProject.title} 
                            className="w-full h-28 object-cover"
                          />
                        ) : (
                          <div className="w-full h-28 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Pas d'image</span>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-medium text-sm mb-1 truncate">{relatedProject.title}</h3>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {relatedProject.crop}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {relatedProject.progress}% complété
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Resources Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ressources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier des tâches
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Voir l'historique
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir la carte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Project Analytics and Info Tabs */}
        <Tabs defaultValue="analytics" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analyses du projet</CardTitle>
                <CardDescription>
                  Recommandations et analyses pour votre projet {project.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Rendements attendus</h3>
                      <p className="text-gray-600 mb-2">
                        Pour la culture de {project.crop} dans une région comme {project.location}, 
                        voici les rendements attendus :
                      </p>
                      <ul className="list-disc pl-5 text-gray-600">
                        <li>Rendement minimal: 14 tonnes/hectare</li>
                        <li>Rendement moyen: 18 tonnes/hectare</li>
                        <li>Rendement optimal: 22 tonnes/hectare</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Irrigation recommandée</h3>
                      <p className="text-gray-600">
                        Basé sur votre région et le type de culture:
                      </p>
                      <ul className="list-disc pl-5 text-gray-600">
                        <li>Fréquence: 2-3 fois par semaine</li>
                        <li>Volume: 20-25mm d'eau par irrigation</li>
                        <li>Méthode recommandée: Goutte à goutte</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Risques identifiés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <h4 className="text-red-600 font-medium">Risque climatique</h4>
                        <p className="text-sm text-gray-600">
                          Période de sécheresse prévue pendant les 2 prochaines semaines
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="text-amber-600 font-medium">Risque de maladies</h4>
                        <p className="text-sm text-gray-600">
                          Mildiou signalé dans la région en cette saison
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="text-green-600 font-medium">Risque financier</h4>
                        <p className="text-sm text-gray-600">
                          Faible - Les prix du marché sont stables
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guides">
            <Card>
              <CardHeader>
                <CardTitle>Guides et ressources</CardTitle>
                <CardDescription>
                  Guides pratiques et ressources pour réussir votre projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Guides de culture</h3>
                      <ul className="space-y-3">
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Guide complet de culture de {project.crop}
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Calendrier des travaux agricoles
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Techniques de fertilisation optimale
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Vidéos pratiques</h3>
                      <ul className="space-y-3">
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Comment préparer votre sol pour {project.crop}
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Techniques de récolte pour un rendement optimal
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center text-agri-green-600 hover:underline">
                            <div className="bg-agri-green-100 p-2 rounded mr-3">
                              <Calendar className="h-5 w-5 text-agri-green-600" />
                            </div>
                            Gestion des maladies courantes
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Documents techniques</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Guide technique.pdf</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Mis à jour le 12/03/2023</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Fiche pratique.pdf</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Mis à jour le 05/02/2023</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Normes de qualité.pdf</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Mis à jour le 18/01/2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes du projet</CardTitle>
                <CardDescription>
                  Ajoutez vos observations et suivez l'évolution du projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Démarrage du projet</h3>
                      <span className="text-xs text-gray-500">12/04/2023</span>
                    </div>
                    <p className="text-gray-600">
                      Première visite du terrain effectuée. Le sol semble adapté pour la culture de {project.crop}. 
                      À prévoir: analyse de sol complète.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Préparation du terrain</h3>
                      <span className="text-xs text-gray-500">18/04/2023</span>
                    </div>
                    <p className="text-gray-600">
                      Labourage effectué aujourd'hui. Le terrain nécessite plus de drainage que prévu.
                      Contact à prendre avec un spécialiste.
                    </p>
                  </div>
                  
                  <Button
                    className="w-full bg-agri-green-500 hover:bg-agri-green-600"
                    onClick={() => {
                      // Add note functionality
                      toast.info("Fonctionnalité d'ajout de notes à venir");
                    }}
                  >
                    Ajouter une note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
