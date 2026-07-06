'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Award,
  BadgeDollarSign,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  Package,
  QrCode,
  RectangleHorizontal,
  RefreshCcw,
  Search,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react'
import QRCode from 'qrcode'
import { searchProducts } from './actions'
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
type PosterFormat = 'square' | 'portrait' | 'story'

const BRAND = {
  navy: '#061f3f',
  deepNavy: '#03152d',
  orange: '#ff5f14',
  green: '#3b7a57',
  light: '#f4f7fa',
}

const FORMAT_SPECS: Record<PosterFormat, { label: string; width: number; height: number; icon: React.ElementType }> = {
  square: { label: 'Square', width: 1200, height: 1200, icon: Square },
  portrait: { label: 'Portrait', width: 1080, height: 1350, icon: RectangleHorizontal },
  story: { label: 'Story', width: 1080, height: 1920, icon: Smartphone },
}

export default function SocialMediaTool() {
  const [mode, setMode] = useState<PosterMode>('price')
  const [format, setFormat] = useState<PosterFormat>('square')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [productImage, setProductImage] = useState('')
  const [headline, setHeadline] = useState('')
  const [subheading, setSubheading] = useState('Available from Bewama for trade, site, and workshop needs.')
  const [features, setFeatures] = useState('')
  const [ctaText, setCtaText] = useState('Shop now or request a quote')
  const [showQr, setShowQr] = useState(true)

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const handleSelectProduct = (product: Product) => {
    setProductName(product.name)
    setProductPrice(`${product.price.toLocaleString()} ${product.currency}`)
    setProductUrl(`${SITE_URL}/products/${product.slug}`)
    setProductImage(product.images?.[0] || '')
    setHeadline(`${product.name} available at Bewama`)
    setSubheading('Order stocked items online or request pricing for project quantities.')
    setQuery('')
    setResults([])
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      setProductImage(loadEvent.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const drawPoster = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const spec = FORMAT_SPECS[format]
    canvas.width = spec.width
    canvas.height = spec.height

    const width = canvas.width
    const height = canvas.height
    const isTall = height > width * 1.2
    const scale = width / 1200

    drawBrandBackground(ctx, width, height)

    const logo = await loadImage('/logo.png')
    const margin = Math.round((isTall ? 64 : 58) * scale)
    drawLogoCard(ctx, logo, margin, margin, Math.round(230 * scale), Math.round(82 * scale), scale)

    if (!productImage) {
      await drawEmptyState(ctx, width, height, scale, logo)
      return
    }

    const isExternal =
      productImage.startsWith('http') &&
      !productImage.includes(typeof window !== 'undefined' ? window.location.host : '')
    const productSrc = isExternal ? `/api/proxy-image?url=${encodeURIComponent(productImage)}` : productImage
    const productImg = await loadImage(productSrc)

    const productArea = isTall
      ? {
          x: Math.round(86 * scale),
          y: Math.round(210 * scale),
          width: width - Math.round(172 * scale),
          height: Math.round(430 * scale),
        }
      : {
          x: Math.round(width * 0.52),
          y: Math.round(190 * scale),
          width: Math.round(width * 0.4),
          height: Math.round(610 * scale),
        }
    drawProductStage(ctx, productImg, productArea.x, productArea.y, productArea.width, productArea.height, scale)

    const textX = margin
    const textMaxWidth = isTall ? width - margin * 2 : Math.round(width * 0.45)
    let textY = isTall ? Math.round(690 * scale) : Math.round(200 * scale)

    const eyebrow = mode === 'problem'
      ? 'PRODUCT SOLUTION'
      : mode === 'authority'
        ? 'BEWAMA MATERIAL GUIDE'
        : 'FEATURED MATERIAL'
    drawEyebrow(ctx, eyebrow, textX, textY, scale)
    textY += Math.round(54 * scale)

    const mainHeadline = (headline || productName || 'Construction materials available at Bewama').trim()
    ctx.fillStyle = '#ffffff'
    ctx.font = `900 ${Math.round((isTall ? 70 : 66) * scale)}px Inter, Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    textY = wrapText(ctx, mainHeadline, textX, textY, textMaxWidth, Math.round((isTall ? 74 : 72) * scale), isTall ? 5 : 4)
    textY += Math.round(24 * scale)

    ctx.fillStyle = 'rgba(255,255,255,0.78)'
    ctx.font = `700 ${Math.round(24 * scale)}px Inter, Arial, sans-serif`
    textY = wrapText(ctx, subheading || productName, textX, textY, textMaxWidth, Math.round(34 * scale), 3)
    textY += Math.round(28 * scale)

    if (productPrice) {
      drawPricePill(ctx, productPrice, textX, textY, scale)
      textY += Math.round(76 * scale)
    }

    const featureList = features.split('\n').map((feature) => feature.trim()).filter(Boolean)
    if (featureList.length > 0) {
      drawFeatureList(ctx, featureList, textX, textY, textMaxWidth, scale)
    }

    const footerY = height - Math.round(150 * scale)
    const qrSize = Math.round((isTall ? 168 : 180) * scale)
    const footerWidth = width - margin * 2 - (showQr ? qrSize + Math.round(52 * scale) : 0)
    drawFooterBar(ctx, margin, footerY, footerWidth, Math.round(92 * scale), ctaText, scale)

    if (showQr) {
      await drawQr(ctx, productUrl || SITE_URL, width - margin - qrSize, footerY - Math.round(30 * scale), qrSize, scale)
    }

    drawWatermark(ctx, width, height)
  }, [format, mode, productImage, productName, productPrice, productUrl, headline, subheading, features, ctaText, showQr])

  useEffect(() => {
    drawPoster()
  }, [drawPoster])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `bewama-${format}-${mode}-${Date.now()}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  const handleCopyCaption = () => {
    const caption = `${productName}\n\n${headline ? headline + '\n\n' : ''}${subheading ? subheading + '\n\n' : ''}${features ? 'Key details:\n' + features + '\n\n' : ''}${productPrice ? `Price: ${productPrice}\n\n` : ''}Shop or request a quote: ${productUrl || SITE_URL}\n\n#Bewama #ConstructionMaterials #IndustrialSupplies #Adhesives #Sealants`
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetTool = () => {
    setProductName('')
    setProductPrice('')
    setProductUrl('')
    setProductImage('')
    setHeadline('')
    setSubheading('Available from Bewama for trade, site, and workshop needs.')
    setFeatures('')
    setCtaText('Shop now or request a quote')
    setQuery('')
    setResults([])
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-4 space-y-6 animate-in slide-in-from-left duration-500">
        <Card className="p-6 border-none shadow-sm space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(FORMAT_SPECS) as [PosterFormat, typeof FORMAT_SPECS[PosterFormat]][]).map(([key, spec]) => {
                const Icon = spec.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-bold transition-all',
                      format === key
                        ? 'border-[#ff5f14] bg-[#fff8f4] text-[#061f3f] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-[#ff5f14]/40'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {spec.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Creative Angle</label>
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              <ModeButton active={mode === 'price'} onClick={() => setMode('price')} icon={BadgeDollarSign} label="Price" />
              <ModeButton active={mode === 'problem'} onClick={() => setMode('problem')} icon={AlertCircle} label="Solution" />
              <ModeButton active={mode === 'authority'} onClick={() => setMode('authority')} icon={Award} label="Guide" />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Search Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Type to search..."
                className="pl-10 h-11 border-slate-200"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {loadingSearch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">
                  <RefreshCcw className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
                {results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold text-[#061f3f] truncate">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.price.toLocaleString()} {product.currency}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="text-xs font-bold uppercase mb-1.5 block text-[#ff5f14]">Poster Headline</label>
              <Input
                placeholder="e.g. Strong contact adhesive for workshop jobs"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                className="h-11 border-orange-200 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Supporting Copy</label>
              <textarea
                placeholder="Short product benefit or offer details..."
                value={subheading}
                onChange={(event) => setSubheading(event.target.value)}
                className="w-full min-h-20 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase mb-1.5 block text-blue-600">Key Details</label>
              <textarea
                placeholder={'Bulk quantities available\nDelivery coordination\nRequest project pricing'}
                value={features}
                onChange={(event) => setFeatures(event.target.value)}
                className="w-full min-h-24 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Product Name</label>
                <Input value={productName} onChange={(event) => setProductName(event.target.value)} className="h-11" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Price</label>
                <Input value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className="h-11" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Product Image</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={productImage}
                  onChange={(event) => setProductImage(event.target.value)}
                  className="h-11 flex-1"
                />
                <div className="relative">
                  <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-3 border-dashed"
                    onClick={() => document.getElementById('img-upload')?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">CTA Text</label>
                <Input value={ctaText} onChange={(event) => setCtaText(event.target.value)} className="h-11" />
              </div>
              <button
                type="button"
                onClick={() => setShowQr((value) => !value)}
                className={cn(
                  'mt-5 flex h-11 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors',
                  showQr ? 'border-[#ff5f14] bg-[#fff8f4] text-[#061f3f]' : 'border-slate-200 text-slate-500'
                )}
              >
                <QrCode className="h-4 w-4" />
                QR
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button
              className="w-full bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold h-12 gap-2 shadow-lg shadow-orange-200"
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
            onClick={resetTool}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Reset
          </Button>
        </Card>
      </div>

      <div className="xl:col-span-8 flex flex-col items-center">
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-bold text-gray-400 uppercase">Live Preview</label>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff8f4] px-3 py-1 text-xs font-bold text-[#061f3f]">
            <Sparkles className="h-3.5 w-3.5 text-[#ff5f14]" />
            {FORMAT_SPECS[format].width} x {FORMAT_SPECS[format].height}px export
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-3xl p-4 md:p-10 flex items-center justify-center border-8 border-white dark:border-slate-800 shadow-2xl min-h-150">
          <canvas
            ref={canvasRef}
            className={cn(
              'max-w-full h-auto rounded-xl shadow-2xl bg-white',
              format === 'story' ? 'max-h-[760px]' : 'max-h-[680px]'
            )}
          />
        </div>
        <p className="text-xs text-slate-400 mt-6 text-center italic">
          Export-ready canvas with Bewama logo, product image, CTA, QR code, and safe layout spacing.
        </p>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all',
        active ? 'bg-white text-[#061f3f] shadow-sm' : 'text-slate-500 hover:bg-white/50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawBrandBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, BRAND.deepNavy)
  gradient.addColorStop(0.62, '#08264c')
  gradient.addColorStop(1, '#061a34')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = BRAND.orange
  ctx.beginPath()
  ctx.moveTo(width * 0.78, 0)
  ctx.lineTo(width * 0.92, 0)
  ctx.lineTo(width * 0.45, height)
  ctx.lineTo(width * 0.31, height)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#ffffff'
  for (let x = 0; x < width; x += 56) ctx.fillRect(x, 0, 1, height)
  for (let y = 0; y < height; y += 56) ctx.fillRect(0, y, width, 1)
  ctx.restore()
}

async function drawEmptyState(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  logo: HTMLImageElement | null
) {
  const cardW = width * 0.68
  const cardH = Math.min(height * 0.34, 420 * scale)
  const x = (width - cardW) / 2
  const y = (height - cardH) / 2

  roundRect(ctx, x, y, cardW, cardH, 28 * scale)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  if (logo) drawContainedImage(ctx, logo, x + cardW * 0.2, y + 50 * scale, cardW * 0.6, 110 * scale)
  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round(36 * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('Select a product to preview', width / 2, y + cardH - 145 * scale)
  ctx.fillStyle = '#64748b'
  ctx.font = `700 ${Math.round(22 * scale)}px Inter, Arial, sans-serif`
  ctx.fillText('Search the catalog or upload a product image', width / 2, y + cardH - 92 * scale)
}

function drawLogoCard(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
) {
  roundRect(ctx, x, y, width, height, 14 * scale)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  if (logo) {
    drawContainedImage(ctx, logo, x + 14 * scale, y + 8 * scale, width - 28 * scale, height - 16 * scale)
  } else {
    ctx.fillStyle = BRAND.navy
    ctx.font = `900 ${Math.round(28 * scale)}px Inter, Arial, sans-serif`
    ctx.fillText('BEWAMA', x + 18 * scale, y + 24 * scale)
  }
}

function drawEyebrow(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number) {
  roundRect(ctx, x, y, 46 * scale, 4 * scale, 2 * scale)
  ctx.fillStyle = BRAND.orange
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `900 ${Math.round(17 * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(text, x + 62 * scale, y + 2 * scale)
}

function drawProductStage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.28)'
  ctx.shadowBlur = 36 * scale
  ctx.shadowOffsetY = 18 * scale
  roundRect(ctx, x, y, width, height, 28 * scale)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()

  if (img) {
    drawContainedImage(ctx, img, x + 34 * scale, y + 34 * scale, width - 68 * scale, height - 68 * scale)
  } else {
    ctx.fillStyle = '#e2e8f0'
    ctx.font = `800 ${Math.round(26 * scale)}px Inter, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('Product image', x + width / 2, y + height / 2)
  }
}

function drawPricePill(ctx: CanvasRenderingContext2D, price: string, x: number, y: number, scale: number) {
  const width = Math.min(360 * scale, Math.max(220 * scale, ctx.measureText(price).width + 58 * scale))
  const height = 58 * scale
  roundRect(ctx, x, y, width, height, 12 * scale)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round(27 * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(price, x + 24 * scale, y + height / 2)
}

function drawFeatureList(
  ctx: CanvasRenderingContext2D,
  features: string[],
  x: number,
  y: number,
  maxWidth: number,
  scale: number
) {
  let currentY = y
  ctx.font = `800 ${Math.round(22 * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'
  features.slice(0, 4).forEach((feature) => {
    ctx.fillStyle = BRAND.green
    ctx.beginPath()
    ctx.arc(x + 12 * scale, currentY + 13 * scale, 10 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    wrapText(ctx, feature, x + 36 * scale, currentY, maxWidth - 36 * scale, 30 * scale, 2)
    currentY += 42 * scale
  })
}

function drawFooterBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cta: string,
  scale: number
) {
  roundRect(ctx, x, y, width, height, 18 * scale)
  ctx.fillStyle = BRAND.orange
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${Math.round(28 * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(cta || 'Shop now or request a quote', x + 28 * scale, y + height / 2)
  ctx.font = `800 ${Math.round(21 * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('bewama.com', x + width - 28 * scale, y + height / 2)
}

async function drawQr(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number,
  scale: number
) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: BRAND.navy, light: '#ffffff' },
    })
    const qrImg = await loadImage(qrDataUrl)
    if (!qrImg) return

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.24)'
    ctx.shadowBlur = 22 * scale
    roundRect(ctx, x - 10 * scale, y - 10 * scale, size + 20 * scale, size + 20 * scale, 16 * scale)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()
    ctx.drawImage(qrImg, x, y, size, size)
  } catch (error) {
    console.error('QR error', error)
  }
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / img.width, height / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  ctx.drawImage(img, x + (width - drawW) / 2, y + (height - drawH) / 2, drawW, drawH)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  let lineCount = 0

  for (let index = 0; index < words.length; index++) {
    const testLine = `${line}${words[index]} `
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      lineCount++
      if (lineCount >= maxLines) {
        ctx.fillText(`${line.trim()}...`, x, currentY)
        return currentY + lineHeight
      }
      ctx.fillText(line.trim(), x, currentY)
      line = `${words[index]} `
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line.trim(), x, currentY)
  return currentY + lineHeight
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.055
  ctx.translate(width / 2, height / 2)
  ctx.rotate(-Math.PI / 5)
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${Math.round(width * 0.052)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'center'

  const spacingX = width * 0.38
  const spacingY = height * 0.22
  for (let i = -4; i < 5; i++) {
    for (let j = -4; j < 5; j++) {
      ctx.fillText('BEWAMA', i * spacingX, j * spacingY)
    }
  }
  ctx.restore()
}
