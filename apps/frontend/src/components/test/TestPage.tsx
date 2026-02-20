"use client";

import { QuestionNavigation, TestHeader, TestQuestionUI } from "@/components/test/panel";
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
} from "@repo/common-ui";
import { Button } from "@repo/common-ui";

const TestPage = ({ testId }: { testId: string }) => {
  const { setTestId, isLoaded, setIsTestComplete, setMinimizeCount, setToken } = useTestContext();
  const [showExitWarning, setShowExitWarning] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");


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
    if (token) {
      setToken(token);
    }
    enterFullScreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setMinimizeCount((prev) => prev + 1);
        setShowExitWarning(true);
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setMinimizeCount((prev) => prev + 1);
        setShowExitWarning(true);
      }
    };


    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
          <TestQuestionUI />
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
          <DialogFooter className="gap-2">
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
