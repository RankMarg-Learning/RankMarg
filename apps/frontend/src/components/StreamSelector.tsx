'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useSession } from 'next-auth/react'

export function StreamSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const { data: session, status } = useSession();

  useEffect(() => {
    const streamInSession = session?.user.stream === "" 
    if (streamInSession) {
      setIsOpen(true)
    }
  }, [session, status])

  const handleStreamSelect = (value: string) => {
    setSelectedStream(value)
  }

  const handleSubmit = async () => {
    if (selectedStream) {
      const response = await fetch("/api/update/stream", {
        method: "POST",
        body: JSON.stringify({ stream: selectedStream }),
      });
      if (response.ok) {
        setIsOpen(false);
      }
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Select Your Stream</DialogTitle>
          <DialogDescription>
            Please choose either JEE or NEET as your stream.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup onValueChange={handleStreamSelect} className="grid gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="JEE" id="jee" />
            <Label htmlFor="jee">JEE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NEET" id="neet" />
            <Label htmlFor="neet">NEET</Label>
          </div>
        </RadioGroup>
        <Button onClick={handleSubmit} disabled={!selectedStream}>
          Confirm Selection
        </Button>
      </DialogContent>
    </Dialog>
  )
}

