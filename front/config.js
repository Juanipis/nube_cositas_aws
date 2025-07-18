// Dynamic Environment configuration for frontend
window.ENV = {
  // Default fallback configuration (can be overridden by env variables or dynamic config)
  API_BASE_URL: "http://localhost:8000",
  
  // Initialize configuration
  async init() {
    try {
      // Try to get configuration from environment variables first
      const envApiUrl = this.getEnvApiUrl();
      if (envApiUrl) {
        this.API_BASE_URL = envApiUrl;
        console.log('Using environment-based API URL:', this.API_BASE_URL);
        return;
      }

      // Fallback: try to get dynamic configuration from backend
      const response = await fetch(`${this.API_BASE_URL}/config`);
      if (response.ok) {
        const config = await response.json();
        this.API_BASE_URL = config.apiBaseUrl;
        console.log('Using dynamic API URL:', this.API_BASE_URL);
      } else {
        console.warn('Could not fetch dynamic config, using default URL');
      }
    } catch (error) {
      console.warn('Could not fetch dynamic config, using default URL:', error.message);
    }
  },

  // Get API URL from environment variables (if available)
  getEnvApiUrl() {
    // These would be set by the server when serving the HTML
    // or by a build process that replaces these values
    const protocol = '{{BACKEND_PROTOCOL}}' || 'http';
    const host = '{{BACKEND_HOST}}' || null;
    const port = '{{BACKEND_PORT}}' || '8000';
    
    // Check if we have real values (not template placeholders)
    if (host && host !== '{{BACKEND_HOST}}') {
      return `${protocol}://${host}:${port}`;
    }
    
    return null;
  }
};

// Initialize configuration when the script loads
window.ENV.init();
