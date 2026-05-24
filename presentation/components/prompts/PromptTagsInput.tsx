'use client'

import { useState } from 'react'
import { FiX, FiHash } from 'react-icons/fi'

interface PromptTagsInputProps {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  error?: string
}

export function PromptTagsInput({ tags, onAddTag, onRemoveTag, error }: PromptTagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = inputValue.trim()
      if (tag) {
        onAddTag(tag)
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1])
    }
  }

  const handleBlur = () => {
    const tag = inputValue.trim()
    if (tag) {
      onAddTag(tag)
      setInputValue('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Tags (max 10)
      </label>
      <div className={`bg-gray-900 border rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-700'
      }`}>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded-md text-sm"
            >
              <FiHash className="w-3 h-3" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-purple-200 transition"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? "Add tags (press Enter or comma)" : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-white text-sm"
            disabled={tags.length >= 10}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">
        {tags.length}/10 tags used
      </p>
    </div>
  )
}