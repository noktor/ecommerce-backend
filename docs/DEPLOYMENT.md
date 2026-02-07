# Deployment Guide

This guide explains how to securely manage environment variables and secrets for different environments (QA, Production) using GitHub.

## 🔐 Managing Secrets with GitHub

### Option 1: GitHub Secrets (Recommended for CI/CD)

GitHub Secrets allow you to store sensitive information securely and use it in GitHub Actions workflows.

#### Setting up GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Click "New repository secret"**

#### Required Secrets for QA Environment

Create these secrets with the `QA_` prefix:

- `QA_MONGODB_URI` - MongoDB Atlas connection string for QA
- `QA_REDIS_URL` - Redis connection URL for QA
- `QA_RABBITMQ_URL` - RabbitMQ connection URL for QA
- `QA_FRONTEND_URL` - Frontend URL for QA environment

#### Required Secrets for Production Environment

Create these secrets with the `PROD_` prefix:

- `PROD_MONGODB_URI` - MongoDB Atlas connection string for Production
- `PROD_REDIS_URL` - Redis connection URL for Production
- `PROD_RABBITMQ_URL` - RabbitMQ connection URL for Production
- `PROD_FRONTEND_URL` - Frontend URL for Production environment

#### Using GitHub Environments (Advanced)

For better control and protection rules:

1. **Go to**: Settings → Environments
2. **Create environments**: `qa` and `production`
3. **Add secrets to each environment** (instead of repository secrets)
4. **Set protection rules** (required reviewers, deployment branches, etc.)

### Option 2: Environment Variables on Server

If you deploy manually or use a different CI/CD system:

1. **Set environment variables on the server**:
   ```bash
   export MONGODB_URI="mongodb+srv://..."
   export REDIS_URL="redis://..."
   export RABBITMQ_URL="amqp://..."
   ```

2. **Or use a `.env` file on the server** (ensure it's not in git):
   ```bash
   # On QA server
   scp .env.qa user@qa-server:/path/to/app/.env
   
   # On Production server
   scp .env.prod user@prod-server:/path/to/app/.env
   ```

## 🚀 Deployment Workflow

### Automatic Deployment (GitHub Actions)

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Runs tests** on every push
2. **Deploys to QA** when pushing to `develop` branch
3. **Deploys to Production** when pushing to `main` branch

#### How it works:

- Secrets are injected as environment variables during deployment
- A `.env` file is created dynamically from secrets
- The application reads from `.env` or environment variables

### Manual Deployment

If deploying manually:

1. **Ensure secrets are set** on the target server
2. **Create `.env` file** with correct values
3. **Run deployment commands**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## ✅ Validation

The application validates that required environment variables are set:

- `MONGODB_URI` is required (throws error if missing)
- Placeholder values are detected and rejected
- Clear error messages guide setup

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different credentials** for each environment
3. **Rotate secrets regularly**
4. **Use GitHub Environments** for production deployments
5. **Enable branch protection** on `main` branch
6. **Require pull request reviews** before production deployment
7. **Use least privilege** - Only grant necessary permissions

## 📋 Checklist for New Environments

- [ ] Create GitHub secrets for the environment
- [ ] Set up GitHub Environment (if using environments)
- [ ] Configure deployment workflow
- [ ] Test deployment to the environment
- [ ] Verify all services are connected
- [ ] Document environment-specific configurations

## 🆘 Troubleshooting

### "MONGODB_URI environment variable is required"

- Check that the secret is set in GitHub
- Verify the secret name matches the workflow
- Ensure the environment is correctly configured

### "Authentication failed" errors

- Verify credentials in GitHub Secrets
- Check MongoDB Atlas IP whitelist
- Ensure user has correct permissions

### Secrets not available in workflow

- Check that secrets are set in the correct scope (repository or environment)
- Verify the workflow has access to the environment
- Check workflow logs for detailed error messages

