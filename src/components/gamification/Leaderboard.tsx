'use client';

import { Card, CardBody, CardHeader, Avatar, Chip, Tabs, Tab } from '@heroui/react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  department: string;
  score: number;
  previousRank?: number;
  change?: 'up' | 'down' | 'same';
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState('overall');
  const [period, setPeriod] = useState('monthly');

  // Mock data - replace with actual API
  const leaderboardData: Record<string, LeaderboardEntry[]> = {
    overall: [
      {
        rank: 1,
        userId: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        department: 'Engineering',
        score: 2450,
        previousRank: 1,
        change: 'same',
      },
      {
        rank: 2,
        userId: '2',
        name: 'Alex Thompson',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        department: 'Sales',
        score: 2280,
        previousRank: 3,
        change: 'up',
      },
      {
        rank: 3,
        userId: '3',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria',
        department: 'Marketing',
        score: 2150,
        previousRank: 2,
        change: 'down',
      },
      {
        rank: 4,
        userId: '4',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?u=john',
        department: 'Engineering',
        score: 1980,
        previousRank: 5,
        change: 'up',
      },
      {
        rank: 5,
        userId: '5',
        name: 'Lisa Wang',
        avatar: 'https://i.pravatar.cc/150?u=lisa',
        department: 'HR',
        score: 1850,
        previousRank: 4,
        change: 'down',
      },
      {
        rank: 6,
        userId: '6',
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/150?u=david',
        department: 'Finance',
        score: 1720,
        previousRank: 6,
        change: 'same',
      },
      {
        rank: 7,
        userId: '7',
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?u=emma',
        department: 'Operations',
        score: 1650,
        previousRank: 8,
        change: 'up',
      },
      {
        rank: 8,
        userId: '8',
        name: 'Michael Brown',
        avatar: 'https://i.pravatar.cc/150?u=michael',
        department: 'Engineering',
        score: 1580,
        previousRank: 7,
        change: 'down',
      },
      {
        rank: 9,
        userId: '9',
        name: 'Sophie Chen',
        avatar: 'https://i.pravatar.cc/150?u=sophie',
        department: 'Marketing',
        score: 1490,
        previousRank: 9,
        change: 'same',
      },
      {
        rank: 10,
        userId: '10',
        name: 'James Lee',
        avatar: 'https://i.pravatar.cc/150?u=james',
        department: 'Sales',
        score: 1420,
        previousRank: 10,
        change: 'same',
      },
    ],
    attendance: [
      {
        rank: 1,
        userId: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        department: 'Engineering',
        score: 100,
        previousRank: 1,
        change: 'same',
      },
      {
        rank: 2,
        userId: '4',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?u=john',
        department: 'Engineering',
        score: 98,
        previousRank: 2,
        change: 'same',
      },
      {
        rank: 3,
        userId: '7',
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?u=emma',
        department: 'Operations',
        score: 97,
        previousRank: 4,
        change: 'up',
      },
    ],
    performance: [
      {
        rank: 1,
        userId: '2',
        name: 'Alex Thompson',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        department: 'Sales',
        score: 95,
        previousRank: 2,
        change: 'up',
      },
      {
        rank: 2,
        userId: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        department: 'Engineering',
        score: 94,
        previousRank: 1,
        change: 'down',
      },
      {
        rank: 3,
        userId: '3',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria',
        department: 'Marketing',
        score: 92,
        previousRank: 3,
        change: 'same',
      },
    ],
    learning: [
      {
        rank: 1,
        userId: '5',
        name: 'Lisa Wang',
        avatar: 'https://i.pravatar.cc/150?u=lisa',
        department: 'HR',
        score: 12,
        previousRank: 1,
        change: 'same',
      },
      {
        rank: 2,
        userId: '3',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria',
        department: 'Marketing',
        score: 10,
        previousRank: 3,
        change: 'up',
      },
      {
        rank: 3,
        userId: '8',
        name: 'Michael Brown',
        avatar: 'https://i.pravatar.cc/150?u=michael',
        department: 'Engineering',
        score: 9,
        previousRank: 2,
        change: 'down',
      },
    ],
    recognition: [
      {
        rank: 1,
        userId: '2',
        name: 'Alex Thompson',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        department: 'Sales',
        score: 28,
        previousRank: 1,
        change: 'same',
      },
      {
        rank: 2,
        userId: '4',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?u=john',
        department: 'Engineering',
        score: 24,
        previousRank: 2,
        change: 'same',
      },
      {
        rank: 3,
        userId: '9',
        name: 'Sophie Chen',
        avatar: 'https://i.pravatar.cc/150?u=sophie',
        department: 'Marketing',
        score: 22,
        previousRank: 4,
        change: 'up',
      },
    ],
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" fill="currentColor" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200';
    return 'bg-default-50';
  };

  const getChangeIcon = (change?: 'up' | 'down' | 'same') => {
    if (change === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (change === 'down') return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-default-400" />;
  };

  const currentData = leaderboardData[activeTab] || leaderboardData.overall || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="lg"
              color="primary"
            >
              <Tab key="overall" title="Overall" />
              <Tab key="attendance" title="Attendance" />
              <Tab key="performance" title="Performance" />
              <Tab key="learning" title="Learning" />
              <Tab key="recognition" title="Recognition" />
            </Tabs>

            <Tabs
              selectedKey={period}
              onSelectionChange={(key) => setPeriod(key as string)}
              size="sm"
              variant="bordered"
            >
              <Tab key="weekly" title="Weekly" />
              <Tab key="monthly" title="Monthly" />
              <Tab key="quarterly" title="Quarterly" />
              <Tab key="yearly" title="Yearly" />
            </Tabs>
          </div>
        </CardHeader>
        <CardBody className="gap-3">
          {/* Top 3 Podium */}
          {currentData && currentData.length >= 3 && currentData[0] && currentData[1] && currentData[2] && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center pt-8"
              >
                <div className="relative mb-3">
                  <Avatar src={currentData[1].avatar} size="lg" name={currentData[1].name} />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                    {getRankIcon(2)}
                  </div>
                </div>
                <h3 className="font-semibold text-center">{currentData[1].name}</h3>
                <p className="text-sm text-default-500">{currentData[1].department}</p>
                <p className="text-2xl font-bold text-gray-600 mt-2">{currentData[1].score}</p>
                <Chip size="sm" variant="flat" className="mt-2">
                  #2
                </Chip>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-3">
                  <Avatar src={currentData[0].avatar} size="lg" name={currentData[0].name} className="w-24 h-24" />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                    {getRankIcon(1)}
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-center">{currentData[0].name}</h3>
                <p className="text-sm text-default-500">{currentData[0].department}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{currentData[0].score}</p>
                <Chip color="warning" size="sm" variant="flat" className="mt-2">
                  👑 #1
                </Chip>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center pt-12"
              >
                <div className="relative mb-3">
                  <Avatar src={currentData[2].avatar} size="lg" name={currentData[2].name} />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                    {getRankIcon(3)}
                  </div>
                </div>
                <h3 className="font-semibold text-center">{currentData[2].name}</h3>
                <p className="text-sm text-default-500">{currentData[2].department}</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{currentData[2].score}</p>
                <Chip size="sm" variant="flat" className="mt-2">
                  #3
                </Chip>
              </motion.div>
            </div>
          )}

          {/* Rest of the leaderboard */}
          <div className="space-y-2">
            {currentData.slice(3).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 3) * 0.05 }}
              >
                <Card className={`${getRankColor(entry.rank)} border`}>
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xl font-bold text-default-500 w-8 text-center">
                          #{entry.rank}
                        </span>
                        <Avatar src={entry.avatar} size="md" name={entry.name} />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold truncate">{entry.name}</h4>
                          <p className="text-sm text-default-500">{entry.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.score}</p>
                          <p className="text-xs text-default-500">points</p>
                        </div>
                        {entry.change && (
                          <div className="flex items-center gap-1">
                            {getChangeIcon(entry.change)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
