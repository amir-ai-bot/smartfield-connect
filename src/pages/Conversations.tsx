
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationList from '@/components/conversation/ConversationList';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Conversations = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Conversations</h1>
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="w-full sm:w-auto mb-6">
            <TabsTrigger value="all" className="flex-1">Toutes les conversations</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">Non lues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ConversationList currentUser={user} />
          </TabsContent>
          
          <TabsContent value="unread">
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500">Fonctionnalité en cours de développement.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Conversations;
