import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Hr, Preview,
} from '@react-email/components'

interface OrderItem {
  name: string
  quantity: number
  price: number
  currency: string
}

interface OrderConfirmationProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  total: number
  currency: string
  deliveryMethod: string
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  currency,
  deliveryMethod,
}: OrderConfirmationProps) {
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase()
  const fmt = (n: number) => `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

  return (
    <Html>
      <Head />
      <Preview>Order #{shortId} confirmed — thank you for shopping with Bewama!</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '32px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#003366', padding: '32px 40px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              BEWAMA
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.7)', margin: '8px 0 0', fontSize: 13 }}>
              Order Confirmation
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 40px' }}>
            <Text style={{ fontSize: 16, color: '#111827', fontWeight: 600, margin: '0 0 4px' }}>
              Hi {customerName},
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              Your order has been confirmed. Here&apos;s a summary:
            </Text>

            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
              Order #{shortId}
            </Text>

            {/* Items table */}
            <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Row style={{ backgroundColor: '#f9fafb', padding: '10px 16px' }}>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Product</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' as const }}>Qty</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' as const }}>Price</Column>
              </Row>
              {items.map((item, i) => (
                <Row key={i} style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <Column style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{item.name}</Column>
                  <Column style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' as const }}>{item.quantity}</Column>
                  <Column style={{ fontSize: 14, color: '#003366', fontWeight: 700, textAlign: 'right' as const }}>{fmt(item.price * item.quantity)}</Column>
                </Row>
              ))}
              <Row style={{ padding: '14px 16px', borderTop: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Column style={{ fontSize: 15, fontWeight: 800, color: '#003366' }}>Total</Column>
                <Column />
                <Column style={{ fontSize: 15, fontWeight: 800, color: '#003366', textAlign: 'right' as const }}>{fmt(total)}</Column>
              </Row>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={{ fontSize: 13, color: '#374151', margin: '0 0 4px' }}>
              <strong>Delivery method:</strong> {deliveryMethod}
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Our team will be in touch to confirm your order and arrange delivery.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px 40px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              Questions? Email <strong>info@bewama.com</strong> or reply to this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail
