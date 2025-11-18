'use client';

import { useState, useEffect } from 'react';
import { Button, Spinner } from '@heroui/react';
import { AlertTriangle, LogOut, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImpersonationSession {
  id: string;
  targetUser: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  tenant: {
    id: string;
    company_name: string;
    slug: string;
  };
  startedAt: string;
  expiresAt: string;
  reason: string;
}

export function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const router = useRouter();

  // Fetch active session
  useEffect(() => {
    async function fetchActiveSession() {
      try {
        const response = await fetch('/api/platform/impersonate/active');
        const result = await response.json();

        if (result.isImpersonating && result.session) {
          setSession(result.session);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Failed to fetch active impersonation session:', error);
      }
    }

    fetchActiveSession();

    // Poll every 30 seconds to check if session is still active
    const interval = setInterval(fetchActiveSession, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update time remaining every second
  useEffect(() => {
    if (!session) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setSession(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleEndImpersonation = async () => {
    if (!session) return;

    setIsEnding(true);
    try {
      const response = await fetch('/api/platform/impersonate/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to end impersonation');
      }

      // Clear session and redirect to platform admin
      setSession(null);
      router.push('/platform-admin');
      router.refresh();
    } catch (error) {
      console.error('Failed to end impersonation:', error);
      alert(error instanceof Error ? error.message : 'Failed to end impersonation');
    } finally {
      setIsEnding(false);
    }
  };

  // Don't show banner if no active session
  if (!session) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Warning and User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                IMPERSONATION MODE ACTIVE
              </p>
              <p className="text-xs opacity-90 truncate">
                Viewing as: <strong>{session.targetUser.full_name}</strong> ({session.targetUser.email}) at{' '}
                <strong>{session.tenant.company_name}</strong>
              </p>
            </div>
          </div>

          {/* Right: Time Remaining and Exit Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs bg-white/20 px-3 py-1.5 rounded">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{timeRemaining}</span>
            </div>
            <Button
              size="sm"
              color="default"
              variant="solid"
              startContent={isEnding ? <Spinner size="sm" /> : <LogOut className="w-4 h-4" />}
              onPress={handleEndImpersonation}
              isLoading={isEnding}
              className="bg-white text-red-600 font-semibold hover:bg-gray-100"
            >
              Exit Impersonation
            </Button>
          </div>
        </div>

        {/* Mobile: Time Remaining */}
        <div className="md:hidden mt-2 flex items-center gap-2 text-xs">
          <Clock className="w-3 h-3" />
          <span>Time remaining: {timeRemaining}</span>
        </div>
      </div>
    </div>
  );
}
