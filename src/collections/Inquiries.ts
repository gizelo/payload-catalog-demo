import { APIError, type CollectionConfig } from 'payload'
import { isAdmin, isStaff, staffOnlyField } from '../access/roles'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'product', 'status', 'createdAt'] },
  access: {
    create: () => true,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create' || !data) return data
        if (data.website) throw new APIError('Spam detected', 400, undefined, true)
        return {
          ...data,
          name: data.name?.trim(),
          email: data.email?.trim().toLowerCase(),
          message: data.message?.trim(),
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true, maxLength: 2000 },
    { name: 'product', type: 'relationship', relationTo: 'products' },
    // Honeypot: real visitors never see this field, so any value means a bot.
    { name: 'website', type: 'text', virtual: true, admin: { hidden: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Answered', value: 'answered' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
  ],
}
