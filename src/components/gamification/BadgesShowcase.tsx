'use client';

import { Card, CardBody, CardHeader, Chip, Progress, Tooltip } from '@heroui/react';
import { Award, Lock, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  nameId: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  pointsValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isEarned: boolean;
  earnedAt?: string;
  progress?: number; // 0-100
}

export function BadgesShowcase() {
  // Mock data - replace with actual API
  const badges: Badge[] = [
    {
      id: '1',
      name: 'Perfect Attendance',
      nameId: 'Kehadiran Sempurna',
      description: 'No absences for a full month',
      category: 'attendance',
      icon: '🏆',
      color: '#10b981',
      pointsValue: 100,
      rarity: 'rare',
      isEarned: true,
      earnedAt: '2025-10-31',
      progress: 100,
    },
    {
      id: '2',
      name: 'Early Bird',
      nameId: 'Burung Awal',
      description: 'Arrive early for 10 consecutive days',
      category: 'attendance',
      icon: '🐦',
      color: '#3b82f6',
      pointsValue: 50,
      rarity: 'common',
      isEarned: true,
      earnedAt: '2025-11-05',
      progress: 100,
    },
    {
      id: '3',
      name: 'Team Player',
      nameId: 'Pemain Tim',
      description: 'Receive 5 peer recognitions in a month',
      category: 'recognition',
      icon: '🤝',
      color: '#8b5cf6',
      pointsValue: 75,
      rarity: 'rare',
      isEarned: false,
      progress: 60,
    },
    {
      id: '4',
      name: 'Learning Champion',
      nameId: 'Juara Pembelajaran',
      description: 'Complete 5 training courses',
      category: 'learning',
      icon: '📚',
      color: '#f59e0b',
      pointsValue: 150,
      rarity: 'epic',
      isEarned: false,
      progress: 40,
    },
    {
      id: '5',
      name: 'Goal Crusher',
      nameId: 'Penghancur Target',
      description: 'Achieve 100% OKR completion',
      category: 'performance',
      icon: '🎯',
      color: '#ef4444',
      pointsValue: 200,
      rarity: 'epic',
      isEarned: false,
      progress: 85,
    },
    {
      id: '6',
      name: 'Overtime Warrior',
      nameId: 'Pejuang Lembur',
      description: 'Work overtime for 20+ hours in a month',
      category: 'attendance',
      icon: '⚔️',
      color: '#6366f1',
      pointsValue: 80,
      rarity: 'rare',
      isEarned: false,
      progress: 45,
    },
    {
      id: '7',
      name: 'Helpful Hand',
      nameId: 'Tangan Penolong',
      description: 'Help teammates 10 times',
      category: 'recognition',
      icon: '🤚',
      color: '#14b8a6',
      pointsValue: 60,
      rarity: 'common',
      isEarned: true,
      earnedAt: '2025-09-15',
      progress: 100,
    },
    {
      id: '8',
      name: 'Innovation Star',
      nameId: 'Bintang Inovasi',
      description: 'Submit 3 innovative ideas',
      category: 'performance',
      icon: '⭐',
      color: '#ec4899',
      pointsValue: 120,
      rarity: 'epic',
      isEarned: false,
      progress: 33,
    },
    {
      id: '9',
      name: 'Consistent Performer',
      nameId: 'Pemain Konsisten',
      description: 'Maintain 4+ rating for 3 quarters',
      category: 'performance',
      icon: '📈',
      color: '#10b981',
      pointsValue: 250,
      rarity: 'legendary',
      isEarned: false,
      progress: 66,
    },
    {
      id: '10',
      name: 'Attendance Streak',
      nameId: 'Rekor Kehadiran',
      description: 'Perfect attendance for 90 days',
      category: 'attendance',
      icon: '🔥',
      color: '#f59e0b',
      pointsValue: 300,
      rarity: 'legendary',
      isEarned: false,
      progress: 22,
    },
  ];

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-default-600',
      rare: 'text-blue-600',
      epic: 'text-purple-600',
      legendary: 'text-orange-600',
    };
    return colors[rarity] || 'text-default-600';
  };

  const getRarityChipColor = (rarity: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
      common: 'default',
      rare: 'primary',
      epic: 'secondary',
      legendary: 'warning',
    };
    return colors[rarity] || 'default';
  };

  const stats = {
    total: badges.length,
    earned: badges.filter((b) => b.isEarned).length,
    inProgress: badges.filter((b) => !b.isEarned && b.progress! > 0).length,
    totalPoints: badges.filter((b) => b.isEarned).reduce((sum, b) => sum + b.pointsValue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.earned}</p>
                  <p className="text-sm text-default-500">Badges Earned</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-default-500">In Progress</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <Star className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPoints}</p>
                  <p className="text-sm text-default-500">Points Earned</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-default-500">Total Badges</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={badge.isEarned ? '' : 'opacity-75'}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`text-5xl ${badge.isEarned ? '' : 'grayscale opacity-50'}`}
                    style={{ filter: badge.isEarned ? 'none' : 'grayscale(100%)' }}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Chip
                      color={getRarityChipColor(badge.rarity)}
                      variant="flat"
                      size="sm"
                      className={getRarityColor(badge.rarity)}
                    >
                      {badge.rarity.toUpperCase()}
                    </Chip>
                    {badge.isEarned ? (
                      <Chip color="success" variant="flat" size="sm">
                        ✓ Earned
                      </Chip>
                    ) : (
                      <Chip variant="flat" size="sm" startContent={<Lock className="h-3 w-3" />}>
                        Locked
                      </Chip>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
                <p className="text-sm text-default-600 mb-1">{badge.nameId}</p>
                <p className="text-sm text-default-500 mb-4">{badge.description}</p>

                {!badge.isEarned && badge.progress !== undefined && badge.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-default-500">Progress</span>
                      <span className="text-xs font-semibold">{badge.progress}%</span>
                    </div>
                    <Progress
                      value={badge.progress}
                      color="primary"
                      size="sm"
                      className="mb-1"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-default-200">
                  <Chip
                    variant="flat"
                    size="sm"
                    style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                  >
                    {badge.category}
                  </Chip>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    <span className="text-sm font-semibold">{badge.pointsValue} pts</span>
                  </div>
                </div>

                {badge.isEarned && badge.earnedAt && (
                  <p className="text-xs text-default-400 mt-2">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
