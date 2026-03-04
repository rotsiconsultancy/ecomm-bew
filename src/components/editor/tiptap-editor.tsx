'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Heading2, Heading3, Image as ImageIcon,
  Minus, Undo, Redo, Code,
} from 'lucide-react'

interface TiptapEditorProps {
  content: object | null
  onChange: (content: object) => void
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-[#003366] text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#ec5b13] underline' } }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: [
          'prose prose-slate max-w-none min-h-96 px-6 py-5 outline-none',
          'prose-headings:text-[#003366] prose-headings:font-bold',
          'prose-a:text-[#ec5b13] prose-a:underline',
          'prose-img:rounded-xl prose-img:shadow-md',
          'prose-code:bg-slate-100 prose-code:rounded prose-code:px-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-[#ec5b13] prose-blockquote:pl-4 prose-blockquote:italic',
        ].join(' '),
      },
    },
  })

  if (!editor) return null

  function addLink() {
    const url = window.prompt('Enter URL:')
    if (!url) return
    // editor?.chain().focus().extendMarkToLink({ href: url }).run()
    editor?.chain().focus().setLink({ href: url }).run()
  }

  function addImage() {
    const url = window.prompt('Enter image URL:')
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#003366]/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title="Add link" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Add image" onClick={addImage}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Word count footer */}
      <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 flex justify-end">
        {editor.storage.characterCount?.words?.() ?? 0} words
      </div>
    </div>
  )
}
