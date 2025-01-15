import { Button } from "@/components/ui/button";
import { useTestContext } from "@/context/TestContext";
import { Maximize, Minimize, Clock, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";



export function TestHeader() {
  const { setIsTestComplete, testInfo,isTestComplete} = useTestContext();
  const [timer, setTimer] = useState(0); // Timer state
  const [isFullScreen, setIsFullScreen] = useState(false);

  const STORAGE_KEY = `test_timer_${testInfo?.testId}`;

  useEffect(() => {
    setTimer(testInfo?.duration * 60);
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { leftTime } = JSON.parse(savedData);
      setTimer(leftTime);
  
      if (leftTime === 0) {
        setIsTestComplete(true);
      }
    }
  }, [testInfo, setIsTestComplete, STORAGE_KEY]);
  
  useEffect(() => {
    if (timer > 0 && !isTestComplete) {
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev - 1;
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ leftTime: newTime })
          );
  
          if (newTime === 0) {
            setIsTestComplete(true);
          }
  
          return newTime;
        });
      }, 1000);
  
      return () => clearInterval(intervalId);
    }
    
  }, [timer, isTestComplete, setIsTestComplete, STORAGE_KEY]);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-yellow-500 text-white">
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 md:ml-2">

          <div className="hidden sm:inline-block" style={{ transform: "rotate(-30deg)" }}>
            <GraduationCap size={30} />
          </div>
          <div className="hidden sm:block h-6 w-px bg-white" />

          <h1 className="text-sm font-semibold md:text-base lg:text-lg ml-1 whitespace break-words">
            {testInfo?.testTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            className="md:flex hover:bg-white/20"
          >
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="hidden md:text-sm ml-2">
              {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
