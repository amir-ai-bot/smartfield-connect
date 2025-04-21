import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (error) {
          setError(error.message);
          setConnectionStatus('Connection failed');
        } else {
          setConnectionStatus('Connection successful!');
          console.log('Sample data:', data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('Connection failed');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Supabase Connection Test</h2>
      <p className="mb-2">Status: {connectionStatus}</p>
      {error && (
        <div className="text-red-500">
          Error: {error}
        </div>
      )}
    </div>
  );
} 