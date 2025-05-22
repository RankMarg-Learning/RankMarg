"use client"
import React from 'react';
import useOnboardingStore from '@/store/onboardingStore';
import GradeSelection from '@/components/onboarding/GradeSelection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, GraduationCap, RefreshCw, BookOpen, School } from 'lucide-react';
import Motion from '@/components/ui/motion';
import StreamSelection from '@/components/onboarding/StreamSelection';
import StudyHoursSelection from '@/components/onboarding/StudyHoursSelection';
import Chip from '@/components/ui/chip';
import YearSelection from '@/components/onboarding/YearSelection';
import TopicSelection from '@/components/onboarding/TopicSelection';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {  useSession } from 'next-auth/react';
import { TextFormator } from '@/utils/textFormator';

const DashboardPreview = () => {
  const {  update } = useSession();
  const router = useRouter();
  const { 
    stream, 
    gradeLevel,
    targetYear, 
    studyHoursPerDay, 
    selectedTopics,
    resetOnboarding
  } = useOnboardingStore();

  const handleOnBoarding = async() => {
    try {
      const response = await axios.post('/api/onboarding', {
        stream, 
        gradeLevel,
        targetYear,
        studyHoursPerDay,
        selectedTopics
      });
      if(response.data.success) {
        await update({ isNewUser: false });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
      router.push('/')
      
    }
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
              <CardTitle className="text-xs font-medium text-muted-foreground">Exam Stream</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center">
                <div className="text-lg font-bold">{stream}</div>
              </div>
            </CardContent>
          </Card>

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
          >
            <RefreshCw className="h-3 w-3" />
            Start Over
          </Button>
          
          <Button className="gap-2" size="sm"
            onClick={handleOnBoarding}
          >
            Continue to Dashboard
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Motion>
      </Motion>
    </div>
  );
};

const Index: React.FC = () => {
  const { currentStep, isCompleted } = useOnboardingStore();


  // For demonstration purposes, let's add a button to reset onboarding
  // in a real app, you would remove this
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        useOnboardingStore.getState().resetOnboarding();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render different screens based on onboarding progress
  if (isCompleted) {
    return <DashboardPreview />;
  }

  switch (currentStep) {
    case 'stream':
      return <StreamSelection />;
    case 'grade':
      return <GradeSelection />;
    case 'year':
      return <YearSelection />;
    case 'studyHours':
      return <StudyHoursSelection />;
    case 'topics':
      return <TopicSelection />;
    default:
      return <StreamSelection />;
  }
};

export default Index;