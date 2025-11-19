'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Avatar, Chip, Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from '@heroui/react';
import { Heart, ThumbsUp, Star, Zap, Award, Plus, Send, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

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
  const [selectedToUserId, setSelectedToUserId] = useState<string>('');
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecognitions();
  }, []);

  async function fetchRecognitions() {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/gamification/recognitions?limit=50');

      if (!response.ok) {
        throw new Error('Failed to fetch recognitions');
      }

      const result = await response.json();
      setRecognitions(result.data || []);
    } catch (err) {
      console.error('Error fetching recognitions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recognitions');
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(recognitionId: string) {
    try {
      const response = await fetch(`/api/v1/gamification/recognitions/${recognitionId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like recognition');
      }

      const result = await response.json();

      // Update local state
      setRecognitions((prev) =>
        prev.map((r) =>
          r.id === recognitionId ? { ...r, likes: result.likesCount } : r
        )
      );
    } catch (err) {
      console.error('Error liking recognition:', err);
    }
  }

  async function handleSubmitRecognition() {
    if (!message.trim() || !selectedToUserId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/v1/gamification/recognitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: selectedToUserId,
          recognitionType: selectedType,
          message: message.trim(),
          isPublic: true,
          pointsAwarded: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create recognition');
      }

      // Refresh recognitions list
      await fetchRecognitions();

      // Reset form and close modal
      setMessage('');
      setSelectedToUserId('');
      onOpenChange();
    } catch (err) {
      console.error('Error creating recognition:', err);
      alert(err instanceof Error ? err.message : 'Failed to create recognition');
    } finally {
      setSubmitting(false);
    }
  }


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



  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading recognitions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Recognitions</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => fetchRecognitions()}>
          Retry
        </Button>
      </div>
    );
  }

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
                          onPress={() => handleLike(recognition.id)}
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
                  onPress={handleSubmitRecognition}
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
