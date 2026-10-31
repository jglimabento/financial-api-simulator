export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isPositiveAmount = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return false
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0
}

export const areDifferentAccounts = (senderAccountId: unknown, receiverAccountId: unknown): boolean =>
  typeof senderAccountId === 'string' &&
  senderAccountId.trim().length > 0 &&
  typeof receiverAccountId === 'string' &&
  receiverAccountId.trim().length > 0 &&
  senderAccountId !== receiverAccountId
