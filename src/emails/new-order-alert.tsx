import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Link, Hr, Preview,
} from '@react-email/components'

interface OrderItem {
  name: string
  quantity: number
  price: number
  currency: string
}

interface NewOrderAlertProps {
  orderId: string
  customerName: string
  total: number
  items: OrderItem[]
  deliveryMethod: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

export function NewOrderAlertEmail({ orderId, customerName, total, items, deliveryMethod }: NewOrderAlertProps) {
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase()
  const fmt = (n: number, currency = 'KES') =>
    `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

  return (
    <Html>
      <Head />
      <Preview>New order #{shortId} from {customerName} — KES {total.toLocaleString()}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '32px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#ec5b13', padding: '32px 40px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              BEWAMA
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', fontSize: 13 }}>
              🛒 New Order Received
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 40px' }}>
            <Text style={{ fontSize: 15, color: '#111827', fontWeight: 600, margin: '0 0 4px' }}>
              Order #{shortId}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              Customer: <strong style={{ color: '#111827' }}>{customerName}</strong> · Delivery: {deliveryMethod}
            </Text>

            {/* Items */}
            <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Row style={{ backgroundColor: '#f9fafb', padding: '10px 16px' }}>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Product</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' as const }}>Qty</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' as const }}>Amount</Column>
              </Row>
              {items.map((item, i) => (
                <Row key={i} style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <Column style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{item.name}</Column>
                  <Column style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' as const }}>{item.quantity}</Column>
                  <Column style={{ fontSize: 14, color: '#003366', fontWeight: 600, textAlign: 'right' as const }}>
                    {fmt(item.price * item.quantity, item.currency)}
                  </Column>
                </Row>
              ))}
              <Row style={{ padding: '14px 16px', borderTop: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Column style={{ fontSize: 15, fontWeight: 800, color: '#003366' }}>Total</Column>
                <Column />
                <Column style={{ fontSize: 15, fontWeight: 800, color: '#003366', textAlign: 'right' as const }}>
                  {fmt(total)}
                </Column>
              </Row>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Link
              href={`${SITE_URL}/admin/order-management/${orderId}`}
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
              View Order in Admin →
            </Link>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px 40px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              Automated alert from Bewama Admin
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default NewOrderAlertEmail
