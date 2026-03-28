// Cloud storage implementation using in-memory storage for now
// In production, replace with actual cloud storage (Firebase, AWS, etc.)

interface CloudStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (prefix: string) => Promise<string[]>;
}

// In-memory storage for development
const storage = new Map<string, any>();

export const cloudStorage: CloudStorage = {
  async get(key: string) {
    return storage.get(key);
  },
  
  async set(key: string, value: any) {
    storage.set(key, value);
  },
  
  async delete(key: string) {
    storage.delete(key);
  },
  
  async list(prefix: string) {
    return Array.from(storage.keys()).filter(key => key.startsWith(prefix));
  }
};

// Helper functions for specific data types
export const profileStorage = {
  async getProfile(userId: string) {
    return cloudStorage.get(`profile:${userId}`);
  },
  
  async setProfile(userId: string, profile: any) {
    return cloudStorage.set(`profile:${userId}`, profile);
  },
  
  async getTrainerClients(trainerId: string) {
    return cloudStorage.get(`trainer:${trainerId}:clients`) || [];
  },
  
  async addClientToTrainer(trainerId: string, clientId: string) {
    const clients = await this.getTrainerClients(trainerId);
    if (!clients.includes(clientId)) {
      clients.push(clientId);
      await cloudStorage.set(`trainer:${trainerId}:clients`, clients);
    }
  }
};

export const healthDataStorage = {
  async saveHealthData(userId: string, data: any) {
    const key = `health:${userId}:${Date.now()}`;
    await cloudStorage.set(key, data);
    
    // Update latest health data
    await cloudStorage.set(`health:${userId}:latest`, data);
    
    return key;
  },
  
  async getLatestHealthData(userId: string) {
    return cloudStorage.get(`health:${userId}:latest`);
  },
  
  async getHealthDataHistory(userId: string, limit = 30) {
    const keys = await cloudStorage.list(`health:${userId}:`);
    const history = [];
    
    for (const key of keys.slice(-limit)) {
      if (!key.endsWith(':latest')) {
        const data = await cloudStorage.get(key);
        if (data) history.push(data);
      }
    }
    
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};