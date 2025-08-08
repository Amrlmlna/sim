"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createLogger } from '@/lib/logs/console/logger';

const logger = createLogger('RedirectStatus');

// Helper function to parse cookies


export function RedirectStatus() {
  const searchParams = useSearchParams();
  const [deeplinkUrl, setDeeplinkUrl] = useState<string | null>(null);

  useEffect(() => {
    const from = searchParams.get('from');
    if (from !== 'electron') return;

    const fetchSessionData = async () => {
      logger.info('Login from Electron detected, fetching session data from API...');
      try {
        const response = await fetch('/api/auth/session-data');
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const data = await response.json();

        const { sessionToken, sessionData, hasLoggedInBefore } = data;

        if (sessionToken && sessionData) {
          logger.info('Authentication data found, creating deeplink.');
          const params = new URLSearchParams();
          params.append('session_token', sessionToken);
          params.append('session_data', sessionData);
          if (hasLoggedInBefore) {
            params.append('has_logged_in_before', hasLoggedInBefore);
          }

          setDeeplinkUrl(`ternary://auth-return?${params.toString()}`);
        } else {
          logger.error('Incomplete authentication data from API.', data);
        }
      } catch (error) {
        logger.error('Failed to fetch session data:', error);
      }
    };

    fetchSessionData();
  }, [searchParams]);

  const handleRedirect = () => {
    if (deeplinkUrl) {
      window.location.href = deeplinkUrl;
    }
  };

  if (searchParams.get('from') !== 'electron') {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Successful</h1>
        <p className="mb-6 text-card-foreground">
          You have successfully logged in. Click the button below to return to the Ternary application.
        </p>
        {deeplinkUrl ? (
          <Button onClick={handleRedirect} size="lg">
            Return to Ternary App
          </Button>
        ) : (
          <p className="text-destructive">Could not prepare return link. Please return to the app manually.</p>
        )}
      </div>
    </div>
  );
}
