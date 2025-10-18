'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Target,
  Sparkles,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePromoCode } from '@/hooks/usePromoCode';

export default function PartnerProgramPage({ params }: { params: { promocodeId: string } }) {
  const router = useRouter();
  const { promoCode: promoData, isLoading: loading, isError, error } = usePromoCode(params.promocodeId);
  const [copied, setCopied] = React.useState(false);

  // Update document title and meta tags dynamically
  useEffect(() => {
    if (promoData?.code) {
      document.title = `${promoData.code} - Partner Program | RankMarg`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          'content', 
          `Track your referrals and earnings with the ${promoData.code} partner promocode. View your impact and help students succeed with RankMarg.`
        );
      }
    }
  }, [promoData]);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    if (promoData?.code) {
      try {
        await navigator.clipboard.writeText(promoData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !promoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Promocode Not Found</h2>
                <p className="text-gray-600 mb-6">
                  {(error as any)?.message || 'The promocode you are looking for does not exist or you do not have access to view it.'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Home
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const validFrom = new Date(promoData.validFrom);
  const validUntil = new Date(promoData.validUntil);
  const isExpired = new Date() > validUntil;
  const usagePercentage = promoData.maxUsageCount 
    ? (promoData.currentUsageCount / promoData.maxUsageCount) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Dashboard</h1>
          <p className="text-gray-600">Track your referral performance (updated weekly)</p>
        </div>

        {/* Promocode Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">{promoData.code}</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Copy promocode"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-gray-600" />
                      <span className="text-gray-600">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <Badge 
                variant={promoData.isActive && !isExpired ? "default" : "secondary"}
                className={promoData.isActive && !isExpired ? "bg-green-500" : "bg-gray-500 text-white"}
              >
                {promoData.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-600">{promoData.discount}% OFF</div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Users Referred */}
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{promoData.currentUsageCount}</div>
              <div className="text-sm text-gray-600">Users Referred</div>
            </CardContent>
          </Card>

          {/* Usage Limit */}
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {promoData.maxUsageCount ?? '∞'}
              </div>
              <div className="text-sm text-gray-600">Usage Limit</div>
              {promoData.maxUsageCount && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {usagePercentage.toFixed(0)}% used
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">
                {validFrom.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} - {validUntil.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-600">Valid Period</div>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        {promoData.applicablePlans && promoData.applicablePlans.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Applicable Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {promoData.applicablePlans.map((plan) => (
                  <Badge 
                    key={plan.id} 
                    variant="outline"
                    className="px-3 py-1"
                  >
                    {plan.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coming Soon */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">More Features Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              Analytics, commission tracking, and referral leaderboards are in development.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
