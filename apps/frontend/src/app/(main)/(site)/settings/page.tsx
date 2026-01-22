"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/common-ui';
import { Label } from '@repo/common-ui';
import { Input } from '@repo/common-ui';
import { Switch } from '@repo/common-ui';
import { Button } from '@repo/common-ui';
import { Separator } from '@repo/common-ui';
import { useToast } from '@/hooks/use-toast';
import { settingService, UserSettings } from '@/services/setting.service';
import { Loader2, Save, RefreshCw, Target, Activity, Crown, ArrowRight } from 'lucide-react';

const Setting = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionsPerDay, setQuestionsPerDay] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const { toast } = useToast();

  // Load user settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for changes whenever values change
  useEffect(() => {
    if (settings) {
      const hasQuestionsChange = questionsPerDay !== settings.questionsPerDay;
      const hasActiveChange = isActive !== settings.isActive;
      
      // If subscription is required, only check for isActive changes
      if (subscriptionRequired) {
        setHasChanges(hasActiveChange);
      } else {
        setHasChanges(hasQuestionsChange || hasActiveChange);
      }
    }
  }, [questionsPerDay, isActive, settings, subscriptionRequired]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setSubscriptionRequired(false);
      const userSettings = await settingService.getUserSettings();
      setSettings(userSettings);
      setQuestionsPerDay(userSettings.questionsPerDay);
      setIsActive(userSettings.isActive);
      
      // Check if subscription is required for full access
      if (userSettings.subscriptionRequired) {
        setSubscriptionRequired(true);
      }
    } catch (error: any) {
      if (error?.message?.includes('subscription required') || error?.response?.status === 403) {
        setSubscriptionRequired(true);
       
      } else {
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);
      
      // If subscription is required, only update isActive
      if (subscriptionRequired) {
        const updatedSettings = await settingService.updateUserSettings({
          isActive,
        });
        setSettings(updatedSettings);
      } else {
        // If subscription is not required, update both settings
        const updatedSettings = await settingService.updateUserSettings({
          questionsPerDay,
          isActive,
        });
        setSettings(updatedSettings);
      }
      
      setHasChanges(false);
      
      toast({
        title: "Success",
        description: "Settings updated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      if (error?.message?.includes('subscription required') || error?.response?.status === 403) {
        setSubscriptionRequired(true);
        
      } else {
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setQuestionsPerDay(settings.questionsPerDay);
      setIsActive(settings.isActive);
      setHasChanges(false);
    }
  };

  const handleQuestionsPerDayChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setQuestionsPerDay(numValue);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (subscriptionRequired) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your study preferences and account settings.
          </p>
        </div>

        {/* Subscription Required Card */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">Premium Feature</CardTitle>
            <CardDescription className="text-amber-700">
              Advanced settings are available with an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-amber-800">
                Unlock powerful customization options to optimize your study experience:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Custom Study Goals</h4>
                    <p className="text-sm text-amber-700">Set your daily question targets (1-50 questions)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Account Management</h4>
                    <p className="text-sm text-amber-700">Control your account status and preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => window.location.href = '/subscription'}
              >
                <Crown className="h-5 w-5 mr-2" />
                View Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
            </div>
          </CardContent>
        </Card>

        {/* Account Status - Available without subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Account Status</span>
            </CardTitle>
            <CardDescription>
              Control your account activity status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="account-status" className="text-base font-medium">
                    Account Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable your account activity.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="account-status"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={saving}
                />
                <span className="text-sm font-medium">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {isActive 
                  ? 'Your account is active and you can participate in all activities.'
                  : 'Your account is inactive. Some features may be limited.'
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences - Requires subscription */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Study Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize your daily study goals (requires subscription).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Questions Per Day
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Set your daily goal for the number of questions to practice.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value="5"
                  disabled
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">questions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your study preferences and account settings.
        </p>
      </div>

      {/* Study Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Study Preferences</span>
          </CardTitle>
          <CardDescription>
            Customize your daily study goals and activity status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Questions Per Day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="questions-per-day" className="text-base font-medium">
                  Questions Per Day
                </Label>
                <p className="text-sm text-muted-foreground">
                  Set your daily goal for the number of questions to practice.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Input
                id="questions-per-day"
                type="number"
                min="1"
                max="50"
                value={questionsPerDay}
                onChange={(e) => handleQuestionsPerDayChange(e.target.value)}
                className="w-24"
                disabled={saving}
              />
              <span className="text-sm text-muted-foreground">questions</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Range: 1-50 questions per day
            </div>
          </div>

          <Separator />

          {/* Account Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="account-status" className="text-base font-medium">
                  Account Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable your account activity.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="account-status"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={saving}
              />
              <span className="text-sm font-medium">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isActive 
                ? 'Your account is active and you can participate in all activities.'
                : 'Your account is inactive. Some features may be limited.'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Manage how you receive updates and reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-60">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="email-notifications"
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive test results, reminders, and progress reports via email
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="study-reminders"
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="study-reminders" className="font-medium">
                  Study Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get daily reminders to complete your study goals
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="performance-updates"
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="performance-updates" className="font-medium">
                  Performance Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly performance analysis and improvement suggestions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="new-content"
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-content" className="font-medium">
                  New Content Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Be notified when new study materials are added for your subjects
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Coming Soon:</strong> Notification preferences will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hasChanges && (
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary-900">
                  You have unsaved changes
                </p>
                <p className="text-xs text-primary-700">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                  className="border-primary-300 text-primary-700 hover:bg-primary-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Settings Summary */}
      {settings && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Current Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions Per Day:</span>
                <span className="ml-2">{settings.questionsPerDay}</span>
              </div>
              <div>
                <span className="font-medium">Account Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  settings.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {settings.updatedAt && (
                <div className="md:col-span-2">
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">
                    {new Date(settings.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Setting;