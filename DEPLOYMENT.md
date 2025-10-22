# Guia de Implantação em Produção

Este guia fornece instruções passo a passo para implantar a plataforma de teste de QI em um ambiente de produção.

## Pré-requisitos

- Servidor com Node.js 14+ instalado
- Acesso a um provedor de hospedagem (Heroku, AWS, DigitalOcean, etc.)
- Domínio próprio (opcional, mas recomendado)
- Certificado SSL/TLS (geralmente fornecido gratuitamente por provedores)
- Conta Stripe com chaves de produção

## Opção 1: Implantação no Heroku (Recomendado para Iniciantes)

Heroku é a opção mais fácil para iniciantes, pois gerencia infraestrutura automaticamente.

### Passo 1: Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Baixe o instalador em https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Passo 2: Criar Conta Heroku

Acesse [https://www.heroku.com](https://www.heroku.com) e crie uma conta gratuita.

### Passo 3: Login no Heroku

```bash
heroku login
```

### Passo 4: Criar Aplicação Heroku

```bash
cd /home/ubuntu/iq_test_platform
heroku create seu-app-name
```

Substitua `seu-app-name` por um nome único.

### Passo 5: Configurar Variáveis de Ambiente

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_secreta_muito_longa_e_segura
heroku config:set STRIPE_SECRET_KEY=sk_live_sua_chave_stripe
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_stripe
heroku config:set CORS_ORIGIN=https://seu-app-name.herokuapp.com
```

### Passo 6: Implantar

```bash
git push heroku main
```

Se estiver usando uma branch diferente:

```bash
git push heroku seu-branch:main
```

### Passo 7: Abrir Aplicação

```bash
heroku open
```

Sua aplicação estará disponível em `https://seu-app-name.herokuapp.com`

## Opção 2: Implantação no DigitalOcean (Recomendado para Controle Total)

DigitalOcean oferece mais controle e é mais econômico para aplicações de médio porte.

### Passo 1: Criar Droplet

1. Acesse [https://www.digitalocean.com](https://www.digitalocean.com)
2. Crie uma conta e faça login
3. Clique em "Create" → "Droplets"
4. Selecione:
   - **Image:** Ubuntu 20.04 LTS
   - **Size:** $5/mês (suficiente para começar)
   - **Region:** Escolha a mais próxima
5. Clique em "Create Droplet"

### Passo 2: Conectar ao Droplet

```bash
ssh root@seu-ip-do-droplet
```

### Passo 3: Instalar Node.js e npm

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Passo 4: Clonar Repositório

```bash
cd /var/www
git clone seu-repositorio-git iq_test_platform
cd iq_test_platform
npm install
```

### Passo 5: Configurar Variáveis de Ambiente

```bash
nano .env
```

Adicione:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_longa_e_segura
STRIPE_SECRET_KEY=sk_live_sua_chave_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_stripe
CORS_ORIGIN=https://seu-dominio.com
```

### Passo 6: Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2
pm2 start server.js --name "iq-test"
pm2 startup
pm2 save
```

### Passo 7: Configurar Nginx como Reverse Proxy

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/default
```

Substitua o conteúdo por:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

### Passo 8: Configurar SSL com Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Opção 3: Implantação na AWS

AWS oferece a máxima flexibilidade e escalabilidade.

### Passo 1: Criar EC2 Instance

1. Acesse [https://aws.amazon.com](https://aws.amazon.com)
2. Vá para EC2 Dashboard
3. Clique em "Launch Instance"
4. Selecione Ubuntu 20.04 LTS
5. Escolha `t2.micro` (elegível para free tier)
6. Configure security groups para permitir portas 80, 443 e 22

### Passo 2: Conectar e Configurar

```bash
ssh -i seu-chave.pem ubuntu@seu-ip-aws
```

Siga os mesmos passos da seção DigitalOcean a partir do Passo 3.

## Checklist de Produção

Antes de lançar em produção, verifique:

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Chaves Stripe de produção (sk_live_ e pk_live_)
- [ ] JWT_SECRET é uma string longa e aleatória
- [ ] HTTPS está habilitado
- [ ] Domínio está apontando para o servidor
- [ ] Banco de dados está sendo feito backup regularmente
- [ ] Logs estão sendo monitorados
- [ ] Rate limiting está configurado
- [ ] CORS está restrito ao domínio correto
- [ ] Testes de pagamento foram realizados com sucesso

## Monitoramento e Manutenção

### Logs

Heroku:
```bash
heroku logs --tail
```

DigitalOcean/AWS:
```bash
pm2 logs
# ou
tail -f /var/log/nginx/access.log
```

### Backup do Banco de Dados

```bash
# Fazer backup
cp database/iq_test.db database/iq_test.db.backup

# Ou usar um serviço de backup automático
```

### Atualizar Aplicação

```bash
git pull origin main
npm install
pm2 restart iq-test
```

## Otimizações de Performance

1. **Compressão:** Ative gzip no Nginx
2. **Cache:** Configure cache de assets estáticos
3. **CDN:** Use CloudFlare para servir assets
4. **Database:** Considere migrar para PostgreSQL
5. **Monitoramento:** Use ferramentas como New Relic ou DataDog

## Troubleshooting

### Aplicação não inicia
```bash
npm start
# Verifique mensagens de erro
```

### Porta já em uso
```bash
lsof -i :3000
kill -9 PID
```

### Erro de conexão com banco de dados
```bash
# Verifique permissões do arquivo
chmod 644 database/iq_test.db
```

## Próximos Passos

1. Configure monitoramento e alertas
2. Implemente testes automatizados
3. Configure CI/CD com GitHub Actions
4. Adicione mais questões ao teste
5. Implemente análise de dados e relatórios
6. Configure suporte ao cliente

---

Para mais informações, consulte a documentação oficial dos provedores de hospedagem.

