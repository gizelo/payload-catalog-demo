import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor'

export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const userRoles = (user as { roles?: Role[] } | null | undefined)?.roles
  return Array.isArray(userRoles) && userRoles.some((role) => roles.includes(role))
}

export const isAdmin: Access = ({ req }) => hasRole(req.user, 'admin')

export const isStaff: Access = ({ req }) => hasRole(req.user, 'admin', 'editor')

export const adminOnlyField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')

export const staffOnlyField: FieldAccess = ({ req }) => hasRole(req.user, 'admin', 'editor')

// Anonymous visitors get a query constraint instead of `false`, so the same
// endpoint serves the public catalogue and the full editorial view.
export const publishedOrStaff: Access = ({ req }) =>
  hasRole(req.user, 'admin', 'editor') ? true : { status: { equals: 'published' } }

export const selfOrAdmin: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true
  return req.user ? { id: { equals: req.user.id } } : false
}
