'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Textarea,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import { LifeBuoy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onUpdate: () => void;
}

export function ViewTicketModal({
  isOpen,
  onClose,
  ticket,
  onUpdate,
}: ViewTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState(ticket.status);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      fetchTicketDetails();
    }
  }, [isOpen, ticket?.id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/platform/support/${ticket.id}`);
      if (response.ok) {
        const { data } = await response.json();
        setTicketData(data);
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/platform/support/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, is_internal: false }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast.success('Message sent');
      setNewMessage('');
      fetchTicketDetails();
      onUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/platform/support/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated');
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-primary" />
          <div className="flex flex-col gap-1">
            <span>{ticket.subject}</span>
            <span className="text-xs font-mono text-gray-500">{ticket.ticket_number}</span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : ticketData ? (
            <>
              {/* Ticket Info */}
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="flat">
                  {ticketData.tenant?.name}
                </Chip>
                <Chip size="sm" color="primary" variant="flat">
                  {ticketData.priority}
                </Chip>
                <Chip size="sm" variant="flat">
                  {ticketData.requester_name}
                </Chip>
              </div>

              {/* Status Update */}
              <div className="flex items-center gap-2">
                <Select
                  label="Status"
                  className="flex-1"
                  selectedKeys={[status]}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <SelectItem key="open">Open</SelectItem>
                  <SelectItem key="in_progress">In Progress</SelectItem>
                  <SelectItem key="waiting_customer">Waiting Customer</SelectItem>
                  <SelectItem key="resolved">Resolved</SelectItem>
                  <SelectItem key="closed">Closed</SelectItem>
                </Select>
                {status !== ticketData.status && (
                  <Button color="primary" size="sm" onPress={handleUpdateStatus}>
                    Update
                  </Button>
                )}
              </div>

              <Divider />

              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold">Messages</h3>
                {ticketData.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${msg.is_internal ? 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{msg.author_name}</span>
                        <span className="text-xs text-gray-500">{msg.author_email}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                        {msg.is_internal && (
                          <Chip size="sm" color="warning" variant="flat">Internal</Chip>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>

              <Divider />

              {/* New Message */}
              <div className="space-y-2">
                <Textarea
                  label="Add Message"
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  minRows={3}
                />
                <div className="flex justify-end">
                  <Button
                    color="primary"
                    startContent={<Send className="w-4 h-4" />}
                    onPress={handleSendMessage}
                    isDisabled={!newMessage.trim()}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p>Failed to load ticket details</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
