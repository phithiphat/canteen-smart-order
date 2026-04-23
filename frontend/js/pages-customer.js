// ===== LOGIN PAGE =====
function loginPage() {
  return `
  <div class="login-page">
    <div class="login-card fade-in-up">
      <div class="logo-area">
        <div class="logo-icon">🍽️</div>
        <h1>Canteen Smart Order</h1>
        <p>ระบบสั่งอาหารโรงอาหารอัจฉริยะ</p>
      </div>
      <div class="role-tabs">
        <button class="role-tab active" onclick="document.querySelectorAll('.login-form').forEach(f=>f.style.display='none');document.getElementById('form-customer').style.display='block';document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">นิสิต</button>
        <button class="role-tab" onclick="document.querySelectorAll('.login-form').forEach(f=>f.style.display='none');document.getElementById('form-vendor').style.display='block';document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">ร้านค้า</button>
        <button class="role-tab" onclick="document.querySelectorAll('.login-form').forEach(f=>f.style.display='none');document.getElementById('form-admin').style.display='block';document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">ผู้ดูแล</button>
      </div>
      <div id="form-customer" class="login-form">
        <div class="form-group"><input id="customer-email-input" class="form-control" placeholder="Email เช่น student1@bu.ac.th" type="email"></div>
        <div class="form-group"><input class="form-control" type="password" placeholder="Password"></div>
        <button class="btn btn-primary btn-lg" style="width:100%" data-action="login" data-value="customer">Login</button>
        <div class="login-divider">หรือ</div>
        <button class="btn btn-outline btn-lg" style="width:100%" data-action="login" data-value="customer">📧 Login with University Email</button>
      </div>
      <div id="form-vendor" class="login-form" style="display:none">
        <div class="form-group"><input id="vendor-email-input" class="form-control" placeholder="Email เช่น vendor3@bu.ac.th" type="email"></div>
        <div class="form-group"><input id="vendor-pass-input" class="form-control" type="password" placeholder="Password"></div>
        <button class="btn btn-primary btn-lg" style="width:100%" data-action="login" data-value="vendor">Login</button>
      </div>
      <div id="form-admin" class="login-form" style="display:none">
        <div class="form-group"><input class="form-control" placeholder="Admin Username"></div>
        <div class="form-group"><input class="form-control" type="password" placeholder="Password"></div>
        <button class="btn btn-primary btn-lg" style="width:100%" data-action="login" data-value="admin">Login</button>
      </div>
    </div>
  </div>`;
}

// ===== CUSTOMER LAYOUT =====
function customerLayout(page) {
  const cartCount = getCartCount();
  const activeAnnouncements = ANNOUNCEMENTS.filter(a => a.active && (a.target === 'all' || a.target === 'customer'));
  
  const announceNotifs = activeAnnouncements.map(a => `
    <div class="notif-item unread"><div class="notif-title">📢 ${a.title}</div><div class="notif-time">${a.message}</div></div>
  `).join('');

  const activeCustomerOrders = App.orders.filter(o => o.customerId === App.user.id && ['cooking', 'ready'].includes(o.status));
  const orderNotifs = activeCustomerOrders.map(o => `
    <div class="notif-item ${o.status === 'ready' ? 'unread' : ''}">
      <div class="notif-title">${STATUS_MAP[o.status].icon} ${STATUS_MAP[o.status].label}</div>
      <div class="notif-time">${o.id} - ${o.items.map(i=>i.name).join(', ')}</div>
    </div>
  `).join('');

  const emptyNotif = (activeAnnouncements.length === 0 && activeCustomerOrders.length === 0) 
    ? `<div style="padding:16px; text-align:center; color:var(--gray); font-size:0.9rem;">ไม่มีการแจ้งเตือน</div>` 
    : '';

  return `
  <nav class="navbar">
    <a href="#" class="navbar-brand" data-nav="menu"><span class="logo">🍽️</span><span>Canteen Smart Order</span></a>
    <button class="navbar-toggle" data-action="toggle-mobile-nav">☰</button>
    <ul class="navbar-nav">
      <li><a href="#" data-nav="menu" class="${page==='menu'||page==='browse-shop'?'active':''}">🏠 เมนูอาหาร</a></li>
      <li><a href="#" data-nav="my-orders" class="${page==='my-orders'?'active':''}">📋 ออเดอร์ของฉัน</a></li>
      <li><a href="#" data-nav="cart" class="${page==='cart'?'active':''}" style="position:relative">🛒 ตะกร้า ${cartCount>0?`<span class="cart-badge">${cartCount}</span>`:''}</a></li>
    </ul>
    <div class="navbar-user">
      <div class="notif-wrapper">
        <button class="btn-icon" data-action="toggle-notif" style="position:relative;background:none;border:none;font-size:1.3rem;cursor:pointer">🔔${(activeAnnouncements.length > 0 || activeCustomerOrders.filter(o=>o.status==='ready').length > 0) ? '<span class="notif-dot"></span>' : ''}</button>
        <div class="notif-dropdown">
          <div class="notif-header">การแจ้งเตือน</div>
          ${announceNotifs}
          ${orderNotifs}
          ${emptyNotif}
        </div>
      </div>
      <div class="avatar">${App.user?App.user.name[0]:''}</div>
      <button class="btn btn-sm btn-outline" data-action="logout">ออก</button>
    </div>
  </nav>
  <div class="main-content"><div class="container fade-in">
    ${page==='menu'?customerMenuPage():''}
    ${page==='browse-shop'?customerShopMenuPage():''}
    ${page==='cart'?customerCartPage():''}
    ${page==='my-orders'?customerOrdersPage():''}
    ${page==='order-detail'?customerOrderDetailPage():''}
    ${page==='track'?customerTrackPage():''}
  </div></div>`;
}

// ===== CUSTOMER: MENU PAGE (ร้านอาหาร + เมนูรวม) =====
function customerMenuPage() {
  const shops = SHOPS.filter(s => s.open);
  const allMenus = MENUS.filter(m => m.available && shops.find(s => s.id === m.shopId));
  return `
  <div class="page-header">
    <div><h1>🍽️ ร้านอาหารในโรงอาหาร</h1><p style="color:var(--gray);margin-top:4px">เลือกร้านที่ชอบ สั่งล่วงหน้า รับได้เลย!</p></div>
    <div class="search-bar"><input type="text" placeholder="ค้นหาร้านหรือเมนู..." id="search-input" oninput="filterAll()"><button>🔍</button></div>
  </div>

  <!-- ===== SHOP CARDS ===== -->
  <h2 style="margin-bottom:16px">🏪 ร้านค้าทั้งหมด <span style="font-size:0.9rem;font-weight:400;color:var(--gray)">(${shops.length} ร้าน)</span></h2>
  <div class="grid grid-3" id="shops-grid" style="margin-bottom:36px">
    ${shops.map(s => {
      const menuCount = MENUS.filter(m => m.shopId === s.id && m.available).length;
      return `<div class="card shop-card" data-shopname="${s.name}" style="cursor:pointer" onclick="App.selectedShop=${s.id};navigate('browse-shop')">
        <img class="card-img" src="${s.image}" alt="${s.name}" onerror="this.src='https://placehold.co/400x300/FFCE99/562F00?text=${encodeURIComponent(s.name)}'">
        <div class="card-body">
          <h3 style="margin-bottom:4px">${s.name}</h3>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:0.85rem;color:var(--gray)">${s.category}</span>
            <span class="badge badge-ready">${menuCount} เมนู</span>
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;margin-top:12px">ดูเมนู →</button>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- ===== ALL MENUS ===== -->
  <h2 style="margin-bottom:16px">📋 เมนูทั้งหมด</h2>
  <div class="filter-tabs" style="margin-bottom:20px">
    <button class="filter-tab active" onclick="filterByShop(0,this)">ทั้งหมด</button>
    ${shops.map(s=>`<button class="filter-tab" onclick="filterByShop(${s.id},this)">${s.name}</button>`).join('')}
  </div>
  <div class="grid grid-4" id="menu-grid">
    ${allMenus.map(m => {
      const shop = SHOPS.find(s => s.id === m.shopId);
      return `<div class="card menu-card" data-shop="${m.shopId}" data-name="${m.name}">
        <div style="position:relative"><img class="card-img" src="${m.image}" alt="${m.name}" onerror="this.src='https://placehold.co/400x300/FFCE99/562F00?text=${encodeURIComponent(m.name)}'"><span class="menu-price">${formatPrice(m.price)}</span></div>
        <div class="card-body">
          <div class="menu-name">${m.name}</div>
          <div class="menu-shop">📍 ${shop?shop.name:''}</div>
          <div class="menu-actions">
            <button class="btn btn-primary btn-sm" data-action="add-cart" data-value="${m.id}" style="flex:1">+ เพิ่มลงตะกร้า</button>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ===== CUSTOMER: SHOP MENU PAGE (เมนูในร้านเดียว) =====
function customerShopMenuPage() {
  const shopId = App.selectedShop || 1;
  const shop = SHOPS.find(s => s.id === shopId);
  if (!shop) return '<div class="empty-state"><h3>ไม่พบร้านค้า</h3></div>';
  const menus = MENUS.filter(m => m.shopId === shopId);
  const available = menus.filter(m => m.available);
  const unavailable = menus.filter(m => !m.available);
  return `
  <div style="margin-bottom:20px">
    <button class="btn btn-outline btn-sm" data-nav="menu">← กลับหน้ารวมร้านค้า</button>
  </div>
  <div class="card" style="margin-bottom:24px">
    <div style="position:relative">
      <img src="${shop.image}" alt="${shop.name}" style="width:100%;height:220px;object-fit:cover" onerror="this.src='https://placehold.co/1200x300/FFCE99/562F00?text=${encodeURIComponent(shop.name)}'">
      <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(transparent,rgba(0,0,0,0.7))">
        <h1 style="color:white;font-size:1.8rem">${shop.name}</h1>
        <p style="color:rgba(255,255,255,0.85);margin-top:4px">${shop.category} · ${available.length} เมนูพร้อมจำหน่าย</p>
      </div>
    </div>
  </div>

  <h2 style="margin-bottom:16px">📋 เมนูอาหาร</h2>
  <div class="grid grid-3">
    ${available.map(m => `
    <div class="card menu-card" data-name="${m.name}">
      <div style="position:relative"><img class="card-img" src="${m.image}" alt="${m.name}" onerror="this.src='https://placehold.co/400x300/FFCE99/562F00?text=${encodeURIComponent(m.name)}'"><span class="menu-price">${formatPrice(m.price)}</span></div>
      <div class="card-body">
        <div class="menu-name">${m.name}</div>
        <div class="menu-actions" style="margin-top:10px">
          <button class="btn btn-primary btn-sm" data-action="add-cart" data-value="${m.id}" style="flex:1">+ เพิ่มลงตะกร้า</button>
        </div>
      </div>
    </div>`).join('')}
  </div>

  ${unavailable.length > 0 ? `
  <h3 style="margin-top:28px;margin-bottom:12px;color:var(--gray)">🚫 เมนูที่ปิดจำหน่าย</h3>
  <div class="grid grid-3">
    ${unavailable.map(m => `
    <div class="card" style="opacity:0.5;pointer-events:none">
      <div style="position:relative"><img class="card-img" src="${m.image}" alt="${m.name}" style="filter:grayscale(100%)" onerror="this.src='https://placehold.co/400x300/e0e0e0/888?text=${encodeURIComponent(m.name)}'"><span class="menu-price" style="background:var(--gray)">${formatPrice(m.price)}</span></div>
      <div class="card-body">
        <div class="menu-name">${m.name}</div>
        <span class="badge badge-cancelled">หมด</span>
      </div>
    </div>`).join('')}
  </div>` : ''}`;
}

// ===== CUSTOMER: CART PAGE =====
function customerCartPage() {
  if (App.cart.length === 0) {
    return `<div class="empty-state"><div class="empty-icon">🛒</div><h3>ตะกร้าว่างเปล่า</h3><p>เลือกเมนูอาหารที่ชอบแล้วเพิ่มลงตะกร้าเลย!</p><br><button class="btn btn-primary" data-nav="menu">ดูเมนูอาหาร</button></div>`;
  }

  const dynamicSlots = generatePickupTimeSlots();

  return `
  <div class="page-header"><h1>🛒 ตะกร้าสินค้า</h1></div>
  <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start">
    <div class="card"><div class="card-body">
      ${App.cart.map(item => {
        const menu = MENUS.find(m => m.id === item.menuId);
        const imgSrc = menu ? menu.image : '';
        return `
        <div class="cart-item" style="display:flex; align-items:center; gap:16px;">
          ${imgSrc ? `<img src="${imgSrc}" style="width:64px; height:64px; object-fit:cover; border-radius:8px; box-shadow:var(--shadow-sm);" onerror="this.style.display='none'">` : ''}
          <div class="cart-item-info" style="flex:1">
            <h4>${item.name}</h4>
            <p>📍 ${SHOPS.find(s=>s.id===item.shopId)?.name||''} · ${formatPrice(item.price)}/จาน</p>
          </div>
          <div class="qty-control">
            <button data-action="cart-dec" data-value="${item.menuId}">−</button>
            <span>${item.qty}</span>
            <button data-action="cart-inc" data-value="${item.menuId}">+</button>
          </div>
          <div style="min-width:70px;text-align:right;font-weight:900">${formatPrice(item.price*item.qty)}</div>
          <button class="btn btn-sm" style="color:var(--danger);background:none" data-action="remove-cart" data-value="${item.menuId}">🗑️</button>
        </div>
      `}).join('')}
    </div></div>
    <div class="card" style="position:sticky;top:88px"><div class="card-body">
      <h3 style="margin-bottom:16px">📝 สรุปคำสั่งซื้อ</h3>
      <div class="form-group">
        <label>⏰ เลือกเวลารับอาหาร (ล่วงหน้า 10 นาที)</label>
        <select class="form-control" id="pickup-time">
          ${dynamicSlots.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div class="cart-summary">
        <div class="flex-between" style="margin-bottom:8px"><span>รายการทั้งหมด</span><span>${getCartCount()} ชิ้น</span></div>
        <div class="flex-between" style="font-size:1.3rem;font-weight:900;color:var(--primary)"><span>รวม</span><span>${formatPrice(getCartTotal())}</span></div>
      </div>
      <button class="btn btn-primary btn-lg" style="width:100%;margin-top:16px" onclick="document.getElementById('payment-modal').classList.add('active')">💳 ยืนยันสั่งอาหาร</button>
      <p style="text-align:center;margin-top:10px;font-size:0.8rem;color:var(--gray)">ชำระเงินผ่าน QR Code</p>
    </div></div>
  </div>
  
  <!-- PAYMENT MODAL -->
  <div id="payment-modal" class="modal-overlay">
    <div class="modal" style="text-align:center">
      <div class="modal-header">
        <h2 style="margin:0 auto">สแกนเพื่อชำระเงิน</h2>
        <button class="modal-close" onclick="document.getElementById('payment-modal').classList.remove('active')">&times;</button>
      </div>
      <p style="margin-bottom:16px">ยอดที่ต้องชำระ: <span style="font-weight:900;color:var(--primary);font-size:1.6rem">${formatPrice(getCartTotal())}</span></p>
      <div style="background:var(--white);padding:20px;border-radius:var(--radius-lg);display:inline-block;border:2px solid var(--gray-light);margin-bottom:24px">
        <!-- Mock QR Code using qrserver API -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CanteenSmartOrder-${getCartTotal()}" alt="QR Code" width="200" height="200">
        <p style="font-size:0.85rem;color:var(--gray);margin-top:12px">รองรับทุกแอปธนาคาร</p>
      </div>
      <button class="btn btn-success btn-lg" style="width:100%" data-action="place-order">💸 ยืนยัน</button>
    </div>
  </div>`;
}

// ===== CUSTOMER: MY ORDERS =====
function customerOrdersPage() {
  const allOrders = App.orders.filter(o => o.customerId === App.user.id);
  if (allOrders.length === 0) {
    return `<div class="empty-state"><div class="empty-icon">📋</div><h3>ยังไม่มีคำสั่งซื้อ</h3><p>สั่งอาหารเลย!</p><br><button class="btn btn-primary" data-nav="menu">ดูเมนู</button></div>`;
  }
  
  const activeOrders = allOrders.filter(o => ['pending','cooking','ready'].includes(o.status));
  const pastOrders = allOrders.filter(o => ['completed','cancelled'].includes(o.status));

  const renderOrderCard = (o) => `
    <div class="card" style="cursor:pointer; margin-bottom: 20px;" data-action="track-order" data-value="${o.id}">
      <div class="card-body">
        <div class="flex-between" style="margin-bottom:12px">
          <h3>${o.id}</h3>
          <span class="badge ${STATUS_MAP[o.status].badge}">${STATUS_MAP[o.status].icon} ${STATUS_MAP[o.status].label}</span>
        </div>
        <p style="font-size:0.9rem;color:var(--gray)">📍 ${o.shopName}</p>
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
          ${o.items.map(i => {
            const menu = MENUS.find(m => m.id === i.menuId);
            const imgSrc = menu ? menu.image : '';
            return `
            <div style="display:flex; align-items:center; gap:12px; background:var(--cream); padding:8px; border-radius:8px;">
              ${imgSrc ? `<img src="${imgSrc}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; box-shadow:var(--shadow);" onerror="this.style.display='none'">` : ''}
              <div style="flex:1;">
                <div style="font-weight:700; font-size:0.95rem; color:var(--primary-dark)">${i.name} <span style="color:var(--primary); font-weight:900;">x${i.qty}</span></div>
                ${i.note ? `<div style="font-size:0.8rem; color:var(--gray); margin-top:2px;">📝 ${i.note}</div>` : ''}
              </div>
              <div style="font-weight:700; font-size:0.9rem;">${formatPrice(i.price * i.qty)}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="flex-between" style="margin-top:14px">
          <span style="font-weight:900;color:var(--primary);font-size:1.1rem">${formatPrice(o.total)}</span>
          <span style="font-size:0.85rem;color:var(--gray)">⏰ รับเวลา ${o.pickupTime}</span>
        </div>
        ${o.status==='pending'?`
          <div style="margin-top:16px;display:flex;gap:8px" onclick="event.stopPropagation()">
            <button class="btn btn-outline btn-sm" style="flex:1" data-action="reschedule-order" data-value="${o.id}">🕒 เลื่อนเวลา</button>
            <button class="btn btn-danger btn-sm" style="flex:1" data-action="cancel-order" data-value="${o.id}">❌ ยกเลิก</button>
          </div>`:''}
        ${o.status==='cooking'||o.status==='ready'?`
          <div class="status-tracker" style="margin-top:16px">
            <div class="status-step completed"><div class="step-circle">✓</div><div class="step-label">สั่งแล้ว</div></div>
            <div class="status-line completed"></div>
            <div class="status-step ${o.status==='cooking'?'active':'completed'}"><div class="step-circle">${o.status==='cooking'?'🍳':'✓'}</div><div class="step-label">กำลังปรุง</div></div>
            <div class="status-line ${o.status==='ready'?'completed':''}"></div>
            <div class="status-step ${o.status==='ready'?'active':''}"><div class="step-circle">${o.status==='ready'?'✅':'○'}</div><div class="step-label">พร้อมรับ</div></div>
          </div>`:''}
        ${o.status==='ready'?`
          <div style="margin-top:16px" onclick="event.stopPropagation()">
            <button class="btn btn-primary btn-lg" style="width:100%; box-shadow: var(--shadow); animation: pulse 2s infinite;" data-action="complete-order" data-value="${o.id}">
              🎉 รับอาหารแล้ว
            </button>
          </div>`:''}
      </div>
    </div>`;

  return `
  <div class="page-header"><h1>📋 ออเดอร์ของฉัน</h1></div>
  
  ${activeOrders.length > 0 ? `
    <h3 style="margin-bottom:16px;color:var(--primary-dark)">กำลังดำเนินการ (${activeOrders.length})</h3>
    <div class="grid grid-2" style="margin-bottom:32px">
      ${activeOrders.map(renderOrderCard).join('')}
    </div>
  ` : '<p style="color:var(--gray);margin-bottom:32px">ไม่มีออเดอร์ที่กำลังดำเนินการ</p>'}

  ${pastOrders.length > 0 ? `
    <h3 style="margin-bottom:16px;color:var(--gray)">ประวัติคำสั่งซื้อ</h3>
    <div class="grid grid-2">
      ${pastOrders.map(renderOrderCard).join('')}
    </div>
  ` : ''}

  <!-- CANCEL ORDER MODAL -->
  <div id="cancel-modal" class="modal-overlay">
    <div class="modal" style="text-align:center">
      <div class="modal-header">
        <h2 style="margin:0 auto">ยืนยันการยกเลิก</h2>
        <button class="modal-close" onclick="document.getElementById('cancel-modal').classList.remove('active')">&times;</button>
      </div>
      <p style="margin-bottom:24px;color:var(--gray)">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?<br>หากยกเลิกแล้วจะไม่สามารถกู้คืนได้ (ระบบจะคืนเงินให้ตามเงื่อนไข)</p>
      <input type="hidden" id="cancel-order-id">
      <div style="display:flex;gap:12px">
        <button class="btn btn-outline btn-lg" style="flex:1" onclick="document.getElementById('cancel-modal').classList.remove('active')">กลับ</button>
        <button class="btn btn-danger btn-lg" style="flex:1" data-action="confirm-cancel">ยืนยันยกเลิก</button>
      </div>
    </div>
  </div>

  <!-- RESCHEDULE ORDER MODAL -->
  <div id="reschedule-modal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 style="margin:0 auto">เลือกเวลาใหม่</h2>
        <button class="modal-close" onclick="document.getElementById('reschedule-modal').classList.remove('active')">&times;</button>
      </div>
      <p style="margin-bottom:16px;text-align:center;color:var(--gray)">เลือกเวลารับอาหารใหม่ที่ท่านสะดวก</p>
      <input type="hidden" id="reschedule-order-id">
      <div class="form-group">
        <label>⏰ เวลารับอาหาร</label>
        <select class="form-control" id="new-pickup-time">
          ${generatePickupTimeSlots().map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary btn-lg" style="width:100%;margin-top:8px" data-action="confirm-reschedule">บันทึกเวลาใหม่</button>
    </div>
  </div>
  `;
}

function customerOrderDetailPage() { return ''; }
// ===== CUSTOMER: TRACK ORDER PAGE (UC-07 & UC-08) =====
function customerTrackPage() {
  const orderId = App.selectedOrder;
  const order = orderId ? App.orders.find(o => o.id === orderId) : App.orders.find(o => o.customerId === App.user.id);
  if (!order) return '<div class="empty-state"><h3>ไม่มีออเดอร์ให้ติดตาม</h3></div>';

  return `
  <div style="margin-bottom:20px">
    <button class="btn btn-outline btn-sm" data-nav="my-orders">← กลับหน้าออเดอร์</button>
  </div>
  
  <div class="card fade-in-up" style="max-width:500px; margin:0 auto;">
    <div class="card-body" style="padding: 30px;">
      <h2 style="text-align:center; margin-bottom: 24px;">สถานะคำสั่งซื้อ</h2>
      
      <div class="flex-between" style="margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--gray-light);">
        <div>
          <h3 style="color:var(--primary-dark)">${order.id}</h3>
          <p style="color:var(--gray); font-size:0.9rem;">ร้าน ${order.shopName}</p>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:900; font-size:1.2rem; color:var(--primary)">${formatPrice(order.total)}</span>
          <p style="color:var(--gray); font-size:0.85rem;">เวลา ${order.pickupTime}</p>
        </div>
      </div>

      <!-- UC-07: PROGRESS BAR & STATUS -->
      <div class="track-progress" style="margin: 32px 0;">
        ${order.status === 'completed' ? `
          <div style="text-align:center;padding:24px;background:#F0FFF4;border:2px solid #C6F6D5;border-radius:12px">
            <div style="font-size:3rem;margin-bottom:8px">🎉</div>
            <h3 style="color:var(--success);margin:0">รับอาหารแล้ว</h3>
            <p style="color:var(--gray);font-size:0.85rem;margin-top:4px">ขอบคุณที่ใช้บริการ ขอให้อร่อยกับมื้ออาหารครับ!</p>
          </div>
        ` : order.status === 'cancelled' ? `
          <div style="text-align:center;padding:24px;background:#FFF5F5;border:2px solid #FED7D7;border-radius:12px">
            <div style="font-size:3rem;margin-bottom:8px">❌</div>
            <h3 style="color:var(--danger);margin:0">ออเดอร์ถูกยกเลิก</h3>
            <p style="color:var(--gray);font-size:0.85rem;margin-top:4px">คำสั่งซื้อนี้ถูกยกเลิก กรุณาสั่งใหม่อีกครั้ง</p>
          </div>
        ` : `
        <div class="status-tracker" style="transform: scale(1.1); transform-origin: top center;">
          <div class="status-step completed">
            <div class="step-circle">📝</div>
            <div class="step-label">สั่งอาหาร<br><span style="font-size:0.7rem;color:var(--gray)">${order.orderDate}</span></div>
          </div>
          <div class="status-line completed"></div>
          
          <div class="status-step ${order.status==='cooking'||order.status==='ready' ? 'completed' : (order.status==='pending' ? 'active' : '')}">
            <div class="step-circle">${order.status==='pending'?'⏳':'🍳'}</div>
            <div class="step-label">กำลังปรุง</div>
          </div>
          <div class="status-line ${order.status==='cooking'||order.status==='ready' ? 'completed' : ''}"></div>
          
          <div class="status-step ${order.status==='ready' ? 'active' : ''}">
            <div class="step-circle">${order.status==='ready'?'✅':'🛍️'}</div>
            <div class="step-label">พร้อมรับ</div>
          </div>
        </div>
        `}
      </div>

      <div style="background:var(--cream); padding:16px; border-radius:var(--radius); margin-bottom:24px;">
        <h4 style="margin-bottom:8px">รายการอาหาร:</h4>
        ${order.items.map(i => `<div class="flex-between" style="font-size:0.9rem; margin-bottom:4px;"><span>${i.name} x${i.qty}</span><span>${formatPrice(i.price*i.qty)}</span></div>`).join('')}
      </div>

      ${order.status === 'ready' ? `
      <div style="text-align:center; margin-bottom:24px;">
        <button class="btn btn-primary btn-lg" style="width:100%; box-shadow: var(--shadow); animation: pulse 2s infinite;" data-action="complete-order" data-value="${order.id}">
          🎉 รับอาหารแล้ว
        </button>
      </div>` : ''}

      <!-- UC-08: MOCK NOTIFICATION BUTTON (Hide for completed/cancelled) -->
      ${(order.status !== 'completed' && order.status !== 'cancelled') ? `
      <div style="text-align:center; padding-top:16px; border-top:1px solid var(--gray-light);">
        <button class="btn btn-secondary" onclick="showPushNotification()">📱 จำลองการแจ้งเตือน</button>
      </div>` : ''}
    </div>
  </div>`;
}

// ===== FILTER FUNCTIONS =====
function filterAll() {
  const q = document.getElementById('search-input')?.value.toLowerCase() || '';
  document.querySelectorAll('.shop-card').forEach(c => {
    c.style.display = c.dataset.shopname.toLowerCase().includes(q) ? '' : 'none';
  });
  document.querySelectorAll('.menu-card').forEach(c => {
    c.style.display = c.dataset.name.toLowerCase().includes(q) ? '' : 'none';
  });
}
function filterMenus() {
  const q = document.getElementById('search-input')?.value.toLowerCase() || '';
  document.querySelectorAll('.menu-card').forEach(c => {
    c.style.display = c.dataset.name.toLowerCase().includes(q) ? '' : 'none';
  });
}
function filterByShop(shopId, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.menu-card').forEach(c => {
    c.style.display = (!shopId || parseInt(c.dataset.shop) === shopId) ? '' : 'none';
  });
}
