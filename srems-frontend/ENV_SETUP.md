# SREMS Frontend - Environment Variables Guide

## Overview

SREMS Frontend uses environment variables to configure API endpoints, logging, and session settings without modifying code.

## Setup Instructions

### 1. Copy .env.example to .env

```bash
cp .env.example .env
```

### 2. Edit .env with your values

```bash
# Edit .env file with your editor
# Update API_BASE_URL, API_SERVICE_PATH, API_VERSION as needed
```

## Environment Variables

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8082` | Backend API server URL (without trailing slash) |
| `VITE_API_SERVICE_PATH` | `/software-management-service` | Service path on backend |
| `VITE_API_VERSION` | `/api/v1` | API version |

**Example:**
```env
# Development
VITE_API_BASE_URL=http://localhost:8082

# Production
VITE_API_BASE_URL=https://api.example.com
```

### Application Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | `SREMS Frontend` | Application display name |
| `VITE_ENVIRONMENT` | `development` | Environment: `development`, `staging`, `production` |

### Logging Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_LOGGING` | `true` | Enable console logging |
| `VITE_LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |

### Session Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SESSION_TIMEOUT_MINUTES` | `30` | Auto-logout timeout (minutes) |
| `VITE_TOKEN_REFRESH_INTERVAL_MINUTES` | `5` | Token refresh interval (minutes) |

## Usage in Code

Environment variables are automatically loaded into `window.ENV` object:

```javascript
// Access in any JavaScript file
const apiUrl = window.ENV.API_BASE_URL;
const appName = window.ENV.APP_NAME;
const isProduction = window.ENV.ENVIRONMENT === 'production';

// Or use through constants.js
import { API_CONFIG, APP_CONFIG } from './src/js/utils/constants.js';

console.log(API_CONFIG.BASE_URL);  // Loads from window.ENV.API_BASE_URL
console.log(APP_CONFIG.ENVIRONMENT);  // Loads from window.ENV.ENVIRONMENT
```

## Environment Profiles

### Development (.env)

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_ENVIRONMENT=development
VITE_ENABLE_LOGGING=true
VITE_LOG_LEVEL=info
VITE_SESSION_TIMEOUT_MINUTES=30
```

### Production (.env.production)

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENVIRONMENT=production
VITE_ENABLE_LOGGING=false
VITE_LOG_LEVEL=error
VITE_SESSION_TIMEOUT_MINUTES=60
```

## Deployment

### Before deploying:

1. **Update .env with production values:**
   ```bash
   # Copy template
   cp .env.example .env.production
   
   # Edit with production values
   nano .env.production
   ```

2. **On deployment server:**
   ```bash
   # Copy .env file to the deployed directory
   # Important: Keep .env secure in your deployment environment
   ```

3. **Access control:**
   - Add `.env` to `.gitignore` (already done)
   - Never commit `.env` file to Git
   - Use secure credential management (GitHub Secrets, CI/CD variables, etc.)

## How It Works

### Loading Process

1. **Page Load:** `index.html` loads `env.js` first
2. **env.js Execution:** 
   - Fetches `.env` file from root directory
   - Parses key=value pairs
   - Stores in `window.ENV` object
   - Falls back to defaults if .env not found
3. **Code Access:** `constants.js` reads from `window.ENV`
4. **API Calls:** All API requests use these values

### Fallback Chain

```
.env file → window.ENV → constants.js → hardcoded defaults → runtime values
```

## Troubleshooting

### "API Error: Cannot connect to backend"

1. Check `.env` file exists in root directory
2. Verify `VITE_API_BASE_URL` is correct
3. Check browser console for `[ENV]` logs
4. Backend server should be running on configured URL

**Debug in browser console:**
```javascript
console.log(window.ENV);  // See all loaded variables
```

### "Environment variables not loading"

1. Verify `.env` file is in project root (same level as `index.html`)
2. Check `.env` file format (KEY=VALUE, one per line, no spaces around `=`)
3. Clear browser cache and reload
4. Check browser DevTools Console for `[ENV]` messages

### ".env file not found" warning

This is normal if `.env` doesn't exist. Application will use defaults. To fix:
```bash
cp .env.example .env
# Edit .env with your values
```

## Security Notes

⚠️ **Important:**
- **NEVER commit `.env` to version control** (already in .gitignore)
- **Never expose sensitive keys** in environment variables visible to frontend
- **Use backend-only secrets** for sensitive data (API keys, database credentials, etc.)
- For public values, use environment variables
- For secrets, use backend-only configuration

## Examples

### Change API Server

```bash
# Edit .env
VITE_API_BASE_URL=http://192.168.1.100:8082
```

### Production Setup

```bash
# .env.production
VITE_API_BASE_URL=https://api.prod.company.com
VITE_ENVIRONMENT=production
VITE_ENABLE_LOGGING=false
VITE_SESSION_TIMEOUT_MINUTES=60
```

### Local Development with Custom Port

```bash
VITE_API_BASE_URL=http://localhost:9090
VITE_API_SERVICE_PATH=/software-management-service
VITE_ENVIRONMENT=development
```

## Support

For issues or questions:
1. Check browser console for `[ENV]` logs
2. Verify .env file exists and format is correct
3. Clear browser cache and reload
4. Restart backend server

---

**Version:** 1.0.0  
**Updated:** 2026-04-01
