import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, User } from 'lucide-react';
import AuthDialog from '@/components/auth/AuthDialog';
import { Link } from 'react-router-dom';

const mockMessages = [
  {
    id: '1',
    sender: {
      name: 'Ahmed Karim',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    message: 'Bonjour, je suis intéressé par vos services',
    time: '11:30',
    date: 'Aujourd\'hui',
    unread: true
  },
  {
    id: '2',
    sender: {
      name: 'Leila Mansour',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    message: 'Avez-vous des semences pour tomates cherry?',
    time: '09:15',
    date: 'Aujourd\'hui',
    unread: false
  },
  {
    id: '3',
    sender: {
      name: 'Mohamed Benali',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    message: 'Merci pour votre réponse rapide',
    time: '16:45',
    date: 'Hier',
    unread: false
  }
];

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  useEffect(() => {
    document.title = 'Messages | AgriSmart';
  }, []);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connectez-vous pour accéder à vos messages</h2>
              <p className="text-gray-600 mb-6">
                Connectez-vous à votre compte pour voir vos conversations avec les fournisseurs et d'autres agriculteurs.
              </p>
              <Button onClick={() => setShowAuthDialog(true)}>
                Se connecter / S'inscrire
              </Button>
              <AuthDialog 
                open={showAuthDialog}
                onOpenChange={setShowAuthDialog}
                initialView="login"
              />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Vos messages</h1>
            <Button>Nouveau message</Button>
          </div>
          
          {mockMessages.length > 0 ? (
            <div className="space-y-3">
              {mockMessages.map((msg) => (
                <Link to={`/messages/${msg.id}`} key={msg.id}>
                  <Card className={`hover:bg-gray-50 transition-colors ${msg.unread ? 'border-l-4 border-agri-green-500' : ''}`}>
                    <CardContent className="p-4 flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{msg.sender.name}</h3>
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                        <span className="text-xs text-gray-400">{msg.date}</span>
                      </div>
                      
                      {msg.unread && (
                        <div className="ml-3 h-2 w-2 bg-agri-green-500 rounded-full"></div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">Pas de messages</h2>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore de messages. Commencez à discuter avec des fournisseurs pour faire grandir votre réseau.
              </p>
              <Button>Trouver un fournisseur</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
