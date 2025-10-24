# Configuração PayPal - Guia Completo

Este guia explica como configurar PayPal para receber pagamentos na sua plataforma de Teste de QI.

## 🎯 Por Que PayPal?

- ✅ Fácil de configurar
- ✅ Aceita pagamentos de qualquer lugar do mundo
- ✅ Depósitos diretos na sua conta bancária
- ✅ Suporte ao cliente 24/7
- ✅ Segurança de nível enterprise

## 📋 Passo a Passo

### Passo 1: Criar Conta PayPal Business

1. Acesse: **https://www.paypal.com/br**
2. Clique em **"Inscrever-se"**
3. Escolha **"Conta Business"**
4. Preencha seus dados:
   - Nome completo
   - Email
   - Senha
   - Tipo de negócio: Educação/Serviços
5. Verifique seu email
6. Adicione informações bancárias para receber pagamentos

### Passo 2: Obter Credenciais de Sandbox (Teste)

1. Acesse: **https://developer.paypal.com**
2. Faça login com sua conta PayPal
3. Vá para **"Dashboard"**
4. Clique em **"Sandbox"** (lado esquerdo)
5. Você verá duas contas de teste:
   - **Merchant (Vendedor)** - Sua conta
   - **Buyer (Comprador)** - Para testar

### Passo 3: Criar Aplicação API

1. No Dashboard, vá para **"Apps & Credentials"**
2. Certifique-se de estar em **"Sandbox"** (não Production)
3. Clique em **"Create App"**
4. Nome da app: `IQ Test Platform`
5. Clique em **"Create"**

### Passo 4: Obter Client ID e Secret

1. Na página da app, você verá:
   - **Client ID** (chave pública)
   - **Secret** (chave privada)
2. Clique em **"Show"** para ver o Secret
3. **Copie ambos** (você usará em breve)

### Passo 5: Configurar no Render.com

1. Acesse: **https://dashboard.render.com**
2. Selecione seu projeto `iq-test-platform`
3. Vá para **"Environment"**
4. Adicione as variáveis:

```
PAYPAL_CLIENT_ID=seu_client_id_aqui
PAYPAL_CLIENT_SECRET=seu_secret_aqui
PAYPAL_MODE=sandbox
```

5. Clique em **"Save"**
6. O Render vai fazer redeploy automaticamente (aguarde 2-3 minutos)

### Passo 6: Testar Pagamento

1. Acesse sua aplicação: **https://iq-test-platform.onrender.com**
2. Clique em **"Iniciar Teste Agora"**
3. Responda as 15 questões
4. Clique em **"Desbloquear Análise Completa"**
5. Use uma conta de teste do PayPal:
   - Email: `sb-xxxxx@personal.example.com` (fornecido no Sandbox)
   - Senha: `123456` (ou a que você configurou)

### Passo 7: Ir para Produção

Quando estiver pronto para aceitar pagamentos reais:

1. No PayPal Developer, vá para **"Production"**
2. Crie uma app em Production
3. Obtenha as credenciais de Production
4. No Render, atualize:

```
PAYPAL_CLIENT_ID=seu_client_id_production
PAYPAL_CLIENT_SECRET=seu_secret_production
PAYPAL_MODE=production
```

5. Pronto! Agora você receberá pagamentos reais.

---

## 💰 Receber Pagamentos

### Configurar Conta Bancária

1. No PayPal, vá para **"Configurações"** → **"Transferências bancárias"**
2. Adicione sua conta bancária
3. Confirme a transferência (PayPal fará 2 depósitos pequenos)
4. Insira os valores para confirmar

### Sacar Dinheiro

1. Vá para **"Carteira"** → **"Transferir fundos"**
2. Selecione **"Transferir para sua conta bancária"**
3. Digite o valor
4. Confirme

Os fundos chegam em 1-3 dias úteis.

---

## 🧪 Testar com Contas Sandbox

### Conta de Vendedor (Sua Conta)

- Email: `sb-xxxxx+facilitator@personal.example.com`
- Senha: `123456`

### Conta de Comprador (Cliente)

- Email: `sb-xxxxx+buyer@personal.example.com`
- Senha: `123456`

Use a conta de comprador para testar pagamentos.

---

## 📊 Monitorar Transações

### No PayPal

1. Vá para **"Atividade"** → **"Transações"**
2. Veja todos os pagamentos recebidos
3. Clique em uma transação para detalhes

### Em Sua Aplicação

1. Acesse o banco de dados
2. Tabela `payments` mostra:
   - ID do pagamento
   - Valor
   - Status
   - Data

---

## 🔐 Segurança

### Boas Práticas

- ✅ Nunca compartilhe seu Secret
- ✅ Use HTTPS em produção
- ✅ Valide todos os pagamentos no servidor
- ✅ Implemente webhooks para confirmação
- ✅ Mantenha logs de transações

### Proteção contra Fraude

PayPal oferece proteção automática:
- Detecção de fraude
- Proteção do vendedor
- Reembolsos automáticos

---

## 🚨 Troubleshooting

### Erro: "Invalid Client ID"

- Verifique se o Client ID está correto
- Certifique-se de estar em Sandbox (não Production)
- Regenere as credenciais se necessário

### Erro: "Payment Failed"

- Verifique se a conta tem fundos
- Tente com outra conta de teste
- Verifique os logs da aplicação

### Pagamento não aparece na aplicação

- Aguarde 5-10 minutos para sincronizar
- Verifique o webhook
- Consulte os logs do servidor

---

## 📞 Suporte PayPal

- **Centro de Ajuda:** https://www.paypal.com/br/smarthelp
- **Fórum de Desenvolvedores:** https://developer.paypal.com/community
- **Email:** developer@paypal.com

---

## ✅ Checklist Final

- [ ] Conta PayPal Business criada
- [ ] App criada em Sandbox
- [ ] Client ID e Secret obtidos
- [ ] Variáveis configuradas no Render
- [ ] Teste de pagamento realizado com sucesso
- [ ] Conta bancária adicionada
- [ ] Credenciais de Production obtidas
- [ ] Aplicação em modo Production

---

**Parabéns! Você está pronto para receber pagamentos!** 💰

Agora é hora de promover sua plataforma e começar a ganhar dinheiro!

