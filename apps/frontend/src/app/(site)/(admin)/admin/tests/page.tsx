"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "@/hooks/use-toast"


function convertToIST(utcDateTime: string): string {
  const utcDate = new Date(utcDateTime);
  
  // Convert to IST by adding 5 hours and 30 minutes
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format the date and time in 12-hour format
  const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
  };

  return istDate.toLocaleString("en-IN", options);
}


export default function Questions() {


  const { data:tests ,refetch} = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/test`
      );
      return response.data;
    },
  });

  const handleDelete = async (testId: string) => {
    const response = await axios.delete(`/api/test/${testId}`)
    if(response.status === 200){
      toast({ title: "Success", description: "Test Deleted Successfully",color:"white" })
      refetch()
    }
  }

  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Test Management</CardTitle>
            <Link href="/admin/tests/create">
              <Button>Create New Test</Button>
            </Link>
        </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            {/* <Input 
              placeholder="Search tests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            /> */}
            
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Test Link</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests ? tests?.map((test) => (
                <TableRow key={test.testId}>
                  <TableCell>{test.title}</TableCell>
                  <TableCell>{`${process.env.NEXT_PUBLIC_WEBSITE_URL!}/test/${test.testId}`}</TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tests/edit/${test.id}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" 
                    onClick={() => handleDelete(test.testId)}
                    className="text-red-500">Delete</Button>
                  </TableCell>
                </TableRow>
              )):
              <TableRow>
                <TableCell colSpan={5} className="text-center">No tests found</TableCell>
              </TableRow>
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

