'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Spinner,
} from '@heroui/react';
import {
  MessageCircle,
  Send,
  X,
  Paperclip,
  Minimize2,
  Maximize2,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'user' | 'agent' | 'system';
  content: string;
  message_type: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatSession {
  id: string;
  status: string;
  subject: string;
  created_at: string;
  agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // New chat form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [initialMessage, setInitialMessage] = useState('');

  // Rating
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isNewChat && session) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, isNewChat, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/platform/chat/sessions/${session.id}`);
      if (!response.ok) return;

      const data = await response.json();
      setMessages(data.messages || []);
      setSession(data.session);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const startNewChat = async () => {
    if (!initialMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/platform/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject || 'Support Chat',
          category,
          initialMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const data = await response.json();
      setSession(data.session);
      setIsNewChat(false);
      setSubject('');
      setCategory('general');
      setInitialMessage('');
      toast.success('Chat started!');

      // Fetch messages after starting chat
      setTimeout(fetchMessages, 500);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    try {
      setSending(true);
      const response = await fetch('/api/platform/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!session) {
      setIsOpen(false);
      return;
    }

    if (session.status !== 'closed') {
      setShowRating(true);
    } else {
      setIsOpen(false);
      setSession(null);
      setMessages([]);
      setIsNewChat(true);
    }
  };

  const submitRating = async () => {
    if (!session || !rating) return;

    try {
      await fetch(`/api/platform/chat/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed',
          satisfaction_rating: rating,
        }),
      });

      toast.success('Thank you for your feedback!');
      setShowRating(false);
      setIsOpen(false);
      setSession(null);
      setMessages([]);
      setIsNewChat(true);
      setRating(0);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getMessageAlignment = (message: Message) => {
    return message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row';
  };

  const getMessageBgColor = (message: Message) => {
    if (message.sender_type === 'user') return 'bg-primary text-white';
    if (message.sender_type === 'system') return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white';
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
          onPress={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 ${
            isMinimized ? 'h-14' : 'h-[600px]'
          } bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 flex flex-col transition-all`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {isNewChat ? 'Start a Chat' : 'Support Chat'}
                </h3>
                {session?.agent && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    with {session.agent.full_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={closeChat}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isNewChat ? (
                  /* New Chat Form */
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hi! How can we help you today?
                    </p>

                    <Input
                      label="Subject (optional)"
                      placeholder="Brief description"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />

                    <Select
                      label="Category"
                      selectedKeys={[category]}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <SelectItem key="general" value="general">
                        General
                      </SelectItem>
                      <SelectItem key="technical" value="technical">
                        Technical Support
                      </SelectItem>
                      <SelectItem key="billing" value="billing">
                        Billing
                      </SelectItem>
                    </Select>

                    <Textarea
                      label="Your Message"
                      placeholder="Describe your issue or question..."
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      minRows={4}
                      isRequired
                    />

                    <Button
                      color="primary"
                      onPress={startNewChat}
                      isLoading={loading}
                      fullWidth
                    >
                      Start Chat
                    </Button>
                  </div>
                ) : (
                  /* Messages */
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-2 ${getMessageAlignment(message)}`}
                      >
                        <Avatar
                          src={message.sender.avatar_url}
                          name={message.sender.full_name}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className={`max-w-[70%] ${message.sender_type === 'user' ? 'text-right' : 'text-left'}`}>
                          <div
                            className={`inline-block px-4 py-2 rounded-lg ${getMessageBgColor(message)}`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Footer */}
              {!isNewChat && session?.status !== 'closed' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      endContent={
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={sendMessage}
                          isLoading={sending}
                          isDisabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}

              {!isNewChat && session?.status === 'closed' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This chat has been closed
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rating Modal */}
      <Modal isOpen={showRating} onClose={() => setShowRating(false)}>
        <ModalContent>
          <ModalHeader>Rate Your Experience</ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How satisfied are you with our support?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  isIconOnly
                  variant="light"
                  size="lg"
                  onPress={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setShowRating(false);
                setIsOpen(false);
                setSession(null);
                setMessages([]);
                setIsNewChat(true);
              }}
            >
              Skip
            </Button>
            <Button
              color="primary"
              onPress={submitRating}
              isDisabled={!rating}
            >
              Submit Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
