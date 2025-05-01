
import React, { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Mic, MicOff, PaperclipIcon } from "lucide-react";
import { getAvatarUrl } from "@/utils/imageUtils";
import { supabase } from '@/integrations/supabase/client'; // Added missing import

const ChatWindow = ({ 
  messages = [], 
  onSendMessage, 
  recipient, 
  currentUser,
  isLoading = false,
  onRecordVoice,
  onUploadFile,
  onMarkAsRead 
}) => {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (onMarkAsRead && messages.length > 0) {
      onMarkAsRead();
    }
  }, [messages, onMarkAsRead]);

  // Check for microphone permission
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasRecordingPermission(true);
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setHasRecordingPermission(false);
      }
    };

    checkMicrophonePermission();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (onRecordVoice) {
          await onRecordVoice(audioBlob);
        }
        setIsRecording(false);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasRecordingPermission(false);
    }
  };

  const handleStopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUploadFile) {
      onUploadFile(Array.from(files));
      e.target.value = null; // Reset the input
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-3 border-b">
        {recipient && (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={recipient.avatar} alt={recipient.name} />
              <AvatarFallback>{recipient.name ? getAvatarUrl(recipient.name) : "??"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{recipient.name}</h2>
              {recipient.isOnline && <p className="text-xs text-green-500">En ligne</p>}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[500px] p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <p>Aucun message</p>
              <p className="text-sm">Envoyez un message pour commencer la conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender_id !== currentUser?.id && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={recipient?.avatar} alt={recipient?.name} />
                      <AvatarFallback>
                        {recipient?.name ? recipient.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`px-4 py-2 rounded-lg max-w-[70%] ${
                      message.sender_id === currentUser?.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    {message.media && message.media.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.media.map((item) => (
                          <div key={item.id}>
                            {item.media_type === 'image' && (
                              <img 
                                src={item.media_url} 
                                alt="Image" 
                                className="rounded-md max-h-52 w-auto"
                                loading="lazy"
                              />
                            )}
                            {item.media_type === 'audio' && (
                              <audio 
                                src={item.media_url} 
                                controls 
                                className="w-full"
                              />
                            )}
                            {item.media_type === 'document' && (
                              <a 
                                href={item.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-500 hover:underline"
                              >
                                <PaperclipIcon className="h-4 w-4 mr-1" />
                                Document joint
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender_id === currentUser?.id && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                      <AvatarFallback>
                        {currentUser?.name ? currentUser.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
          <Button 
            type="button" 
            size="icon" 
            variant="outline"
            onClick={triggerFileInput}
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          
          {hasRecordingPermission && (
            <Button 
              type="button" 
              size="icon" 
              variant="outline"
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onMouseLeave={() => isRecording && handleStopRecording()}
              className={isRecording ? 'bg-red-100' : ''}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Input 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;
