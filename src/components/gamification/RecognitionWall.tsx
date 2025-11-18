'use client';

import { Card, CardBody, Avatar, Chip, Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Heart, ThumbsUp, Star, Zap, Award, Plus, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Recognition {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    position: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar: string;
    position: string;
  };
  type: 'thank_you' | 'great_work' | 'team_player' | 'helpful' | 'innovative';
  message: string;
  pointsAwarded: number;
  isPublic: boolean;
  createdAt: string;
  likes: number;
}

export function RecognitionWall() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedType, setSelectedType] = useState<string>('thank_you');
  const [message, setMessage] = useState('');

  // Mock data - replace with actual API
  const recognitions: Recognition[] = [
    {
      id: '1',
      fromUser: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        position: 'Engineering Manager',
      },
      toUser: {
        id: '2',
        name: 'Alex Thompson',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        position: 'Senior Software Engineer',
      },
      type: 'great_work',
      message:
        'Alex went above and beyond to deliver the new feature ahead of schedule. The code quality is exceptional and the documentation is thorough. Great work!',
      pointsAwarded: 50,
      isPublic: true,
      createdAt: '2025-11-18T10:30:00Z',
      likes: 12,
    },
    {
      id: '2',
      fromUser: {
        id: '3',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria',
        position: 'Marketing Director',
      },
      toUser: {
        id: '4',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?u=john',
        position: 'Product Designer',
      },
      type: 'team_player',
      message:
        'John has been incredibly supportive in helping the marketing team with design assets. Always willing to jump in and collaborate!',
      pointsAwarded: 30,
      isPublic: true,
      createdAt: '2025-11-17T15:45:00Z',
      likes: 8,
    },
    {
      id: '3',
      fromUser: {
        id: '5',
        name: 'Lisa Wang',
        avatar: 'https://i.pravatar.cc/150?u=lisa',
        position: 'HR Manager',
      },
      toUser: {
        id: '6',
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/150?u=david',
        position: 'Finance Analyst',
      },
      type: 'helpful',
      message:
        'David helped me understand the new payroll system and patiently answered all my questions. Really appreciate the help!',
      pointsAwarded: 20,
      isPublic: true,
      createdAt: '2025-11-17T09:20:00Z',
      likes: 5,
    },
    {
      id: '4',
      fromUser: {
        id: '7',
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?u=emma',
        position: 'Operations Lead',
      },
      toUser: {
        id: '8',
        name: 'Michael Brown',
        avatar: 'https://i.pravatar.cc/150?u=michael',
        position: 'Senior Engineer',
      },
      type: 'innovative',
      message:
        'Michael proposed an innovative solution that reduced our API response time by 40%. Brilliant thinking!',
      pointsAwarded: 75,
      isPublic: true,
      createdAt: '2025-11-16T14:10:00Z',
      likes: 15,
    },
    {
      id: '5',
      fromUser: {
        id: '9',
        name: 'Sophie Chen',
        avatar: 'https://i.pravatar.cc/150?u=sophie',
        position: 'Content Strategist',
      },
      toUser: {
        id: '10',
        name: 'James Lee',
        avatar: 'https://i.pravatar.cc/150?u=james',
        position: 'Sales Manager',
      },
      type: 'thank_you',
      message:
        'Thank you for providing valuable customer insights that helped shape our content strategy. Your input was invaluable!',
      pointsAwarded: 25,
      isPublic: true,
      createdAt: '2025-11-16T11:30:00Z',
      likes: 6,
    },
  ];

  const recognitionTypes = [
    { value: 'thank_you', label: 'Thank You', icon: Heart, color: 'text-pink-600', points: 10 },
    { value: 'great_work', label: 'Great Work', icon: ThumbsUp, color: 'text-blue-600', points: 50 },
    { value: 'team_player', label: 'Team Player', icon: Star, color: 'text-purple-600', points: 30 },
    { value: 'helpful', label: 'Helpful', icon: Zap, color: 'text-orange-600', points: 20 },
    { value: 'innovative', label: 'Innovative', icon: Award, color: 'text-green-600', points: 75 },
  ];

  const getRecognitionIcon = (type: string) => {
    const rec = recognitionTypes.find((r) => r.value === type);
    if (!rec) return Heart;
    return rec.icon;
  };

  const getRecognitionColor = (type: string) => {
    const rec = recognitionTypes.find((r) => r.value === type);
    return rec?.color || 'text-default-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleSendRecognition = () => {
    // TODO: Implement API call
    console.log('Sending recognition:', { type: selectedType, message });
    onOpenChange();
    setMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recognition Wall</h2>
          <p className="text-default-500">Celebrate your teammates and their achievements</p>
        </div>
        <Button color="primary" startContent={<Plus className="h-4 w-4" />} onPress={onOpen}>
          Give Recognition
        </Button>
      </div>

      {/* Recognition Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {recognitionTypes.map((type, index) => {
          const Icon = type.icon;
          const count = recognitions.filter((r) => r.type === type.value).length;
          return (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${type.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-default-500">{type.label}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recognition Feed */}
      <div className="space-y-4">
        {recognitions.map((recognition, index) => {
          const Icon = getRecognitionIcon(recognition.type);
          const iconColor = getRecognitionColor(recognition.type);

          return (
            <motion.div
              key={recognition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={recognition.fromUser.avatar}
                      size="lg"
                      name={recognition.fromUser.name}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{recognition.fromUser.name}</h4>
                            <span className="text-default-500">recognized</span>
                            <h4 className="font-semibold">{recognition.toUser.name}</h4>
                          </div>
                          <p className="text-sm text-default-500">
                            {recognition.fromUser.position} → {recognition.toUser.position}
                          </p>
                        </div>
                        <Chip
                          variant="flat"
                          size="sm"
                          startContent={<Icon className={`h-4 w-4 ${iconColor}`} />}
                          className="capitalize"
                        >
                          {recognition.type.replace('_', ' ')}
                        </Chip>
                      </div>

                      <p className="text-default-700 mb-3 leading-relaxed">{recognition.message}</p>

                      <div className="flex items-center gap-4 pt-3 border-t border-default-200">
                        <Button
                          size="sm"
                          variant="light"
                          startContent={<Heart className="h-4 w-4" />}
                        >
                          {recognition.likes} Likes
                        </Button>
                        <Chip
                          variant="flat"
                          size="sm"
                          startContent={<Star className="h-3 w-3 text-yellow-500" />}
                          color="warning"
                        >
                          +{recognition.pointsAwarded} points
                        </Chip>
                        <span className="text-sm text-default-400 ml-auto">
                          {formatDate(recognition.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Avatar
                      src={recognition.toUser.avatar}
                      size="lg"
                      name={recognition.toUser.name}
                    />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Give Recognition Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Give Recognition</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recognition Type</label>
                    <div className="grid grid-cols-5 gap-2">
                      {recognitionTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.value;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              isSelected
                                ? 'border-primary bg-primary-50 dark:bg-primary-950/30'
                                : 'border-default-200 hover:border-default-300'
                            }`}
                          >
                            <Icon className={`h-6 w-6 ${type.color}`} />
                            <span className="text-xs font-medium">{type.label}</span>
                            <Chip size="sm" variant="flat">
                              +{type.points}
                            </Chip>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">To (Employee)</label>
                    <Button variant="bordered" fullWidth className="justify-start">
                      Select Employee
                    </Button>
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="Write a message to recognize your teammate..."
                    value={message}
                    onValueChange={setMessage}
                    minRows={4}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSendRecognition}
                  startContent={<Send className="h-4 w-4" />}
                  isDisabled={!message.trim()}
                >
                  Send Recognition
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
