"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Contribute from "@/components/admin/AddQuestion"


export default function Tests() {

  return (
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
        </CardHeader>
        <CardContent>
          
          <Contribute />
        </CardContent>
      </Card>
  )
}

