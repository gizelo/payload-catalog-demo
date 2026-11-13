import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin, selfOrAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    create: isAdmin,
    read: selfOrAdmin,
    update: selfOrAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        return totalDocs === 0 ? { ...data, roles: ['admin'] } : data
      },
    ],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { create: adminOnlyField, update: adminOnlyField },
    },
  ],
}
