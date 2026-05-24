'use client'

import { useState } from 'react'
import { FiGitBranch, FiClock, FiRotateCcw } from 'react-icons/fi'

interface Version {
  id: string
  versionNumber: number
  title: string
  content: string
  promptText: string
  changelog: string | null
  createdAt: Date
}

interface PromptVersionHistoryProps {
  versions: Version[]
  onRestore?: (versionNumber: number) => void
}

export function PromptVersionHistory({ versions, onRestore }: PromptVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(
    versions.length > 0 ? versions[0].versionNumber : null
  )

  if (!versions || versions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
        <FiGitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No version history yet</p>
        <p className="text-gray-500 text-sm mt-1">Versions will appear when you update this prompt</p>
      </div>
    )
  }

  const selected = versions.find(v => v.versionNumber === selectedVersion)

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
      <div className="flex items-center space-x-2 text-gray-300 mb-4 pb-3 border-b border-gray-800">
        <FiGitBranch className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold">Version History</h3>
        <span className="text-xs text-gray-500 ml-2">{versions.length} versions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Version List */}
        <div className="md:col-span-1 space-y-2 max-h-96 overflow-y-auto">
          {versions.map((version) => (
            <button
              key={version.versionNumber}
              onClick={() => setSelectedVersion(version.versionNumber)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                selectedVersion === version.versionNumber
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-sm ${
                  selectedVersion === version.versionNumber ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  v{version.versionNumber}
                </span>
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <p className="text-sm text-white mt-1 truncate">{version.title}</p>
              {version.changelog && (
                <p className="text-xs text-gray-500 mt-1 truncate">{version.changelog}</p>
              )}
            </button>
          ))}
        </div>

        {/* Version Details */}
        {selected && (
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{selected.title}</h4>
                {onRestore && (
                  <button
                    onClick={() => onRestore(selected.versionNumber)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm flex items-center space-x-1"
                  >
                    <FiRotateCcw className="w-3 h-3" />
                    <span>Restore v{selected.versionNumber}</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Content Preview</h5>
                  <div className="prose prose-invert max-w-none text-sm bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: selected.content.substring(0, 500) + (selected.content.length > 500 ? '...' : '') }} />
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Prompt Text Preview</h5>
                  <pre className="bg-gray-900 rounded-lg p-3 text-gray-300 text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selected.promptText.substring(0, 200)}{selected.promptText.length > 200 ? '...' : ''}
                  </pre>
                </div>
                
                {selected.changelog && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Changelog</h5>
                    <p className="text-gray-300 text-sm bg-gray-900 rounded-lg p-3">{selected.changelog}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  Created: {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}