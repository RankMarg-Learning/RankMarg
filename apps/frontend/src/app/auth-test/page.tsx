"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import passportAuthAdapter from "@/lib/auth/passport-adapter";

/**
 * Test page for authentication flow
 * This page demonstrates the integration between NextAuth and our Passport backend
 */
export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if a token was returned in URL (for OAuth flows)
  const hasTokenInUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('token');

  /**
   * Load user profile from backend API
   */
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await passportAuthAdapter.getProfile();
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test the integration between NextAuth.js and Passport.js
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg mb-2">Authentication Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">Status:</span>
              <span>
                {status === "authenticated" ? (
                  <span className="text-green-600 font-medium">Authenticated</span>
                ) : status === "loading" ? (
                  <span className="text-yellow-600 font-medium">Loading...</span>
                ) : (
                  <span className="text-red-600 font-medium">Not Authenticated</span>
                )}
              </span>

              {hasTokenInUrl && (
                <div className="col-span-2 text-amber-600">
                  Token detected in URL. This is from OAuth redirect.
                </div>
              )}
            </div>
          </div>

          {/* Session Information */}
          {status === "authenticated" && session && (
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-lg mb-2">Session Data</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">User ID:</span>
                <span>{session.user?.id}</span>

                <span className="font-medium">Name:</span>
                <span>{session.user?.name}</span>

                <span className="font-medium">Email:</span>
                <span>{session.user?.email}</span>

                <span className="font-medium">Role:</span>
                <span>{session.user?.role}</span>

                <span className="font-medium">Has Token:</span>
                <span>{session.accessToken ? "Yes" : "No"}</span>
              </div>
            </div>
          )}

          {/* Backend API Test */}
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg mb-2">API Profile Test</h3>
            <div className="space-y-4">
              <Button 
                onClick={loadProfile} 
                disabled={loading || status !== "authenticated"}
              >
                {loading ? "Loading..." : "Load Profile from API"}
              </Button>

              {error && (
                <div className="text-red-600 text-sm p-2 border border-red-300 bg-red-50 rounded">
                  {error}
                </div>
              )}

              {profile && (
                <div className="text-sm p-2 border border-green-300 bg-green-50 rounded">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg mb-2">Authentication Actions</h3>
            <div className="flex flex-col space-y-2">
              {status === "authenticated" ? (
                <Button variant="destructive" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/sign-in" passHref>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/sign-up" passHref>
                    <Button variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
