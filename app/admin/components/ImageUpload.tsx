'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  label: string
  disabled?: boolean
  className?: string
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  label,
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }

    const data = await response.json()
    return data.url
  }

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)
      onImageChange(imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled || uploading) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeImage = () => {
    onImageChange('')
    setUrlInput('')
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
          type="button"
        >
          <LinkIcon className="w-3 h-3 mr-1" />
          {showUrlInput ? 'Hide URL' : 'Add URL'}
        </button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400 text-sm"
            disabled={disabled || uploading}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || disabled || uploading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add
          </button>
        </div>
      )}
      
      {currentImage ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-slate-600">
            <Image
              src={currentImage}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm shadow-lg"
                    disabled={uploading}
                    type="button"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    {uploading ? 'Uploading...' : 'Change'}
                  </button>
                  <button
                    onClick={removeImage}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm shadow-lg"
                    disabled={uploading}
                    type="button"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Image URL Display */}
          <div className="mt-2 p-2 bg-slate-700/30 rounded text-xs text-slate-400 truncate">
            {currentImage}
          </div>
        </div>
      ) : (
        <div
          className={`
            relative w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
            ${dragOver ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            bg-slate-800/30
          `}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-400" />
                <p className="text-sm text-white">Uploading image...</p>
                <p className="text-xs text-slate-400 mt-1">Please wait...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                <div className="mt-3 flex items-center text-xs text-slate-500">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload to Cloudinary
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}