'use client'

import { useState, useEffect } from 'react'
import { User } from '@/core/entities/User'
import { IUserRepository } from '@/core/repositories/IUserRepository'
import { ProfileService } from '@/application/services/ProfileService'

export function useProfile(profileRepository: IUserRepository) {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profileService = new ProfileService(profileRepository)

  const fetchProfileByUsername = async (username: string) => {
    setLoading(true)
    setError(null)
    try {
      const user = await profileService.getProfileByUsername(username)
      setProfile(user)
      if (!user) {
        setError('User not found')
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileByUserId = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const user = await profileService.getProfileByUserId(userId)
      setProfile(user)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (userId: string, updates: Partial<User>) => {
    try {
      const updated = await profileService.updateProfile(userId, updates)
      setProfile(updated)
      return updated
    } catch (err) {
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfileByUsername,
    fetchProfileByUserId,
    updateProfile,
  }
}