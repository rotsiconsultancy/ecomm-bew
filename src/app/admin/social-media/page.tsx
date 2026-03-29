import { getAdminContext } from '@/lib/auth'
import SocialMediaTool from './social-media-tool'

export default async function SocialMediaPage() {
  await getAdminContext()
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold text-[#003366] tracking-tight">Social Media Management</h1>
        <p className="text-gray-500 mt-2">Generate branded posters for your social media platforms.</p>
      </div>

      <SocialMediaTool />
    </div>
  )
}
