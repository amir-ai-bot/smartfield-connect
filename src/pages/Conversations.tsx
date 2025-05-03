
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getConversations } from '@/services/conversationService';
import { Link, useNavigate } from 'react-router-dom';
import ConversationList from '@/components/conversation/ConversationList';
import { MessageSquare, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { User as AuthUser } from '@/types/auth';

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    document.title = 'Conversations | AgriSmart';
  }, []);

  if (!user) {
    return null;
  }

  // Create a compatible user object
  const authUser: AuthUser = {
    ...user,
    email_verified: user.email_verified !== undefined ? user.email_verified : false
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-16">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mes conversations</h1>
          <Button 
            onClick={() => navigate('/suppliers')}
            className="bg-agri-green-500 hover:bg-agri-green-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Fournisseurs
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Toutes les conversations</TabsTrigger>
            <TabsTrigger value="unread">Non lues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  Vos échanges avec les fournisseurs et autres utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationList currentUser={authUser} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unread" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages non lus</CardTitle>
                <CardDescription>
                  Conversations avec des messages non lus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationList currentUser={authUser} filterUnread={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Guide d'utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-agri-green-500" />
                    Comment démarrer une conversation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Accédez à la page des fournisseurs, choisissez un fournisseur 
                    qui correspond à vos besoins et cliquez sur "Contacter". 
                    Vous pouvez ensuite échanger directement avec eux.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-agri-green-500" />
                    Messages multimédia
                  </h3>
                  <p className="text-sm text-gray-600">
                    La messagerie vous permet d'envoyer des photos, documents et 
                    messages vocaux pour faciliter vos échanges avec les fournisseurs.
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 border-t pt-4">
                <p>
                  Besoin d'aide supplémentaire ? Contactez notre support à{' '}
                  <a 
                    href="mailto:yassindhibi100@gmail.com" 
                    className="text-agri-green-600 hover:underline"
                  >
                    yassindhibi100@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conversations;
