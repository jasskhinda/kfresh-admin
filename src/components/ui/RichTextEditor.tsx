'use client'

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
  // Simplified version - enhanced textarea for now to avoid layout issues
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        value={content || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
      />
      
      {description && (
        <p className="text-xs text-gray-500 mt-2">
          {description}
        </p>
      )}

      {/* Instructions for copy/paste */}
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        💡 <strong>Copy & Paste Ready:</strong> You can paste formatted content, tables, lists, and HTML directly into this field.
      </div>
    </div>
  )
}

export default RichTextEditor