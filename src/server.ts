import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const app = Fastify({ logger: true })
const prisma = new PrismaClient()

app.register(cors, { origin: true })

app.get('/', async () => {
  return { message: 'Financial API Simulator is running 🚀' }
})


app.post('/users', async (request, reply) => {
  const { name, email, password } = request.body as any

  try {
    
    const accountNumber = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        accounts: {
          create: {
            number: accountNumber,
            balance: 0.0,
          }
        }
      },
      include: {
        accounts: true 
      }
    })

    return reply.status(201).send(user)
  } catch (error) {
    request.log.error(error)
    return reply.status(400).send({ error: 'Erro ao criar usuário. Email já existe?' })
  }
})


app.get('/users', async () => {
  const users = await prisma.user.findMany({
    include: { accounts: true }
  })
  return users
})


app.post('/transactions/deposit', async (request, reply) => {
  const { accountId, amount, description } = request.body as any

  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          amount: new Decimal(amount),
          type: 'CREDIT',
          description,
          receiverAccountId: accountId
        }
      })

      const account = await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: new Decimal(amount) }
        }
      })

      return { transaction, newBalance: account.balance }
    })

    return reply.status(201).send(result)
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({ error: 'Erro no processamento do depósito' })
  }
})


app.post('/transactions/transfer', async (request, reply) => {
  const { senderAccountId, receiverAccountId, amount, description } = request.body as any
  const transferAmount = new Decimal(amount)

  try {
    const result = await prisma.$transaction(async (tx) => {
     
      const sender = await tx.account.findUnique({
        where: { id: senderAccountId }
      })

      if (!sender || sender.balance.lessThan(transferAmount)) {
        throw new Error('Saldo insuficiente')
      }

     
      await tx.account.update({
        where: { id: senderAccountId },
        data: { balance: { decrement: transferAmount } }
      })

     
      await tx.account.update({
        where: { id: receiverAccountId },
        data: { balance: { increment: transferAmount } }
      })

     
      const transaction = await tx.transaction.create({
        data: {
          amount: transferAmount,
          type: 'TRANSFER',
          description,
          senderAccountId,
          receiverAccountId
        }
      })

      return transaction
    })

    return reply.status(201).send(result)

  } catch (error: any) {
    request.log.error(error)
    return reply.status(400).send({ error: error.message || 'Erro na transferência' })
  }
})

app.get('/accounts/:id/statement', async (request, reply) => {
  const { id } = request.params as any

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountId: id },   
          { receiverAccountId: id } 
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        senderAccount: { select: { user: { select: { name: true } } } },
        receiverAccount: { select: { user: { select: { name: true } } } }
      }
    })

    return transactions
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao buscar extrato' })
  }
})

const start = async () => {
  try {
    await app.listen({ port: 3333 })
    console.log('HTTP Server running on http://localhost:3333')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()