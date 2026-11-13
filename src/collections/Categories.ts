import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '../access/roles'
import { formatSlug } from '../hooks/formatSlug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
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
  ],
}
