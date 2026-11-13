import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin, isStaff, publishedOrStaff } from '../access/roles'
import { formatSlug } from '../hooks/formatSlug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const becomesPublished = data.status === 'published' && originalDoc?.status !== 'published'
        return becomesPublished ? { ...data, publishedAt: new Date().toISOString() } : data
      },
    ],
    afterChange: [
      ({ doc, previousDoc, req }) => {
        if (doc.status === 'published' && previousDoc?.status !== 'published') {
          req.payload.logger.info(`Product published: ${doc.slug}`)
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'price', type: 'number', min: 0 },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { description: 'Visible to admins only.' },
    },
  ],
}
