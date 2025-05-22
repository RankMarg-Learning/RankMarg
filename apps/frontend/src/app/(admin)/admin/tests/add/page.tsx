"use client"
import TestForm from '@/components/admin/test/TestForm'
import { toast } from '@/hooks/use-toast';
import { addTest } from '@/services/test.service';
import { test } from '@/types/typeAdmin';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const TestAdd = () => {
    const route = useRouter();
      const [loading, setLoading] = useState(false);

    const handleSave = async (testData: Partial<test>) => {
        setLoading(true);
        try {
            const response = await addTest(testData)
            
            if (response && response.success) {
                toast({
                    title:'Test Added',
                    description:'Test has been added successfully',
                })
                route.push('/admin/tests');
            }
            else {
                toast({
                    title:'Failed',
                    description:'Failed to add test',
                })
            }
        } catch (error) {
            console.error(error)
        }
        finally{
            setLoading(false);
        }

    };
    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Add New Test</h2>
                <p className="text-gray-500">Create a new test for your exams </p>
            </div>
            <TestForm
                onSave={handleSave}
                onCancel={() => { 
                    route.push('/admin/tests'); 
                }}
                loading={loading}
            />
        </>
    )
}

export default TestAdd