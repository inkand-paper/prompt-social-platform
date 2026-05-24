'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  avatarUrl: string | null
  username: string
  onUpload: (file: File) => Promise<void>
  onRemove: () => Promise<void>
  isLoading?: boolean
}

export function AvatarUpload({ avatarUrl, username, onUpload, onRemove, isLoading = false }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      await onUpload(file)
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!avatarUrl) return
    setUploading(true)
    try {
      await onRemove()
      toast.success('Avatar removed successfully!')
    } catch (error) {
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            fill
            sizes="(max-width: 128px) 128px, 128px"
            className="object-cover"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {username[0].toUpperCase()}
            </span>
          </div>
        )}
        
        {(uploading || isLoading) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 flex gap-2">
        <label className="cursor-pointer p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors border border-gray-600">
          <Camera className="w-4 h-4 text-white" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || isLoading}
          />
        </label>
        
        {avatarUrl && (
          <button
            onClick={handleRemove}
            disabled={uploading || isLoading}
            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors border border-red-500"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}