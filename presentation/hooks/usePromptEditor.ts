import { useState, useCallback, useMemo } from 'react'

interface PromptEditorState {
  title: string
  content: string
  description: string
  promptText: string
  visibility: 'public' | 'unlisted' | 'private'
  tags: string[]
  isDraft: boolean
}

interface UsePromptEditorProps {
  initialData?: Partial<PromptEditorState>
  onSave?: (data: PromptEditorState) => void
  autoSave?: boolean
  autoSaveInterval?: number
}

export function usePromptEditor({ initialData, onSave, autoSave = false, autoSaveInterval = 30000 }: UsePromptEditorProps = {}) {
  const [state, setState] = useState<PromptEditorState>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    description: initialData?.description || '',
    promptText: initialData?.promptText || '',
    visibility: initialData?.visibility || 'public',
    tags: initialData?.tags || [],
    isDraft: initialData?.isDraft !== undefined ? initialData.isDraft : true
  })

  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback(<K extends keyof PromptEditorState>(field: K, value: PromptEditorState[K]) => {
    setState(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!state.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (state.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (state.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!state.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (state.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters'
    } else if (state.content.length > 10000) {
      newErrors.content = 'Content must be less than 10000 characters'
    }

    if (!state.promptText.trim()) {
      newErrors.promptText = 'Prompt text is required'
    } else if (state.promptText.length > 5000) {
      newErrors.promptText = 'Prompt text must be less than 5000 characters'
    }

    if (state.description && state.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (state.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed'
    }

    for (const tag of state.tags) {
      if (tag.length > 30) {
        newErrors.tags = 'Each tag must be less than 30 characters'
        break
      }
      if (!/^[a-zA-Z0-9\-\_\u4e00-\u9fff]+$/.test(tag)) {
        newErrors.tags = 'Tags can only contain letters, numbers, hyphens, underscores, and Chinese characters'
        break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [state])

  const save = useCallback(async () => {
    if (!validate()) {
      return false
    }

    if (onSave) {
      await onSave(state)
      setIsDirty(false)
    }
    return true
  }, [state, validate, onSave])

  const reset = useCallback(() => {
    setState({
      title: initialData?.title || '',
      content: initialData?.content || '',
      description: initialData?.description || '',
      promptText: initialData?.promptText || '',
      visibility: initialData?.visibility || 'public',
      tags: initialData?.tags || [],
      isDraft: initialData?.isDraft !== undefined ? initialData.isDraft : true
    })
    setIsDirty(false)
    setErrors({})
  }, [initialData])

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag) return
    
    if (state.tags.includes(trimmedTag)) {
      setErrors(prev => ({ ...prev, tags: 'Tag already exists' }))
      return
    }
    
    if (state.tags.length >= 10) {
      setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }))
      return
    }
    
    setState(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }))
    setIsDirty(true)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.tags
      return newErrors
    })
  }, [state.tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
    setIsDirty(true)
  }, [])

  // Auto-save
  useMemo(() => {
    if (autoSave && isDirty) {
      const interval = setInterval(() => {
        if (isDirty && validate()) {
          save()
        }
      }, autoSaveInterval)

      return () => clearInterval(interval)
    }
  }, [autoSave, autoSaveInterval, isDirty, save, validate])

  return {
    state,
    updateField,
    errors,
    isDirty,
    validate,
    save,
    reset,
    addTag,
    removeTag,
    setState
  }
}