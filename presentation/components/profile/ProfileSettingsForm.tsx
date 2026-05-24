'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@/core/entities/User'
import { AvatarUpload } from './AvatarUpload'
import { SocialLinksForm } from './SocialLinksForm'
import { PrivacySettings } from './PrivacySettings'
import { ProfileService } from '@/application/services/ProfileService'
import { IUserRepository } from '@/core/repositories/IUserRepository'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

const profileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  github: z.string().url('Invalid URL').or(z.string().max(0)).optional(),
  twitter: z.string().url('Invalid URL').or(z.string().max(0)).optional(),
  linkedin: z.string().url('Invalid URL').or(z.string().max(0)).optional(),
  website: z.string().url('Invalid URL').or(z.string().max(0)).optional(),
  isPrivate: z.boolean(),
  showEmail: z.boolean(),
  emailNotifications: z.boolean(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSettingsFormProps {
  user: User
  profileRepository: IUserRepository
  onUpdate: (updatedUser: User) => void
}

export function ProfileSettingsForm({ user, profileRepository, onUpdate }: ProfileSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const profileService = new ProfileService(profileRepository)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName || '',
      bio: user.bio || '',
      location: user.location || '',
      occupation: user.occupation || '',
      github: user.socialLinks.github || '',
      twitter: user.socialLinks.twitter || '',
      linkedin: user.socialLinks.linkedin || '',
      website: user.socialLinks.website || '',
      isPrivate: user.privacy.isPrivate,
      showEmail: user.privacy.showEmail,
      emailNotifications: user.notifications.emailNotifications,
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Update profile basic info
      const updatedProfile = await profileService.updateProfile(user.id, {
        fullName: data.fullName || null,
        bio: data.bio || null,
        location: data.location || null,
        occupation: data.occupation || null,
      })

      // Update social links
      await profileService.updateSocialLinks(user.id, {
        github: data.github || null,
        twitter: data.twitter || null,
        linkedin: data.linkedin || null,
        website: data.website || null,
      })

      // Update privacy settings
      await profileService.updatePrivacySettings(user.id, {
        isPrivate: data.isPrivate,
        showEmail: data.showEmail,
      })

      // Update notification settings
      await profileService.updateNotificationSettings(user.id, {
        emailNotifications: data.emailNotifications,
      })

      // Get the final updated user
      const finalUser = await profileService.getProfileByUserId(user.id)
      if (finalUser) {
        onUpdate(finalUser)
      }
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    const avatarUrl = await profileService.uploadAvatar(user.id, file)
    const updatedUser = { ...user, avatarUrl }
    onUpdate(updatedUser)
  }

  const handleAvatarRemove = async () => {
    await profileService.deleteAvatar(user.id)
    const updatedUser = { ...user, avatarUrl: null }
    onUpdate(updatedUser)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex justify-center">
        <AvatarUpload
          avatarUrl={user.avatarUrl}
          username={user.username}
          onUpload={handleAvatarUpload}
          onRemove={handleAvatarRemove}
          isLoading={isLoading}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            {...register('fullName')}
            type="text"
            placeholder="Your full name"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <input
            {...register('location')}
            type="text"
            placeholder="City, Country"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Occupation
          </label>
          <input
            {...register('occupation')}
            type="text"
            placeholder="AI Engineer, Prompt Designer, etc."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
      </div>

      <SocialLinksForm register={register} errors={errors} />
      <PrivacySettings register={register} />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        Save Changes
      </button>
    </form>
  )
}