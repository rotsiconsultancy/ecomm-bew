import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface SupplierNotificationEmailProps {
  preview: string
  title: string
  eyebrow?: string
  message: string
  ctaLabel?: string
  ctaUrl?: string
  details?: { label: string; value: string }[]
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

export function SupplierNotificationEmail({
  preview,
  title,
  eyebrow = 'Supplier Marketplace',
  message,
  ctaLabel,
  ctaUrl,
  details = [],
}: SupplierNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#f4f7fa', fontFamily: 'Inter, Arial, sans-serif' }}>
        <Container style={{ maxWidth: 620, margin: '32px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
          <Section style={{ backgroundColor: '#061f3f', padding: '30px 36px' }}>
            <Img
              src="https://bewama.com/logo.png"
              alt="Bewama"
              width="156"
              style={{ display: 'block', margin: '0 0 24px', height: 'auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 8 }}
            />
            <Text style={{ margin: 0, color: '#ffb38b', fontSize: 12, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              {eyebrow}
            </Text>
            <Heading style={{ margin: '8px 0 0', color: '#ffffff', fontSize: 28, lineHeight: '34px', fontWeight: 900 }}>
              {title}
            </Heading>
          </Section>

          <Section style={{ padding: '30px 36px' }}>
            <Text style={{ color: '#344256', fontSize: 15, lineHeight: '24px', margin: 0 }}>
              {message}
            </Text>

            {details.length > 0 && (
              <Section style={{ marginTop: 24, border: '1px solid #e3e9f1', borderRadius: 10, overflow: 'hidden' }}>
                {details.map((detail, index) => (
                  <Section key={detail.label} style={{ padding: '12px 16px', borderTop: index === 0 ? 'none' : '1px solid #edf1f5' }}>
                    <Text style={{ margin: 0, color: '#728196', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {detail.label}
                    </Text>
                    <Text style={{ margin: '4px 0 0', color: '#061f3f', fontSize: 14, fontWeight: 700 }}>
                      {detail.value}
                    </Text>
                  </Section>
                ))}
              </Section>
            )}

            {ctaLabel && ctaUrl && (
              <Link
                href={ctaUrl}
                style={{
                  display: 'inline-block',
                  marginTop: 26,
                  backgroundColor: '#ff5f14',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  padding: '13px 18px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                {ctaLabel}
              </Link>
            )}

            <Hr style={{ borderColor: '#edf1f5', margin: '30px 0 18px' }} />
            <Text style={{ margin: 0, color: '#8b98a8', fontSize: 12, lineHeight: '18px' }}>
              Bewama supplier operations. Visit <Link href={SITE_URL} style={{ color: '#ff5f14' }}>bewama.com</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SupplierNotificationEmail
