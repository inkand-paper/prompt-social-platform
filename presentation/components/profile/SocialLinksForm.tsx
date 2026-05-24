'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { FaGithub, FaTwitter, FaLinkedin, FaGlobe } from 'react-icons/fa'

interface SocialLinksFormProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export function SocialLinksForm({ register, errors }: SocialLinksFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Social Links</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <FaGithub className="w-4 h-4" />
            <span>GitHub</span>
          </div>
        </label>
        <input
          {...register('github')}
          type="url"
          placeholder="https://github.com/username"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        {errors.github && (
          <p className="text-red-500 text-sm mt-1">{errors.github.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <FaTwitter className="w-4 h-4" />
            <span>Twitter/X</span>
          </div>
        </label>
        <input
          {...register('twitter')}
          type="url"
          placeholder="https://twitter.com/username"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        {errors.twitter && (
          <p className="text-red-500 text-sm mt-1">{errors.twitter.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <FaLinkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </div>
        </label>
        <input
          {...register('linkedin')}
          type="url"
          placeholder="https://linkedin.com/in/username"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        {errors.linkedin && (
          <p className="text-red-500 text-sm mt-1">{errors.linkedin.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <FaGlobe className="w-4 h-4" />
            <span>Website</span>
          </div>
        </label>
        <input
          {...register('website')}
          type="url"
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        {errors.website && (
          <p className="text-red-500 text-sm mt-1">{errors.website.message as string}</p>
        )}
      </div>
    </div>
  )
}