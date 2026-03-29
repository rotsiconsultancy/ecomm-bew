'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
    Search, Download, RefreshCcw, Package, 
    Trash2, Camera, Copy, CheckCircle2, 
    AlertCircle, Award, BadgeDollarSign 
} from 'lucide-react'
import { searchProducts } from './actions'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  images: string[]
}

const SITE_URL = 'https://bewama.com'

type PosterMode = 'price' | 'problem' | 'authority'

export default function SocialMediaTool() {
  const [mode, setMode] = useState<PosterMode>('price')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // -- Form State --
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [productImage, setProductImage] = useState('')
  const [headline, setHeadline] = useState('')
  const [features, setFeatures] = useState('')
  
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // -- Search Handling --
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoadingSearch(true)
        const data = await searchProducts(query)
        setResults(data as Product[])
        setLoadingSearch(false)
      } else {
        setResults([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p)
    setProductName(p.name)
    setProductPrice(`${p.price.toLocaleString()} ${p.currency}`)
    setProductUrl(`${SITE_URL}/products/${p.slug}`)
    setProductImage(p.images?.[0] || '')
    setQuery('')
    setResults([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProductImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // -- Drawing Logic --
  const drawPoster = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Standard high-res square for social media
    canvas.width = 1200
    canvas.height = 1200

    // Loading State: Clear Canvas
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!productImage) {
      ctx.fillStyle = '#003366'
      ctx.font = '32px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Select a product to preview poster', canvas.width / 2, canvas.height / 2)
      return
    }

    // 1. Load Main Image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    // Use proxy for external images to bypass CORS
    const isExternal = productImage.startsWith('http') && !productImage.includes(typeof window !== 'undefined' ? window.location.host : '')
    img.src = isExternal ? `/api/proxy-image?url=${encodeURIComponent(productImage)}` : productImage
    
    await new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve // proceed anyway
    })

    // 2. Set Canvas Layout
    const gutterWidth = 420
    const padding = 50

    // 3. Draw Navy Side Panel
    ctx.fillStyle = '#003366'
    ctx.fillRect(0, 0, gutterWidth, canvas.height)

    // 4. Draw Product Image (Right side)
    const drawWidth = canvas.width - gutterWidth
    const drawHeight = canvas.height
    
    // Object fit: cover
    const scale = Math.max(drawWidth / img.width, drawHeight / img.height)
    const x = gutterWidth + (drawWidth - img.width * scale) / 2
    const y = (drawHeight - img.height * scale) / 2
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

    // 5. Branding - Bewama Logo & Text
    ctx.textBaseline = 'top' // Make vertical alignment easier to reason about
    drawHexLogo(ctx, padding, 60, 60)
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 54px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('BEWAMA', padding, 160)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '22px Inter, sans-serif'
    ctx.fillText('Your home of Building and Industrial Materials', padding, 240)

    // 6. Dynamic Content Based on Mode
    let currentY = 320

    if (mode === 'problem' && headline) {
        ctx.fillStyle = '#FF9900'
        ctx.font = 'bold 46px Inter, sans-serif'
        currentY = wrapText(ctx, headline.toUpperCase(), padding, currentY, gutterWidth - padding * 2, 55)
        currentY += 40 // Spacing after headline
    }

    // Product Name
    ctx.fillStyle = mode === 'problem' ? 'white' : '#FF9900'
    ctx.font = 'bold 42px Inter, sans-serif'
    currentY = wrapText(ctx, (productName || "Product Name").toUpperCase(), padding, currentY, gutterWidth - padding * 2, 50)
    currentY += 30 // Spacing after product name

    // Price
    ctx.fillStyle = 'white'
    ctx.font = 'bold 64px Inter, sans-serif'
    ctx.fillText(productPrice || "Contact Us", padding, currentY)
    currentY += 80 // Spacing after price

    // Authority Mode: Features
    if (mode === 'authority' && features) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '26px Inter, sans-serif'
        const list = features.split('\n').filter(f => f.trim())
        list.slice(0, 6).forEach((f) => {
            ctx.fillText(`✔ ${f}`, padding, currentY)
            currentY += 45
        })
    }

    // 7. QR CODE (Bottom Right Overlap)
    const qrSize = 220
    const qrUrl = productUrl || SITE_URL
    
    try {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, { 
            width: qrSize, 
            margin: 2,
            color: { dark: '#003366', light: '#ffffff' }
        })
        const qrImg = new Image()
        qrImg.src = qrDataUrl
        await new Promise((resolve) => { qrImg.onload = resolve })
        
        const qrx = canvas.width - qrSize - 40
        const qry = canvas.height - qrSize - 40
        
        // Shadow for QR
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 30
        ctx.fillStyle = 'white'
        ctx.fillRect(qrx - 10, qry - 10, qrSize + 20, qrSize + 20)
        ctx.restore()
        
        ctx.drawImage(qrImg, qrx, qry, qrSize, qrSize)
    } catch (err) {
        console.error('QR error', err)
    }

    // 8. Contact Footer
    ctx.fillStyle = 'white'
    ctx.textBaseline = 'alphabetic' // Restore for footer icons if needed
    ctx.font = 'bold 28px Inter, sans-serif'
    ctx.fillText('📞 0745 474 586', padding, canvas.height - 80)
    ctx.font = '24px Inter, sans-serif'
    ctx.fillText('🌐 bewama.com', padding, canvas.height - 40)

    // 9. Watermark
    addWatermark(ctx, canvas)

  }, [mode, productName, productPrice, productUrl, productImage, headline, features])

  useEffect(() => {
    drawPoster()
  }, [drawPoster])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `bewama-${mode}-${Date.now()}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  const handleCopyCaption = () => {
    const caption = `🚀 ${productName.toUpperCase()}\n\n${headline ? headline + '\n\n' : ''}${features ? 'Key Features:\n' + features + '\n\n' : ''}Price: ${productPrice}\n\nShop now: ${productUrl}\n\n#Bewama #IndustrialMaterials #Construction #QualityTools`
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Controls: Left Column */}
      <div className="xl:col-span-4 space-y-6 animate-in slide-in-from-left duration-500">
        <Card className="p-6 border-none shadow-sm space-y-4">
          
          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
             <button 
                onClick={() => setMode('price')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                    mode === 'price' ? "bg-white text-[#003366] shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
             >
                <BadgeDollarSign className="w-4 h-4" /> Price
             </button>
             <button 
                onClick={() => setMode('problem')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                    mode === 'problem' ? "bg-white text-[#003366] shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
             >
                <AlertCircle className="w-4 h-4" /> Problem
             </button>
             <button 
                onClick={() => setMode('authority')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                    mode === 'authority' ? "bg-white text-[#003366] shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
             >
                <Award className="w-4 h-4" /> Authority
             </button>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Search Product</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                    placeholder="Type to search..." 
                    className="pl-10 h-11 border-slate-200"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loadingSearch && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"><RefreshCcw className="w-4 h-4 text-slate-400" /></div>}
            </div>
            
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
                    {results.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                        >
                            <div className="w-10 h-10 bg-slate-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-bold text-[#003366] truncate">{p.name}</p>
                                <p className="text-xs text-slate-400">{p.price.toLocaleString()} {p.currency}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
             {mode === 'problem' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase mb-1.5 block text-orange-600">Problem Headline</label>
                    <Input 
                        placeholder="e.g. STOP WASTING TIME ON CHEAP TOOLS" 
                        value={headline} 
                        onChange={e => setHeadline(e.target.value)} 
                        className="h-11 border-orange-200 focus:ring-orange-500" 
                    />
                </div>
             )}

             {mode === 'authority' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase mb-1.5 block text-blue-600">Key Features (One per line)</label>
                    <textarea 
                        placeholder="German Engineering&#10;5-Year Warranty&#10;Eco-Friendly" 
                        value={features} 
                        onChange={e => setFeatures(e.target.value)} 
                        className="w-full min-h-25 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Product Name</label>
                    <Input value={productName} onChange={e => setProductName(e.target.value)} className="h-11" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Price</label>
                    <Input value={productPrice} onChange={e => setProductPrice(e.target.value)} className="h-11" />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Product Image</label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Image URL" 
                        value={productImage} 
                        onChange={e => setProductImage(e.target.value)} 
                        className="h-11 flex-1"
                    />
                    <div className="relative">
                        <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <Button 
                            variant="outline" 
                            className="h-11 px-3 border-dashed"
                            onClick={() => document.getElementById('img-upload')?.click()}
                        >
                            <Camera className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t">
              <Button 
                className="w-full bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold h-12 gap-2 shadow-lg shadow-orange-200"
                onClick={handleDownload}
                disabled={!productImage}
              >
                <Download className="w-5 h-5" /> Download Poster
              </Button>
              <Button 
                variant="outline"
                className="w-full h-11 gap-2"
                onClick={handleCopyCaption}
                disabled={!productName}
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Caption Copied!' : 'Copy Ad Caption'}
              </Button>
          </div>

          <Button 
            variant="ghost" 
            className="w-full h-10 text-slate-400 hover:text-red-500 hover:bg-red-50 mt-2"
            onClick={() => {
                setSelectedProduct(null)
                setProductName('')
                setProductPrice('')
                setProductUrl('')
                setProductImage('')
                setHeadline('')
                setFeatures('')
                setQuery('')
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Reset
          </Button>
        </Card>
      </div>

      {/* Preview: Right Column */}
      <div className="xl:col-span-8 flex flex-col items-center">
        <label className="text-sm font-bold text-gray-400 uppercase mb-4 self-start">Live Preview</label>
        <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-3xl p-4 md:p-12 flex items-center justify-center border-8 border-white dark:border-slate-800 shadow-2xl min-h-150">
             <canvas 
                ref={canvasRef} 
                className="max-w-full h-auto rounded-xl shadow-2xl bg-white aspect-square"
             />
        </div>
        <p className="text-xs text-slate-400 mt-6 text-center italic">
            This high-resolution 1200x1200px export is optimized for Instagram, Facebook, and WhatsApp.
        </p>
      </div>
    </div>
  )
}

// -- Helper Functions --

function drawHexLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = size * 0.15
    ctx.strokeStyle = "#FF9900"
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = x + (size/2) + (size/2) * Math.cos(angle)
        const py = y + (size/2) + (size/2) * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
    
    // Tiny inner dot
    ctx.fillStyle = "#FF9900"
    ctx.beginPath()
    ctx.arc(x + size/2, y + size/2, size * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const words = text.split(' ')
    let line = ''
    let currentY = y
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' '
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY)
            line = words[n] + ' '
            currentY += lineHeight
        } else { line = testLine }
    }
    ctx.fillText(line, x, currentY)
    return currentY + lineHeight // Return the position for the next element
}

function addWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.save()
    ctx.globalAlpha = 0.12 // Very faint
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    ctx.translate(centerX, centerY)
    ctx.rotate(-Math.PI / 4) // 45-degree tilt
    
    ctx.fillStyle = "white"
    ctx.font = `bold ${canvas.width * 0.05}px sans-serif`
    ctx.textAlign = 'center'
    
    // Draw a grid of watermarks
    const spacingX = canvas.width * 0.35
    const spacingY = canvas.height * 0.35
    
    for (let i = -3; i < 4; i++) {
        for (let j = -3; j < 4; j++) {
            ctx.fillText("BEWAMA", i * spacingX, j * spacingY)
        }
    }
    ctx.restore()
}
