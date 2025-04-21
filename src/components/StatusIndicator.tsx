import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { cn } from '@/lib/utils';

export function StatusIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsConnected(false);
          return;
        }

        const { error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 w-3 h-3 rounded-full transition-colors duration-300",
        {
          "bg-green-500": isConnected === true,
          "bg-red-500": isConnected === false,
          "bg-gray-300": isConnected === null
        }
      )}
      title={isConnected ? "Connected to Supabase" : "Not connected to Supabase"}
    />
  );
} 