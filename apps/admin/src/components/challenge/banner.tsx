"use client";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";


const Banner = () => {
    const router = useRouter();
    const  socket = useSocket();
    const [open, setOpen] = useState(false);
    const [join, setJoin] = useState(false);
    const [challengeLink,setChallengeLink] = useState<string>(`${process.env.NEXT_PUBLIC_WEBSITE_URL!}/challenge/test`);
    
    useEffect(() => {
      if (!socket) return;
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "INIT_CHALLENGE":
            if(message.payload.invite){setOpen(true);}
            setOpen(true);
            break;
          case "CHALLENGE_ADD":
            setChallengeLink(`${process.env.NEXT_PUBLIC_WEBSITE_URL!}/challenge/${message.challengeId}`);
            // if(invite){setOpen(true);}
            
            break;
          case "CHALLENGE_START":
            router.push(`/challenge/${message.payload.challengeId}`);
            break;
  
        }
      };
    }, [socket]);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(challengeLink);
    }
  
    
  
    return (
      
      <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 py-16 px-6 sm:px-12 md:px-24 lg:px-36 rounded-lg shadow-lg text-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-lg"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 noselect">
            Join the Ultimate Challenge!
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-gray-200 noselect">
            Challenge friends, compete for the top spot, and improve your rank.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
  
            <Button  className="relative bg-yellow-700 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group" 
            onClick={
              () => {
                socket?.send(JSON.stringify({ type: "INIT_CHALLENGE",
                payload: {
                  invite: false,
                }
                 }));
                 setJoin(true);
              }
            }
            
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
              <span className="relative z-10" >Join Challenge </span>
            </Button>
        {/* <DialogTrigger asChild> */}
          <Button  className="relative bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group"
          onClick={
            () => {
              socket?.send(JSON.stringify({ type: "INIT_CHALLENGE",
              payload: {
                invite: true,
              }
               }));
              //  setInvite(true);
              }
          }
          >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
                  <span className="relative z-10">Invite a Friend</span>
          </Button>
        {/* </DialogTrigger> */}
        <Dialog open={open} onOpenChange={setOpen}>
        
        <DialogContent className="sm:max-w-md bg-white" >
          {
            join?<>
            <DialogHeader>
            <DialogTitle className="text-center">Waiting for an opponent...</DialogTitle>
            <DialogDescription>
              Want to speed up? Invite a friend to join the challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" onClick={
                ()=>{setJoin(false)
                  socket?.send(JSON.stringify({type:"USER_REMOVE"}))
                }
              } >
                Close
              </Button>
            </DialogClose>
           
          </DialogFooter>
          </>:
          <>
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
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" 
              >
                Close
              </Button>
            </DialogClose>
           
          </DialogFooter>
          </>
          }
          
        </DialogContent>
      </Dialog>
           {/* <InviteFriend /> */}
          </div>
        </div>
      </div>
    );
  };

  export default Banner;