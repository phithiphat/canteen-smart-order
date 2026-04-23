// ===== VENDOR LAYOUT =====
function vendorLayout(page) {
  const activeAnnouncements = ANNOUNCEMENTS.filter(a => a.active && (a.target === 'all' || a.target === 'vendor'));
  
  const announceNotifs = activeAnnouncements.map(a => `
    <div class="notif-item unread"><div class="notif-title">📢 ${a.title}</div><div class="notif-time">${a.message}</div></div>
  `).join('');

  const activeVendorOrders = App.orders.filter(o => o.shopId === App.user.shopId && o.status === 'pending');
  const orderNotifs = activeVendorOrders.map(o => `
    <div class="notif-item unread">
      <div class="notif-title">📦 ออเดอร์ใหม่ ${o.id}</div>
      <div class="notif-time">${o.items.map(i=>i.name).join(', ')} - รอดำเนินการ</div>
    </div>
  `).join('');

  const emptyNotif = (activeAnnouncements.length === 0 && activeVendorOrders.length === 0) 
    ? `<div style="padding:16px; text-align:center; color:var(--gray); font-size:0.9rem;">ไม่มีการแจ้งเตือน</div>` 
    : '';

  return `
  <nav class="navbar">
    <a href="#" class="navbar-brand"><span class="logo">🍽️</span><span>${App.user.name || 'Vendor Dashboard'}</span></a>
    <button class="navbar-toggle" data-action="toggle-sidebar">☰</button>
    <div class="navbar-user">
      <div class="notif-wrapper">
        <button class="btn-icon" data-action="toggle-notif" style="position:relative;background:none;border:none;font-size:1.3rem;cursor:pointer">🔔${(activeAnnouncements.length > 0 || activeVendorOrders.length > 0) ? '<span class="notif-dot"></span>' : ''}</button>
        <div class="notif-dropdown">
          <div class="notif-header">การแจ้งเตือน</div>
          ${announceNotifs}
          ${orderNotifs}
          ${emptyNotif}
        </div>
      </div>
      <div class="avatar">${(App.user.name || 'ร').charAt(0)}</div>
      <button class="btn btn-sm btn-outline" data-action="logout">ออก</button>
    </div>
  </nav>
  <aside class="sidebar">
    <div class="sidebar-section">จัดการ</div>
    <ul class="sidebar-nav">
      <li><a href="#" data-nav="v-orders" class="${page==='v-orders'?'active':''}"><span class="icon">📦</span>ออเดอร์ใหม่</a></li>
      <li><a href="#" data-nav="v-cooking" class="${page==='v-cooking'?'active':''}"><span class="icon">🍳</span>กำลังปรุง</a></li>
      <li><a href="#" data-nav="v-group" class="${page==='v-group'?'active':''}"><span class="icon">📊</span>จัดกลุ่มออเดอร์</a></li>
      <li><a href="#" data-nav="v-menu" class="${page==='v-menu'?'active':''}"><span class="icon">📝</span>จัดการเมนู</a></li>
      <li><a href="#" data-nav="v-sales" class="${page==='v-sales'?'active':''}"><span class="icon">💰</span>ยอดขายวันนี้</a></li>
    </ul>
  </aside>
  <div class="main-content with-sidebar"><div class="container fade-in">
    ${page==='v-orders'?vendorOrdersPage():''}
    ${page==='v-cooking'?vendorCookingPage():''}
    ${page==='v-group'?vendorGroupPage():''}
    ${page==='v-menu'?vendorMenuPage():''}
    ${page==='v-sales'?vendorSalesPage():''}
  </div></div>`;
}

// ===== VENDOR: INCOMING ORDERS =====
function vendorOrdersPage() {
  const orders = App.orders.filter(o => o.shopId === App.user.shopId && o.status === 'pending');
  return `
  <div class="page-header"><h1>📦 ออเดอร์ใหม่</h1><span class="badge badge-pending">${orders.length} รายการ</span></div>
  ${orders.length===0?'<div class="empty-state"><div class="empty-icon">📭</div><h3>ไม่มีออเดอร์ใหม่ในขณะนี้</h3></div>':''}
  <div class="grid grid-2">
    ${orders.map(o => `
    <div class="card">
      <div class="card-body">
        <div class="flex-between" style="margin-bottom:10px">
          <h3>${o.id}</h3>
          <span class="badge badge-pending">⏳ รอรับออเดอร์</span>
        </div>
        <p><strong>👤</strong> ${o.customerName}</p>
        <p style="margin-top:6px"><strong>⏰</strong> รับเวลา ${o.pickupTime}</p>
        <div style="margin:12px 0;padding:12px;background:var(--cream);border-radius:var(--radius)">
          ${o.items.map(i=>`<div class="flex-between" style="margin-bottom:4px"><span>${i.name} x${i.qty}</span><span>${formatPrice(i.price*i.qty)}</span></div>${i.note?`<div style="font-size:0.8rem;color:var(--gray);margin-bottom:4px">📝 ${i.note}</div>`:''}`).join('')}
          <div class="flex-between" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--gray-light);font-weight:900"><span>รวม</span><span style="color:var(--primary)">${formatPrice(o.total)}</span></div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-success" style="flex:1" data-action="accept-order" data-value="${o.id}">✅ รับออเดอร์</button>
          <button class="btn btn-danger" data-action="reject-order" data-value="${o.id}">❌ ปฏิเสธ</button>
        </div>
      </div>
    </div>`).join('')}
  </div>

  <!-- REJECT ORDER MODAL -->
  <div id="reject-modal" class="modal-overlay">
    <div class="modal" style="text-align:center">
      <div class="modal-header">
        <h2 style="margin:0 auto">ยืนยันการปฏิเสธคำสั่งซื้อ</h2>
        <button class="modal-close" onclick="document.getElementById('reject-modal').classList.remove('active')">&times;</button>
      </div>
      <p style="margin-bottom:24px;color:var(--gray)">คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำสั่งซื้อนี้?<br>ระบบจะทำการยกเลิกและแจ้งลูกค้าให้ทราบ</p>
      <input type="hidden" id="reject-order-id">
      <div style="display:flex;gap:12px">
        <button class="btn btn-outline btn-lg" style="flex:1" onclick="document.getElementById('reject-modal').classList.remove('active')">กลับ</button>
        <button class="btn btn-danger btn-lg" style="flex:1" data-action="confirm-reject">ยืนยันปฏิเสธ</button>
      </div>
    </div>
  </div>`;
}

// ===== VENDOR: COOKING =====
function vendorCookingPage() {
  const orders = App.orders.filter(o => o.shopId === App.user.shopId && (o.status === 'accepted' || o.status === 'preparing'));
  return `
  <div class="page-header"><h1>🍳 กำลังปรุงอาหาร (อัปเดตสถานะ)</h1><span class="badge badge-cooking">${orders.length} รายการ</span></div>
  ${orders.length===0?'<div class="empty-state"><div class="empty-icon">🍳</div><h3>ไม่มีออเดอร์ที่กำลังปรุง</h3></div>':''}
  <div class="grid grid-2">
    ${orders.map(o => `
    <div class="card" style="border: 2px solid var(--primary);">
      <div class="card-body">
        <div class="flex-between" style="margin-bottom:10px">
          <h3>${o.id}</h3>
          <span class="badge badge-cooking">🍳 กำลังปรุง</span>
        </div>
        <p><strong>👤</strong> ${o.customerName}</p>
        <p style="margin-top:6px"><strong>⏰</strong> รับเวลา ${o.pickupTime}</p>
        <div style="margin:12px 0;padding:12px;background:var(--cream);border-radius:var(--radius)">
          ${o.items.map(i=>`<div class="flex-between" style="margin-bottom:4px"><span>${i.name} x${i.qty}</span><span>${formatPrice(i.price*i.qty)}</span></div>${i.note?`<div style="font-size:0.8rem;color:var(--gray);margin-bottom:4px">📝 ${i.note}</div>`:''}`).join('')}
          <div class="flex-between" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--gray-light);font-weight:900"><span>รวม</span><span style="color:var(--primary)">${formatPrice(o.total)}</span></div>
        </div>
        <button class="btn btn-primary btn-lg" style="width:100%; box-shadow: var(--shadow); animation: pulse 2s infinite;" data-action="ready-order" data-value="${o.id}">
          🛍️ พร้อมรับอาหาร
        </button>
      </div>
    </div>`).join('')}
  </div>`;
}

// ===== VENDOR: GROUP ORDERS =====
function vendorGroupPage() {
  const orders = App.orders.filter(o => o.shopId === App.user.shopId && (o.status === 'accepted' || o.status === 'preparing' || o.status === 'pending'));
  const grouped = {};
  orders.forEach(o => o.items.forEach(i => {
    if (!grouped[i.name]) grouped[i.name] = { total: 0, orders: [], price: i.price, image: MENUS.find(m=>m.name===i.name)?.image||'' };
    grouped[i.name].total += i.qty;
    grouped[i.name].orders.push({ orderId: o.id, qty: i.qty, note: i.note, customer: o.customerName, time: o.pickupTime });
  }));

  const groupKeys = Object.keys(grouped);
  if (groupKeys.length === 0) {
    return `<div class="page-header"><h1>📊 จัดกลุ่มออเดอร์ตามเมนู</h1></div><div class="empty-state"><div class="empty-icon">📊</div><h3>ไม่มีออเดอร์ที่รอการจัดเตรียมในขณะนี้</h3></div>`;
  }

  return `
  <div class="page-header"><h1>📊 จัดกลุ่มออเดอร์ตามเมนู</h1></div>
  
  <div class="filter-tabs" style="margin-bottom:20px; display:flex; gap:12px; overflow-x:auto;">
    ${groupKeys.map((name, idx) => `
      <button class="btn btn-group-tab ${idx===0?'btn-outline':'btn-primary'}" 
              style="border-radius:var(--radius); white-space:nowrap; ${idx===0?'background:var(--white); color:var(--primary);':'background:var(--primary); color:white;'}"
              onclick="document.querySelectorAll('.btn-group-tab').forEach(b=>{b.className='btn btn-group-tab btn-primary'; b.style.background='var(--primary)'; b.style.color='white';}); 
                       this.className='btn btn-group-tab btn-outline'; this.style.background='var(--white)'; this.style.color='var(--primary)';
                       document.querySelectorAll('.group-list').forEach(l=>l.style.display='none'); 
                       document.getElementById('group-${idx}').style.display='block';">
        ${name} (${grouped[name].total})
      </button>
    `).join('')}
  </div>

  <div class="card" style="background:var(--white); border-radius:var(--radius-lg); overflow:hidden;">
    <div class="card-body" style="padding:0">
      ${groupKeys.map((name, idx) => `
      <div id="group-${idx}" class="group-list" style="display:${idx===0?'block':'none'}">
        ${grouped[name].orders.map((d, i) => `
        <div style="display:flex; gap:16px; padding:20px; border-bottom:${i<grouped[name].orders.length-1?'1px solid var(--gray-light)':'none'}">
          <img src="${grouped[name].image}" alt="${name}" style="width:120px; height:80px; object-fit:cover; border-radius:var(--radius);" onerror="this.src='https://placehold.co/400x300/FFCE99/562F00?text=${encodeURIComponent(name)}'">
          <div style="flex:1; display:flex; justify-content:space-between;">
            <div>
              <p style="font-size:0.8rem; color:var(--gray); margin-bottom:4px">ร้าน ${SHOPS.find(s=>s.id===App.user.shopId)?.name||'อาหาร'}</p>
              <h3 style="margin-bottom:4px; font-size:1.1rem">${name} ${d.note ? `<span style="font-weight:normal;color:var(--gray)">+ ${d.note}</span>` : ''} <span style="color:var(--primary);margin-left:4px">x${d.qty}</span></h3>
              <p style="font-weight:900; color:var(--primary); font-size:1.1rem; margin-top:8px">${formatPrice(grouped[name].price * d.qty)}</p>
            </div>
            <div style="text-align:right;">
              <p style="font-size:0.8rem; color:var(--gray); margin-bottom:4px">เลข ออเดอร์ ${d.orderId}</p>
              <p style="font-weight:700; margin-top:16px"><span style="color:var(--primary)">🕒</span> ${d.time} น.</p>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
      `).join('')}
    </div>
  </div>`;
}

// ===== VENDOR: MENU MANAGEMENT =====
function vendorMenuPage() {
  const menus = MENUS.filter(m => m.shopId === App.user.shopId);
  return `
  <div style="width:100%; height:120px; overflow:hidden; border-radius:var(--radius-lg); margin-bottom:20px;">
    <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" style="width:100%; height:100%; object-fit:cover;" alt="Shop Cover">
  </div>
  
  <h2 style="text-align:center; margin-bottom: 24px; font-size:1.2rem; color:var(--primary-dark);">เปิดหรือปิดการขายเมนู</h2>
  
  <div class="card" style="background:var(--white); border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--gray-light); box-shadow:0 2px 10px rgba(0,0,0,0.05);">
    <div class="card-body" style="padding:0">
      ${menus.map((m, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:${i<menus.length-1?'1px solid #eee':'none'};">
        <span style="font-weight:700; font-size:1rem;">${m.name}</span>
        <div style="display:flex; gap:12px;">
          <button class="btn" style="border-radius:6px; padding:8px 32px; font-weight:bold; transition:all 0.2s; ${m.available?'background:var(--success); color:white; border:none;':'background:transparent; color:var(--success); border:1px solid var(--success); opacity:0.7;'}" onclick="if(!${m.available}) toggleMenuAvail(${m.id})">เปิด</button>
          <button class="btn" style="border-radius:6px; padding:8px 32px; font-weight:bold; transition:all 0.2s; ${!m.available?'background:var(--danger); color:white; border:none;':'background:transparent; color:var(--danger); border:1px solid var(--danger); opacity:0.7;'}" onclick="if(${m.available}) toggleMenuAvail(${m.id})">ปิด</button>
        </div>
      </div>
      `).join('')}
    </div>
  </div>`;
}

// ===== VENDOR: SALES REPORT =====
// ===== VENDOR: SALES REPORT =====
function vendorSalesPage() {
  const todayOrders = App.orders.filter(o => o.shopId === App.user.shopId && o.status !== 'cancelled');
  const totalRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const completed = todayOrders.filter(o => o.status === 'completed').length;
  
  // Mock data for chart
  const chartData = [
    { time: '10:00', sales: 450, height: '40%' },
    { time: '11:00', sales: 850, height: '75%' },
    { time: '12:00', sales: 1200, height: '100%' },
    { time: '13:00', sales: 900, height: '80%' },
    { time: '14:00', sales: 300, height: '25%' },
    { time: '15:00', sales: 500, height: '45%' }
  ];

  return `
  <div class="page-header">
    <h1>💰 รายงานยอดขายประจำวัน</h1>
    <p style="color:var(--gray)">📅 ${new Date().toLocaleDateString('th-TH',{dateStyle:'long'})}</p>
  </div>
  
  <div class="grid grid-4" style="margin-bottom:24px">
    <div class="stat-card"><div class="stat-icon orange">📦</div><div class="stat-info"><h3>${todayOrders.length}</h3><p>ออเดอร์ทั้งหมด</p></div></div>
    <div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-info"><h3>${completed}</h3><p>เสร็จสมบูรณ์</p></div></div>
    <div class="stat-card"><div class="stat-icon blue">💰</div><div class="stat-info"><h3>${formatPrice(totalRevenue)}</h3><p>รายได้วันนี้</p></div></div>
    <div class="stat-card"><div class="stat-icon red">📊</div><div class="stat-info"><h3>${formatPrice(todayOrders.length>0?Math.round(totalRevenue/todayOrders.length):0)}</h3><p>เฉลี่ยต่อบิล</p></div></div>
  </div>

  <div class="card" style="margin-bottom:24px;">
    <div class="card-body">
      <h3 style="margin-bottom:16px;">📈 กราฟยอดขายตามช่วงเวลา</h3>
      <div style="display:flex; height:200px; align-items:flex-end; gap:2%; padding-top:20px; border-bottom:2px solid var(--gray-light); padding-bottom:10px;">
        ${chartData.map(d => `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;">
            <span style="font-size:0.8rem; color:var(--gray); font-weight:bold;">฿${d.sales}</span>
            <div style="width:100%; max-width:40px; background:linear-gradient(to top, var(--primary-dark), var(--primary)); height:${d.height}; border-radius:4px 4px 0 0; transition:height 1s ease-out; box-shadow:0 4px 10px rgba(255,150,68,0.3);"></div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; gap:2%; margin-top:8px;">
        ${chartData.map(d => `
          <div style="flex:1; text-align:center; font-size:0.8rem; color:var(--gray);">${d.time}</div>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="table-wrapper">
    <table>
      <thead><tr><th>ออเดอร์</th><th>ลูกค้า</th><th>รายการ</th><th>ยอด</th><th>สถานะ</th></tr></thead>
      <tbody>
        ${todayOrders.map(o=>`<tr>
          <td><strong>${o.id}</strong></td><td>${o.customerName}</td>
          <td>${o.items.map(i=>`${i.name} x${i.qty}`).join(', ')}</td>
          <td style="font-weight:900; color:var(--primary-dark);">${formatPrice(o.total)}</td>
          <td><span class="badge ${STATUS_MAP[o.status].badge}">${STATUS_MAP[o.status].label}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
