'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    currency: string
    image: string | null
  }
  size?: 'sm' | 'default'
  className?: string
}

export function AddToCartButton({ product, size = 'sm', className }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleClick() {
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      currency: product.currency,
      quantity: 1,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button
      size={size}
      onClick={handleClick}
      title={added ? 'Added to cart!' : `Add ${product.name} to cart`}
      className={`bg-[#003366] hover:bg-[#002244] text-white transition-all ${className ?? ''}`}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
