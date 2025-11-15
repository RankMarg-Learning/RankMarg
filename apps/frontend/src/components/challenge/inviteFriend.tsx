//! This component is not in use Discard any time 



"use client"; 
import { Copy } from "lucide-react"

import { Button } from "@repo/common-ui"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/common-ui"
import { Input } from "@repo/common-ui"
import { Label } from "@repo/common-ui"
import {   useState } from "react";
import { v4 as uuidv4 } from "uuid";

const  InviteFriend = () => {
  const challengeId = uuidv4();
  
  const [challengeLink] = useState<string>(`${window.location.origin}/challenge/${challengeId}`);

  

 
  
  


 

  const handleCopy = () => {
    navigator.clipboard.writeText(challengeLink);
  }

 
  
  // open={isOpen} onOpenChange={setIsOpen}

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button className="relative bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group"
        
        >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
                <span className="relative z-10">Invite a Friend</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white" >
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={challengeLink}
              
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3"
          onClick={handleCopy}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button type="button" >
              Close
            </Button>
          </DialogClose>
          <Button type="submit" 
           >
                Start Challenge
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default InviteFriend