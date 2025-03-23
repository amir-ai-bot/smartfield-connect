
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';

const projectsData = [
  {
    id: "1",
    title: "Oliveraie Secteur Nord",
    crop: "Oliviers",
    location: "Gafsa Nord",
    startDate: "Mars 2023",
    endDate: "Oct 2023",
    progress: 65,
    status: "active",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title: "Palmeraie El Oasis",
    crop: "Palmiers",
    location: "El Guettar",
    startDate: "Jan 2023",
    endDate: "Déc 2023",
    progress: 80,
    status: "active",
    image: "https://images.unsplash.com/photo-1599832413454-320a7a35ee8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    title: "Culture de Pistaches",
    crop: "Pistachiers",
    location: "Gafsa Sud",
    startDate: "Avr 2023",
    endDate: "Nov 2023",
    progress: 30,
    status: "planning",
    image: "https://images.unsplash.com/photo-1603507414391-06fe6162dc65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "4",
    title: "Verger d'Amandiers",
    crop: "Amandiers",
    location: "Metlaoui",
    startDate: "Fév 2022",
    endDate: "Sep 2022",
    progress: 100,
    status: "completed",
    image: "https://images.unsplash.com/photo-1595247302029-628aaab641d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "5",
    title: "Oasis de Grenadiers",
    crop: "Grenadiers",
    location: "Gafsa Est",
    startDate: "Mar 2023",
    endDate: "Oct 2023",
    progress: 50,
    status: "active",
    image: "https://images.unsplash.com/photo-1611480192402-1194caa53d03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "6",
    title: "Plantation de Figues",
    crop: "Figuiers",
    location: "Sidi Aïch",
    startDate: "Avr 2023",
    endDate: "Nov 2023",
    progress: 40,
    status: "active",
    image: "https://images.unsplash.com/photo-1632923057155-39af45e430c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  }
];

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  
  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.crop.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCrop = cropFilter === 'all' || project.crop === cropFilter;
    
    return matchesSearch && matchesStatus && matchesCrop;
  });
  
  const uniqueCrops = Array.from(new Set(projectsData.map(project => project.crop)));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Projets agricoles</h1>
            <p className="text-gray-600">Gérez et suivez tous vos projets en un seul endroit</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 bg-agri-green-500 hover:bg-agri-green-600 text-white flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card mb-8 p-4 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Rechercher des projets..." 
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
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="planning">Planification</SelectItem>
                    <SelectItem value="completed">Complétés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger id="crop" className="border-gray-200">
                    <div className="flex items-center">
                      <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Culture" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
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
        {filteredProjects.length > 0 ? (
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
            <h3 className="font-display text-lg font-semibold mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600 mb-4">Aucun projet ne correspond à vos critères de recherche.</p>
            <Button onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCropFilter('all');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
