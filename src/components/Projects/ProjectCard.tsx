
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectData } from "@/types/auth";
import { Calendar, MapPin, Sprout, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectCardProps {
  project: ProjectData;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { language, t } = useLanguage();
  const { 
    title, 
    crop, 
    location, 
    startDate, 
    endDate, 
    progress, 
    status,
    image,
    user_name,
    user_avatar 
  } = project;
  
  // Crop default images - keep existing mapping
  const cropDefaultImages: Record<string, string> = {
    'Oliviers': 'https://cdn.pixabay.com/photo/2021/07/14/11/31/olive-tree-6465723_1280.jpg',
    'Palmiers': 'https://cdn.pixabay.com/photo/2019/03/11/23/51/palm-trees-4050731_1280.jpg',
    // ... keep existing crop images
  };
  
  // Fallback image
  const defaultFallbackImage = 'https://cdn.pixabay.com/photo/2019/09/28/04/02/agriculture-4509751_1280.jpg';
  
  const [imageError, setImageError] = React.useState(false);
  const [fallbackImage, setFallbackImage] = React.useState('');
  
  // Set fallback image on component mount
  React.useEffect(() => {
    // Get the appropriate image for the crop, or default if not found
    const defaultImage = crop && cropDefaultImages[crop] 
      ? cropDefaultImages[crop] 
      : defaultFallbackImage;
    
    setFallbackImage(defaultImage);
  }, [crop]);
  
  // Status badge color
  const statusColor = {
    active: "bg-green-500 hover:bg-green-600",
    planning: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-gray-500 hover:bg-gray-600"
  };
  
  // Status label translation
  const getStatusLabel = (projectStatus: string) => {
    const statusMapping: Record<string, Record<string, string>> = {
      en: {
        active: "Active",
        planning: "Planning",
        completed: "Completed"
      },
      fr: {
        active: "Actif",
        planning: "Planification",
        completed: "Complété"
      },
      ar: {
        active: "نشط",
        planning: "تخطيط",
        completed: "مكتمل"
      }
    };
    
    return (statusMapping[language] && statusMapping[language][projectStatus]) || projectStatus;
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="relative h-32 overflow-hidden">
        <img
          src={image || fallbackImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${statusColor[status]}`}>
          {getStatusLabel(status)}
        </Badge>
        {project.isPublic && (
          <Badge className="absolute top-2 left-2 bg-purple-500 hover:bg-purple-600">
            Public
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {project.description || 'Aucune description'}
        </p>
        
        <div className="space-y-1 text-xs text-gray-500">
          {project.location && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{project.location}</span>
            </div>
          )}
          {project.crop && (
            <div className="flex items-center">
              <Sprout className="h-3.5 w-3.5 mr-1" />
              <span>{project.crop}</span>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Début: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.user_name && (
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{project.user_name}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-agri-green-500 h-1.5 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="ml-2 text-xs font-medium text-gray-500">{project.progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
