'use client'

import { useState } from 'react'
import { usePromptEditor } from '@/presentation/hooks/usePromptEditor'
import { PromptTagsInput } from './PromptTagsInput'
import { PromptVisibilitySelector } from './PromptVisibilitySelector'
import { PromptTester } from './PromptTester'
import { PromptScoreFeedback } from './PromptScoreFeedback'
import { FiSave, FiSend, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'

interface PromptEditorProps {
  initialData?: {
    id?: string
    title?: string
    content?: string
    description?: string
    promptText?: string
    visibility?: 'public' | 'unlisted' | 'private'
    tags?: string[]
    isDraft?: boolean
  }
  onSave: (data: any) => Promise<void>
  onPublish?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  isLoading?: boolean
}

export function PromptEditor({ initialData, onSave, onPublish, onDelete, isLoading = false }: PromptEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const { state, updateField, errors, isDirty, save, addTag, removeTag } = usePromptEditor({
    initialData,
    onSave
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await save()
  }

  const handlePublish = async () => {
    if (initialData?.id && onPublish) {
      await onPublish(initialData.id)
    }
  }

  const handleDelete = async () => {
    if (initialData?.id && onDelete && confirm('Are you sure you want to delete this prompt?')) {
      await onDelete(initialData.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiSave className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
          
          {initialData?.id && state.isDraft && onPublish && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span>Publish</span>
            </button>
          )}
          
          {initialData?.id && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center space-x-2"
        >
          {showPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          <span>{showPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      {showPreview ? (
        // Preview Mode
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-4">{state.title || 'Untitled'}</h1>
            {state.description && (
              <p className="text-gray-400 mb-4">{state.description}</p>
            )}
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: state.content }} />
            </div>
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Prompt Text:</h3>
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {state.promptText}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter a descriptive title"
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-white ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={state.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of your prompt"
              rows={2}
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-white ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Content (Rich Text) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={state.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Write the main content of your prompt..."
              rows={10}
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 font-mono text-white ${
                errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
              }`}
            />
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {state.content.length}/10000 characters
            </p>
          </div>

          {/* Prompt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Text *
            </label>
            <textarea
              value={state.promptText}
              onChange={(e) => updateField('promptText', e.target.value)}
              placeholder="The actual prompt text that users will copy..."
              rows={5}
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 font-mono text-white ${
                errors.promptText ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
              }`}
            />
            {errors.promptText && <p className="mt-1 text-sm text-red-500">{errors.promptText}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {state.promptText.length}/5000 characters
            </p>
          </div>

          {/* AI Testing & Scoring */}
          {state.promptText.trim().length > 0 && (
            <div className="space-y-6">
              <PromptTester promptText={state.promptText} />
              <PromptScoreFeedback promptText={state.promptText} />
            </div>
          )}

          {/* Tags & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PromptTagsInput
              tags={state.tags}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              error={errors.tags}
            />
            
            <PromptVisibilitySelector
              value={state.visibility}
              onChange={(value) => updateField('visibility', value)}
            />
          </div>
        </>
      )}

      {/* Status Indicator */}
      {isDirty && (
        <div className="text-sm text-yellow-500 flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Unsaved changes</span>
        </div>
      )}
    </form>
  )
}