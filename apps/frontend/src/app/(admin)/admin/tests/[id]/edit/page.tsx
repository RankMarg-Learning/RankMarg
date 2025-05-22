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
                    title: 'Test Updated',
                    description: 'Test has been updated successfully',
                })
                router.push('/admin/tests');
            } else {
                toast({
                    title: 'Failed',
                    description: 'Failed to update test',
                })
            }
        } catch (error) {
            console.error(error);
            toast({
                type: "foreground",
                description: "Failed to update test",
            });
        }
        finally {
            setLoading(false);
        }
    };

    if (isLoading) return <Loading />
    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Add New Test</h2>
                <p className="text-gray-500">Create a new test for your exams</p>
            </div>
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