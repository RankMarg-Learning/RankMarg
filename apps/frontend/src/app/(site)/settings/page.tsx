import { Label } from '@/components/ui/label'
import { Checkbox } from '@radix-ui/react-checkbox'
import { Clock } from 'lucide-react'
import React from 'react'

const Setting = () => {
  return (
    <div className="mt-8 pt-6 border-t border-neutral-200/20">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-md font-medium text-gray-700">Notification Preferences</h4>
      <div className="flex items-center text-amber-600">
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">Coming Soon</span>
      </div>
    </div>
    <div className="space-y-3 opacity-60">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Checkbox id="email-notifications" disabled />
        </div>
        <div className="ml-3 text-sm">
          <Label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</Label>
          <p className="text-gray-500">Receive test results, reminders, and progress reports via email</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Checkbox id="study-reminders" disabled />
        </div>
        <div className="ml-3 text-sm">
          <Label htmlFor="study-reminders" className="font-medium text-gray-700">Study Reminders</Label>
          <p className="text-gray-500">Get daily reminders to complete your study goals</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Checkbox id="performance-updates" disabled />
        </div>
        <div className="ml-3 text-sm">
          <Label htmlFor="performance-updates" className="font-medium text-gray-700">Performance Updates</Label>
          <p className="text-gray-500">Receive weekly performance analysis and improvement suggestions</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Checkbox id="new-content" disabled />
        </div>
        <div className="ml-3 text-sm">
          <Label htmlFor="new-content" className="font-medium text-gray-700">New Content Alerts</Label>
          <p className="text-gray-500">Be notified when new study materials are added for your subjects</p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Setting