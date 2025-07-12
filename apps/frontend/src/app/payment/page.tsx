"use client"
import Loading from '@/components/Loading';
import PaymentStatus from '@/components/PaymentStatus';
import React, { Suspense } from 'react';

const PaymentStatusPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentStatus />
    </Suspense>
  );
};

export default PaymentStatusPage;

export const dynamic = 'force-dynamic';