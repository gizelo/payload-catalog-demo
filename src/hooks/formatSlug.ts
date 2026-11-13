import type { FieldHook } from 'payload'

export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const formatSlug =
  (sourceField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const source = data?.[sourceField] ?? originalDoc?.[sourceField]
    return typeof source === 'string' ? slugify(source) : value
  }
