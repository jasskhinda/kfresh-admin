'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Table as TableIcon,
  Undo2, 
  Redo2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'

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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-4 border border-gray-300 rounded-lg',
      },
    },
  })

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
  }

  const addTable = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    }
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
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bold') ? 'bg-gray-300' : ''
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-gray-300' : ''
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <select
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => {
              const level = parseInt(e.target.value)
              if (level === 0) {
                editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
              }
            }}
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={addTable}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-200"
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-200"
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border-x border-b border-gray-300 rounded-b-lg min-h-[120px] bg-white">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div className="absolute pointer-events-none text-gray-400 p-4 text-sm">
            {placeholder}
          </div>
        )}
      </div>

      {/* Table Controls - Only show when cursor is in a table */}
      {editor.isActive('table') && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 mb-2">Table Controls:</p>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Row Above
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Row Below
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Column Left
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Column Right
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Table
            </button>
          </div>
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 mt-2">
          {description}
        </p>
      )}

      {/* Paste Instructions */}
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800 font-medium">✨ WordPress-style Copy & Paste:</p>
        <ul className="text-xs text-green-700 mt-1 space-y-1">
          <li>• Paste from Excel/Google Sheets → Automatically becomes a table</li>
          <li>• Paste from Word/Google Docs → Keeps formatting (bold, italic, lists)</li>
          <li>• Paste HTML → Preserves structure and styling</li>
          <li>• Paste plain text → Clean formatting applied</li>
        </ul>
      </div>
    </div>
  )
}

export default RichTextEditor