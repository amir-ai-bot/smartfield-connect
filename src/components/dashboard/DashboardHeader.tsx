
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';

type DashboardHeaderProps = {
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
};

const DashboardHeader = ({ isLoading, lastUpdated, refreshData }: DashboardHeaderProps) => {
  // Format relative time
  const getRelativeTimeString = (date: Date | null): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue de retour, voici un aperçu de vos projets agricoles
          {!isLoading && lastUpdated && (
            <span className="text-xs text-gray-500 ml-2">
              Mis à jour {getRelativeTimeString(lastUpdated)}
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
  );
};

export default DashboardHeader;
