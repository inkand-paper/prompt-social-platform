'use client'

import { UseFormRegister } from 'react-hook-form'

interface PrivacySettingsProps {
  register: UseFormRegister<any>
}

export function PrivacySettings({ register }: PrivacySettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
      
      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-white font-medium">Private Profile</p>
          <p className="text-sm text-gray-400">Only followers can see your prompts and activity</p>
        </div>
        <input
          {...register('isPrivate')}
          type="checkbox"
          className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
        />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-white font-medium">Show Email on Profile</p>
          <p className="text-sm text-gray-400">Display your email address publicly</p>
        </div>
        <input
          {...register('showEmail')}
          type="checkbox"
          className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
        />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-white font-medium">Email Notifications</p>
          <p className="text-sm text-gray-400">Receive notifications about likes, comments, and follows</p>
        </div>
        <input
          {...register('emailNotifications')}
          type="checkbox"
          className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
        />
      </label>
    </div>
  )
}