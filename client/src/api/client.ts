import axios from 'axios';

export interface ServerConfig {
  host: string;
  port: number;
}

class ApiClient {
  private baseUrl: string = '';
  private token: string | null = null;

  setServer(config: ServerConfig) {
    this.baseUrl = `http://${config.host}:${config.port}`;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('fuse_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('fuse_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('fuse_token');
  }

  private getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async register(username: string, email: string, password: string) {
    const response = await axios.post(`${this.baseUrl}/api/auth/register`, {
      username,
      email,
      password
    });
    return response.data;
  }

  async login(username: string, password: string) {
    const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
      username,
      password
    });
    return response.data;
  }

  async getMe() {
    const response = await axios.get(`${this.baseUrl}/api/auth/me`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getChannels() {
    const response = await axios.get(`${this.baseUrl}/api/channels`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createChannel(name: string, type: string) {
    const response = await axios.post(
      `${this.baseUrl}/api/channels`,
      { name, type },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getMessages(channelId: number, limit: number = 50, offset: number = 0) {
    const response = await axios.get(
      `${this.baseUrl}/api/channels/${channelId}/messages`,
      {
        headers: this.getHeaders(),
        params: { limit, offset }
      }
    );
    return response.data;
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${this.baseUrl}/api/upload`, formData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  getFileUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const api = new ApiClient();
