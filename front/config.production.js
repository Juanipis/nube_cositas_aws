// Production Environment configuration for frontend with Nginx
window.ENV = {
  // When served through Nginx, the API is available at the same domain
  // Nginx proxy passes requests to the backend automatically
  API_BASE_URL: "",  // Use relative URLs since Nginx handles routing
  
  // Production configuration
  ENVIRONMENT: "production",
  
  // Initialize configuration
  async init() {
    try {
      console.log('🌐 Initializing production configuration...');
      
      // In production with Nginx, we use relative paths
      // Nginx handles routing /todos, /config, etc. to the backend
      this.API_BASE_URL = "";
      
      // Test if we can reach the backend through Nginx proxy
      const response = await fetch('/config');
      if (response.ok) {
        const config = await response.json();
        console.log('✅ Backend connection successful through Nginx proxy');
        console.log('📡 API Base URL:', this.API_BASE_URL || 'Relative paths');
        console.log('🔧 Backend Environment:', config.environment);
        return;
      } else {
        console.warn('⚠️  Could not reach backend through proxy, using fallback');
        // Fallback to direct backend connection if needed
        this.API_BASE_URL = "http://172.31.84.188:8000";
      }
    } catch (error) {
      console.warn('⚠️  Could not reach backend through proxy, using fallback:', error.message);
      // Fallback to direct backend connection
      this.API_BASE_URL = "http://172.31.84.188:8000";
    }
  },

  // Get API URL (not needed in this implementation but kept for compatibility)
  getEnvApiUrl() {
    return null; // We use relative URLs in production
  }
};

// Initialize configuration when the script loads
window.ENV.init(); 