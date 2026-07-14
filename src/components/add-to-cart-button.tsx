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
  const { addToCart, cartItems } = useCart()
  const [added, setAdded] = useState(false)
  const inCart = cartItems.some((item) => item.product_id === product.id)

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
      title={inCart ? `${product.name} is in your cart. Click to add another.` : `Add ${product.name} to cart`}
      className={`bg-[#061f3f] hover:bg-[#03152d] text-white transition-all ${className ?? ''}`}
    >
      {added || inCart ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5" />
          {added ? 'Added!' : 'In Cart'}
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
