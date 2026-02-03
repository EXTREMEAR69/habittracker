// Mock storage API for local development
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { key, value, shared: false } : null;
    } catch (error) {
      return null;
    }
  },
  
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    } catch (error) {
      return null;
    }
  },
  
  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch (error) {
      return null;
    }
  },
  
  async list(prefix) {
    try {
      const keys = Object.keys(localStorage).filter(k => 
        prefix ? k.startsWith(prefix) : true
      );
      return { keys, prefix, shared: false };
    } catch (error) {
      return null;
    }
  }
};

window.storage = storage;