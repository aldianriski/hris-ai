'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      // TODO: Replace with your actual VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        toast.info('Push notifications not configured yet');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from backend
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-default-600" />
          <h3 className="text-lg font-semibold">Push Notifications</h3>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-default-600 mb-4">
          {isSubscribed
            ? 'You will receive notifications for important updates like leave approvals and payslip availability.'
            : 'Enable push notifications to stay updated on important events.'}
        </p>

        {permission === 'denied' && (
          <div className="bg-warning-50 dark:bg-warning-100/10 p-3 rounded-lg border border-warning-200 mb-4">
            <p className="text-sm text-warning-700 dark:text-warning-600">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {isSubscribed ? (
          <Button
            color="danger"
            variant="flat"
            startContent={<BellOff className="h-4 w-4" />}
            onPress={unsubscribeFromPush}
            isLoading={isLoading}
          >
            Disable Notifications
          </Button>
        ) : (
          <Button
            color="primary"
            startContent={<Bell className="h-4 w-4" />}
            onPress={subscribeToPush}
            isLoading={isLoading}
            isDisabled={permission === 'denied'}
          >
            Enable Notifications
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
