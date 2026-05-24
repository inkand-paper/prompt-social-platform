'use client'

import { supabase } from '@/infrastructure/database/SupabaseClient'

import { useState, useCallback } from 'react'
import { PromptService } from '@/application/services/PromptService'
import { SupabasePromptRepository } from '@/infrastructure/repositories/SupabasePromptRepository'
import { SupabasePromptVersionRepository } from '@/infrastructure/repositories/SupabasePromptVersionRepository'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { CreatePromptDTO, UpdatePromptDTO } from '@/application/dto/CreatePromptDTO'

const promptRepository = new SupabasePromptRepository()
const versionRepository = new SupabasePromptVersionRepository()
const tagRepository = new SupabaseTagRepository()
const userRepository = new SupabaseUserRepository()

const promptService = new PromptService(
  promptRepository,
  versionRepository,
  tagRepository,
  userRepository
)

export function usePrompts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPrompt = useCallback(async (userId: string, data: CreatePromptDTO) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.createPrompt(userId, data)
      if (!result.success) {
        setError(result.error?.message || 'Failed to create prompt')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const getPrompt = useCallback(async (promptId: string, viewerId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.getPrompt(promptId, viewerId)
      if (!result.success) {
        setError(result.error?.message || 'Failed to fetch prompt')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserPrompts = useCallback(async (userId: string, page: number = 1, limit: number = 10) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.getUserPrompts(userId, page, limit)
      if (!result.success) {
        setError(result.error?.message || 'Failed to fetch user prompts')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message }, data: { prompts: [], total: 0 } }
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePrompt = useCallback(async (promptId: string, userId: string, data: UpdatePromptDTO) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.updatePrompt(promptId, userId, data)
      if (!result.success) {
        setError(result.error?.message || 'Failed to update prompt')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePrompt = useCallback(async (promptId: string, userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.deletePrompt(promptId, userId)
      if (!result.success) {
        setError(result.error?.message || 'Failed to delete prompt')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserStats = useCallback(async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, is_draft, view_count')
      .eq('user_id', userId)

    if (error) throw error

    const total = data.length
    const published = data.filter((p: any) => !p.is_draft).length
    const drafts = data.filter((p: any) => p.is_draft).length
    const totalViews = data.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)

    return {
      success: true,
      data: { total, published, drafts, totalViews }
    }
  } catch (error: any) {
    return { success: false, error }
  }
}, [])

  const publishPrompt = useCallback(async (promptId: string, userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.publishPrompt(promptId, userId)
      if (!result.success) {
        setError(result.error?.message || 'Failed to publish prompt')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const saveAsDraft = useCallback(async (promptId: string, userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.saveAsDraft(promptId, userId)
      if (!result.success) {
        setError(result.error?.message || 'Failed to save as draft')
      }
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message } }
    } finally {
      setLoading(false)
    }
  }, [])

  const getVersions = useCallback(async (promptId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promptService.getPromptVersions(promptId)
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: { message: err.message }, data: [] }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createPrompt,
    getPrompt,
    updatePrompt,
    deletePrompt,
    getUserStats,
    getUserPrompts,
    publishPrompt,
    saveAsDraft,
    getVersions
  }
}