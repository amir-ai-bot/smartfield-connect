import { useEffect } from 'react';

const TestEnv = () => {
  useEffect(() => {
    console.log('Environment Variables:');
    console.log('VITE_OPENWEATHER_API_KEY:', import.meta.env.VITE_OPENWEATHER_API_KEY);
  }, []);

  return null;
};

export default TestEnv; 