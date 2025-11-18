'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { BadgesShowcase } from '@/components/gamification/BadgesShowcase';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { RecognitionWall } from '@/components/gamification/RecognitionWall';
import { PulseCheckSurveys } from '@/components/gamification/PulseCheckSurveys';
import { Tabs, Tab } from '@heroui/react';
import { useState } from 'react';
import { Award, Trophy, Heart, MessageSquare } from 'lucide-react';

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <PageContainer
      title="Engagement & Gamification"
      subtitle="Badges, leaderboards, recognition, and pulse checks to boost engagement"
    >
      <div className="space-y-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          size="lg"
          color="primary"
          variant="underlined"
        >
          <Tab
            key="badges"
            title={
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Badges & Achievements</span>
              </div>
            }
          />
          <Tab
            key="leaderboard"
            title={
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </div>
            }
          />
          <Tab
            key="recognition"
            title={
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Recognition Wall</span>
              </div>
            }
          />
          <Tab
            key="surveys"
            title={
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Pulse Checks</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === 'badges' && <BadgesShowcase />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'recognition' && <RecognitionWall />}
        {activeTab === 'surveys' && <PulseCheckSurveys />}
      </div>
    </PageContainer>
  );
}
