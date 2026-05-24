'use client'

import { FiGlobe, FiLink, FiLock } from 'react-icons/fi'

interface PromptVisibilitySelectorProps {
  value: 'public' | 'unlisted' | 'private'
  onChange: (value: 'public' | 'unlisted' | 'private') => void
}

export function PromptVisibilitySelector({ value, onChange }: PromptVisibilitySelectorProps) {
  const options = [
    {
      value: 'public' as const,
      label: 'Public',
      description: 'Anyone can see this prompt',
      icon: FiGlobe
    },
    {
      value: 'unlisted' as const,
      label: 'Unlisted',
      description: 'Only people with the link can see',
      icon: FiLink
    },
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Only you can see this prompt',
      icon: FiLock
    }
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Visibility
      </label>
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.value
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 ${
                  isSelected ? 'text-purple-500' : 'text-gray-400'
                }`} />
                <div>
                  <p className={`font-medium ${
                    isSelected ? 'text-purple-400' : 'text-white'
                  }`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}