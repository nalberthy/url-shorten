# URL Shortener

## Descrição
Funcionalidades essenciais de encurtamento, redirecionamento e estatísticas simples.

## Funcionalidades

### Recursos atuais
- **Encurtamento de URLs**: Criar links curtos automaticamente
- **Códigos Personalizados**: Permitir códigos customizados pelo usuário
- **Redirecionamento**: Redirecionar para URL original
- **Contagem de Cliques**: Rastrear quantas vezes cada URL foi acessada
- **Listagem**: Ver todas as URLs criadas
- **Estatísticas Básicas**: Total de URLs, cliques e top URLs
- **API Documentada**: Swagger UI integrado
- **Autenticação**: JWT + Passport.js
- **Hash de Senhas**: bcrypt
- **Guards**: JWT Auth Guard, Optional Auth Guard (acessos com e sem authenticação)
- **Estratégias**: Local Strategy, JWT Strategy

## Instalação

```bash
# Instalar dependências
npm install

# Subir versão modelada do banco
npm run db:push

# Iniciar aplicação
npm run start:dev
```

## Rodar com docker
Garanta que a variável de ambiente (conexão com banco) esteja definida de acordo com tipo de execução.

```bash
# Entrar na pasta do projeto e preparar a aplicação
cd url-shorten-api && npm install && cd ..

# Iniciar a aplicação com Docker
docker-compose up
```

### Links

- **Aplicação**: http://localhost:5000
- **Documentação**: http://localhost:5000/api/docs
- **Postman Collection**: [Endpoints prontos para teste direto](https://raw.githubusercontent.com/nalberthy/url-shorten/refs/heads/feat/collections/collection/V2%20-%20URL%20Shorten.json?token=GHSAT0AAAAAADH2A4XSDXQGR4YNI7ZXS2KY2ESIH6Q)
