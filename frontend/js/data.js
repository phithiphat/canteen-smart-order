// ===== MOCK DATA FOR CANTEEN SMART ORDER =====

let SHOPS = [
  { id: 1, name: 'ร้านครัวคุณแม่', category: 'อาหารตามสั่ง', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', open: true },
  { id: 2, name: 'ร้านก๋วยเตี๋ยวลุงสมชาย', category: 'ก๋วยเตี๋ยว', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', open: true },
  { id: 3, name: 'ร้านส้มตำแม่พร', category: 'อาหารอีสาน', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop', open: true },
  { id: 4, name: 'ร้านข้าวมันไก่เฮียหลี', category: 'อาหารจานเดียว', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', open: false },
  { id: 5, name: 'ร้านเครื่องดื่ม Cool Cool', category: 'เครื่องดื่ม', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', open: true },
];

let MENUS = [
  { id: 1, shopId: 1, name: 'ข้าวกะเพราหมูสับ', price: 45, image: 'img/ข้าวกะเพราหมูสับ.jpg', available: true, category: 'อาหารตามสั่ง' },
  { id: 2, shopId: 1, name: 'ข้าวผัดหมู', price: 40, image: 'img/ข้าวผัดหมู.jpg', available: true, category: 'อาหารตามสั่ง' },
  { id: 3, shopId: 1, name: 'ข้าวไข่เจียว', price: 35, image: 'img/ข้าวไข่เจียว.jpg', available: true, category: 'อาหารตามสั่ง' },
  { id: 4, shopId: 1, name: 'ข้าวคะน้าหมูกรอบ', price: 50, image: 'img/ข้าวคะน้าหมูกรอบ.jpg', available: false, category: 'อาหารตามสั่ง' },
  { id: 5, shopId: 2, name: 'ก๋วยเตี๋ยวเรือ', price: 40, image: 'img/ก๋วยเตี๋ยวเรือ.jpg', available: true, category: 'ก๋วยเตี๋ยว' },
  { id: 6, shopId: 2, name: 'ก๋วยเตี๋ยวต้มยำ', price: 45, image: 'img/ก๋วยเตี๋ยวต้มยำ.jpg', available: true, category: 'ก๋วยเตี๋ยว' },
  { id: 7, shopId: 2, name: 'บะหมี่แห้ง', price: 40, image: 'img/บะหมี่แห้ง.jpg', available: true, category: 'ก๋วยเตี๋ยว' },
  { id: 8, shopId: 3, name: 'ส้มตำไทย', price: 35, image: 'img/ส้มตำไทย.jpeg', available: true, category: 'อาหารอีสาน' },
  { id: 9, shopId: 3, name: 'ส้มตำปูปลาร้า', price: 45, image: 'img/ส้มตำปูปลาร้า.avif', available: true, category: 'อาหารอีสาน' },
  { id: 10, shopId: 3, name: 'ไก่ย่าง', price: 60, image: 'img/ไก่ย่าง.jpg', available: true, category: 'อาหารอีสาน' },
  { id: 11, shopId: 4, name: 'ข้าวมันไก่ต้ม', price: 45, image: 'img/ข้าวมันไก่ต้ม.jpg', available: true, category: 'อาหารจานเดียว' },
  { id: 12, shopId: 4, name: 'ข้าวมันไก่ทอด', price: 50, image: 'img/ข้าวมันไก่ทอด.jpg', available: true, category: 'อาหารจานเดียว' },
  { id: 13, shopId: 5, name: 'ชาเย็น', price: 25, image: 'img/ชาเย็น.jpg', available: true, category: 'เครื่องดื่ม' },
  { id: 14, shopId: 5, name: 'กาแฟเย็น', price: 30, image: 'img/กาแฟเย็น.avif', available: true, category: 'เครื่องดื่ม' },
  { id: 15, shopId: 5, name: 'น้ำส้มคั้น', price: 35, image: 'img/น้ำส้มคั้น.jpg', available: true, category: 'เครื่องดื่ม' },
];

let MOCK_ORDERS = [
  { id: 'ORD-001', customerId: 1, customerName: 'สมชาย ใจดี', shopId: 1, shopName: 'ร้านครัวคุณแม่', items: [{ menuId: 1, name: 'ข้าวกะเพราหมูสับ', qty: 2, price: 45, note: 'ไม่เผ็ด' }, { menuId: 3, name: 'ข้าวไข่เจียว', qty: 1, price: 35, note: '' }], total: 125, status: 'pending', pickupTime: '12:00', orderDate: '2026-04-22', createdAt: '2026-04-22T11:30:00' },
  { id: 'ORD-002', customerId: 2, customerName: 'สมหญิง รักเรียน', shopId: 2, shopName: 'ร้านก๋วยเตี๋ยวลุงสมชาย', items: [{ menuId: 5, name: 'ก๋วยเตี๋ยวเรือ', qty: 1, price: 40, note: '' }], total: 40, status: 'cooking', pickupTime: '12:15', orderDate: '2026-04-22', createdAt: '2026-04-22T11:35:00' },
  { id: 'ORD-003', customerId: 3, customerName: 'วรวิทย์ เก่งมาก', shopId: 1, shopName: 'ร้านครัวคุณแม่', items: [{ menuId: 2, name: 'ข้าวผัดหมู', qty: 1, price: 40, note: 'ใส่ไข่ด้วย' }], total: 40, status: 'ready', pickupTime: '12:00', orderDate: '2026-04-22', createdAt: '2026-04-22T11:20:00' },
  { id: 'ORD-004', customerId: 1, customerName: 'สมชาย ใจดี', shopId: 3, shopName: 'ร้านส้มตำแม่พร', items: [{ menuId: 8, name: 'ส้มตำไทย', qty: 1, price: 35, note: '' }, { menuId: 10, name: 'ไก่ย่าง', qty: 1, price: 60, note: '' }], total: 95, status: 'completed', pickupTime: '11:30', orderDate: '2026-04-22', createdAt: '2026-04-22T11:00:00' },
  { id: 'ORD-005', customerId: 4, customerName: 'กานดา สวยงาม', shopId: 1, shopName: 'ร้านครัวคุณแม่', items: [{ menuId: 1, name: 'ข้าวกะเพราหมูสับ', qty: 1, price: 45, note: 'เผ็ดมาก' }], total: 45, status: 'cancelled', pickupTime: '12:30', orderDate: '2026-04-22', createdAt: '2026-04-22T11:40:00' },
];

let VENDORS = [
  { id: 1, name: 'ร้านครัวคุณแม่', owner: 'คุณสมศรี', username: 'vendor1', status: 'active', totalOrders: 156, revenue: 7800 },
  { id: 2, name: 'ร้านก๋วยเตี๋ยวลุงสมชาย', owner: 'คุณสมชาย', username: 'vendor2', status: 'active', totalOrders: 98, revenue: 4900 },
  { id: 3, name: 'ร้านส้มตำแม่พร', owner: 'คุณแม่พร', username: 'vendor3', status: 'active', totalOrders: 134, revenue: 6700 },
  { id: 4, name: 'ร้านข้าวมันไก่เฮียหลี', owner: 'เฮียหลี', username: 'vendor4', status: 'suspended', totalOrders: 45, revenue: 2250 },
  { id: 5, name: 'ร้านเครื่องดื่ม Cool Cool', owner: 'คุณณัฐ', username: 'vendor5', status: 'active', totalOrders: 210, revenue: 6300 },
];

let ANNOUNCEMENTS = [
  { id: 1, title: 'ปิดปรับปรุงระบบ', message: 'ระบบจะปิดปรับปรุงวันที่ 25 เม.ย. 2569 เวลา 22:00-06:00', target: 'all', date: '2026-04-20', active: true },
  { id: 2, title: 'โปรโมชั่นพิเศษ!', message: 'สั่งอาหารครบ 100 บาท รับส่วนลด 10% ตลอดสัปดาห์นี้', target: 'customer', date: '2026-04-21', active: true },
];

let TIME_SLOTS = ['11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30'];

const STATUS_MAP = new Proxy({
  pending:    { label: 'รอรับออเดอร์',   badge: 'badge-pending',   icon: '⏳' },
  accepted:   { label: 'รับออเดอร์แล้ว', badge: 'badge-cooking',   icon: '✅' },
  preparing:  { label: 'กำลังปรุง',      badge: 'badge-cooking',   icon: '🍳' },
  ready:      { label: 'พร้อมเสิร์ฟ',    badge: 'badge-ready',     icon: '🛍️' },
  completed:  { label: 'รับอาหารแล้ว',   badge: 'badge-completed', icon: '🎉' },
  cancelled:  { label: 'ยกเลิก',         badge: 'badge-cancelled', icon: '❌' },
}, {
  get: (target, key) => target[key] || { label: key, badge: 'badge-pending', icon: '📦' }
});

