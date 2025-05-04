import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplet } from 'lucide-react';

type MoistureChartProps = {
  moistureData: Array<{
    day: string;
    value: number;
  }> | null;
  isLoading: boolean;
};

const MoistureChart = ({ moistureData, isLoading }: MoistureChartProps) => {
  return (
    <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-agri-blue-500" />
          Humidité du sol
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={moistureData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#38BDF8" fill="#BAE6FD" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MoistureChart;
