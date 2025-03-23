
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Droplet, 
  LineChart, 
  Plus, 
  RefreshCcw, 
  Sprout, 
  Sun, 
  Thermometer, 
  Wind, 
  CloudRain
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const moistureData = [
  { day: 'Lun', value: 40 },
  { day: 'Mar', value: 35 },
  { day: 'Mer', value: 45 },
  { day: 'Jeu', value: 30 },
  { day: 'Ven', value: 50 },
  { day: 'Sam', value: 45 },
  { day: 'Dim', value: 42 },
];

const yieldData = [
  { year: '2018', value: 30 },
  { year: '2019', value: 40 },
  { year: '2020', value: 35 },
  { year: '2021', value: 50 },
  { year: '2022', value: 65 },
  { year: '2023', value: 75 },
];

const Dashboard = () => {
  const [activeProject, setActiveProject] = useState(0);
  
  const projects = [
    {
      id: 1,
      name: 'Oliveraie Secteur Nord',
      progress: 65,
      status: 'En croissance',
      irrigation: 'Programmée',
      nextTask: 'Fertilisation',
      taskDate: '18 Juin',
    },
    {
      id: 2,
      name: 'Palmeraie El Oasis',
      progress: 80,
      status: 'Fructification',
      irrigation: 'Manuelle',
      nextTask: 'Récolte',
      taskDate: '30 Juin',
    },
    {
      id: 3,
      name: 'Culture de Pistaches',
      progress: 30,
      status: 'Plantation',
      irrigation: 'Automatisée',
      nextTask: 'Inspection',
      taskDate: '22 Juin',
    },
  ];
  
  const currentProject = projects[activeProject];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue de retour, voici un aperçu de vos projets agricoles</p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button 
              size="sm" 
              className="bg-agri-green-500 hover:bg-agri-green-600 text-white flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          </div>
        </div>
        
        {/* Projects selection */}
        <div className="mb-8 flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          <div className="flex space-x-3">
            {projects.map((project, index) => (
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
                  {project.name}
                </h3>
                <div className="flex items-center mt-1">
                  <div className="relative h-1.5 w-24 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-agri-green-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{project.progress}%</span>
                </div>
              </button>
            ))}
            
            <button className="px-4 py-3 rounded-lg flex items-center justify-center bg-white border border-dashed border-gray-300 hover:bg-gray-50 flex-shrink-0 text-gray-600 transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          </div>
        </div>
        
        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project overview card */}
          <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-agri-green-500" />
                Aperçu du projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold">{currentProject.name}</h4>
                    <span className="text-xs bg-agri-green-100 text-agri-green-700 px-2 py-0.5 rounded-full">
                      {currentProject.status}
                    </span>
                  </div>
                  
                  <Progress value={currentProject.progress} className="h-2" />
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Progression</span>
                    <span className="text-xs font-medium">{currentProject.progress}%</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Irrigation</p>
                      <div className="flex items-center">
                        <Droplet className="h-4 w-4 mr-1.5 text-agri-blue-500" />
                        <span className="text-sm font-medium">{currentProject.irrigation}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Prochaine tâche</p>
                      <p className="text-sm font-medium">{currentProject.nextTask}</p>
                      <p className="text-xs text-agri-green-600">{currentProject.taskDate}</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Voir tous les détails
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Weather card */}
          <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                Météo aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-semibold">32°C</h3>
                  <p className="text-gray-600">Gafsa, Tunisie</p>
                </div>
                
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Sun className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Thermometer className="h-5 w-5 mx-auto mb-1 text-agri-terra-500" />
                  <p className="text-xs text-gray-500">Ressenti</p>
                  <p className="text-sm font-medium">34°C</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Wind className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                  <p className="text-xs text-gray-500">Vent</p>
                  <p className="text-sm font-medium">12 km/h</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <CloudRain className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                  <p className="text-xs text-gray-500">Humidité</p>
                  <p className="text-sm font-medium">25%</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">Prévisions pour la semaine</p>
                <div className="flex justify-between">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, i) => (
                    <div key={day} className="text-center">
                      <p className="text-xs mb-1">{day}</p>
                      <Sun className={`h-5 w-5 mx-auto ${i === 2 ? 'text-gray-400' : 'text-yellow-500'}`} />
                      <p className="text-xs font-medium mt-1">{30 + i}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tasks card */}
          <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Tâches à venir</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  {
                    task: 'Fertilisation des oliviers',
                    project: 'Oliveraie Secteur Nord',
                    date: '18 Juin, 2023',
                    priority: 'high'
                  },
                  {
                    task: 'Inspection des palmiers',
                    project: 'Palmeraie El Oasis',
                    date: '20 Juin, 2023',
                    priority: 'medium'
                  },
                  {
                    task: 'Récolte des dattes',
                    project: 'Palmeraie El Oasis',
                    date: '30 Juin, 2023',
                    priority: 'medium'
                  },
                  {
                    task: 'Contrôle des parasites',
                    project: 'Culture de Pistaches',
                    date: '22 Juin, 2023',
                    priority: 'low'
                  }
                ].map((item, i) => (
                  <li 
                    key={i} 
                    className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className={`h-5 w-5 rounded-full mr-3 mt-0.5 flex-shrink-0 ${
                        item.priority === 'high' 
                          ? 'bg-red-100 border border-red-400' 
                          : item.priority === 'medium'
                            ? 'bg-yellow-100 border border-yellow-400'
                            : 'bg-green-100 border border-green-400'
                      }`}
                    />
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{item.task}</h4>
                      <p className="text-xs text-gray-500">{item.project}</p>
                      <p className="text-xs text-agri-blue-600 mt-1">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                Toutes les tâches
              </Button>
            </CardContent>
          </Card>
          
          {/* Moisture chart */}
          <Card className="shadow-none border md:col-span-2 lg:col-span-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-agri-blue-500" />
                Humidité du sol (7 derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={moistureData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0ea5e9" 
                      fill="url(#colorValue)" 
                      strokeWidth={2} 
                    />
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Yearly yield chart */}
          <Card className="shadow-none border md:col-span-2 lg:col-span-1 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-agri-green-500" />
                Rendement annuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={yieldData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4CAF50" 
                      fill="url(#colorYield)" 
                      strokeWidth={2} 
                    />
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
