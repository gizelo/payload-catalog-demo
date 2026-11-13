import { rmSync } from 'fs'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '../src/payload.config'
import type { User } from '../src/payload-types'

let payload: Payload
let editor: User
let categoryId: number

beforeAll(async () => {
  rmSync('./test.db', { force: true })
  payload = await getPayload({ config })
  await payload.create({ collection: 'users', data: { email: 'admin@demo.test', password: 'pass-1234', roles: ['admin'] } })
  editor = await payload.create({ collection: 'users', data: { email: 'editor@demo.test', password: 'pass-1234', roles: ['editor'] } })
  const category = await payload.create({ collection: 'categories', data: { title: 'Lamps' } })
  categoryId = category.id
  await payload.create({ collection: 'products', data: { title: 'Café Desk Lamp', category: categoryId, status: 'published', internalNotes: 'supplier margin 40%' } })
  await payload.create({ collection: 'products', data: { title: 'Floor Lamp', category: categoryId, status: 'draft' } })
})

afterAll(async () => {
  await payload.destroy()
  rmSync('./test.db', { force: true })
})

describe('products', () => {
  it('shows anonymous visitors only published products', async () => {
    const { docs } = await payload.find({ collection: 'products', overrideAccess: false })
    expect(docs.map((d) => d.slug)).toEqual(['cafe-desk-lamp'])
  })

  it('sets publishedAt when a product is published', async () => {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: 'cafe-desk-lamp' } } })
    expect(docs[0].publishedAt).toBeTruthy()
  })

  it('hides internal notes from editors', async () => {
    const { docs } = await payload.find({ collection: 'products', overrideAccess: false, user: editor })
    expect(docs).toHaveLength(2)
    expect(docs.every((d) => d.internalNotes === undefined)).toBe(true)
  })

  it('does not let editors delete products', async () => {
    const { docs } = await payload.find({ collection: 'products', limit: 1 })
    await expect(
      payload.delete({ collection: 'products', id: docs[0].id, overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })
})

describe('inquiries', () => {
  it('accepts a public inquiry but ignores a status sent by the visitor', async () => {
    const inquiry = await payload.create({
      collection: 'inquiries',
      overrideAccess: false,
      data: { name: '  Anna ', email: 'ANNA@Example.com ', message: 'Is it in stock?', status: 'answered' },
    })
    expect(inquiry.status).toBe('new')
    expect(inquiry.email).toBe('anna@example.com')
  })

  it('rejects submissions that fill the honeypot', async () => {
    await expect(
      payload.create({
        collection: 'inquiries',
        overrideAccess: false,
        data: { name: 'Bot', email: 'bot@spam.test', message: 'Buy now', website: 'http://spam.test' },
      }),
    ).rejects.toThrow('Spam detected')
  })

  it('keeps inquiries private from anonymous visitors', async () => {
    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })
})
