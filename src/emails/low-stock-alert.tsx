import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Link, Preview,
} from '@react-email/components'

interface LowStockProduct {
  name: string
  stock: number
  category: string | null
}

interface LowStockAlertProps {
  products: LowStockProduct[]
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

export function LowStockAlertEmail({ products }: LowStockAlertProps) {
  const previewText = `⚠️ Low Stock Alert — ${products.length} product${products.length !== 1 ? 's' : ''} need attention`
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '32px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#003366', padding: '32px 40px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              BEWAMA
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.7)', margin: '8px 0 0', fontSize: 13 }}>
              ⚠️ Low Stock Alert — Admin Notice
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 40px' }}>
            <Text style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              The following {products.length} product{products.length !== 1 ? 's are' : ' is'} running low on stock and may need restocking:
            </Text>

            {/* Products table */}
            <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Row style={{ backgroundColor: '#f9fafb', padding: '10px 16px' }}>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Product</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Category</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' as const }}>Stock</Column>
              </Row>
              {products.map((p, i) => (
                <Row key={i} style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <Column style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{p.name}</Column>
                  <Column style={{ fontSize: 13, color: '#6b7280' }}>{p.category ?? '—'}</Column>
                  <Column style={{ fontSize: 14, fontWeight: 800, color: p.stock <= 5 ? '#ef4444' : '#ec5b13', textAlign: 'right' as const }}>
                    {p.stock} left
                  </Column>
                </Row>
              ))}
            </Section>

            <Section style={{ marginTop: 24 }}>
              <Link
                href={`${SITE_URL}/admin/product-management`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#003366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                Manage Products →
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px 40px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              This is an automated alert from your Bewama admin dashboard.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default LowStockAlertEmail
