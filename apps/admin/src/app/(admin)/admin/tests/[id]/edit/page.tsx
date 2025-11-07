"use client"
import TestForm from '@/components/admin/test/TestForm'
import Loading from '@/components/Loading';
import { toast } from '@/hooks/use-toast';
import { getTestById, updateTest } from '@/services/test.service';
import { test } from '@/types/typeAdmin';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const EditTest = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { data: test, isLoading, isError } = useQuery({
        queryKey: ["test", id],
        queryFn: () => getTestById(id),
        enabled: !!id,
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });
    if (!isLoading && !isError && !test) {
        router.push("/admin/tests");
        return null;
    }

    const handleSave = async (testData: Partial<test>) => {
        if (!id) return;
        try {
            setLoading(true)
            const response = await updateTest(id, testData);

            if (response && response.success) {
                toast({
                    title: "Test Updated Successfully!",
                    variant: "default",
                    duration: 3000,
                    className: "bg-gray-100 text-gray-800",
                  })
                router.push('/admin/tests');
            } else {
                toast({
                    title: "Failed to update test!",
                    variant: "default",
                    duration: 3000,
                    className: "bg-red-500 text-white",
                  })
                
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to update test!",
                variant: "default",
                duration: 3000,
                className: "bg-red-500 text-white",
              })
        }
        finally {
            setLoading(false);
        }
    };

    if (isLoading) return <Loading />
    return (
        <>
            <TestForm
                initialTest={test.data}
                onSave={handleSave}
                onCancel={() => { router.push('/admin/tests') }}
                loading={loading}
            />
        </>
    )
}

export default EditTest