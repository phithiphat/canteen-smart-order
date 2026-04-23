// ===== API SERVICE LAYER =====
// Auto-detect: localhost = development, otherwise = production (Render)
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'https://canteen-smart-order.onrender.com/api'; // 🔁 เปลี่ยนเป็น URL จริงของ Render หลัง deploy

const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  async fetchWithAuth(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
    return data;
  },

  // Auth
  async loginCustomer(email) {
    const res = await this.fetchWithAuth('/auth/login/customer', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    this.setToken(res.token);
    return res.user;
  },
  
  async loginSystem(email, password) {
    const res = await this.fetchWithAuth('/auth/login/system', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res.user;
  },

  // Public / Shared
  async getShops() {
    return this.fetchWithAuth('/vendors');
  },
  async getAllMenus() {
    return this.fetchWithAuth('/menus');
  },
  async getAnnouncements() {
    return this.fetchWithAuth('/admin/announcements');
  },

  // Customer
  async createOrder(vendorId, items, pickupTime) {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify({ vendorId, items, pickupTime })
    });
  },
  async getMyOrders() {
    return this.fetchWithAuth('/orders/my-orders');
  },
  async cancelOrder(id) {
    return this.fetchWithAuth(`/orders/${id}/cancel`, { method: 'POST' });
  },
  async rescheduleOrder(id, newPickupTime) {
    return this.fetchWithAuth(`/orders/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newPickupTime })
    });
  },
  async mockPay(id) {
    return this.fetchWithAuth(`/orders/${id}/pay`, { method: 'POST' });
  },
  async completeOrder(id) {
    return this.fetchWithAuth(`/orders/${id}/complete`, { method: 'POST' });
  },

  // Vendor
  async getVendorMe() {
    return this.fetchWithAuth('/vendors/me');
  },
  async getIncomingOrders() {
    return this.fetchWithAuth('/vendors/orders/incoming');
  },
  async acceptRejectOrder(id, action) {
    return this.fetchWithAuth(`/vendors/orders/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },
  async updateOrderStatus(id, status) {
    return this.fetchWithAuth(`/vendors/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  async getMyMenus() {
    return this.fetchWithAuth('/vendors/my-menus');
  },
  async toggleMenuAvailability(id, isAvailable) {
    return this.fetchWithAuth(`/menus/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    });
  },

  // Admin
  async getDashboard() {
    return this.fetchWithAuth('/admin/dashboard');
  },
  async getAdminVendors() {
    return this.fetchWithAuth('/admin/vendors');
  },
  async suspendVendor(id) {
    return this.fetchWithAuth(`/admin/vendors/${id}/suspend`, { method: 'PATCH' });
  },
  async createVendor(data) {
    return this.fetchWithAuth('/admin/vendors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async createAnnouncement(data) {
    return this.fetchWithAuth('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
