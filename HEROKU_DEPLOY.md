# Deploy no Heroku - Guia Passo a Passo

Este guia fornece instruções simples para fazer o deploy da Plataforma de Teste de QI no Heroku.

## Opção 1: Deploy com Um Clique (Mais Fácil)

Clique no botão abaixo para fazer o deploy automático no Heroku:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/seu-usuario/iq-test-platform)

**Nota:** Você precisará fazer fork do repositório no GitHub primeiro.

## Opção 2: Deploy Manual via Heroku CLI (Recomendado)

### Passo 1: Instalar Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Baixe o instalador em: https://devcenter.heroku.com/articles/heroku-cli

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Passo 2: Login no Heroku

```bash
heroku login
```

Isso abrirá seu navegador para você fazer login com sua conta Heroku.

### Passo 3: Criar Aplicação Heroku

```bash
cd /home/ubuntu/iq_test_platform
heroku create seu-app-name
```

Substitua `seu-app-name` por um nome único (ex: `meu-teste-qi-123`).

**Dica:** Se não especificar um nome, Heroku gerará um automaticamente.

### Passo 4: Configurar Variáveis de Ambiente

```bash
# JWT Secret (use uma string longa e aleatória)
heroku config:set JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria-aqui

# Stripe Keys (use as chaves de teste por enquanto)
heroku config:set STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui

# CORS Origin (será seu domínio Heroku)
heroku config:set CORS_ORIGIN=https://seu-app-name.herokuapp.com

# Node Environment
heroku config:set NODE_ENV=production
```

### Passo 5: Fazer Deploy

```bash
git push heroku master
```

Se estiver usando a branch `main`:
```bash
git push heroku main:master
```

### Passo 6: Abrir Aplicação

```bash
heroku open
```

Sua aplicação estará disponível em: `https://seu-app-name.herokuapp.com`

## Opção 3: Deploy via GitHub (Com CI/CD)

### Passo 1: Fazer Fork do Repositório

1. Acesse o repositório no GitHub
2. Clique em "Fork"
3. Clone o fork para seu computador

### Passo 2: Conectar ao Heroku

1. Acesse https://dashboard.heroku.com
2. Clique em "New" → "Create new app"
3. Escolha um nome
4. Vá para a aba "Deploy"
5. Selecione "GitHub" como método de deployment
6. Conecte sua conta GitHub
7. Procure por "iq-test-platform"
8. Clique em "Connect"

### Passo 3: Configurar Variáveis de Ambiente

1. Vá para a aba "Settings"
2. Clique em "Reveal Config Vars"
3. Adicione as variáveis:

| Chave | Valor |
| :---- | :---- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Sua chave secreta |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `CORS_ORIGIN` | `https://seu-app-name.herokuapp.com` |

### Passo 4: Fazer Deploy

1. Volte para a aba "Deploy"
2. Clique em "Deploy Branch"

## Testando a Aplicação

Após o deploy, acesse sua aplicação em `https://seu-app-name.herokuapp.com`

### Teste de Registro e Login

1. Clique em "Login"
2. Clique em "Registre-se aqui"
3. Preencha o formulário
4. Clique em "Registrar"

### Teste do Teste de QI

1. Clique em "Iniciar Teste"
2. Responda as 15 questões
3. Clique em "Finalizar Teste"
4. Veja seus resultados

### Teste de Pagamento

Para testar pagamentos sem cobrar valores reais, use os cartões de teste do Stripe:

**Cartão de Sucesso:**
- Número: `4242 4242 4242 4242`
- Expiração: Qualquer data futura (ex: 12/25)
- CVC: Qualquer 3 dígitos (ex: 123)

**Cartão de Falha:**
- Número: `4000 0000 0000 0002`
- Expiração: Qualquer data futura
- CVC: Qualquer 3 dígitos

## Visualizar Logs

```bash
heroku logs --tail
```

## Troubleshooting

### Erro: "Permission denied"
```bash
heroku login
```

### Erro: "App not found"
```bash
heroku apps:list
heroku git:remote -a seu-app-name
```

### Erro: "Build failed"
```bash
heroku logs --tail
# Verifique a mensagem de erro e corrija o problema
```

### Aplicação não inicia
```bash
heroku ps
heroku restart
```

## Próximos Passos

1. **Configurar Stripe de Produção:**
   - Obtenha chaves de produção em stripe.com
   - Atualize as variáveis de ambiente

2. **Configurar Domínio Próprio:**
   - Compre um domínio
   - Configure no Heroku (Settings → Domains)

3. **Implementar Marketing:**
   - Crie uma estratégia de aquisição de clientes
   - Anuncie a plataforma

4. **Monitoramento:**
   - Configure alertas
   - Monitore performance

## Recursos Úteis

- [Documentação Heroku Node.js](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku CLI Reference](https://devcenter.heroku.com/articles/heroku-cli-reference)
- [Troubleshooting Heroku](https://devcenter.heroku.com/articles/troubleshooting-node-deploys)

## Suporte

Se tiver problemas com o deploy:

1. Verifique os logs: `heroku logs --tail`
2. Consulte a documentação do Heroku
3. Verifique se todas as variáveis de ambiente estão configuradas

---

**Seu aplicativo estará pronto para produção em minutos!** 🚀

