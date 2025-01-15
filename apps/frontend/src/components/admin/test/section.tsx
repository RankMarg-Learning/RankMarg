import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const Section = () => {
    
  return (
    <Card>
        <CardHeader className='hidden'>
            <CardTitle>Section</CardTitle>
        </CardHeader>
        <CardContent className='my-5'>
            <label htmlFor="section-select">Section</label>
           
        </CardContent>
        <CardFooter>
            <Button>Save</Button>
        </CardFooter>
    </Card>
  )
}

export default Section