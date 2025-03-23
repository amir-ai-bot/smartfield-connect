
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/contexts/DashboardContext';

type TasksCardProps = {
  tasks: Task[] | null;
  isLoading: boolean;
};

const TasksCard = ({ tasks, isLoading }: TasksCardProps) => {
  return (
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
              {tasks?.map((item, i) => (
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
  );
};

export default TasksCard;
