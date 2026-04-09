import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = '开始输入内容...',
  editable = true,
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const addImage = () => {
    const url = window.prompt('请输入图片URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const MenuBar = () => (
    <div className="border-b p-2 flex flex-wrap gap-1 items-center">
      <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          size="sm"
        >
          <Bold className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
        >
          <Italic className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          size="sm"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          size="sm"
        >
          <Strikethrough className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          size="sm"
        >
          <Code className="w-4 h-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          size="sm"
        >
          <Heading1 className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          size="sm"
        >
          <Heading2 className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          size="sm"
        >
          <Heading3 className="w-4 h-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          size="sm"
        >
          <List className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          size="sm"
        >
          <ListOrdered className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          size="sm"
        >
          <Quote className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          size="sm"
        >
          <Code2 className="w-4 h-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          size="sm"
        >
          <AlignLeft className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          size="sm"
        >
          <AlignCenter className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          size="sm"
        >
          <AlignRight className="w-4 h-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(!showLinkDialog)}>
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {showLinkDialog && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="px-2 py-1 text-sm border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLink()
              }
            }}
          />
          <Button size="sm" onClick={addLink}>
            添加
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <MenuBar />}
      <EditorContent editor={editor} />
    </div>
  )
}