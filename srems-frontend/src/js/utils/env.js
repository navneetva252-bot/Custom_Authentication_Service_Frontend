/**
 * env.js
 * Environment loader for vanilla JavaScript
 * Loads environment variables from .env file
 */

// ═══════════════════════════════════════════════════════════════════════════
// Environment Variables (global object)
// ═══════════════════════════════════════════════════════════════════════════

window.ENV = {
  // API Configuration
  API_BASE_URL: 'http://localhost:8082',
  API_SERVICE_PATH: '/software-management-service',
  API_VERSION: '/api/v1',
  
  // Application Configuration
  APP_NAME: 'SREMS Frontend',
  ENVIRONMENT: 'development',
  
  // Features
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'info',
  
  // Session Configuration
  SESSION_TIMEOUT_MINUTES: 30,
  TOKEN_REFRESH_INTERVAL_MINUTES: 5,
};

/**
 * Load environment variables from .env file at runtime
 * Usage in HTML: <script src="env.js"></script>
 */
async function loadEnvVariables() {
  try {
    const response = await fetch('.env');
    if (!response.ok) {
      console.log('[ENV] .env file not found, using default values');
      return;
    }
    
    const envText = await response.text();
    const lines = envText.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      const cleanKey = key.trim().replace('VITE_', '');
      const value = valueParts.join('=').trim();
      
      if (cleanKey && value) {
        // Handle different value types
        let parsedValue = value;
        
        // Parse booleans
        if (value.toLowerCase() === 'true') parsedValue = true;
        if (value.toLowerCase() === 'false') parsedValue = false;
        
        // Parse numbers
        if (!isNaN(value) && value !== '') parsedValue = Number(value);
        
        window.ENV[cleanKey] = parsedValue;
        console.log(`[ENV] Loaded: ${cleanKey} = ${parsedValue}`);
      }
    });
    
    console.log('[ENV] ✅ Environment variables loaded successfully');
    console.log('[ENV] Current environment:', window.ENV.ENVIRONMENT);
  } catch (error) {
    console.warn('[ENV] Warning: Could not load .env file', error);
    console.log('[ENV] Using default environment values');
  }
}

// Auto-load environment variables on script load
loadEnvVariables();

// Export for ES modules if needed
export default window.ENV;
