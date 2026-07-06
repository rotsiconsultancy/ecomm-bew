import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

export const tiptapExtensions = [
  StarterKit.configure({
    link: false,
    underline: false,
  }),
  Underline,
  TiptapImage.configure({ inline: false }),
  TiptapLink.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'text-[#ff5f14] underline' },
  }),
]
