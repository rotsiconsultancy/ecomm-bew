'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  Image as ImageIcon,
  Package,
  QrCode,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
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
const EXPORT_PIXEL_RATIO = 2

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'threads'
type Placement = 'portrait' | 'square' | 'story' | 'wide'
type Preset = 'offer' | 'info' | 'solution' | 'seasonal' | 'newArrival' | 'bulk'
type PosterType = 'price' | 'info' | 'solution' | 'seasonal'
type PreviewZoom = 'fit' | 'actual' | 'export'

const BRAND = {
  navy: '#061f3f',
  deepNavy: '#03152d',
  orange: '#ff5f14',
  green: '#3b7a57',
  light: '#f4f7fa',
}

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  threads: 'Threads',
}

const PLACEMENT_SPECS: Record<Placement, { label: string; width: number; height: number }> = {
  portrait: { label: '4:5', width: 1080, height: 1350 },
  square: { label: '1:1', width: 1080, height: 1080 },
  story: { label: '9:16', width: 1080, height: 1920 },
  wide: { label: 'Wide', width: 1080, height: 566 },
}

const PRESET_LABELS: Record<Preset, string> = {
  offer: 'Offer',
  info: 'Product Info',
  solution: 'Solution',
  seasonal: 'Seasonal',
  newArrival: 'New Arrival',
  bulk: 'Bulk Order',
}

const POSTER_TYPE_LABELS: Record<PosterType, string> = {
  price: 'Price',
  info: 'Info',
  solution: 'Solution',
  seasonal: 'Seasonal',
}

const getExportSize = (placement: Placement) => {
  const spec = PLACEMENT_SPECS[placement]
  return {
    width: spec.width * EXPORT_PIXEL_RATIO,
    height: spec.height * EXPORT_PIXEL_RATIO,
  }
}

export default function SocialMediaTool() {
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [placement, setPlacement] = useState<Placement>('portrait')
  const [preset, setPreset] = useState<Preset>('offer')
  const [posterType, setPosterType] = useState<PosterType>('price')
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>('fit')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const [productName, setProductName] = useState('Somafix S121')
  const [productPrice, setProductPrice] = useState('KSH 350.00')
  const [productUrl, setProductUrl] = useState('')
  const [productImage, setProductImage] = useState('/bewama/silicones-category.png')
  const [subtitle, setSubtitle] = useState('Siliconized Acrylic Sealant')
  const [description, setDescription] = useState('Elastic, solvent-free acrylic sealant for doors, windows, joints, and interior finishing work.')
  const [infoBullets, setInfoBullets] = useState(['Elastic and solvent-free', 'Doors, windows, and joints', 'Available for site delivery'])
  const [solutionBullets, setSolutionBullets] = useState(['Practical for finishing crews', 'Clean interior application', 'Order online or request bulk pricing'])
  const [oldPrice, setOldPrice] = useState('KSH 450.00')
  const [promoLabel, setPromoLabel] = useState('MID YEAR')
  const [promoSubLabel, setPromoSubLabel] = useState('SALE')
  const [offerText, setOfferText] = useState('UP TO 60% OFF')
  const [showSaleBadge, setShowSaleBadge] = useState(false)
  const [showOldPrice, setShowOldPrice] = useState(false)
  const [showQr, setShowQr] = useState(true)
  const [showSafeZone, setShowSafeZone] = useState(false)
  const [showCarousel, setShowCarousel] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('/bewama/trade-strip.png')
  const [campaignBackground, setCampaignBackground] = useState('Trade scene')
  const [backgroundModalOpen, setBackgroundModalOpen] = useState(false)

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
    setSubtitle(product.name)
    setDescription('Order stocked items online or request pricing for project quantities.')
    setOldPrice('')
    setQuery('')
    setResults([])
  }

  const readImageFile = (event: React.ChangeEvent<HTMLInputElement>, onLoad: (value: string) => void) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      onLoad(loadEvent.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const applyPreset = (nextPreset: Preset) => {
    setPreset(nextPreset)

    if (nextPreset === 'offer') {
      setPosterType('price')
      setShowSaleBadge(false)
      setShowOldPrice(false)
      if (!productPrice) setProductPrice('KSH 350.00')
      if (!subtitle || subtitle === 'New Arrival') setSubtitle('Siliconized Acrylic Sealant')
      return
    }

    if (nextPreset === 'info') {
      setPosterType('info')
      setShowSaleBadge(false)
      setShowOldPrice(false)
      return
    }

    if (nextPreset === 'solution') {
      setPosterType('solution')
      setShowSaleBadge(false)
      setShowOldPrice(false)
      return
    }

    if (nextPreset === 'seasonal') {
      setPosterType('seasonal')
      setShowSaleBadge(true)
      setShowOldPrice(true)
      setCampaignBackground((value) => value || 'Christmas campaign')
      setBackgroundImage((value) => value || '/bewama/trade-strip.png')
      return
    }

    if (nextPreset === 'newArrival') {
      setPosterType('info')
      setShowSaleBadge(false)
      setShowOldPrice(false)
      setSubtitle('New Arrival')
      setDescription('Fresh stock now available for trade, site, and workshop orders.')
      return
    }

    setPosterType('solution')
    setShowSaleBadge(false)
    setShowOldPrice(false)
    setProductPrice('Request Quote')
    setDescription('Planning a larger project order? Bewama can help with product availability and project quantities.')
  }

  const updateInfoBullet = (index: number, value: string) => {
    setInfoBullets((items) => items.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const updateSolutionBullet = (index: number, value: string) => {
    setSolutionBullets((items) => items.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const qualityWarning = (() => {
    if (placement === 'story' && (productName.length > 20 || subtitle.length > 34)) {
      return 'Text may be tight in 9:16. Shorten the product name or subtitle.'
    }
    if (productName.length > 28) return 'Product name is long. Check Export view before posting.'
    if (posterType === 'price' && !productPrice.trim()) return 'Add a price or switch to Info/Solution.'
    return ''
  })()

  const drawPoster = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const exportSize = getExportSize(placement)
    canvas.width = exportSize.width
    canvas.height = exportSize.height
    canvas.style.aspectRatio = `${PLACEMENT_SPECS[placement].width} / ${PLACEMENT_SPECS[placement].height}`

    const width = canvas.width
    const height = canvas.height
    const scale = width / 1200
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    drawBrandBackground(ctx, width, height)

    const logo = await loadImage('/logo.png')

    if (!productImage) {
      await drawEmptyState(ctx, width, height, scale, logo)
      return
    }

    const isExternal =
      productImage.startsWith('http') &&
      !productImage.includes(typeof window !== 'undefined' ? window.location.host : '')
    const productSrc = isExternal ? `/api/proxy-image?url=${encodeURIComponent(productImage)}` : productImage
    const productImg = await loadImage(productSrc)
    const backgroundImg = backgroundImage ? await loadImage(backgroundImage) : null

    if (posterType === 'price' || posterType === 'seasonal') {
      await drawSalePoster({
        ctx,
        width,
        height,
        scale,
        logo,
        productImg,
        backgroundImg,
        productName,
        headline: subtitle,
        subheading: description,
        productPrice,
        oldPrice,
        promoLabel,
        promoSubLabel,
        offerText,
        productUrl: productUrl || SITE_URL,
        showQr,
        showSaleBadge,
        showOldPrice,
      })
      return
    }

    await drawInfoPoster({
      ctx,
      width,
      height,
      scale,
      productImg,
      logo,
      productName,
      subtitle,
      description,
      productPrice,
      productUrl: productUrl || SITE_URL,
      bullets: posterType === 'solution' ? solutionBullets : infoBullets,
      showQr,
      dark: posterType === 'solution',
    })
  }, [placement, productImage, backgroundImage, posterType, productName, productPrice, productUrl, subtitle, description, oldPrice, promoLabel, promoSubLabel, offerText, showQr, showSaleBadge, showOldPrice, infoBullets, solutionBullets])

  useEffect(() => {
    drawPoster()
  }, [drawPoster])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `bewama-${placement}-${posterType}-master-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleCopyCaption = () => {
    const bullets = (posterType === 'solution' ? solutionBullets : infoBullets).filter(Boolean).join('\n')
    const caption = `${productName}\n\n${subtitle ? subtitle + '\n\n' : ''}${description ? description + '\n\n' : ''}${bullets ? 'Key details:\n' + bullets + '\n\n' : ''}${productPrice ? `Price: ${productPrice}\n\n` : ''}Shop or request a quote: ${productUrl || SITE_URL}\n\n#Bewama #ConstructionMaterials #IndustrialSupplies #Adhesives #Sealants`
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetTool = () => {
    setPlatform('instagram')
    setPlacement('portrait')
    setPreset('offer')
    setPosterType('price')
    setPreviewZoom('fit')
    setProductName('Somafix S121')
    setProductPrice('KSH 350.00')
    setProductUrl('')
    setProductImage('/bewama/silicones-category.png')
    setSubtitle('Siliconized Acrylic Sealant')
    setDescription('Elastic, solvent-free acrylic sealant for doors, windows, joints, and interior finishing work.')
    setInfoBullets(['Elastic and solvent-free', 'Doors, windows, and joints', 'Available for site delivery'])
    setSolutionBullets(['Practical for finishing crews', 'Clean interior application', 'Order online or request bulk pricing'])
    setOldPrice('KSH 450.00')
    setPromoLabel('MID YEAR')
    setPromoSubLabel('SALE')
    setOfferText('UP TO 60% OFF')
    setShowSaleBadge(false)
    setShowOldPrice(false)
    setShowQr(true)
    setShowSafeZone(false)
    setShowCarousel(false)
    setBackgroundImage('/bewama/trade-strip.png')
    setCampaignBackground('Trade scene')
    setQuery('')
    setResults([])
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <img src="/logo.png" alt="Bewama" className="h-10 w-10 object-contain" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#061f3f]">Poster Studio</h2>
        </div>
        <Button className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold" onClick={handleDownload} disabled={!productImage}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="max-h-[calc(100vh-142px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4">
            <h3 className="text-sm font-black text-[#061f3f]">Builder</h3>
          </div>

          <div className="space-y-4 p-4">
            <ControlGroup label="Preset">
              <select
                value={preset}
                onChange={(event) => applyPreset(event.target.value as Preset)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-[#061f3f] outline-none transition focus:border-[#ff5f14]"
              >
                {(Object.entries(PRESET_LABELS) as [Preset, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </ControlGroup>

            <ControlGroup label="Platform">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(PLATFORM_LABELS) as [Platform, string][]).map(([key, label]) => (
                  <ChoiceButton key={key} active={platform === key} onClick={() => {
                    setPlatform(key)
                    if (key === 'tiktok') setPlacement('story')
                    if (key === 'threads' && placement === 'story') setPlacement('square')
                  }}>
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Size">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(PLACEMENT_SPECS) as [Placement, typeof PLACEMENT_SPECS[Placement]][]).map(([key, spec]) => (
                  <ChoiceButton key={key} active={placement === key} onClick={() => setPlacement(key)}>
                    {spec.label}
                  </ChoiceButton>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Type">
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(POSTER_TYPE_LABELS) as [PosterType, string][]).map(([key, label]) => (
                  <ChoiceButton key={key} active={posterType === key} onClick={() => {
                    setPosterType(key)
                    if (key === 'price') setPreset('offer')
                    if (key === 'seasonal') setPreset('seasonal')
                  }}>
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Product">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search product..." className="h-10 pl-10" value={query} onChange={(event) => setQuery(event.target.value)} />
                {loadingSearch && <RefreshCcw className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
                {results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {results.map((product) => (
                      <button key={product.id} type="button" onClick={() => handleSelectProduct(product)} className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-none hover:bg-slate-50">
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                          {product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#061f3f]">{product.name}</p>
                          <p className="text-xs font-semibold text-slate-400">{product.price.toLocaleString()} {product.currency}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Field label="Product name" value={productName} onChange={setProductName} />
              <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
              <Field label="Price" value={productPrice} onChange={setProductPrice} />
            </ControlGroup>

            <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-black text-[#061f3f] marker:text-[#ff5f14]">Advanced</summary>
              <div className="mt-3 space-y-3">
                <Field label="Old price" value={oldPrice} onChange={setOldPrice} />
                <div className="grid grid-cols-2 gap-2">
                  <ToggleButton active={showSaleBadge} onClick={() => setShowSaleBadge((value) => !value)}>Sale badge</ToggleButton>
                  <ToggleButton active={showOldPrice} onClick={() => setShowOldPrice((value) => !value)}>Old price</ToggleButton>
                </div>
                <Field label="Promo" value={promoLabel} onChange={setPromoLabel} />
                <Field label="Badge" value={promoSubLabel} onChange={setPromoSubLabel} />
                <Field label="Offer text" value={offerText} onChange={setOfferText} />
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">Description</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#ff5f14]" />
                </label>
                <BulletEditor label="Info bullets" items={infoBullets} onChange={updateInfoBullet} />
                <BulletEditor label="Solution bullets" items={solutionBullets} onChange={updateSolutionBullet} />
              </div>
            </details>

            <ControlGroup label="Images">
              <div className="space-y-2">
                <Input value={productImage} onChange={(event) => setProductImage(event.target.value)} placeholder="Product image URL" className="h-10" />
                <input id="product-image-upload" type="file" accept="image/*" className="hidden" onChange={(event) => readImageFile(event, setProductImage)} />
                <button type="button" onClick={() => document.getElementById('product-image-upload')?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-left">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#ff5f14] shadow-sm"><Upload className="h-4 w-4" /></span>
                  <span><b className="block text-sm text-[#061f3f]">Product image</b><span className="text-xs font-semibold text-slate-500">Upload packshot.</span></span>
                </button>
                <input id="background-image-upload" type="file" accept="image/*" className="hidden" onChange={(event) => readImageFile(event, (value) => {
                  setBackgroundImage(value)
                  setCampaignBackground('Custom upload')
                  setPosterType('seasonal')
                  setPreset('seasonal')
                })} />
                <button type="button" onClick={() => setBackgroundModalOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-left">
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white text-[#ff5f14] shadow-sm">
                    {backgroundImage ? <img src={backgroundImage} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4" />}
                  </span>
                  <span><b className="block text-sm text-[#061f3f]">Background</b><span className="text-xs font-semibold text-slate-500">{campaignBackground || 'Choose image.'}</span></span>
                </button>
              </div>
            </ControlGroup>

            <div className="flex gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" className="h-10 flex-1 gap-2" onClick={handleCopyCaption} disabled={!productName}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Caption'}
              </Button>
              <Button variant="ghost" className="h-10 px-3 text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={resetTool}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#061f3f]">Preview</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <Pill>{PLATFORM_LABELS[platform]}</Pill>
                <Pill>{PLACEMENT_SPECS[placement].label}</Pill>
                <Pill>{POSTER_TYPE_LABELS[posterType]}</Pill>
              </div>
            </div>
            <button type="button" onClick={() => setShowQr((value) => !value)} className={cn('grid h-10 w-12 place-items-center rounded-xl border text-xs font-black', showQr ? 'border-[#ff5f14] bg-[#fff8f4] text-[#061f3f]' : 'border-slate-200 text-slate-400')}>
              <QrCode className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(['fit', 'actual', 'export'] as PreviewZoom[]).map((zoom) => (
                <PreviewTab key={zoom} active={previewZoom === zoom} onClick={() => setPreviewZoom(zoom)}>
                  {zoom === 'actual' ? '100%' : zoom[0].toUpperCase() + zoom.slice(1)}
                </PreviewTab>
              ))}
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <PreviewTab active={showSafeZone} onClick={() => setShowSafeZone((value) => !value)}>Safe zone</PreviewTab>
              <PreviewTab active={showCarousel} onClick={() => setShowCarousel((value) => !value)}>Carousel</PreviewTab>
            </div>
          </div>

          {qualityWarning && (
            <div className="mb-3 rounded-xl border border-orange-200 bg-[#fff8f4] px-3 py-2 text-xs font-bold text-[#8a3a12]">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              {qualityWarning}
            </div>
          )}

          <div className="grid min-h-[680px] place-items-center overflow-auto rounded-2xl bg-[linear-gradient(90deg,rgba(6,31,63,0.045)_1px,transparent_1px),linear-gradient(rgba(6,31,63,0.045)_1px,transparent_1px)] bg-[size:34px_34px] bg-[#dfe8f1] p-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className={cn(
                  'h-auto max-w-full bg-white shadow-2xl',
                  placement === 'story' ? 'rounded-lg' : 'rounded-sm',
                  getCanvasPreviewClass(placement, previewZoom)
                )}
              />
              {showSafeZone && <div className="pointer-events-none absolute inset-[8%_7%_12%] border-2 border-dashed border-[#ff5f14]/80 bg-[#ff5f14]/5" />}
            </div>
          </div>

          {showCarousel && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <SlideCard title="Slide 1" copy="Product hero with logo and category." />
              <SlideCard title="Slide 2" copy="Benefits or problem-solution bullets." />
              <SlideCard title="Slide 3" copy="Price, QR, and purchase CTA." />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-400">{getExportSize(placement).width} x {getExportSize(placement).height}px PNG master</span>
            <Button className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold" onClick={handleDownload} disabled={!productImage}>
              <Download className="mr-2 h-4 w-4" />
              Download PNG Master
            </Button>
          </div>
        </section>
      </div>

      {backgroundModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#03152d]/60 p-4" role="dialog" aria-modal="true" aria-label="Choose background">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h3 className="text-lg font-black text-[#061f3f]">Background</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">Choose a campaign scene or upload your own.</p>
              </div>
              <Button variant="ghost" onClick={() => setBackgroundModalOpen(false)}>Close</Button>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {[
                { label: 'Christmas campaign', src: '/bewama/trade-strip.png' },
                { label: 'Active site scene', src: '/bewama/hero.png' },
                { label: 'Clean product studio', src: '/bewama/sealant-category.png' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setCampaignBackground(item.label)
                    setBackgroundImage(item.src)
                    setPosterType('seasonal')
                    setPreset('seasonal')
                    setBackgroundModalOpen(false)
                  }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left transition hover:border-[#ff5f14]"
                >
                  <img src={item.src} alt="" className="h-28 w-full object-cover" />
                  <span className="block p-3 text-sm font-black text-[#061f3f]">{item.label}</span>
                </button>
              ))}
              <button type="button" onClick={() => document.getElementById('background-image-upload')?.click()} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-left hover:border-[#ff5f14]">
                <Camera className="mb-4 h-6 w-6 text-[#ff5f14]" />
                <b className="block text-sm text-[#061f3f]">Upload custom</b>
                <span className="text-xs font-semibold text-slate-500">Use Christmas, sale, site, or campaign artwork.</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">{label}</label>
      {children}
    </div>
  )
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-10 rounded-xl border px-3 text-left text-sm font-black transition',
        active ? 'border-[#ff5f14] bg-[#fff8f4] text-[#061f3f]' : 'border-slate-200 bg-slate-50 text-[#061f3f] hover:border-[#ff5f14]/50'
      )}
    >
      {children}
    </button>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-2 block last:mb-0">
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-10" />
    </label>
  )
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-2 text-left text-xs font-black transition',
        active ? 'border-[#ff5f14] bg-[#fff8f4] text-[#061f3f]' : 'border-slate-200 bg-white text-slate-500'
      )}
    >
      {children}
    </button>
  )
}

function BulletEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (index: number, value: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <Input key={index} value={item} onChange={(event) => onChange(index, event.target.value)} className="h-10" />
        ))}
      </div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-black text-[#061f3f]">
      {children}
    </span>
  )
}

function PreviewTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('min-h-8 rounded-lg px-3 text-xs font-black text-[#061f3f] transition', active && 'bg-white shadow-sm')}
    >
      {children}
    </button>
  )
}

function SlideCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <b className="block text-sm text-[#061f3f]">{title}</b>
      <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{copy}</span>
    </div>
  )
}

function getCanvasPreviewClass(placement: Placement, zoom: PreviewZoom) {
  if (zoom === 'export') {
    if (placement === 'story') return 'w-[520px]'
    if (placement === 'wide') return 'w-[720px]'
    return placement === 'square' ? 'w-[680px]' : 'w-[660px]'
  }
  if (zoom === 'actual') {
    if (placement === 'story') return 'w-[430px]'
    if (placement === 'wide') return 'w-[660px]'
    return placement === 'square' ? 'w-[570px]' : 'w-[560px]'
  }
  if (placement === 'story') return 'w-[350px]'
  if (placement === 'wide') return 'w-[620px]'
  return placement === 'square' ? 'w-[520px]' : 'w-[500px]'
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

async function drawSalePoster({
  ctx,
  width,
  height,
  scale,
  logo,
  productImg,
  backgroundImg,
  productName,
  headline,
  subheading,
  productPrice,
  oldPrice,
  promoLabel,
  promoSubLabel,
  offerText,
  productUrl,
  showQr,
  showSaleBadge,
  showOldPrice,
}: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scale: number
  logo: HTMLImageElement | null
  productImg: HTMLImageElement | null
  backgroundImg: HTMLImageElement | null
  productName: string
  headline: string
  subheading: string
  productPrice: string
  oldPrice: string
  promoLabel: string
  promoSubLabel: string
  offerText: string
  productUrl: string
  showQr: boolean
  showSaleBadge: boolean
  showOldPrice: boolean
}) {
  const isTall = height > width * 1.2
  const isWide = height < width * 0.7
  const footerH = Math.round((isTall ? 86 : 76) * scale)
  const contentH = height - footerH
  if (isWide) {
    await drawWidePricePoster({
      ctx,
      width,
      height,
      scale,
      footerH,
      logo,
      productImg,
      backgroundImg,
      productName,
      headline,
      subheading,
      productPrice,
      oldPrice,
      promoLabel,
      promoSubLabel,
      offerText,
      productUrl,
      showQr,
      showSaleBadge,
      showOldPrice,
    })
    return
  }

  const heroH = Math.round(contentH * (isTall ? 0.42 : 0.38))
  const panelY = heroH
  const panelH = contentH - heroH
  const pad = Math.round((isTall ? 58 : 54) * scale)

  ctx.fillStyle = '#fdf8f2'
  ctx.fillRect(0, 0, width, height)

  if (backgroundImg) {
    drawCoverImage(ctx, backgroundImg, 0, 0, width, heroH)
  } else {
    drawSalePhotoSide(ctx, 0, 0, width, heroH, scale)
  }

  const heroGradient = ctx.createLinearGradient(0, 0, width, heroH)
  heroGradient.addColorStop(0, 'rgba(3,21,45,0.58)')
  heroGradient.addColorStop(0.46, 'rgba(3,21,45,0.18)')
  heroGradient.addColorStop(1, 'rgba(255,95,20,0.16)')
  ctx.fillStyle = heroGradient
  ctx.fillRect(0, 0, width, heroH)

  if (productImg) {
    const productBox = isTall
      ? { x: width * 0.34, y: heroH * 0.08, width: width * 0.32, height: heroH * 0.82 }
      : { x: width * 0.38, y: heroH * 0.08, width: width * 0.24, height: heroH * 0.82 }
    drawProductShadow(ctx, productBox.x + productBox.width * 0.15, productBox.y + productBox.height * 0.86, productBox.width * 0.7, productBox.height * 0.08, scale)
    drawContainedImage(ctx, productImg, productBox.x, productBox.y, productBox.width, productBox.height)
  }

  if (showSaleBadge) {
    const badgeW = Math.round(250 * scale)
    const badgeH = Math.round(96 * scale)
    drawSaleBadge(ctx, pad, heroH - badgeH - Math.round(26 * scale), badgeW, badgeH, promoLabel, promoSubLabel, offerText, scale * 0.74)
  }

  ctx.fillStyle = '#fffaf7'
  ctx.fillRect(0, panelY, width, panelH)

  const logoW = Math.min(Math.round(270 * scale), width - pad * 2)
  if (logo) {
    drawContainedImage(ctx, logo, (width - logoW) / 2, panelY + Math.round(34 * scale), logoW, Math.round(88 * scale))
  }

  const textX = pad
  const maxText = width - pad * 2
  let textY = panelY + Math.round(150 * scale)

  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round((isTall ? 54 : 48) * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  textY = wrapText(ctx, (productName || 'Product').toUpperCase(), textX, textY, maxText, Math.round((isTall ? 60 : 54) * scale), 2)

  ctx.fillStyle = BRAND.orange
  ctx.font = `900 ${Math.round(24 * scale)}px Inter, Arial, sans-serif`
  textY = wrapText(ctx, (headline || subheading || 'Product available at Bewama').toUpperCase(), textX, textY + Math.round(12 * scale), maxText, Math.round(32 * scale), 2)

  const dividerY = Math.min(textY + Math.round(26 * scale), panelY + panelH - Math.round(230 * scale))
  ctx.fillStyle = BRAND.navy
  ctx.fillRect(textX, dividerY, maxText, Math.max(3, Math.round(4 * scale)))

  const priceBandY = panelY + panelH - Math.round((showOldPrice && oldPrice ? 190 : 160) * scale)
  const qrSize = Math.round((isTall ? 132 : 118) * scale)
  const qrX = width - pad - qrSize
  const priceMaxW = showQr ? qrX - textX - Math.round(34 * scale) : maxText
  let priceY = priceBandY

  if (showOldPrice && oldPrice) {
    ctx.fillStyle = '#7f8388'
    ctx.font = `800 ${Math.round(24 * scale)}px Inter, Arial, sans-serif`
    ctx.fillText(oldPrice, textX, priceY)
    const oldWidth = ctx.measureText(oldPrice).width
    ctx.strokeStyle = BRAND.orange
    ctx.lineWidth = Math.max(3, 4 * scale)
    ctx.beginPath()
    ctx.moveTo(textX, priceY + Math.round(16 * scale))
    ctx.lineTo(textX + oldWidth, priceY + Math.round(16 * scale))
    ctx.stroke()
    priceY += Math.round(42 * scale)
  }

  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round((isTall ? 68 : 58) * scale)}px Inter, Arial, sans-serif`
  wrapText(ctx, productPrice || 'KSH 350.00', textX, priceY, priceMaxW, Math.round(64 * scale), 2)

  if (showQr) {
    const qrY = priceBandY + Math.round((showOldPrice && oldPrice ? 18 : 0) * scale)
    await drawQr(ctx, productUrl, qrX, qrY, qrSize, scale, logo)

    ctx.fillStyle = BRAND.navy
    ctx.font = `900 ${Math.round(15 * scale)}px Inter, Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('SCAN TO BUY', qrX, qrY + qrSize + Math.round(18 * scale))
  }

  drawSaleFooter(ctx, 0, height - footerH, width, footerH, scale)
}

async function drawWidePricePoster({
  ctx,
  width,
  height,
  scale,
  footerH,
  logo,
  productImg,
  backgroundImg,
  productName,
  headline,
  subheading,
  productPrice,
  oldPrice,
  promoLabel,
  promoSubLabel,
  offerText,
  productUrl,
  showQr,
  showSaleBadge,
  showOldPrice,
}: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scale: number
  footerH: number
  logo: HTMLImageElement | null
  productImg: HTMLImageElement | null
  backgroundImg: HTMLImageElement | null
  productName: string
  headline: string
  subheading: string
  productPrice: string
  oldPrice: string
  promoLabel: string
  promoSubLabel: string
  offerText: string
  productUrl: string
  showQr: boolean
  showSaleBadge: boolean
  showOldPrice: boolean
}) {
  const contentH = height - footerH
  const heroW = Math.round(width * 0.46)
  const panelX = heroW
  const pad = Math.round(44 * scale)

  if (backgroundImg) drawCoverImage(ctx, backgroundImg, 0, 0, heroW, contentH)
  else drawSalePhotoSide(ctx, 0, 0, heroW, contentH, scale)

  ctx.fillStyle = 'rgba(3,21,45,0.22)'
  ctx.fillRect(0, 0, heroW, contentH)

  if (productImg) {
    const productBox = { x: heroW * 0.28, y: contentH * 0.11, width: heroW * 0.44, height: contentH * 0.75 }
    drawProductShadow(ctx, productBox.x + productBox.width * 0.15, productBox.y + productBox.height * 0.86, productBox.width * 0.7, productBox.height * 0.08, scale)
    drawContainedImage(ctx, productImg, productBox.x, productBox.y, productBox.width, productBox.height)
  }

  if (showSaleBadge) {
    drawSaleBadge(ctx, pad, contentH - Math.round(118 * scale), Math.round(230 * scale), Math.round(86 * scale), promoLabel, promoSubLabel, offerText, scale * 0.66)
  }

  ctx.fillStyle = '#fffaf7'
  ctx.fillRect(panelX, 0, width - panelX, contentH)

  const textX = panelX + pad
  const maxText = width - panelX - pad * 2
  let textY = Math.round(42 * scale)
  if (logo) {
    drawContainedImage(ctx, logo, textX, textY - Math.round(16 * scale), Math.round(220 * scale), Math.round(76 * scale))
    textY += Math.round(92 * scale)
  }

  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round(42 * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  textY = wrapText(ctx, (productName || 'Product').toUpperCase(), textX, textY, maxText, Math.round(48 * scale), 2)

  ctx.fillStyle = BRAND.orange
  ctx.font = `900 ${Math.round(22 * scale)}px Inter, Arial, sans-serif`
  textY = wrapText(ctx, (headline || subheading || 'Product available at Bewama').toUpperCase(), textX, textY + Math.round(8 * scale), maxText, Math.round(28 * scale), 2)

  ctx.fillStyle = BRAND.navy
  ctx.fillRect(textX, textY + Math.round(18 * scale), maxText, Math.max(3, Math.round(4 * scale)))

  const qrSize = Math.round(100 * scale)
  const qrX = width - pad - qrSize
  let priceY = contentH - Math.round((showOldPrice && oldPrice ? 142 : 116) * scale)
  if (showOldPrice && oldPrice) {
    ctx.fillStyle = '#7f8388'
    ctx.font = `800 ${Math.round(21 * scale)}px Inter, Arial, sans-serif`
    ctx.fillText(oldPrice, textX, priceY)
    const oldWidth = ctx.measureText(oldPrice).width
    ctx.strokeStyle = BRAND.orange
    ctx.lineWidth = Math.max(3, 4 * scale)
    ctx.beginPath()
    ctx.moveTo(textX, priceY + Math.round(14 * scale))
    ctx.lineTo(textX + oldWidth, priceY + Math.round(14 * scale))
    ctx.stroke()
    priceY += Math.round(36 * scale)
  }

  ctx.fillStyle = BRAND.navy
  ctx.font = `900 ${Math.round(46 * scale)}px Inter, Arial, sans-serif`
  wrapText(ctx, productPrice || 'KSH 350.00', textX, priceY, qrX - textX - Math.round(28 * scale), Math.round(52 * scale), 2)

  if (showQr) {
    await drawQr(ctx, productUrl, qrX, contentH - Math.round(128 * scale), qrSize, scale, logo)
  }

  drawSaleFooter(ctx, 0, height - footerH, width, footerH, scale)
}

async function drawInfoPoster({
  ctx,
  width,
  height,
  scale,
  productImg,
  logo,
  productName,
  subtitle,
  description,
  productPrice,
  productUrl,
  bullets,
  showQr,
  dark,
}: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scale: number
  productImg: HTMLImageElement | null
  logo: HTMLImageElement | null
  productName: string
  subtitle: string
  description: string
  productPrice: string
  productUrl: string
  bullets: string[]
  showQr: boolean
  dark: boolean
}) {
  const isTall = height > width * 1.2
  const footerH = Math.round(92 * scale)
  const contentH = height - footerH
  const splitX = isTall ? 0 : Math.round(width * 0.42)
  const photoW = isTall ? width : splitX
  const photoH = isTall ? Math.round(contentH * 0.42) : contentH
  const panelX = isTall ? 0 : splitX
  const panelY = isTall ? photoH : 0
  const panelW = isTall ? width : width - splitX
  const panelH = isTall ? contentH - photoH : contentH

  ctx.fillStyle = '#eef3f8'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, photoW, photoH)
  ctx.strokeStyle = 'rgba(6, 31, 63, 0.08)'
  ctx.lineWidth = Math.max(1, scale)
  for (let x = 0; x < photoW; x += 120 * scale) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, photoH)
    ctx.stroke()
  }

  if (productImg) {
    const productBox = isTall
      ? { x: width * 0.24, y: photoH * 0.1, width: width * 0.52, height: photoH * 0.78 }
      : { x: photoW * 0.2, y: contentH * 0.24, width: photoW * 0.6, height: contentH * 0.5 }
    drawProductShadow(ctx, productBox.x + productBox.width * 0.18, productBox.y + productBox.height * 0.86, productBox.width * 0.64, productBox.height * 0.08, scale)
    drawContainedImage(ctx, productImg, productBox.x, productBox.y, productBox.width, productBox.height)
  }

  ctx.fillStyle = dark ? BRAND.navy : '#ffffff'
  ctx.fillRect(panelX, panelY, panelW, panelH)

  const panelPad = Math.round(48 * scale)
  const textX = panelX + panelPad
  const maxText = panelW - panelPad * 2
  let textY = panelY + Math.round(56 * scale)

  if (logo && !dark) {
    drawContainedImage(ctx, logo, textX, textY - Math.round(20 * scale), Math.round(210 * scale), Math.round(74 * scale))
    textY += Math.round(86 * scale)
  }

  roundRect(ctx, textX, textY, dark ? 190 * scale : 230 * scale, 44 * scale, 22 * scale)
  ctx.fillStyle = dark ? 'rgba(255,95,20,0.18)' : '#eaf4ef'
  ctx.fill()
  ctx.fillStyle = dark ? '#ffb28a' : BRAND.green
  ctx.font = `900 ${Math.round(17 * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(dark ? 'SITE SOLUTION' : 'PRODUCT INFORMATION', textX + Math.round(22 * scale), textY + Math.round(22 * scale))
  textY += Math.round(78 * scale)

  ctx.fillStyle = dark ? '#ffffff' : BRAND.navy
  ctx.font = `900 ${Math.round((isTall ? 60 : 64) * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'top'
  textY = wrapText(ctx, dark ? 'Need a clean seal?' : (productName || 'Product').toUpperCase(), textX, textY, maxText, Math.round(68 * scale), 2)

  ctx.fillStyle = dark ? 'rgba(255,255,255,0.72)' : '#415067'
  ctx.font = `800 ${Math.round(23 * scale)}px Inter, Arial, sans-serif`
  textY = wrapText(ctx, dark ? `${productName || 'This product'} helps with ${subtitle || 'site work'}.` : description, textX, textY + Math.round(18 * scale), maxText, Math.round(34 * scale), 4)
  textY += Math.round(34 * scale)

  const activeBullets = bullets.map((item) => item.trim()).filter(Boolean).slice(0, 3)
  ctx.font = `900 ${Math.round(22 * scale)}px Inter, Arial, sans-serif`
  activeBullets.forEach((bullet) => {
    ctx.fillStyle = BRAND.orange
    ctx.beginPath()
    ctx.arc(textX + Math.round(12 * scale), textY + Math.round(15 * scale), Math.round(12 * scale), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `900 ${Math.round(15 * scale)}px Inter, Arial, sans-serif`
    ctx.textBaseline = 'top'
    ctx.fillText('✓', textX + Math.round(8 * scale), textY + Math.round(4 * scale))
    ctx.fillStyle = dark ? '#ffffff' : BRAND.navy
    ctx.font = `900 ${Math.round(22 * scale)}px Inter, Arial, sans-serif`
    wrapText(ctx, bullet, textX + Math.round(40 * scale), textY, maxText - Math.round(44 * scale), Math.round(30 * scale), 2)
    textY += Math.round(48 * scale)
  })

  const priceY = panelY + panelH - Math.round(190 * scale)
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : BRAND.navy
  ctx.fillRect(textX, priceY - Math.round(32 * scale), maxText, Math.max(3, Math.round(4 * scale)))
  ctx.fillStyle = dark ? '#ffffff' : BRAND.navy
  ctx.font = `900 ${Math.round(42 * scale)}px Inter, Arial, sans-serif`
  ctx.fillText(productPrice || 'KSH 350.00', textX, priceY)

  if (showQr) {
    const qrSize = Math.round(118 * scale)
    await drawQr(ctx, productUrl, textX + maxText - qrSize, priceY - Math.round(34 * scale), qrSize, scale, logo)
  }

  drawSaleFooter(ctx, 0, height - footerH, width, footerH, scale)
}

function drawSalePhotoSide(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, scale: number) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, '#cfc8ba')
  gradient.addColorStop(0.55, '#ebe5dc')
  gradient.addColorStop(1, '#b9b0a2')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, width, height)

  const floorY = y + height * 0.82
  const floorGradient = ctx.createLinearGradient(x, floorY, x, y + height)
  floorGradient.addColorStop(0, '#bdb5a8')
  floorGradient.addColorStop(1, '#eee8de')
  ctx.fillStyle = floorGradient
  ctx.fillRect(x, floorY, width, height - floorY)

  ctx.strokeStyle = 'rgba(83, 75, 66, 0.28)'
  ctx.lineWidth = Math.max(2, 2 * scale)
  ctx.beginPath()
  ctx.moveTo(x, floorY)
  ctx.lineTo(x + width, floorY)
  ctx.stroke()

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(x + width * 0.72, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width * 0.86, y + height)
  ctx.lineTo(x + width * 0.58, y + height)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.16
  ctx.strokeStyle = '#756e64'
  ctx.lineWidth = Math.max(1, 1.5 * scale)
  for (let line = 0; line < 8; line++) {
    const lineX = x + line * width / 7
    ctx.beginPath()
    ctx.moveTo(lineX, y)
    ctx.lineTo(lineX - width * 0.25, y + height)
    ctx.stroke()
  }

  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#2e5c3c'
  ctx.beginPath()
  ctx.ellipse(x + width * 0.03, y + height * 0.28, width * 0.09, height * 0.035, -0.8, 0, Math.PI * 2)
  ctx.ellipse(x + width * 0.06, y + height * 0.42, width * 0.08, height * 0.032, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawProductShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, scale: number) {
  ctx.save()
  ctx.filter = `blur(${Math.round(14 * scale)}px)`
  ctx.globalAlpha = 0.28
  ctx.fillStyle = '#19120d'
  ctx.beginPath()
  ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSaleBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  subLabel: string,
  offerText: string,
  scale: number
) {
  ctx.save()
  ctx.fillStyle = BRAND.deepNavy
  ctx.beginPath()
  ctx.moveTo(x, y + height * 0.12)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width * 0.92, y + height)
  ctx.lineTo(x, y + height)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = BRAND.orange
  ctx.beginPath()
  ctx.moveTo(x + width * 0.08, y + height * 0.12)
  ctx.lineTo(x + width * 0.74, y + height * 0.04)
  ctx.lineTo(x + width * 0.7, y + height * 0.34)
  ctx.lineTo(x + width * 0.04, y + height * 0.42)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${Math.round(27 * scale)}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label || 'MID YEAR', x + width * 0.11, y + height * 0.23)
  ctx.font = `900 ${Math.round(64 * scale)}px Inter, Arial, sans-serif`
  ctx.fillText(subLabel || 'SALE', x + width * 0.08, y + height * 0.65)
  ctx.font = `900 ${Math.round(24 * scale)}px Inter, Arial, sans-serif`
  ctx.fillStyle = BRAND.orange
  ctx.fillText(offerText || 'UP TO 60% OFF', x + width * 0.1, y + height * 0.9)
  ctx.restore()
}

function drawSaleFooter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, scale: number) {
  ctx.fillStyle = BRAND.deepNavy
  ctx.fillRect(x, y, width, height)

  const items: Array<{ icon: 'pin' | 'web' | 'phone' | 'mail'; text: string }> = [
    { icon: 'web', text: 'www.bewama.co.ke' },
    { icon: 'phone', text: '0700 123 456' },
    { icon: 'mail', text: 'sales@bewama.co.ke' },
  ]
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${Math.round(16 * scale)}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const itemW = width / items.length
  items.forEach((item, index) => {
    const itemX = x + itemW * index + Math.round(48 * scale)
    const iconY = y + height / 2
    drawFooterIcon(ctx, item.icon, itemX, iconY, Math.round(22 * scale), scale)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(item.text, itemX + Math.round(34 * scale), iconY)
    if (index > 0) {
      ctx.fillStyle = BRAND.orange
      ctx.fillRect(x + itemW * index, y + height * 0.25, Math.max(1, 2 * scale), height * 0.5)
      ctx.fillStyle = '#ffffff'
    }
  })
}

function drawFooterIcon(
  ctx: CanvasRenderingContext2D,
  icon: 'pin' | 'web' | 'phone' | 'mail',
  x: number,
  y: number,
  size: number,
  scale: number
) {
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, 2.2 * scale)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (icon === 'pin') {
    ctx.beginPath()
    ctx.arc(x + size / 2, y - size * 0.08, size * 0.28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + size / 2, y + size * 0.48)
    ctx.quadraticCurveTo(x + size * 0.1, y + size * 0.08, x + size * 0.22, y - size * 0.2)
    ctx.quadraticCurveTo(x + size / 2, y - size * 0.68, x + size * 0.78, y - size * 0.2)
    ctx.quadraticCurveTo(x + size * 0.9, y + size * 0.08, x + size / 2, y + size * 0.48)
    ctx.stroke()
  } else if (icon === 'web') {
    ctx.beginPath()
    ctx.arc(x + size / 2, y, size * 0.43, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + size * 0.08, y)
    ctx.lineTo(x + size * 0.92, y)
    ctx.moveTo(x + size / 2, y - size * 0.43)
    ctx.bezierCurveTo(x + size * 0.25, y - size * 0.2, x + size * 0.25, y + size * 0.2, x + size / 2, y + size * 0.43)
    ctx.moveTo(x + size / 2, y - size * 0.43)
    ctx.bezierCurveTo(x + size * 0.75, y - size * 0.2, x + size * 0.75, y + size * 0.2, x + size / 2, y + size * 0.43)
    ctx.stroke()
  } else if (icon === 'phone') {
    ctx.beginPath()
    ctx.moveTo(x + size * 0.28, y - size * 0.34)
    ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.18, x + size * 0.22, y + size * 0.02)
    ctx.quadraticCurveTo(x + size * 0.42, y + size * 0.34, x + size * 0.72, y + size * 0.38)
    ctx.quadraticCurveTo(x + size * 0.92, y + size * 0.28, x + size * 0.78, y + size * 0.1)
    ctx.lineTo(x + size * 0.62, y + size * 0.16)
    ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.08, x + size * 0.38, y - size * 0.08)
    ctx.lineTo(x + size * 0.46, y - size * 0.24)
    ctx.closePath()
    ctx.stroke()
  } else {
    roundRect(ctx, x + size * 0.08, y - size * 0.32, size * 0.84, size * 0.64, 2 * scale)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + size * 0.12, y - size * 0.26)
    ctx.lineTo(x + size / 2, y + size * 0.04)
    ctx.lineTo(x + size * 0.88, y - size * 0.26)
    ctx.stroke()
  }

  ctx.restore()
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
  scale: number,
  logo?: HTMLImageElement | null
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
    if (logo) {
      const logoSize = size * 0.26
      const logoX = x + (size - logoSize) / 2
      const logoY = y + (size - logoSize) / 2
      roundRect(ctx, logoX - 6 * scale, logoY - 6 * scale, logoSize + 12 * scale, logoSize + 12 * scale, 9 * scale)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      drawContainedImage(ctx, logo, logoX, logoY, logoSize, logoSize)
    }
  } catch (error) {
    console.error('QR error', error)
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / img.width, height / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  ctx.drawImage(img, x + (width - drawW) / 2, y + (height - drawH) / 2, drawW, drawH)
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
