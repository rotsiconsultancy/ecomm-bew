import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Hr, Preview,
} from '@react-email/components'

interface QuoteItem {
  product_name: string
  quantity: number
  unit: string
}

interface QuoteReceivedProps {
  quoteId: string
  customerName: string
  items: QuoteItem[]
  message?: string
}

export function QuoteReceivedEmail({ quoteId, customerName, items, message }: QuoteReceivedProps) {
  const shortRef = quoteId.replace(/-/g, '').slice(0, 8).toUpperCase()

  return (
    <Html>
      <Head />
      <Preview>Quote request received — Ref #{shortRef}. We&apos;ll respond within 24 hours.</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '32px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#003366', padding: '32px 40px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              BEWAMA
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.7)', margin: '8px 0 0', fontSize: 13 }}>
              Quote Request Received
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 40px' }}>
            <Text style={{ fontSize: 16, color: '#111827', fontWeight: 600, margin: '0 0 4px' }}>
              Hi {customerName},
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>
              Thank you for your quote request. We&apos;ve received it and will respond within 24 hours.
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              Your reference number is: <strong style={{ color: '#003366' }}>#{shortRef}</strong>
            </Text>

            {/* Items */}
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
              Requested Items
            </Text>
            <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Row style={{ backgroundColor: '#f9fafb', padding: '10px 16px' }}>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Product</Column>
                <Column style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' as const }}>Quantity</Column>
              </Row>
              {items.map((item, i) => (
                <Row key={i} style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <Column style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{item.product_name}</Column>
                  <Column style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' as const }}>{item.quantity} {item.unit}</Column>
                </Row>
              ))}
            </Section>

            {message && (
              <>
                <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
                <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
                  Your Message
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{message}</Text>
              </>
            )}

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Our team reviews all quote requests during business hours (Mon–Fri, 8am–6pm EAT).
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px 40px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              Questions? Email <strong>info@bewama.com</strong>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default QuoteReceivedEmail
