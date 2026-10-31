import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { hash } from 'bcryptjs'

const app = Fastify({ logger: true })
const prisma = new PrismaClient()

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.register(cors, {
  origin: (origin, callback) => {
    // Requests without an Origin header (e.g. CLI/server-to-server) are allowed.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin not allowed'), false)
  },
})

app.get('/', async () => ({
  message: 'Financial API Simulator is running',
}))

app.post('/users', async (request, reply) => {
  const body = (request.body || {}) as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return reply.status(400).send({
      error: 'Name, a valid email and a password with at least 8 characters are required.',
    })
  }

  try {
    const accountNumber = Math.floor(100000 + Math.random() * 900000).toString()
    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        accounts: { create: { number: accountNumber, balance: 0 } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        accounts: true,
      },
    })

    return reply.status(201).send(user)
  } catch (error) {
    request.log.error(error)
    return reply.status(400).send({ error: 'Unable to create user. The email may already be registered.' })
  }
})

app.get('/users', async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      accounts: true,
    },
  })
})

app.post('/transactions/deposit', async (request, reply) => {
  const body = (request.body || {}) as Record<string, unknown>
  const accountId = typeof body.accountId === 'string' ? body.accountId : ''
  const amountNumber = Number(body.amount)
  const description = typeof body.description === 'string' ? body.description : undefined

  if (!accountId || !Number.isFinite(amountNumber) || amountNumber <= 0) {
    return reply.status(400).send({ error: 'A valid accountId and an amount greater than zero are required.' })
  }

  try {
    const amount = new Decimal(amountNumber)
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      })
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'CREDIT',
          description,
          receiverAccountId: accountId,
        },
      })
      return { transaction, newBalance: account.balance }
    })

    return reply.status(201).send(result)
  } catch (error) {
    request.log.error(error)
    return reply.status(400).send({ error: 'Unable to process deposit. Check the account and request data.' })
  }
})

app.post('/transactions/transfer', async (request, reply) => {
  const body = (request.body || {}) as Record<string, unknown>
  const senderAccountId = typeof body.senderAccountId === 'string' ? body.senderAccountId : ''
  const receiverAccountId = typeof body.receiverAccountId === 'string' ? body.receiverAccountId : ''
  const amountNumber = Number(body.amount)
  const description = typeof body.description === 'string' ? body.description : undefined

  if (
    !senderAccountId ||
    !receiverAccountId ||
    senderAccountId === receiverAccountId ||
    !Number.isFinite(amountNumber) ||
    amountNumber <= 0
  ) {
    return reply.status(400).send({
      error: 'Valid, different sender and receiver accounts and an amount greater than zero are required.',
    })
  }

  try {
    const amount = new Decimal(amountNumber)
    const result = await prisma.$transaction(async (tx) => {
      const sender = await tx.account.findUnique({ where: { id: senderAccountId } })
      const receiver = await tx.account.findUnique({ where: { id: receiverAccountId } })

      if (!sender || !receiver) throw new Error('Sender or receiver account was not found.')
      if (sender.balance.lessThan(amount)) throw new Error('Insufficient funds.')

      await tx.account.update({
        where: { id: senderAccountId },
        data: { balance: { decrement: amount } },
      })
      await tx.account.update({
        where: { id: receiverAccountId },
        data: { balance: { increment: amount } },
      })

      return tx.transaction.create({
        data: {
          amount,
          type: 'TRANSFER',
          description,
          senderAccountId,
          receiverAccountId,
        },
      })
    })

    return reply.status(201).send(result)
  } catch (error) {
    request.log.error(error)
    const message = error instanceof Error ? error.message : 'Unable to process transfer.'
    const statusCode = message === 'Insufficient funds.' ? 400 : 400
    return reply.status(statusCode).send({ error: message })
  }
})

app.get('/accounts/:id/statement', async (request, reply) => {
  const { id } = request.params as { id: string }
  if (!id) return reply.status(400).send({ error: 'A valid account id is required.' })

  try {
    return await prisma.transaction.findMany({
      where: {
        OR: [{ senderAccountId: id }, { receiverAccountId: id }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        senderAccount: { select: { user: { select: { name: true } } } },
        receiverAccount: { select: { user: { select: { name: true } } } },
      },
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({ error: 'Unable to retrieve account statement.' })
  }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3333)
    await app.listen({ port, host: '0.0.0.0' })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
