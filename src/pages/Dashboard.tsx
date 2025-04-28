import React from 'react';
import Footer from '@/components/Footer';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';

// Import refactored components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectSelector from '@/components/dashboard/ProjectSelector';
import ProjectOverviewCard from '@/components/dashboard/ProjectOverviewCard';
import WeatherCard from '@/components/dashboard/WeatherCard';
import TasksCard from '@/components/dashboard/TasksCard';
import MoistureChart from '@/components/dashboard/MoistureChart';
import YieldChart from '@/components/dashboard/YieldChart';

const DashboardContent = () => {
  const { data, isLoading, activeProject, setActiveProject, refreshData } = useDashboard();
  const currentProject = data.projects[activeProject];
  
  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      {/* Dashboard Header */}
      <DashboardHeader 
        isLoading={isLoading} 
        lastUpdated={data.lastUpdated} 
        refreshData={refreshData} 
      />
      
      {/* Projects selection */}
      <ProjectSelector 
        projects={isLoading ? null : data.projects} 
        activeProject={activeProject} 
        setActiveProject={setActiveProject} 
        isLoading={isLoading} 
      />
      
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Project overview card */}
        <ProjectOverviewCard 
          project={isLoading ? null : currentProject} 
          isLoading={isLoading} 
        />
        
        {/* Weather card */}
        <WeatherCard 
          weatherData={isLoading ? null : data.weatherData} 
          isLoading={isLoading} 
        />
        
        {/* Tasks card */}
        <TasksCard 
          tasks={isLoading ? null : data.tasks} 
          isLoading={isLoading} 
        />
        
        {/* Moisture chart */}
        <MoistureChart 
          moistureData={isLoading ? null : data.moistureData} 
          isLoading={isLoading} 
        />
        
        {/* Yearly yield chart */}
        <YieldChart 
          yieldData={isLoading ? null : data.yieldData} 
          isLoading={isLoading} 
        />
      </div>
    </main>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardProvider>
        <DashboardContent />
        <Footer />
      </DashboardProvider>
    </div>
  );
};

export default Dashboard;
