import { getAdminContext } from '@/lib/auth'
import SocialMediaTool from './social-media-tool'

export default async function SocialMediaPage() {
  await getAdminContext()
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold text-[#061f3f] tracking-tight">Social Poster Studio</h1>
        <p className="text-gray-500 mt-2">Create Bewama-branded product posters with logo, QR code, offer copy, and export-ready layouts.</p>
      </div>

      <SocialMediaTool />
    </div>
  )
}
