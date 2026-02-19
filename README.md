# 💰 Financial API Simulator

Um simulador de operações bancárias robusto desenvolvido com tecnologias modernas de backend. Este projeto permite a criação de usuários, gerenciamento de contas e execução de transações financeiras seguras (depósitos e transferências).

## 🛠️ Tecnologias e Ferramentas

- **Runtime:** Node.js v24.13.1
- **Framework:** Fastify 
- **Banco de Dados:** PostgreSQL 15 (via Docker)
- **ORM:** Prisma
- **Documentação de Testes:** Postman

## 🏗️ Arquitetura do Projeto

O projeto utiliza uma estrutura organizada para facilitar a manutenção e escalabilidade:
- **Prisma:** Gerenciamento de schema e migrações de dados.
- **Transactions:** Uso de `$transaction` do Prisma para garantir a atomicidade das operações financeiras (evitando perda de dados em transferências).
