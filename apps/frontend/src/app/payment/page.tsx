"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, XCircle, RefreshCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const SUPPORT_EMAIL = 'support@rankmarg.in'; 

const PaymentStatusPage = () => {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = searchParams?.get('planName') || '';
  const expiry = searchParams?.get('expiry') || '';
  const status = searchParams?.get('status') || '';

  useEffect(() => {
    if (!status || (status !== 'success' && status !== 'failed')) {
      router.replace('/pricing');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/dashboard');
    }
  }, [countdown, router, status]);

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

  const handleTryAgain = () => {
    router.push('/pricing');
  };

  if (!status || (status !== 'success' && status !== 'failed')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white opacity-80 rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'success' ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {status === 'success' ? (
              <>
                <h1 className="text-xl font-semibold text-green-900 mb-2 flex items-center justify-center">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 mb-1">Thank you for subscribing!</p>
                <p className="text-gray-500 text-sm">Your personalized practice journey starts now.</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-red-900 mb-2 flex items-center justify-center">
                  Payment Failed
                </h1>
                <p className="text-gray-600 mb-1">Unfortunately, your payment could not be processed.</p>
                <p className="text-gray-500 text-sm">Please try again or contact support if the issue persists.</p>
              </>
            )}
          </div>

          {/* Plan Details (only for success) */}
          {status === 'success' && plan && expiry && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="text-gray-900 font-medium">Plan: {plan}</div>
              <div className="text-gray-600 text-sm">Active till: {expiry}</div>
            </div>
          )}

          {/* Dashboard or Try Again Button */}
          {status === 'success' ? (
            <button
              onClick={handleDashboardRedirect}
              className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-primary-500 transition-colors duration-200 flex items-center justify-center mb-4"
            >
              <span className="mr-2">Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleTryAgain}
              className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center mb-4"
            >
              <span className="mr-2">Try Again</span>
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}

          {/* Countdown (only for success) */}
          {status === 'success' && (
            <div className="text-gray-500 text-sm mb-4">
              Redirecting to dashboard in {countdown} seconds...
            </div>
          )}

          {/* Support Section */}
          <div className="mt-4 text-gray-700 text-sm border-t pt-4">
            <div className="mb-1 font-medium">Need help?</div>
            <div>
              Contact our support team at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 underline">
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

export const dynamic = 'force-dynamic';