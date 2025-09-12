'use client'

import { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  label?: string
  description?: string
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start typing or paste content...",
  className = "",
  label,
  description 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Handle paste events to preserve formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain')
    
    if (paste) {
      // Clean up the HTML while preserving basic formatting
      const cleanHtml = paste
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
        .replace(/style="[^"]*"/gi, '') // Remove inline styles but keep structure
      
      // Insert at cursor position or replace selection
      if (editorRef.current) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(document.createRange().createContextualFragment(cleanHtml))
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        
        // Update content
        onChange(editorRef.current.innerHTML)
      }
    }
  }

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // Sync content from props
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  // Toolbar functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    editorRef.current?.focus()
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 underline"
          title="Underline"
        >
          U
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:')
            if (url) execCommand('createLink', url)
          }}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          title="Add Link"
        >
          🔗 Link
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          title="Clear Formatting"
        >
          ⌫ Clear
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full min-h-[150px] px-3 py-2 border-l border-r border-b border-gray-300 rounded-b-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm prose prose-sm max-w-none ${
          isFocused ? 'outline-none' : ''
        }`}
        style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
        dangerouslySetInnerHTML={{ __html: content || '' }}
        data-placeholder={!content ? placeholder : ''}
      />
      
      {description && (
        <p className="text-xs text-gray-500 mt-2">
          {description}
        </p>
      )}

      {/* Enhanced Instructions */}
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">💡</span>
          <div>
            <p className="font-medium text-blue-900 mb-1">Copy & Paste Features:</p>
            <div className="text-blue-700 space-y-1">
              <p>• <strong>Tables:</strong> Copy from Excel, Google Sheets, or any website</p>
              <p>• <strong>Lists:</strong> Bullet points and numbered lists</p>
              <p>• <strong>Formatting:</strong> Bold, italic, links preserved</p>
              <p>• <strong>Rich Content:</strong> HTML content from any source</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for placeholder */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
        }
        [contenteditable] table td,
        [contenteditable] table th {
          border: 1px solid #d1d5db;
          padding: 6px 8px;
        }
        [contenteditable] table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 20px;
          margin: 8px 0;
        }
        [contenteditable] li {
          margin: 2px 0;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor