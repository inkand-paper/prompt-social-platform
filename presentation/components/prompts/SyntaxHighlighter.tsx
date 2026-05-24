'use client'

import { useEffect, useState } from 'react'

interface CodeHighlighterProps {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export function CodeHighlighter({ code, language = 'text', showLineNumbers = false }: CodeHighlighterProps) {
  const [highlighted, setHighlighted] = useState<string>(code)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simple syntax highlighting without external library
    const highlightCode = () => {
      let result = escapeHtml(code)
      
      // Highlight comments
      result = result.replace(/(\/\/.*$)/gm, '<span class="text-green-500">$1</span>')
      
      // Highlight strings
      result = result.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-yellow-500">$&</span>')
      
      // Highlight numbers
      result = result.replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
      
      // Highlight keywords
      const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'from', 'export', 'default', 'class', 'extends', 'super', 'this', 'new', 'try', 'catch', 'finally', 'throw', 'async', 'await']
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
        result = result.replace(regex, '<span class="text-purple-400">$1</span>')
      })
      
      // Add line numbers if requested
      if (showLineNumbers) {
        const lines = result.split('\n')
        const numberedLines = lines.map((line, index) => {
          return `<div class="flex">
            <span class="text-gray-600 select-none w-8 text-right pr-2">${index + 1}</span>
            <span class="flex-1">${line || ' '}</span>
          </div>`
        }).join('')
        result = numberedLines
      } else {
        result = `<div>${result}</div>`
      }
      
      setHighlighted(result)
      setLoading(false)
    }
    
    highlightCode()
  }, [code, showLineNumbers])

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  if (loading) {
    return <div className="bg-gray-800 rounded-lg p-4 text-gray-400">Loading syntax highlighter...</div>
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
        <span className="text-xs text-gray-400">{language}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre 
          className="text-sm font-mono text-gray-300 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  )
}