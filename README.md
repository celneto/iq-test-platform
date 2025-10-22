# Plataforma de Teste de QI Online

Uma aplicação web profissional e completa para administração de testes de Quociente de Inteligência (QI) online, com sistema de pagamento integrado, autenticação de usuários e geração de relatórios detalhados.

## Características Principais

A plataforma oferece um teste de QI abrangente baseado na metodologia da Escala de Inteligência Wechsler para Adultos (WAIS), avaliando quatro dimensões principais da inteligência:

- **Compreensão Verbal:** Avalia raciocínio verbal, vocabulário e conhecimento adquirido
- **Organização Perceptual:** Mede habilidades de raciocínio não verbal e resolução de problemas visuais
- **Memória Operacional:** Avalia a capacidade de reter e manipular informações na mente
- **Velocidade de Processamento:** Mede a rapidez e precisão no processamento de informações visuais

## Funcionalidades

### Autenticação e Gerenciamento de Usuários

A plataforma oferece um sistema robusto de autenticação com registro de novos usuários, login seguro com JWT (JSON Web Tokens) e gerenciamento de perfil. As senhas são armazenadas com hash bcryptjs para máxima segurança.

### Teste Interativo

O teste consiste em 15 questões cuidadosamente selecionadas que cobrem as quatro dimensões cognitivas. A interface é intuitiva e responsiva, com barra de progresso, navegação entre questões e temporizador para cada resposta.

### Sistema de Pontuação Profissional

As respostas são processadas através de um algoritmo de pontuação padronizado que converte as respostas brutas em uma escala de QI com média 100 e desvio padrão 15, alinhado com padrões internacionais.

### Análise Detalhada de Resultados

Cada usuário recebe um relatório completo incluindo:

- Pontuação de QI Total
- Índices para cada uma das quatro áreas cognitivas
- Classificação de inteligência (Muito Superior, Superior, Acima da Média, Média, Abaixo da Média, Limítrofe, Extremamente Baixo)
- Percentil comparativo com a população geral

### Sistema de Pagamento Integrado

Integração com Stripe para processamento seguro de pagamentos. O teste custa R$ 29,99 e os usuários podem acessar seus resultados por um ano após a compra.

### Histórico de Testes

Os usuários podem visualizar todos os testes que realizaram, com datas e resultados, permitindo acompanhar sua evolução ao longo do tempo.

## Estrutura Técnica

### Backend

O backend é desenvolvido em Node.js com Express.js, oferecendo uma API RESTful robusta:

- **Servidor:** Express.js
- **Banco de Dados:** SQLite3 para armazenamento local
- **Autenticação:** JWT (JSON Web Tokens)
- **Segurança:** bcryptjs para hash de senhas, CORS para controle de origem
- **Pagamento:** Stripe API

### Frontend

O frontend é uma aplicação web responsiva desenvolvida com HTML5, CSS3 e JavaScript vanilla:

- **Interface:** Design moderno e profissional
- **Responsividade:** Funciona perfeitamente em desktop, tablet e mobile
- **Sem dependências externas:** Apenas JavaScript vanilla para máxima performance

### Banco de Dados

O SQLite3 armazena:

- Dados de usuários (email, senha hasheada, nome)
- Sessões de teste
- Respostas individuais para cada questão
- Resultados finais com pontuações
- Informações de pagamento

## Instalação e Configuração

### Pré-requisitos

- Node.js 14 ou superior
- npm ou yarn

### Passos de Instalação

1. Clone ou extraia o projeto:
```bash
cd iq_test_platform
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database/iq_test.db
JWT_SECRET=sua_chave_secreta_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe
CORS_ORIGIN=http://localhost:3000
```

4. Inicie o servidor:
```bash
npm start
```

5. Acesse a aplicação em `http://localhost:3000`

## Fluxo de Uso

### Para Usuários Novos

1. Acesse a página inicial
2. Clique em "Iniciar Teste" ou "Login"
3. Se não tiver conta, clique em "Registre-se aqui"
4. Preencha o formulário com nome, email e senha
5. Após o registro, você será automaticamente autenticado
6. Clique em "Iniciar Teste" novamente
7. Processe o pagamento através do Stripe
8. Responda as 15 questões do teste
9. Receba seus resultados com análise detalhada

### Para Usuários Existentes

1. Faça login com seu email e senha
2. Clique em "Iniciar Teste"
3. Processe o pagamento
4. Responda o teste
5. Visualize seus resultados

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil do usuário (requer autenticação)

### Teste

- `GET /api/test/questions` - Obter todas as questões
- `POST /api/test/start` - Iniciar uma nova sessão de teste
- `POST /api/test/submit-answers` - Submeter respostas e obter resultados

### Pagamento

- `POST /api/payment/create-checkout-session` - Criar sessão de checkout Stripe
- `GET /api/payment/verify-payment/:session_id` - Verificar status do pagamento

### Resultados

- `GET /api/results` - Obter todos os resultados do usuário
- `GET /api/results/:result_id` - Obter resultado específico
- `GET /api/results/:result_id/pdf` - Gerar relatório em PDF (placeholder)

## Metodologia de Pontuação

A plataforma utiliza uma metodologia de pontuação alinhada com testes de QI profissionais:

### Escala de QI

| Faixa de QI | Classificação           | Percentual da População |
| :---------- | :---------------------- | :---------------------- |
| 130+        | Muito Superior          | 2.2%                    |
| 120-129     | Superior                | 6.7%                    |
| 110-119     | Acima da Média          | 16.1%                   |
| 90-109      | Média                   | 50%                     |
| 80-89       | Abaixo da Média         | 16.1%                   |
| 70-79       | Limítrofe               | 6.7%                    |
| 69-         | Extremamente Baixo      | 2.2%                    |

### Cálculo de Índices

Cada uma das quatro áreas cognitivas recebe uma pontuação padronizada com média 100 e desvio padrão 15. O QI Total é calculado como a média dos quatro índices.

## Segurança

A plataforma implementa várias medidas de segurança:

- **Hashing de Senhas:** bcryptjs com salt rounds configurável
- **JWT:** Tokens com expiração de 7 dias
- **CORS:** Controle de origem configurável
- **Validação de Entrada:** Validação em todos os endpoints
- **Stripe:** Integração segura com PCI compliance

## Próximos Passos para Produção

Para colocar a aplicação em produção, considere:

1. **Hospedagem:** Implante em serviços como Heroku, AWS, DigitalOcean ou Vercel
2. **Banco de Dados:** Migre para PostgreSQL ou MySQL para melhor escalabilidade
3. **SSL/TLS:** Configure certificados SSL para HTTPS
4. **Variáveis de Ambiente:** Use gerenciadores de secrets para produção
5. **Monitoramento:** Implemente logging e monitoramento de erros
6. **Testes:** Adicione testes unitários e de integração
7. **Documentação API:** Gere documentação com Swagger/OpenAPI
8. **Rate Limiting:** Implemente rate limiting para proteger contra abuso
9. **Backup:** Configure backups automáticos do banco de dados
10. **CDN:** Use CDN para servir arquivos estáticos

## Preço e Modelo de Negócio

O teste custa **R$ 29,99** por realização. Este preço pode ser ajustado modificando a constante `TEST_PRICE` no arquivo `routes/payment.js`.

### Receita Potencial

Com uma estratégia de marketing eficaz, a plataforma pode gerar receita significativa. Por exemplo:

- 100 testes/mês = R$ 2.999
- 1.000 testes/mês = R$ 29.990
- 10.000 testes/mês = R$ 299.900

## Suporte e Manutenção

Para manutenção contínua:

- Monitore logs de erro e performance
- Atualize dependências regularmente
- Realize backups periódicos do banco de dados
- Implemente melhorias baseadas em feedback de usuários
- Considere adicionar mais questões e categorias de teste

## Licença

Este projeto é fornecido como está. Você é livre para modificar e usar conforme necessário.

## Contato e Suporte

Para dúvidas ou sugestões sobre a plataforma, entre em contato através do formulário de feedback na aplicação.

---

**Desenvolvido com ❤️ para ajudar pessoas a entender melhor suas capacidades cognitivas.**

