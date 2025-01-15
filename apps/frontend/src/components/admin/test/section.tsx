import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import SelectFilter from '@/components/SelectFilter'
import React from 'react'

const Section = () => {
    const [section, setSection] = React.useState('')

    const handleSection = (value: string[]) => {
        setSection(value[0])
    }
  return (
    <Card>
        <CardHeader className='hidden'>
            <CardTitle>Section</CardTitle>
        </CardHeader>
        <CardContent className='my-5'>
            <label htmlFor="section-select">Section</label>
            <SelectFilter
              width={"full"}
              placeholder="Section"
              selectName={['Physics', 'Chemistry', 'Mathematics', 'Biology']}
              onChange={handleSection}
            />
        </CardContent>
        <CardFooter>
            <Button>Save</Button>
        </CardFooter>
    </Card>
  )
}

export default Section