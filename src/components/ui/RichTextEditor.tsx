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
    
    // Get both HTML and plain text
    const htmlData = e.clipboardData.getData('text/html')
    const textData = e.clipboardData.getData('text/plain')
    
    let pasteContent = ''
    
    if (htmlData) {
      // Clean HTML while preserving formatting
      pasteContent = htmlData
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style blocks
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .replace(/<meta[^>]*>/gi, '') // Remove meta tags
        .replace(/<link[^>]*>/gi, '') // Remove link tags
    } else if (textData) {
      // Convert plain text to HTML with line breaks
      pasteContent = textData
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
    
    if (pasteContent && editorRef.current) {
      // Insert the content
      editorRef.current.focus()
      
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        const fragment = document.createRange().createContextualFragment(pasteContent)
        range.insertNode(fragment)
        
        // Move cursor to end of inserted content
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        // If no selection, append to end
        editorRef.current.innerHTML += pasteContent
      }
      
      // Update content
      onChange(editorRef.current.innerHTML)
    }
  }

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // Sync content from props (but avoid infinite loops)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== content) {
        editorRef.current.innerHTML = content || ''
      }
    }
  }, [content])

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Enhanced Editor with better paste handling */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
          isFocused ? 'outline-none' : ''
        }`}
        style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5'
        }}
        suppressContentEditableWarning={true}
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
            <p className="font-medium text-blue-900 mb-1">Smart Copy & Paste:</p>
            <div className="text-blue-700 space-y-1">
              <p>• <strong>Rich Text:</strong> Copy formatted text from anywhere and it will preserve <strong>bold</strong>, <em>italic</em>, and other formatting</p>
              <p>• <strong>Tables:</strong> Copy from Excel, Google Sheets, or websites - table structure preserved</p>
              <p>• <strong>Lists:</strong> Bullet points and numbered lists maintain their structure</p>
              <p>• <strong>Links:</strong> Copy text with links and they'll remain clickable</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS for better formatting */}
      <style jsx>{`
        [contenteditable] {
          outline: none;
        }
        
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          font-style: italic;
        }
        
        /* Table styling */
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
          border: 1px solid #d1d5db;
        }
        
        [contenteditable] table td,
        [contenteditable] table th {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }
        
        [contenteditable] table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        [contenteditable] table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        /* List styling */
        [contenteditable] ul, 
        [contenteditable] ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        
        [contenteditable] li {
          margin: 4px 0;
          line-height: 1.5;
        }
        
        /* Text formatting */
        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 600;
        }
        
        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
        
        /* Links */
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        /* Paragraphs and line breaks */
        [contenteditable] p {
          margin: 8px 0;
        }
        
        [contenteditable] br {
          line-height: 1.5;
        }
        
        /* Headers */
        [contenteditable] h1, [contenteditable] h2, [contenteditable] h3 {
          font-weight: 600;
          margin: 12px 0 8px 0;
        }
        
        [contenteditable] h1 { font-size: 1.2em; }
        [contenteditable] h2 { font-size: 1.1em; }
        [contenteditable] h3 { font-size: 1.05em; }
      `}</style>
    </div>
  )
}

export default RichTextEditor