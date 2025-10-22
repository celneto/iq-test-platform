# Configuração do Stripe para Pagamentos

Este guia explica como configurar a integração com o Stripe para processar pagamentos na plataforma de teste de QI.

## O que é Stripe?

Stripe é uma plataforma de pagamento online que permite aceitar cartões de crédito e outros métodos de pagamento. É segura, confiável e amplamente utilizada por empresas em todo o mundo.

## Passo 1: Criar uma Conta Stripe

1. Acesse [https://stripe.com/br](https://stripe.com/br)
2. Clique em "Começar" ou "Sign Up"
3. Preencha o formulário com seus dados pessoais e de negócio
4. Verifique seu email
5. Complete o processo de verificação de identidade

## Passo 2: Obter Chaves de API

Após criar a conta:

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para **Developers** → **API Keys**
3. Você verá duas chaves:
   - **Publishable Key** (chave pública) - começa com `pk_`
   - **Secret Key** (chave secreta) - começa com `sk_`

### Modo de Teste vs. Produção

Stripe oferece dois modos:

- **Modo de Teste:** Use para testar a integração. Neste modo, você pode usar cartões de teste fornecidos pelo Stripe.
- **Modo de Produção:** Use quando estiver pronto para aceitar pagamentos reais.

Inicialmente, você estará no modo de teste. Para alternar entre modos, use o toggle no canto superior direito do dashboard.

## Passo 3: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione suas chaves Stripe:

```
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
```

**Importante:** Nunca compartilhe sua chave secreta (`sk_`) com ninguém. Ela deve ser mantida segura no servidor.

## Passo 4: Cartões de Teste

Para testar pagamentos no modo de teste, use os seguintes cartões fornecidos pelo Stripe:

### Cartão de Sucesso
- **Número:** 4242 4242 4242 4242
- **Expiração:** Qualquer data futura (ex: 12/25)
- **CVC:** Qualquer número de 3 dígitos (ex: 123)

### Cartão de Falha
- **Número:** 4000 0000 0000 0002
- **Expiração:** Qualquer data futura
- **CVC:** Qualquer número de 3 dígitos

### Cartão com Autenticação 3D Secure
- **Número:** 4000 0025 0000 3155
- **Expiração:** Qualquer data futura
- **CVC:** Qualquer número de 3 dígitos

## Passo 5: Testar a Integração

1. Inicie o servidor: `npm start`
2. Acesse a aplicação em `http://localhost:3000`
3. Registre uma nova conta
4. Clique em "Iniciar Teste"
5. Proceda para o checkout
6. Use um dos cartões de teste acima
7. Complete o pagamento

## Passo 6: Configurar Webhook (Opcional)

Para produção, é recomendado configurar webhooks para receber notificações de eventos de pagamento:

1. No Dashboard do Stripe, vá para **Developers** → **Webhooks**
2. Clique em "Adicionar endpoint"
3. Insira a URL do seu servidor: `https://seu-dominio.com/api/payment/webhook`
4. Selecione os eventos que deseja receber (ex: `checkout.session.completed`)
5. Copie a chave de assinatura do webhook
6. Adicione ao `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_aqui
```

## Passo 7: Migrar para Produção

Quando estiver pronto para aceitar pagamentos reais:

1. No Dashboard do Stripe, ative o modo de produção
2. Copie as chaves de produção (começam com `pk_live_` e `sk_live_`)
3. Atualize o arquivo `.env` com as chaves de produção
4. Certifique-se de que seu servidor está usando HTTPS
5. Teste novamente com um cartão real (use um valor pequeno)

## Segurança e Boas Práticas

- **Nunca** exponha sua chave secreta no código frontend
- **Sempre** use HTTPS em produção
- **Valide** todas as transações no backend
- **Implemente** rate limiting para prevenir abuso
- **Monitore** suas transações no dashboard do Stripe
- **Configure** alertas para atividades suspeitas

## Resolvendo Problemas

### Erro: "Invalid API Key"
- Verifique se a chave está correta no arquivo `.env`
- Certifique-se de estar usando a chave correta (Secret Key no backend)
- Reinicie o servidor após alterar as chaves

### Erro: "Webhook signature verification failed"
- Verifique se a chave do webhook está correta
- Certifique-se de que o endpoint está acessível publicamente
- Teste o webhook usando a ferramenta de teste do Stripe

### Pagamento não está sendo processado
- Verifique se o servidor está rodando
- Verifique os logs do servidor para mensagens de erro
- Confirme que as chaves do Stripe estão corretas
- Teste com um cartão de teste do Stripe

## Documentação Adicional

Para mais informações, consulte:

- [Documentação do Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/checkout)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)

## Suporte

Se tiver dúvidas sobre o Stripe, entre em contato com o suporte do Stripe através do seu dashboard ou visite [https://support.stripe.com](https://support.stripe.com).

---

**Nota:** Este guia assume que você está usando a integração Stripe Checkout. Existem outras formas de integração (como Stripe Elements) que podem ser mais adequadas para casos específicos.

