// Direct API configuration for frontend
window.ENV = {
  // Direct connection to backend API
  API_BASE_URL: "http://44.204.83.247:8000",
  
  // Production configuration
  ENVIRONMENT: "production",
  
  // Initialize configuration
  async init() {
    try {
      console.log('🌐 Initializing direct API configuration...');
      console.log('📡 API Base URL:', this.API_BASE_URL);
      
      // Test backend connection
      const response = await fetch(`${this.API_BASE_URL}/health`);
      if (response.ok) {
        console.log('✅ Backend connection successful');
        const healthData = await response.json();
        console.log('🔧 Backend Status:', healthData);
      } else {
        console.warn('⚠️  Backend health check failed');
      }
    } catch (error) {
      console.warn('⚠️  Could not reach backend:', error.message);
      console.log('🔄 Will continue with configured URL');
    }
  },

  // Get API URL (kept for compatibility)
  getEnvApiUrl() {
    return this.API_BASE_URL;
  }
};

// Initialize configuration when the script loads
window.ENV.init();
