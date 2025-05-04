import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/dashboard';
import { createProject } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProjectForm from '@/components/Projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateProject: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    document.title = 'Créer un projet | AgriSmart';
  }, []);

  const handleSubmit = async (formData: Partial<ProjectData>) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un projet');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting project with data:', formData);

      // Validate required fields
      if (!formData.title && !formData.name) {
        toast.error('Le titre du projet est requis');
        return;
      }

      if (!formData.crop) {
        toast.error('Le type de culture est requis');
        return;
      }

      if (!formData.location) {
        toast.error('La localisation est requise');
        return;
      }

      // Ensure dates are properly formatted
      if (formData.startDate && typeof formData.startDate === 'string') {
        try {
          // Make sure it's a valid date
          new Date(formData.startDate).toISOString();
        } catch (e) {
          formData.startDate = new Date().toISOString().split('T')[0];
        }
      } else {
        formData.startDate = new Date().toISOString().split('T')[0];
      }

      if (formData.endDate && typeof formData.endDate === 'string') {
        try {
          // Make sure it's a valid date
          new Date(formData.endDate).toISOString();
        } catch (e) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          formData.endDate = endDate.toISOString().split('T')[0];
        }
      } else {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        formData.endDate = endDate.toISOString().split('T')[0];
      }

      // Set default values for required fields
      formData.status = formData.status || 'planning';
      formData.progress = formData.progress || 0;
      formData.is_public = formData.is_public || false;

      // Add a default image if none is provided
      if (!formData.image) {
        formData.image = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8';
      }

      console.log('Processed form data:', formData);

      // Try to create the project
      const createdProject = await createProject(user.id, formData);

      if (createdProject) {
        console.log('Project created successfully:', createdProject);
        toast.success('Projet créé avec succès');
        navigate(`/projects/${createdProject.id}`);
      } else {
        console.error('Failed to create project, no error thrown but no project returned');
        toast.error('Erreur lors de la création du projet');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleCancel} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Créer un nouveau projet</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détails du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateProject;
