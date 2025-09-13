"use client"
import React, { useState } from 'react';
import useOnboardingStore from '@/store/onboardingStore';
import GradeSelection from '@/components/onboarding/GradeSelection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, GraduationCap, RefreshCw, BookOpen, School, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Motion from '@/components/ui/motion';
import ExamSelection from '@/components/onboarding/ExamSelection';
import StudyHoursSelection from '@/components/onboarding/StudyHoursSelection';
import Chip from '@/components/ui/chip';
import YearSelection from '@/components/onboarding/YearSelection';
import TopicSelection from '@/components/onboarding/TopicSelection';
import { useRouter } from 'next/navigation';
import { TextFormator } from '@/utils/textFormator';
import PhoneSection from './PhoneSection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from '@/utils/api';

const DashboardPreview = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcess, setCurrentProcess] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errorDialog, setErrorDialog] = useState({ show: false, message: '' });

  
  const { 
    phone,
    examCode,
    gradeLevel,
    targetYear, 
    studyHoursPerDay, 
    selectedTopics,
    resetOnboarding
  } = useOnboardingStore();

  const processSteps = [
    { id: 'profile', label: 'Setting up your profile', duration: 800 },
    { id: 'plan', label: 'Creating your study plan', duration: 1000 },
    { id: 'content', label: 'Generating practice content', duration: 1200 },
    { id: 'finalize', label: 'Finalizing your dashboard', duration: 600 }
  ];

  const simulateProgress = async (steps) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentProcess(step.label);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      setCompletedSteps(prev => [...prev, step.id]);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleOnBoarding = async() => {
    setIsProcessing(true);
    
    try {
      const progressPromise = simulateProgress(processSteps);
      
      const onboardingResponse = await api.post('/onboarding', {
        phone,
        examCode,
        gradeLevel,
        targetYear,
        studyHoursPerDay,
        selectedTopics
      });
      
      if (onboardingResponse.data.success) {
        let sessionCreated = false;
        let retryCount = 0;
        const maxRetries = 1;

        while (!sessionCreated && retryCount <= maxRetries) {
          try {
            await api.post('/onboarding/session');
            sessionCreated = true;
          } catch (sessionError) {
            retryCount++;
            if (retryCount > maxRetries) {
              throw new Error('Failed to create session after retry');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      await progressPromise;
      
      if(onboardingResponse.data.success) {
        
        setCurrentProcess('Complete! Redirecting...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
      setIsProcessing(false);
      
      const errorMessage = error.message === 'Failed to create session after retry' 
        ? "We're having trouble setting up your session. Please try again in a few moments."
        : "Something went wrong during the setup process. Please try again.";
      
      setErrorDialog({ show: true, message: errorMessage });
    }
  };

  if (isProcessing) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 yellow-gradient">
          <Motion animation="scale-in" className="onboarding-card">
            <div className="text-center space-y-6">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
                {currentProcess.includes('Complete') ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Setting Up Your Learning Experience</h2>
                <p className="text-muted-foreground text-sm">{currentProcess}</p>
              </div>
              
              <div className="space-y-3 max-w-sm mx-auto">
                {processSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500' 
                        : currentProcess === step.label 
                          ? 'bg-primary' 
                          : 'bg-gray-200'
                    }`}>
                      {completedSteps.includes(step.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                      {currentProcess === step.label && !completedSteps.includes(step.id) && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      completedSteps.includes(step.id) || currentProcess === step.label
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Motion>
        </div>
        <Dialog open={errorDialog.show} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, show: open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive text-base ">
                <AlertCircle className="h-5 w-5" />
                Error
              </DialogTitle>
              <DialogDescription>
                {errorDialog.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setErrorDialog({ show: false, message: '' });
                  router.push('/');
                }}
              >
                Go Back
              </Button>
              <Button 
                onClick={() => {
                  setErrorDialog({ show: false, message: '' });
                  handleOnBoarding();
                }}
              >
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 yellow-gradient">
      <Motion animation="scale-in" className="onboarding-card">
        <Motion animation="slide-in-up" className="text-center mb-6">
          <div className="mb-4 mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Your Learning Plan is Ready!</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            We've created a personalized study plan based on your preferences.
          </p>
        </Motion>

        <Motion animation="slide-in-up" delay={150} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          

          <Card className="bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Grade Level</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center">
                <School className="h-4 w-4 text-primary mr-1" />
                <div className="text-lg font-bold"> {TextFormator(gradeLevel)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Target Year</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-primary mr-1" />
                <div className="text-lg font-bold">{targetYear}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Daily Study</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-primary mr-1" />
                <div className="text-lg font-bold">{studyHoursPerDay} hrs</div>
              </div>
            </CardContent>
          </Card>
        </Motion>

        <Motion animation="slide-in-up" delay={200} className="mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Topics You're Learning</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <Chip
                    key={topic.id}
                    variant="secondary"
                    size="sm"
                    icon={<BookOpen className="h-3 w-3" />}
                  >
                    {topic.name}
                  </Chip>
                ))}
              </div>
            </CardContent>
          </Card>
        </Motion>

        <Motion animation="slide-in-up" delay={250} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={resetOnboarding}
            size="sm"
            disabled={isProcessing}
          >
            <RefreshCw className="h-3 w-3" />
            Start Over
          </Button>
          
          <Button 
            className="gap-2" 
            size="sm"
            onClick={handleOnBoarding}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Setting Up...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </Motion>
      </Motion>
    </div>
  );
};

const OnboardingIndex: React.FC = () => {
  const { currentStep, isCompleted } = useOnboardingStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        useOnboardingStore.getState().resetOnboarding();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isCompleted) {
    return <DashboardPreview />;
  }

  switch (currentStep) {
    case 'phone':
        return <PhoneSection/>
    case 'exam':
      return <ExamSelection />;
    case 'grade':
      return <GradeSelection />;
    case 'year':
      return <YearSelection />;
    case 'studyHours':
      return <StudyHoursSelection />;
    case 'topics':
      return <TopicSelection />;
    default:
      return <ExamSelection />;
  }
};

export default OnboardingIndex;