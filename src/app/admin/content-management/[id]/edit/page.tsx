import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ContentForm from '../../content-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params

  const content = await prisma.content.findUnique({
    where: { id }
  })

  if (!content) {
    notFound()
  }

  return <ContentForm initialData={content} />
}
