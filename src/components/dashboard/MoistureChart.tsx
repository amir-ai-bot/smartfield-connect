
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplet, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type MoistureChartProps = {
  moistureData: { day: string; value: number }[] | null;
  isLoading: boolean;
};

const MoistureChart = ({ moistureData, isLoading }: MoistureChartProps) => {
  return (
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
                data={moistureData || []}
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
  );
};

export default MoistureChart;
