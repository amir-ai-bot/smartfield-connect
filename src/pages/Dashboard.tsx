
import { useEffect } from 'react';
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
  CloudRain,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardContent = () => {
  const { data, isLoading, activeProject, setActiveProject, refreshData } = useDashboard();
  const currentProject = data.projects[activeProject];
  
  // Format relative time
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  };
  
  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-600">
            Bienvenue de retour, voici un aperçu de vos projets agricoles
            {!isLoading && (
              <span className="text-xs text-gray-500 ml-2">
                Mis à jour {getRelativeTimeString(data.lastUpdated)}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={() => refreshData()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
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
            data.projects.map((project, index) => (
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
                    <h4 className="font-semibold">{currentProject.name}</h4>
                    <span className="text-xs bg-agri-green-100 text-agri-green-700 px-2 py-0.5 rounded-full">
                      {currentProject.status}
                    </span>
                  </div>
                  
                  <Progress value={currentProject.progress} className="h-2 transition-all duration-500 ease-out" />
                  
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
            )}
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
            {isLoading ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Skeleton className="h-10 w-20 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg text-center">
                      <Skeleton className="h-5 w-5 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto mt-1" />
                      <Skeleton className="h-4 w-10 mx-auto mt-1" />
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <div className="flex justify-between">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-3 w-6 mb-1 mx-auto" />
                        <Skeleton className="h-5 w-5 mx-auto" />
                        <Skeleton className="h-3 w-8 mt-1 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-semibold">{data.weatherData.temperature}°C</h3>
                    <p className="text-gray-600">{data.weatherData.location}</p>
                  </div>
                  
                  <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Sun className="h-10 w-10 text-yellow-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Thermometer className="h-5 w-5 mx-auto mb-1 text-agri-terra-500" />
                    <p className="text-xs text-gray-500">Ressenti</p>
                    <p className="text-sm font-medium">{data.weatherData.feelsLike}°C</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Wind className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                    <p className="text-xs text-gray-500">Vent</p>
                    <p className="text-sm font-medium">{data.weatherData.windSpeed} km/h</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <CloudRain className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                    <p className="text-xs text-gray-500">Humidité</p>
                    <p className="text-sm font-medium">{data.weatherData.humidity}%</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">Prévisions pour la semaine</p>
                  <div className="flex justify-between">
                    {data.weatherData.forecast.map((day, i) => (
                      <div key={day.day} className="text-center">
                        <p className="text-xs mb-1">{day.day}</p>
                        <Sun className={`h-5 w-5 mx-auto ${day.condition === 'cloudy' ? 'text-gray-400' : 'text-yellow-500'}`} />
                        <p className="text-xs font-medium mt-1">{day.temperature}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tasks card */}
        <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Tâches à venir</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start p-3 rounded-lg border border-gray-100">
                    <Skeleton className="h-5 w-5 rounded-full mr-3 mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {data.tasks.map((item, i) => (
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
              </>
            )}
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
            {isLoading ? (
              <div className="h-[240px] flex items-center justify-center bg-gray-50 rounded-lg">
                <Loader2 className="h-8 w-8 text-agri-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.moistureData}
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
                      isAnimationActive={true}
                      animationDuration={1500}
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
            )}
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
            {isLoading ? (
              <div className="h-[240px] flex items-center justify-center bg-gray-50 rounded-lg">
                <Loader2 className="h-8 w-8 text-agri-green-500 animate-spin" />
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.yieldData}
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
                      isAnimationActive={true}
                      animationDuration={1500}
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
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardProvider>
        <Navbar />
        <DashboardContent />
        <Footer />
      </DashboardProvider>
    </div>
  );
};

export default Dashboard;
