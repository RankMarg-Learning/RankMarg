"use client";

import { QuestionNavigation } from "@/components/test/panel/QuestionNavigation";
import { TestHeader } from "@/components/test/panel/TestHeader";
import { TestQuestion } from "@/components/test/panel/TestQuestion";
import { useTestContext } from "@/context/TestContext";
import React, { useEffect, useState } from "react";
import Loading from "../Loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

const TestPage = ({ testId }: { testId: string }) => {
  const { setTestId, isLoaded, setIsTestComplete } = useTestContext();
  const [showExitWarning, setShowExitWarning] = useState(false);



  useEffect(() => {
    const enterFullScreen = async () => {
      const elem = document.documentElement;

      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (elem as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((elem as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (elem as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen();
        }
      } catch (error) {
        console.error("Failed to enter full-screen mode:", error);
      }
    };

    setTestId(testId);
    enterFullScreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowExitWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testId, setTestId]);


  if (isLoaded) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TestHeader />
      <div className="flex flex-1 relative">
        <main className="flex-1 w-full lg:w-4/5">
          <TestQuestion />
        </main>
        <QuestionNavigation />
      </div>
      <Dialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              Exiting full-screen mode will end your test. Do you want to
              continue in full-screen mode?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowExitWarning(false);
                setIsTestComplete(true);
              }}
            >
              End Test
            </Button>
            <Button
              onClick={async () => {
                setShowExitWarning(false);
                const elem = document.documentElement;

                const elementWithFullScreen = elem as HTMLElement & {
                  webkitRequestFullscreen?: () => Promise<void>;
                };

                if (elem.requestFullscreen) {
                  await elem.requestFullscreen();
                } else if (elementWithFullScreen.webkitRequestFullscreen) {
                  await elementWithFullScreen.webkitRequestFullscreen();
                }
              }}
            >
              Continue in Full Screen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestPage;
