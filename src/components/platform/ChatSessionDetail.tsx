'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  Send,
  X,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Paperclip,
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

interface Session {
  id: string;
  status: string;
  subject: string;
  category: string;
  started_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  tenant: {
    id: string;
    company_name: string;
  };
}

interface ChatSessionDetailProps {
  sessionId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ChatSessionDetail({ sessionId, onClose, onUpdate }: ChatSessionDetailProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [cannedResponses, setCannedResponses] = useState<any[]>([]);
  const [showCannedResponses, setShowCannedResponses] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession();
    fetchCannedResponses();
    const interval = setInterval(fetchSession, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/platform/chat/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');

      const data = await response.json();
      setSession(data.session);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };

  const fetchCannedResponses = async () => {
    try {
      const response = await fetch('/api/platform/chat/canned-responses?active=true');
      if (!response.ok) return;

      const data = await response.json();
      setCannedResponses(data.responses || []);
    } catch (error) {
      console.error('Failed to fetch canned responses:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch('/api/platform/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      await fetchSession();
      onUpdate();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/platform/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`Chat marked as ${status}`);
      await fetchSession();
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const useCannedResponse = (content: string) => {
    setNewMessage(content);
    setShowCannedResponses(false);
  };

  const getMessageAlignment = (message: Message) => {
    return message.sender_type === 'user' ? 'flex-row' : 'flex-row-reverse';
  };

  const getMessageBgColor = (message: Message) => {
    if (message.sender_type === 'agent') return 'bg-primary text-white';
    if (message.sender_type === 'system')
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white';
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center p-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-gray-500 dark:text-gray-400">
          Session not found
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={session.user.avatar_url}
            name={session.user.full_name}
            size="md"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {session.user.full_name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session.tenant.company_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chat actions">
              {session.status !== 'resolved' && (
                <DropdownItem
                  key="resolve"
                  startContent={<CheckCircle2 className="w-4 h-4" />}
                  onPress={() => updateStatus('resolved')}
                >
                  Mark as Resolved
                </DropdownItem>
              )}
              {session.status !== 'waiting' && (
                <DropdownItem
                  key="waiting"
                  startContent={<Clock className="w-4 h-4" />}
                  onPress={() => updateStatus('waiting')}
                >
                  Mark as Waiting
                </DropdownItem>
              )}
              {session.status !== 'closed' && (
                <DropdownItem
                  key="close"
                  className="text-danger"
                  color="danger"
                  startContent={<XCircle className="w-4 h-4" />}
                  onPress={() => updateStatus('closed')}
                >
                  Close Chat
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Button isIconOnly size="sm" variant="light" onPress={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardBody className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div
              className={`max-w-[70%] ${message.sender_type === 'agent' ? 'text-right' : 'text-left'}`}
            >
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
      </CardBody>

      {/* Footer */}
      {session.status !== 'closed' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Canned Responses */}
          {showCannedResponses && cannedResponses.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Quick Responses:
              </p>
              <div className="flex flex-wrap gap-1">
                {cannedResponses.map((response) => (
                  <Chip
                    key={response.id}
                    size="sm"
                    variant="flat"
                    className="cursor-pointer"
                    onClick={() => useCannedResponse(response.content)}
                  >
                    {response.shortcut}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => setShowCannedResponses(!showCannedResponses)}
              title="Quick responses"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
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
    </Card>
  );
}
