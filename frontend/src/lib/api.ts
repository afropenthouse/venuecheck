const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'exists' : 'not found');
  return token;
};

export const api = {
  upload: {
    image: async (file: string) => {
      console.log('API: Upload image request');
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ file })
      });
      if (!res.ok) {
        console.error('Upload failed:', res.status, res.statusText);
        throw new Error('Upload failed');
      }
      return res.json();
    }
  },
  auth: {
    login: async (email: string, password: string) => {
      console.log('API: Login request for:', email);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        console.error('Login failed:', res.status, res.statusText);
        throw new Error('Invalid credentials');
      }
      const data = await res.json();
      console.log('Login successful, token received');
      return data;
    },
    register: async (email: string, password: string, name?: string) => {
      console.log('API: Register request for:', email);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) {
        console.error('Registration failed:', res.status, res.statusText);
        throw new Error('Registration failed');
      }
      const data = await res.json();
      console.log('Registration successful');
      return data;
    },
    verifyEmail: async (email: string, code: string) => {
      console.log('API: Verify email request for:', email);
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!res.ok) {
        console.error('Email verification failed:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Verification failed');
      }
      const data = await res.json();
      console.log('Email verification successful');
      return data;
    },
    resendVerification: async (email: string) => {
      console.log('API: Resend verification request for:', email);
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        console.error('Resend verification failed:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to resend code');
      }
      const data = await res.json();
      console.log('Resend verification successful');
      return data;
    }
  },
  venues: {
    getAll: async () => {
      console.log('API: Get all venues request');
      const token = getToken();
      if (!token) {
        console.error('No token found for getAll venues');
        throw new Error('No authentication token');
      }
      const res = await fetch(`${API_URL}/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error('Get venues failed:', res.status, res.statusText);
        throw new Error('Failed to fetch venues');
      }
      const data = await res.json();
      console.log('Get venues successful:', data.length, 'venues');
      return data;
    },
    getPublic: async () => {
      console.log('API: Get public venues request');
      const res = await fetch(`${API_URL}/venues/public`);
      if (!res.ok) {
        console.error('Get public venues failed:', res.status, res.statusText);
        throw new Error('Failed to fetch public venues');
      }
      const data = await res.json();
      console.log('Get public venues successful:', data.length, 'venues');
      return data;
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_URL}/venues/${id}`);
      if (!res.ok) throw new Error('Venue not found');
      return res.json();
    },
    create: async (data: any) => {
      console.log('API: Create venue request:', data);
      const token = getToken();
      if (!token) {
        console.error('No token found for create venue');
        throw new Error('No authentication token');
      }
      const res = await fetch(`${API_URL}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        console.error('Create venue failed:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        throw new Error('Failed to create venue');
      }
      const venueData = await res.json();
      console.log('Create venue successful:', venueData.id);
      return venueData;
    },
    update: async (id: string, data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  },
  bookings: {
    getAll: async () => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return res.json();
    },
    approve: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    decline: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${id}/decline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  },
  settings: {
    get: async () => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    update: async (data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    updateNotifications: async (data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  feedback: {
    submit: async (venueId: string, data: { rating: number; comment?: string; guestName: string; guestEmail?: string }) => {
      console.log('API: Submit feedback for venue:', venueId);
      const res = await fetch(`${API_URL}/feedback/venues/${venueId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        console.error('Submit feedback failed:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
      return res.json();
    },
    getVenueFeedback: async (venueId: string) => {
      const res = await fetch(`${API_URL}/feedback/venues/${venueId}/feedback`);
      if (!res.ok) throw new Error('Failed to fetch feedback');
      return res.json();
    },
    getHostFeedback: async () => {
      const token = getToken();
      if (!token) throw new Error('No authentication token');
      const res = await fetch(`${API_URL}/feedback/host/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch host feedback');
      return res.json();
    }
  }
};