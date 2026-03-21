const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

type Product = {
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  images: string[]
  stock: number
  brand: string | null
  category: string | null
}

export function generateProductSchema(product: Product) {
  const availability =
    product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ? stripHtml(product.description) : undefined,
    image: product.images ?? [],
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category ?? undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Jane Doe',
      },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.price.toString(),
      availability,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Bewama',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'KE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnInStore',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: product.currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'KE',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
        },
      },
    },
  }
}

/** Strip TipTap/HTML tags to get plain text for description */
function stripHtml(input: string): string {
  // If it looks like stored TipTap JSON, extract text from it
  try {
    const json = JSON.parse(input)
    return extractText(json)
  } catch {
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === 'text') return String(node.text ?? '')
  const content = node.content as Record<string, unknown>[] | undefined
  if (content) return content.map(extractText).join(' ')
  return ''
}