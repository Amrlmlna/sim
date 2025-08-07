"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/auth-client";
import { createLogger } from "@/lib/logs/console/logger";

const logger = createLogger("RedirectStatus");

export function RedirectStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if this page was accessed from Electron login
    if (searchParams.get("from") !== "electron") {
      // If not, redirect back to login
      router.push("/login");
      return;
    }
  }, [router, searchParams]);

  const handleRedirect = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    try {
      // Get the current session data
      const sessionData = await client.getSession();
      
      if (!sessionData.data?.session || !sessionData.data?.user) {
        logger.error("No session data found for redirect");
        // Redirect to login if no session
        router.push("/login");
        return;
      }

      const { session, user } = sessionData.data;
      const params = new URLSearchParams({
        sessionToken: session.token,
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: user.image || '',
        planTier: 'free', // This would need to be fetched from your user data structure
      });
      
      // Trigger the deeplink redirect
      window.location.href = `ternary://auth-return?${params.toString()}`;
    } catch (err) {
      logger.error("Error during redirect", err);
      // On error, redirect to login
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-neutral-800 p-8 shadow-lg border border-neutral-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white">Login Successful!</h2>
          <p className="text-center text-lg text-neutral-400">
            Click the button below to continue to the Ternary application.
          </p>
        </div>
        
        <div className="mt-6">
          <Button onClick={handleRedirect} disabled={isRedirecting} className="w-full">
            {isRedirecting ? "Redirecting..." : "Continue to App"}
          </Button>
        </div>
        
        <div className="mt-4 text-center text-xs text-neutral-500">
          <p>If nothing happens, please ensure the Ternary app is installed and try again.</p>
        </div>
      </div>
    </div>
  );
}
