// ===== APP STATE =====
// Force clear menu cache during development to apply data.js changes
localStorage.removeItem('cso_menus');

const App = {
  currentPage: 'login',
  role: null, // 'customer','vendor','admin'
  user: null,
  cart: [],
  orders: [...MOCK_ORDERS],
  notifications: [],
};

// ===== ROUTER =====
async function navigate(page) {
  App.currentPage = page;
  await prefetchData(page);
  render();
}

async function prefetchData(page) {
  try {
    if (page !== 'login' && api.getToken()) {
      try {
        const ann = await api.getAnnouncements();
        ANNOUNCEMENTS = (ann || []).map(a => ({
          id: a.id, title: a.title, message: a.content, target: 'all', date: a.createdAt, active: true
        }));
      } catch(e) { console.warn('Announcements fetch failed:', e); }
    }
    
    if (App.role === 'customer') {
      try {
        const shopImages = {
          'ร้านครัวคุณแม่': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
          'ร้านก๋วยเตี๋ยวลุงสมชาย': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
          'ร้านส้มตำแม่พร': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop',
          'ร้านข้าวมันไก่เฮียหลี': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
          'ร้านเครื่องดื่ม Cool Cool': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
        };
        const defaultShopImg = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
        const shops = await api.getShops();
        SHOPS = (shops || []).map(s => ({
          id: s.id, name: s.storeName, category: s.description || 'อาหาร',
          image: shopImages[s.storeName] || defaultShopImg,
          open: s.isOpen
        }));
      } catch(e) { console.warn('Shops fetch failed:', e); }

      try {
        const menus = await api.getAllMenus();
        MENUS = (menus || []).map(m => ({
          id: m.id, shopId: m.vendorId, name: m.name, price: parseFloat(m.price),
          image: m.imageUrl || `https://placehold.co/400x300/FFCE99/562F00?text=${encodeURIComponent(m.name)}`,
          available: m.isAvailable, category: m.vendor?.storeName || 'อาหาร'
        }));
      } catch(e) { console.warn('Menus fetch failed:', e); }

      if (page === 'my-orders' || page === 'track') {
        try {
          const orders = await api.getMyOrders();
          App.orders = (orders || []).map(o => ({
            id: o.id.toString(),
            customerId: o.customerId,
            shopName: o.vendor?.storeName || 'Shop',
            shopId: o.vendorId,
            items: (o.orderItems || []).map(i => ({
              menuId: i.menuId, name: i.menu?.name || 'Menu', qty: i.quantity,
              price: parseFloat(i.menu?.price || 0), note: i.specialInstructions || ''
            })),
            total: parseFloat(o.totalAmount),
            status: o.status.toLowerCase(),
            pickupTime: new Date(o.pickupTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            orderDate: new Date(o.createdAt).toISOString().split('T')[0]
          }));
        } catch(e) { console.warn('Orders fetch failed:', e); }
      }
    } else if (App.role === 'vendor') {
      try {
        const me = await api.getVendorMe();
        if (me) {
          App.user.name = me.storeName;
          App.user.shopId = me.id;
          App.user.status = me.isSuspended ? 'suspended' : (me.isOpen ? 'active' : 'closed');
        }
      } catch(e) { console.warn('Vendor profile fetch failed:', e); }

      if (page === 'v-orders') {
        try {
          const orders = await api.getIncomingOrders();
          App.orders = (orders || []).map(o => ({
            id: o.id.toString(),
            shopId: o.vendorId, // Add this
            customerName: o.customer?.name || 'Customer',
            items: (o.orderItems || []).map(i => ({
              name: i.menu?.name, qty: i.quantity, price: parseFloat(i.menu?.price || 0), note: i.specialInstructions
            })),
            total: parseFloat(o.totalAmount),
            status: o.status.toLowerCase(),
            pickupTime: new Date(o.pickupTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          }));
        } catch(e) { console.warn('Vendor orders fetch failed:', e); }
      } else if (page === 'v-menu') {
        try {
          const myMenus = await api.getMyMenus();
          MENUS = (myMenus || []).map(m => ({
            id: m.id, shopId: m.vendorId, name: m.name, price: parseFloat(m.price),
            image: m.imageUrl || '', available: m.isAvailable, category: 'อาหาร'
          }));
        } catch(e) { console.warn('Vendor menus fetch failed:', e); }
      }
    } else if (App.role === 'admin') {
      if (page === 'a-vendors') {
        try {
          const vendors = await api.getAdminVendors();
          VENDORS = (vendors || []).map(v => ({
            id: v.userId,
            name: v.storeName,
            owner: v.user?.name,
            username: v.user?.email,
            status: v.user?.status === 'SUSPENDED' ? 'suspended' : 'active',
            totalOrders: 0, revenue: 0
          }));
        } catch(e) { console.warn('Admin vendors fetch failed:', e); }
      }
    }
  } catch (err) {
    console.error('Prefetch error:', err);
    showToast(err.message, 'error');
  }
}

function render() {
  const root = document.getElementById('app');
  const p = App.currentPage;
  if (p === 'login') { root.innerHTML = loginPage(); }
  else if (App.role === 'customer') { root.innerHTML = customerLayout(p); }
  else if (App.role === 'vendor') { root.innerHTML = vendorLayout(p); }
  else if (App.role === 'admin') { root.innerHTML = adminLayout(p); }
  attachEvents();
  saveState();
}

// ===== HELPERS =====
function showToast(msg, type = '') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${type==='success'?'✅':type==='error'?'❌':'🔔'}</span><span class="toast-msg">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatPrice(n) { return `฿${n}`; }
function getCartTotal() { return App.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount() { return App.cart.reduce((s, i) => s + i.qty, 0); }

function addToCart(menuId) {
  const menu = MENUS.find(m => m.id === menuId);
  if (!menu) return;
  const existing = App.cart.find(c => c.menuId === menuId);
  if (existing) { existing.qty++; }
  else { App.cart.push({ menuId, name: menu.name, price: menu.price, qty: 1, shopId: menu.shopId, note: '' }); }
  showToast(`เพิ่ม ${menu.name} ลงตะกร้าแล้ว`, 'success');
  render();
}

function removeFromCart(menuId) {
  App.cart = App.cart.filter(c => c.menuId !== menuId);
  render();
}

function updateCartQty(menuId, delta) {
  const item = App.cart.find(c => c.menuId === menuId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) App.cart = App.cart.filter(c => c.menuId !== menuId);
  render();
}

async function login(role) {
  try {
    if (role === 'customer') {
      const email = document.getElementById('customer-email-input')?.value.trim() || 'student1@bu.ac.th';
      const user = await api.loginCustomer(email);
      App.role = 'customer';
      App.user = { name: user.name, id: user.id };
    } else if (role === 'vendor') {
      const email = document.getElementById('vendor-email-input')?.value.trim() || 'vendor1@bu.ac.th';
      const password = document.getElementById('vendor-pass-input')?.value.trim() || 'password';
      const user = await api.loginSystem(email, password);
      App.role = 'vendor';
      App.user = { name: user.name, id: user.id, shopId: null };
      // Fetch VendorProfile to get shopId (VendorProfile.id, NOT user.id)
      const profile = await api.getVendorMe();
      App.user.shopId = profile.id;
      App.user.name = profile.storeName || user.name;
    } else {
      const email = 'admin@bu.ac.th';
      const user = await api.loginSystem(email, 'adminpass'); // Mock password
      App.role = 'admin';
      App.user = { name: user.name, id: user.id };
    }
    
    await navigate(role === 'customer' ? 'menu' : role === 'vendor' ? 'v-orders' : 'a-dashboard');
    showToast(`ยินดีต้อนรับ ${App.user.name}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() { 
  api.clearToken();
  App.role = null; 
  App.user = null; 
  App.cart = []; 
  App.orders = [];
  navigate('login'); 
}

// ===== ATTACH EVENTS =====
function attachEvents() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); navigate(el.dataset.nav); };
  });
  document.querySelectorAll('[data-action]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const a = el.dataset.action;
      const v = el.dataset.value;
      if (a === 'login') login(v);
      else if (a === 'logout') logout();
      else if (a === 'add-cart') addToCart(parseInt(v));
      else if (a === 'remove-cart') removeFromCart(parseInt(v));
      else if (a === 'cart-inc') { updateCartQty(parseInt(v), 1); }
      else if (a === 'cart-dec') { updateCartQty(parseInt(v), -1); }
      else if (a === 'place-order') { document.getElementById('payment-modal')?.classList.remove('active'); placeOrder(); }
      else if (a === 'cancel-order') { document.getElementById('cancel-order-id').value = v; document.getElementById('cancel-modal').classList.add('active'); }
      else if (a === 'confirm-cancel') { const id = document.getElementById('cancel-order-id').value; document.getElementById('cancel-modal').classList.remove('active'); cancelOrder(id); }
      else if (a === 'reschedule-order') { document.getElementById('reschedule-order-id').value = v; document.getElementById('reschedule-modal').classList.add('active'); }
      else if (a === 'confirm-reschedule') { const id = document.getElementById('reschedule-order-id').value; const time = document.getElementById('new-pickup-time').value; document.getElementById('reschedule-modal').classList.remove('active'); rescheduleOrder(id, time); }
      else if (a === 'accept-order') updateOrderStatus(v, 'accepted');
      else if (a === 'reject-order') { document.getElementById('reject-order-id').value = v; document.getElementById('reject-modal').classList.add('active'); }
      else if (a === 'confirm-reject') { const id = document.getElementById('reject-order-id').value; document.getElementById('reject-modal').classList.remove('active'); updateOrderStatus(id, 'cancelled'); }
      else if (a === 'ready-order') updateOrderStatus(v, 'ready');
      else if (a === 'complete-order') customerCompleteOrder(v);
      else if (a === 'suspend-vendor') {
        document.getElementById('suspend-vendor-id').value = v;
        document.getElementById('suspend-shop-name').textContent = el.dataset.name;
        document.getElementById('suspend-owner-name').textContent = el.dataset.owner;
        document.getElementById('suspend-reason').value = '';
        document.getElementById('suspend-modal').classList.add('active');
      }
      else if (a === 'confirm-suspend') {
        const id = parseInt(document.getElementById('suspend-vendor-id').value);
        const reason = document.getElementById('suspend-reason').value;
        if(!reason) { showToast('กรุณาระบุเหตุผลการระงับบัญชี', 'error'); return; }
        document.getElementById('suspend-modal').classList.remove('active');
        suspendVendor(id, reason);
      }
      else if (a === 'unsuspend-vendor') unsuspendVendor(parseInt(v));
      else if (a === 'add-vendor') {
        document.getElementById('new-vendor-name').value = '';
        document.getElementById('new-vendor-owner').value = '';
        document.getElementById('new-vendor-username').value = '';
        document.getElementById('add-vendor-modal').classList.add('active');
      }
      else if (a === 'confirm-add-vendor') { addVendor(); }
      else if (a === 'create-announcement') createAnnouncement();
      else if (a === 'delete-announcement') deleteAnnouncement(parseInt(v));
      else if (a === 'toggle-menu') toggleMenuAvail(parseInt(v));
      else if (a === 'toggle-notif') toggleNotifDropdown();
      else if (a === 'toggle-mobile-nav') toggleMobileNav();
      else if (a === 'toggle-sidebar') toggleSidebar();
      else if (a === 'track-order') { App.selectedOrder = v; navigate('track'); }
      else if (a === 'cancel-order') {
        document.getElementById('cancel-order-id').value = v;
        document.getElementById('cancel-modal').classList.add('active');
      }
      else if (a === 'confirm-cancel') {
        const id = document.getElementById('cancel-order-id').value;
        document.getElementById('cancel-modal').classList.remove('active');
        updateOrderStatus(id, 'cancelled');
      }
      else if (a === 'reschedule-order') {
        document.getElementById('reschedule-order-id').value = v;
        document.getElementById('reschedule-modal').classList.add('active');
      }
      else if (a === 'confirm-reschedule') {
        const id = document.getElementById('reschedule-order-id').value;
        const newTime = document.getElementById('new-pickup-time').value;
        document.getElementById('reschedule-modal').classList.remove('active');
        const order = App.orders.find(o => o.id === id);
        if (order) {
          order.pickupTime = newTime;
          showToast('เลื่อนเวลารับอาหารสำเร็จ', 'success');
          render();
        }
      }
    };
  });
}

async function placeOrder() {
  if (App.cart.length === 0) { showToast('กรุณาเพิ่มอาหารลงตะกร้า', 'error'); return; }
  const timeEl = document.getElementById('pickup-time');
  const pickupTime = timeEl ? timeEl.value : '12:00';
  
  // Validate time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(pickupTime)) {
    showToast('กรุณาเลือกเวลารับอาหารที่ถูกต้อง', 'error');
    return;
  }

  const shopGroups = {};
  App.cart.forEach(item => {
    if (!shopGroups[item.shopId]) shopGroups[item.shopId] = [];
    shopGroups[item.shopId].push({ menuId: item.menuId, quantity: item.qty, specialInstructions: item.note || '' });
  });

  try {
    // Build a proper ISO date string using local time components
    const now = new Date();
    const [hours, mins] = pickupTime.split(':');
    const pickupDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(mins), 0);
    const fullTime = pickupDate.toISOString();
    
    for (const shopIdStr of Object.keys(shopGroups)) {
      await api.createOrder(parseInt(shopIdStr), shopGroups[shopIdStr], fullTime);
    }
    App.cart = [];
    showToast('สั่งอาหารสำเร็จ! ระบบได้ส่งออเดอร์ไปยังร้านค้าแล้ว', 'success');
    navigate('my-orders');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelOrder(orderId) {
  try {
    await api.cancelOrder(orderId);
    showToast('ยกเลิกคำสั่งซื้อสำเร็จ', 'success');
    await prefetchData(App.currentPage);
    render();
  } catch (err) { showToast(err.message, 'error'); }
}

async function customerCompleteOrder(orderId) {
  try {
    await api.completeOrder(orderId);
    showToast('🎉 รับอาหารเรียบร้อยแล้ว!', 'success');
    await prefetchData(App.currentPage);
    render();
  } catch (err) { showToast(err.message, 'error'); }
}

async function rescheduleOrder(orderId, time) {
  try {
    const now = new Date();
    const [hours, mins] = time.split(':');
    const pickupDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(mins), 0);
    const fullTime = pickupDate.toISOString();
    await api.rescheduleOrder(orderId, fullTime);
    showToast(`เลื่อนเวลาเป็น ${time} สำเร็จ`, 'success');
    await prefetchData(App.currentPage);
    render();
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateOrderStatus(orderId, status) {
  try {
    if (status === 'accepted') await api.acceptRejectOrder(orderId, 'ACCEPT');
    else if (status === 'cancelled') await api.acceptRejectOrder(orderId, 'REJECT');
    else await api.updateOrderStatus(orderId, status.toUpperCase());
    
    showToast(`อัปเดตสถานะสำเร็จ`, 'success');
    await prefetchData(App.currentPage);
    render();
  } catch (err) { showToast(err.message, 'error'); }
}

function generatePickupTimeSlots() {
  const dynamicSlots = [];
  const now = new Date();
  let start = new Date(now.getTime() + 10 * 60000); // +10 minutes minimum prep time
  const remainder = start.getMinutes() % 5;
  if (remainder !== 0) start = new Date(start.getTime() + (5 - remainder) * 60000);

  for (let i = 0; i < 12; i++) {
    const hours = start.getHours().toString().padStart(2, '0');
    const mins = start.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${mins}`;
    if (start.getHours() >= 23) break;
    dynamicSlots.push(timeString);
    start = new Date(start.getTime() + 10 * 60000); // 10-minute intervals
  }
  if (dynamicSlots.length === 0) dynamicSlots.push("หมดเวลาทำการ");
  return dynamicSlots;
}

async function suspendVendor(vendorId, reason) {
  try {
    await api.suspendVendor(vendorId);
    showToast(`ระงับบัญชีร้านสำเร็จ`, 'success');
    await prefetchData(App.currentPage);
    render();
  } catch(err) { showToast(err.message, 'error'); }
}

function unsuspendVendor(vendorId) {
  showToast('ไม่สามารถยกเลิกระงับได้ (ฟีเจอร์สาธิต)', 'error');
}

async function addVendor() {
  const storeName = document.getElementById('new-vendor-name').value.trim();
  const name = document.getElementById('new-vendor-owner').value.trim();
  const email = document.getElementById('new-vendor-username').value.trim();
  
  if (!storeName || !name || !email) return showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
  
  try {
    await api.createVendor({ email, name, password: 'password', storeName });
    document.getElementById('add-vendor-modal').classList.remove('active');
    showToast(`เพิ่มร้านค้า ${storeName} สำเร็จ`, 'success');
    await prefetchData(App.currentPage);
    render();
  } catch(err) { showToast(err.message, 'error'); }
}

function filterAdminVendors() {
  const query = document.getElementById('admin-vendor-search').value.toLowerCase();
  const rows = document.querySelectorAll('.vendor-row');
  rows.forEach(row => {
    const name = row.dataset.name.toLowerCase();
    const username = row.dataset.username.toLowerCase();
    const owner = row.dataset.owner.toLowerCase();
    if (name.includes(query) || username.includes(query) || owner.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

async function createAnnouncement() {
  const title = document.getElementById('announce-title').value.trim();
  const content = document.getElementById('announce-message').value.trim();
  const targetGroup = document.getElementById('announce-target').value;
  if (!title || !content) return showToast('กรุณากรอกหัวข้อและรายละเอียดประกาศ', 'error');
  try {
    await api.createAnnouncement({ title, content, targetGroup });
    showToast('เผยแพร่ประกาศเรียบร้อยแล้ว!', 'success');
    await prefetchData(App.currentPage);
    render();
  } catch(err) { showToast(err.message, 'error'); }
}

function deleteAnnouncement(id) {
  showToast('ไม่สามารถลบได้ (ฟีเจอร์สาธิต)', 'error');
}

async function toggleMenuAvail(menuId) {
  const menu = MENUS.find(m => m.id === menuId);
  if (menu) { 
    try {
      await api.toggleMenuAvailability(menuId, !menu.available);
      showToast(`${menu.name}: อัปเดตสถานะสำเร็จ`, 'success');
      await prefetchData(App.currentPage);
      render();
    } catch(err) { showToast(err.message, 'error'); }
  }
}

function toggleNotifDropdown() {
  const d = document.querySelector('.notif-dropdown');
  if (d) d.classList.toggle('show');
}
function toggleMobileNav() {
  const n = document.querySelector('.navbar-nav');
  if (n) n.classList.toggle('open');
}
function toggleSidebar() {
  const s = document.querySelector('.sidebar');
  if (s) s.classList.toggle('open');
}

function showPushNotification() {
  const c = document.body;
  const t = document.createElement('div');
  t.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center; background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); padding:16px; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.2); width:340px; border:1px solid rgba(0,0,0,0.05); cursor:pointer;">
      <div style="width:40px; height:40px; background:var(--primary); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem;">🍽️</div>
      <div style="flex:1; text-align:left;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span style="font-weight:700; font-size:0.9rem; color:var(--primary-dark)">Canteen Smart Order</span>
          <span style="font-size:0.75rem; color:var(--gray)">ตอนนี้</span>
        </div>
        <p style="font-size:0.85rem; color:#333; margin:0">✅ <strong>อาหารพร้อมเสิร์ฟแล้ว!</strong><br><span style="color:var(--gray)">กรุณามารับที่ร้าน ภายใน 10 นาที</span></p>
      </div>
    </div>
  `;
  t.style.position = 'fixed';
  t.style.top = '-100px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.zIndex = '9999';
  t.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  c.appendChild(t);
  
  setTimeout(() => { t.style.top = '20px'; }, 50);
  setTimeout(() => { t.style.top = '-150px'; t.style.opacity = '0'; }, 4000);
  setTimeout(() => { t.remove(); }, 4600);
}

// ===== DATA SYNC (CROSS-TAB & PERSISTENCE) =====
// Data persistence disabled - using temporary mock data only
function saveState() {
  // Disabled: Data will not be saved permanently
}

function loadState() {
  // Disabled: Always load fresh mock data from data.js
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();
});
