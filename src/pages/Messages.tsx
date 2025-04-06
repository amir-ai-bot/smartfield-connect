import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Conversation, Message, getConversations, getMessages, sendMessage, markMessagesAsRead } from '@/services/messageService';
import LoadingSpinner from '@/components/LoadingSpinner';
import AuthDialog from '@/components/auth/AuthDialog';
import { toast } from 'sonner';

export default function Messages() {
  const session = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Load conversations when component mounts
  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoading(false);
      setShowAuthDialog(true);
      return;
    }

    const loadConversations = async () => {
      try {
        const data = await getConversations(session.user.id);
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Erreur lors du chargement des conversations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [session?.user?.id]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedConversation.id);
        setMessages(data);
        // Mark messages as read
        await markMessagesAsRead(selectedConversation.id, session?.user?.id || '');
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Erreur lors du chargement des messages');
      }
    };

    loadMessages();
  }, [selectedConversation, session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !selectedConversation || !newMessage.trim()) return;

    try {
      const message = await sendMessage(
        selectedConversation.id,
        session.user.id,
        newMessage.trim()
      );
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Connectez-vous pour accéder à vos messages
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Vous devez être connecté pour voir vos conversations.
            </p>
            <button
              onClick={() => setShowAuthDialog(true)}
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              Se connecter
            </button>
          </div>
        </div>
        {showAuthDialog && <AuthDialog onClose={() => setShowAuthDialog(false)} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-12 min-h-[600px]">
            {/* Conversations List */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
              </div>
              <div className="overflow-y-auto h-[calc(600px-4rem)]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucune conversation
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none ${
                        selectedConversation?.id === conv.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        Conversation #{conv.id.slice(0, 8)}
                      </div>
                      {conv.last_message && (
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {conv.last_message}
                        </p>
                      )}
                      {conv.unread_count > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="col-span-8 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Conversation #{selectedConversation.id.slice(0, 8)}
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === session.user.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            message.sender_id === session.user.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                      >
                        Envoyer
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Sélectionnez une conversation pour voir les messages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 