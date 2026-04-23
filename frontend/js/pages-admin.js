// ===== ADMIN LAYOUT =====
function adminLayout(page) {
  return `
  <nav class="navbar">
    <a href="#" class="navbar-brand"><span class="logo">🍽️</span><span>Admin Panel</span></a>
    <button class="navbar-toggle" data-action="toggle-sidebar">☰</button>
    <div class="navbar-user">
      <div class="avatar" style="background:var(--primary-dark)">A</div>
      <button class="btn btn-sm btn-outline" data-action="logout">ออก</button>
    </div>
  </nav>
  <aside class="sidebar">
    <div class="sidebar-section">ภาพรวม</div>
    <ul class="sidebar-nav">
      <li><a href="#" data-nav="a-dashboard" class="${page === 'a-dashboard' ? 'active' : ''}"><span class="icon">📊</span>Dashboard</a></li>
    </ul>
    <div class="sidebar-section">จัดการ</div>
    <ul class="sidebar-nav">
      <li><a href="#" data-nav="a-vendors" class="${page === 'a-vendors' ? 'active' : ''}"><span class="icon">🏪</span>จัดการร้านค้า</a></li>
      <li><a href="#" data-nav="a-history" class="${page === 'a-history' ? 'active' : ''}"><span class="icon">📋</span>ประวัติคำสั่งซื้อ</a></li>
      <li><a href="#" data-nav="a-announce" class="${page === 'a-announce' ? 'active' : ''}"><span class="icon">📢</span>ประกาศข่าวสาร</a></li>
    </ul>
  </aside>
  <div class="main-content with-sidebar"><div class="container fade-in">
    ${page === 'a-dashboard' ? adminDashboard() : ''}
    ${page === 'a-vendors' ? adminVendorsPage() : ''}
    ${page === 'a-history' ? adminHistoryPage() : ''}
    ${page === 'a-announce' ? adminAnnouncePage() : ''}
  </div></div>`;
}

// ===== ADMIN: DASHBOARD =====
function adminDashboard() {
  const total = App.orders.length;
  const revenue = App.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const activeVendors = VENDORS.filter(v => v.status === 'active').length;
  const completedOrders = App.orders.filter(o => o.status === 'completed').length;
  const pendingOrders = App.orders.filter(o => o.status === 'pending').length;
  const avgOrderValue = total > 0 ? Math.round(revenue / (total - App.orders.filter(o => o.status === 'cancelled').length)) : 0;
  const totalMenus = MENUS.length;

  // Schedule chart rendering after DOM update
  setTimeout(() => renderDashboardCharts(), 100);

  return `
  <div class="page-header"><h1>📊 System Dashboard</h1><p style="color:var(--gray)">ภาพรวมระบบ Canteen Smart Order</p></div>

  <!-- STAT CARDS -->
  <div class="grid grid-4" style="margin-bottom:28px">
    <div class="stat-card"><div class="stat-icon orange">📦</div><div class="stat-info"><h3>${total}</h3><p>คำสั่งซื้อทั้งหมด</p></div></div>
    <div class="stat-card"><div class="stat-icon green">💰</div><div class="stat-info"><h3>${formatPrice(revenue)}</h3><p>รายได้รวม</p></div></div>
    <div class="stat-card"><div class="stat-icon blue">🏪</div><div class="stat-info"><h3>${activeVendors}/${VENDORS.length}</h3><p>ร้านค้าเปิดให้บริการ</p></div></div>
    <div class="stat-card"><div class="stat-icon red">🍽️</div><div class="stat-info"><h3>${totalMenus}</h3><p>เมนูอาหารทั้งหมด</p></div></div>
  </div>

  <!-- MINI STAT ROW -->
  <div class="grid grid-4" style="margin-bottom:28px">
    <div class="card" style="text-align:center"><div class="card-body" style="padding:16px">
      <div style="font-size:2rem;font-weight:900;color:var(--success)">${completedOrders}</div>
      <div style="font-size:0.85rem;color:var(--gray)">✅ สำเร็จแล้ว</div>
    </div></div>
    <div class="card" style="text-align:center"><div class="card-body" style="padding:16px">
      <div style="font-size:2rem;font-weight:900;color:var(--warning)">${pendingOrders}</div>
      <div style="font-size:0.85rem;color:var(--gray)">⏳ รอดำเนินการ</div>
    </div></div>
    <div class="card" style="text-align:center"><div class="card-body" style="padding:16px">
      <div style="font-size:2rem;font-weight:900;color:var(--primary)">${formatPrice(avgOrderValue)}</div>
      <div style="font-size:0.85rem;color:var(--gray)">💳 ยอดเฉลี่ย/ออเดอร์</div>
    </div></div>
    <div class="card" style="text-align:center"><div class="card-body" style="padding:16px">
      <div style="font-size:2rem;font-weight:900;color:#8B5CF6">128</div>
      <div style="font-size:0.85rem;color:var(--gray)">👥 ผู้ใช้งานวันนี้</div>
    </div></div>
  </div>

  <!-- CHARTS ROW 1: Order Status (Doughnut) + Revenue by Vendor (Bar) -->
  <div class="grid grid-2" style="margin-bottom:28px">
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">📊 สัดส่วนสถานะออเดอร์</h3>
      <div style="position:relative;height:280px;display:flex;justify-content:center;align-items:center">
        <canvas id="chart-order-status"></canvas>
      </div>
    </div></div>
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">💰 รายได้แยกตามร้านค้า</h3>
      <div style="position:relative;height:280px">
        <canvas id="chart-revenue-vendor"></canvas>
      </div>
    </div></div>
  </div>

  <!-- CHARTS ROW 2: Daily Trends (Line) + Popular Menu (Horizontal Bar) -->
  <div class="grid grid-2" style="margin-bottom:28px">
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">📈 แนวโน้มออเดอร์ 7 วันล่าสุด</h3>
      <div style="position:relative;height:280px">
        <canvas id="chart-daily-trend"></canvas>
      </div>
    </div></div>
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">🔥 เมนูยอดนิยม (Top 5)</h3>
      <div style="position:relative;height:280px">
        <canvas id="chart-popular-menu"></canvas>
      </div>
    </div></div>
  </div>

  <!-- BOTTOM ROW: Order Status Progress + Top Vendors -->
  <div class="grid grid-2">
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">📈 สถานะออเดอร์วันนี้</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${['pending', 'cooking', 'ready', 'completed', 'cancelled'].map(s => {
    const count = App.orders.filter(o => o.status === s).length;
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    const colors = { pending: '#F59E0B', cooking: '#3B82F6', ready: '#10B981', completed: '#6366F1', cancelled: '#EF4444' };
    return `<div>
            <div class="flex-between" style="margin-bottom:4px"><span class="badge ${STATUS_MAP[s].badge}">${STATUS_MAP[s].icon} ${STATUS_MAP[s].label}</span><span style="font-weight:700">${count} (${pct}%)</span></div>
            <div style="height:8px;background:var(--gray-light);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${colors[s]};border-radius:4px;transition:width 0.5s"></div></div>
          </div>`;
  }).join('')}
      </div>
    </div></div>
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:16px">🏪 ร้านค้ายอดนิยม</h3>
      ${[...VENDORS].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5).map((v, i) => `
        <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--gray-light)">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-weight:900;color:var(--primary);font-size:1.1rem;min-width:28px">#${i + 1}</span>
            <div><div style="font-weight:700">${v.name}</div><div style="font-size:0.8rem;color:var(--gray)">${v.owner}</div></div>
          </div>
          <div style="text-align:right"><div style="font-weight:900">${v.totalOrders} ออเดอร์</div><div style="font-size:0.8rem;color:var(--success)">${formatPrice(v.revenue)}</div></div>
        </div>
      `).join('')}
    </div></div>
  </div>`;
}

// ===== CHART RENDERING =====
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  // Destroy existing charts to prevent memory leaks
  Chart.helpers?.each(Chart.instances, (instance) => { instance.destroy(); });

  const fontFamily = "'Segoe UI', 'Noto Sans Thai', sans-serif";
  Chart.defaults.font.family = fontFamily;

  // --- 1. Order Status Doughnut Chart ---
  const statusCtx = document.getElementById('chart-order-status');
  if (statusCtx) {
    const statusCounts = ['pending', 'cooking', 'ready', 'completed', 'cancelled'].map(
      s => App.orders.filter(o => o.status === s).length
    );
    new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['รอรับออเดอร์', 'กำลังปรุง', 'พร้อมเสิร์ฟ', 'รับอาหารแล้ว', 'ยกเลิก'],
        datasets: [{
          data: statusCounts,
          backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#EF4444'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 } }
        }
      }
    });
  }

  // --- 2. Revenue by Vendor Bar Chart ---
  const revenueCtx = document.getElementById('chart-revenue-vendor');
  if (revenueCtx) {
    const sortedVendors = [...VENDORS].sort((a, b) => b.revenue - a.revenue);
    const vendorColors = ['#FF6B35', '#FF8C61', '#FFB088', '#10B981', '#3B82F6'];
    new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: sortedVendors.map(v => v.name.replace('ร้าน', '')),
        datasets: [{
          label: 'รายได้ (บาท)',
          data: sortedVendors.map(v => v.revenue),
          backgroundColor: vendorColors.map(c => c + 'CC'),
          borderColor: vendorColors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '฿' + v.toLocaleString() }, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ฿' + ctx.parsed.y.toLocaleString() } }
        }
      }
    });
  }

  // --- 3. Daily Order Trend Line Chart ---
  const trendCtx = document.getElementById('chart-daily-trend');
  if (trendCtx) {
    const days = [];
    const orderCounts = [];
    const revenueCounts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      days.push(dayLabel);
      const dayOrders = App.orders.filter(o => o.orderDate === dateStr);
      orderCounts.push(dayOrders.length);
      revenueCounts.push(dayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0));
    }
    // Add some mock trend data if all zeros
    if (orderCounts.every(c => c === 0)) {
      const mockCounts = [3, 5, 4, 7, 6, 8, App.orders.length];
      const mockRevenue = [210, 385, 290, 520, 440, 615, App.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)];
      mockCounts.forEach((c, i) => { orderCounts[i] = c; revenueCounts[i] = mockRevenue[i]; });
    }

    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'จำนวนออเดอร์',
            data: orderCounts,
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255,107,53,0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#FF6B35',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y'
          },
          {
            label: 'รายได้ (บาท)',
            data: revenueCounts,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16,185,129,0.05)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { beginAtZero: true, position: 'left', title: { display: true, text: 'ออเดอร์' }, grid: { color: '#f0f0f0' } },
          y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'บาท' }, grid: { drawOnChartArea: false },
            ticks: { callback: v => '฿' + v } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 14 } },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + (ctx.datasetIndex === 1 ? '฿' + ctx.parsed.y.toLocaleString() : ctx.parsed.y) } }
        }
      }
    });
  }

  // --- 4. Popular Menu Horizontal Bar Chart ---
  const menuCtx = document.getElementById('chart-popular-menu');
  if (menuCtx) {
    // Count menu occurrences across orders
    const menuCount = {};
    App.orders.forEach(o => {
      o.items.forEach(i => {
        menuCount[i.name] = (menuCount[i.name] || 0) + i.qty;
      });
    });
    const sortedMenus = Object.entries(menuCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // If no data, use mock
    if (sortedMenus.length === 0) {
      MENUS.slice(0, 5).forEach(m => sortedMenus.push([m.name, Math.floor(Math.random() * 20) + 5]));
    }
    const menuColors = ['#FF6B35', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

    new Chart(menuCtx, {
      type: 'bar',
      data: {
        labels: sortedMenus.map(m => m[0]),
        datasets: [{
          label: 'จำนวนที่สั่ง',
          data: sortedMenus.map(m => m[1]),
          backgroundColor: menuColors.map(c => c + 'CC'),
          borderColor: menuColors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } },
          y: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' สั่ง ' + ctx.parsed.x + ' จาน' } }
        }
      }
    });
  }
}

// ===== ADMIN: MANAGE VENDORS =====
function adminVendorsPage() {
  const filteredVendors = VENDORS;
  return `
  <div class="page-header"><h1>🏪 จัดการร้านค้า</h1>
    <button class="btn btn-primary" onclick="openAddVendorModal()">+ เพิ่มร้านค้าใหม่</button>
  </div>

  <!-- Search Bar -->
  <div style="margin-bottom:20px">
    <input type="text" id="admin-vendor-search" class="form-control" placeholder="🔍 ค้นหาร้านค้า, เจ้าของ, Username..." oninput="filterAdminVendors()" style="max-width:400px">
  </div>

  <div class="table-wrapper">
    <table>
      <thead><tr><th>ร้านค้า</th><th>เจ้าของ</th><th>Username</th><th>ออเดอร์</th><th>รายได้</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
      <tbody>
        ${filteredVendors.map(v => `<tr class="vendor-row" data-name="${v.name.toLowerCase()}" data-username="${v.username.toLowerCase()}" data-owner="${v.owner.toLowerCase()}">
          <td><strong>${v.name}</strong></td><td>${v.owner}</td><td><code style="background:var(--cream);padding:2px 8px;border-radius:4px;font-size:0.85rem">${v.username}</code></td>
          <td style="text-align:center">${v.totalOrders}</td><td style="font-weight:700">${formatPrice(v.revenue)}</td>
          <td>
            <span class="badge ${v.status === 'active' ? 'badge-ready' : 'badge-cancelled'}">${v.status === 'active' ? '✅ ใช้งาน' : '🚫 ระงับ'}</span>
            ${v.status === 'suspended' && v.suspendReason ? `<div style="font-size:0.78rem;color:var(--danger);margin-top:4px">เหตุ : ${v.suspendReason}</div>` : ''}
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-outline" onclick="openEditVendorModal(${v.id})" title="แก้ไขข้อมูล">✏️</button>
              <button class="btn btn-sm btn-outline" onclick="resetVendorPassword(${v.id})" title="Reset รหัสผ่าน">🔑</button>
              <button class="btn btn-sm ${v.status === 'active' ? 'btn-danger' : 'btn-success'}" onclick="toggleVendorStatus(${v.id})" title="${v.status === 'active' ? 'ระงับบัญชี' : 'เปิดใช้งาน'}">${v.status === 'active' ? '🚫' : '✅'}</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- ADD VENDOR MODAL -->
  <div id="add-vendor-modal" class="modal-overlay">
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h2 style="margin:0">🏪 เพิ่มร้านค้าใหม่</h2>
        <button class="modal-close" onclick="closeAddVendorModal()">&times;</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:16px;padding:24px">
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ชื่อร้านค้า <span style="color:var(--danger)">*</span></label>
          <input type="text" id="new-vendor-name" class="form-control" placeholder="เช่น ร้านอาหารตามสั่ง">
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ชื่อเจ้าของร้าน <span style="color:var(--danger)">*</span></label>
          <input type="text" id="new-vendor-owner" class="form-control" placeholder="เช่น คุณสมชาย">
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">Username (สำหรับเข้าสู่ระบบ) <span style="color:var(--danger)">*</span></label>
          <input type="text" id="new-vendor-username" class="form-control" placeholder="เช่น vendor6">
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ประเภทร้าน</label>
          <select id="new-vendor-category" class="form-control">
            <option value="อาหารตามสั่ง">อาหารตามสั่ง</option>
            <option value="ก๋วยเตี๋ยว">ก๋วยเตี๋ยว</option>
            <option value="อาหารอีสาน">อาหารอีสาน</option>
            <option value="อาหารจานเดียว">อาหารจานเดียว</option>
            <option value="เครื่องดื่ม">เครื่องดื่ม</option>
            <option value="ของหวาน">ของหวาน</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div style="display:flex;gap:12px;margin-top:8px">
          <button class="btn btn-primary btn-lg" style="flex:1" onclick="addVendor()">✅ เพิ่มร้านค้า</button>
          <button class="btn btn-outline btn-lg" style="flex:0.5" onclick="closeAddVendorModal()">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>

  <!-- EDIT VENDOR MODAL -->
  <div id="edit-vendor-modal" class="modal-overlay">
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h2 style="margin:0">✏️ แก้ไขข้อมูลร้านค้า</h2>
        <button class="modal-close" onclick="closeEditVendorModal()">&times;</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:16px;padding:24px">
        <input type="hidden" id="edit-vendor-id">
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ชื่อร้านค้า <span style="color:var(--danger)">*</span></label>
          <input type="text" id="edit-vendor-name" class="form-control">
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ชื่อเจ้าของร้าน <span style="color:var(--danger)">*</span></label>
          <input type="text" id="edit-vendor-owner" class="form-control">
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">Username</label>
          <input type="text" id="edit-vendor-username" class="form-control">
        </div>
        <div style="display:flex;gap:12px;margin-top:8px">
          <button class="btn btn-primary btn-lg" style="flex:1" onclick="saveEditVendor()">💾 บันทึกการแก้ไข</button>
          <button class="btn btn-outline btn-lg" style="flex:0.5" onclick="closeEditVendorModal()">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SUSPEND VENDOR MODAL (UC-16) -->
  <div id="suspend-vendor-modal" class="modal-overlay">
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h2 style="margin:0;color:var(--danger);display:flex;align-items:center;gap:8px"><span style="font-size:1.4rem">⚠️</span> ยืนยันการระงับบัญชีร้านค้า</h2>
        <button class="modal-close" onclick="closeSuspendVendorModal()">&times;</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:16px;padding:24px">
        <div id="suspend-vendor-info" style="background:var(--cream);padding:14px 18px;border-radius:10px;border-left:4px solid var(--danger)">
          <!-- Vendor info injected dynamically -->
        </div>
        <div style="background:#FFF3F3;padding:10px 14px;border-radius:8px;color:var(--danger);font-size:0.88rem;font-weight:600">
          <span style="margin-right:4px">*</span> ร้านค้าจะถูกบังคับให้ออกจากระบบ (Log out) ทันที
        </div>
        <div class="form-group">
          <label style="font-weight:700;margin-bottom:6px;display:block">ระบุเหตุผลการระงับบัญชี <span style="color:var(--danger)">*</span></label>
          <textarea id="suspend-vendor-reason" class="form-control" rows="4" placeholder="เช่น ละเมิดกฎเรื่องสุขอนามัย , ทำผิดข้อตกลงมหาวิทยาลัย..."></textarea>
        </div>
        <input type="hidden" id="suspend-vendor-id">
        <div style="display:flex;gap:12px;margin-top:4px;justify-content:flex-end">
          <button class="btn btn-outline" onclick="closeSuspendVendorModal()">ยกเลิก</button>
          <button class="btn btn-danger btn-lg" onclick="confirmSuspendVendor()" style="display:flex;align-items:center;gap:6px">🚫 ยืนยันการระงับ</button>
        </div>
      </div>
    </div>
  </div>`;
}

// --- Vendor Modal Functions ---
function openAddVendorModal() {
  document.getElementById('add-vendor-modal').classList.add('active');
  document.getElementById('new-vendor-name').value = '';
  document.getElementById('new-vendor-owner').value = '';
  document.getElementById('new-vendor-username').value = '';
  document.getElementById('new-vendor-category').value = 'อาหารตามสั่ง';
  setTimeout(() => document.getElementById('new-vendor-name').focus(), 200);
}
function closeAddVendorModal() {
  document.getElementById('add-vendor-modal').classList.remove('active');
}

function addVendor() {
  const name = document.getElementById('new-vendor-name').value.trim();
  const owner = document.getElementById('new-vendor-owner').value.trim();
  const username = document.getElementById('new-vendor-username').value.trim();
  const category = document.getElementById('new-vendor-category').value;

  if (!name || !owner || !username) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  // Check for duplicate username
  if (VENDORS.some(v => v.username.toLowerCase() === username.toLowerCase())) {
    showToast('Username นี้ถูกใช้แล้ว กรุณาเลือก Username อื่น', 'error');
    return;
  }

  const newId = VENDORS.length > 0 ? Math.max(...VENDORS.map(v => v.id)) + 1 : 1;
  const newVendor = {
    id: newId,
    name: name,
    owner: owner,
    username: username,
    status: 'active',
    totalOrders: 0,
    revenue: 0
  };

  // Also add a corresponding shop
  const newShopId = SHOPS.length > 0 ? Math.max(...SHOPS.map(s => s.id)) + 1 : 1;
  SHOPS.push({
    id: newShopId,
    name: name,
    category: category,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    open: true
  });

  VENDORS.push(newVendor);
  saveState();
  closeAddVendorModal();
  showToast(`เพิ่มร้านค้า "${name}" เรียบร้อยแล้ว! 🎉`, 'success');
  render();
}

function openEditVendorModal(vendorId) {
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;
  document.getElementById('edit-vendor-id').value = vendorId;
  document.getElementById('edit-vendor-name').value = vendor.name;
  document.getElementById('edit-vendor-owner').value = vendor.owner;
  document.getElementById('edit-vendor-username').value = vendor.username;
  document.getElementById('edit-vendor-modal').classList.add('active');
  setTimeout(() => document.getElementById('edit-vendor-name').focus(), 200);
}
function closeEditVendorModal() {
  document.getElementById('edit-vendor-modal').classList.remove('active');
}

function saveEditVendor() {
  const id = parseInt(document.getElementById('edit-vendor-id').value);
  const name = document.getElementById('edit-vendor-name').value.trim();
  const owner = document.getElementById('edit-vendor-owner').value.trim();
  const username = document.getElementById('edit-vendor-username').value.trim();

  if (!name || !owner || !username) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  // Check for duplicate username (excluding current vendor)
  if (VENDORS.some(v => v.id !== id && v.username.toLowerCase() === username.toLowerCase())) {
    showToast('Username นี้ถูกใช้แล้ว กรุณาเลือก Username อื่น', 'error');
    return;
  }

  const vendor = VENDORS.find(v => v.id === id);
  if (!vendor) return;

  vendor.name = name;
  vendor.owner = owner;
  vendor.username = username;

  saveState();
  closeEditVendorModal();
  showToast(`แก้ไขข้อมูลร้าน "${name}" เรียบร้อยแล้ว! ✅`, 'success');
  render();
}

function toggleVendorStatus(vendorId) {
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;

  if (vendor.status === 'active') {
    // Open suspend modal (UC-16)
    openSuspendVendorModal(vendorId);
  } else {
    // Re-activate directly
    vendor.status = 'active';
    vendor.suspendReason = '';
    saveState();
    showToast(`เปิดใช้งานบัญชีร้าน "${vendor.name}" เรียบร้อยแล้ว ✅`, 'success');
    render();
  }
}

function openSuspendVendorModal(vendorId) {
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;
  document.getElementById('suspend-vendor-id').value = vendorId;
  document.getElementById('suspend-vendor-reason').value = '';
  document.getElementById('suspend-vendor-info').innerHTML = `
    <div style="font-size:0.95rem;color:#333">
      คุณกำลังจะระงับการใช้งานของร้าน <strong style="color:var(--primary-dark)">${vendor.name}</strong><br>
      <span style="font-size:0.88rem;color:var(--gray)">(เจ้าของ: ${vendor.owner})</span>
    </div>`;
  document.getElementById('suspend-vendor-modal').classList.add('active');
  setTimeout(() => document.getElementById('suspend-vendor-reason').focus(), 200);
}

function closeSuspendVendorModal() {
  document.getElementById('suspend-vendor-modal').classList.remove('active');
}

function confirmSuspendVendor() {
  const vendorId = parseInt(document.getElementById('suspend-vendor-id').value);
  const reason = document.getElementById('suspend-vendor-reason').value.trim();

  if (!reason) {
    showToast('กรุณาระบุเหตุผลในการระงับบัญชี', 'error');
    document.getElementById('suspend-vendor-reason').focus();
    return;
  }

  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;

  vendor.status = 'suspended';
  vendor.suspendReason = reason;
  vendor.suspendDate = new Date().toISOString().split('T')[0];

  saveState();
  closeSuspendVendorModal();
  showToast(`ระงับบัญชีร้าน "${vendor.name}" เรียบร้อยแล้ว 🚫`, 'success');
  render();
}

function resetVendorPassword(vendorId) {
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;

  if (!confirm(`🔑 ต้องการ Reset รหัสผ่านร้าน "${vendor.name}" ใช่หรือไม่?\n\nรหัสผ่านใหม่จะถูกตั้งเป็น: 1234`)) {
    return;
  }

  showToast(`Reset รหัสผ่านร้าน "${vendor.name}" เรียบร้อย! รหัสผ่านใหม่: 1234 🔑`, 'success');
}

// ===== ADMIN: ORDER HISTORY =====
function adminHistoryPage() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return `
  <div class="page-header"><h1>📋 ประวัติคำสั่งซื้อ</h1>
    <button class="btn btn-primary" onclick="openExportModal()">📥 Export Data</button>
  </div>

  <!-- FILTER BAR -->
  <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:flex-end">
    <div class="form-group" style="margin:0">
      <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px">📅 จากวันที่</label>
      <input type="date" id="history-start-date" class="form-control" style="width:auto" value="${monthAgo}">
    </div>
    <div class="form-group" style="margin:0">
      <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px">📅 ถึงวันที่</label>
      <input type="date" id="history-end-date" class="form-control" style="width:auto" value="${today}">
    </div>
    <div class="form-group" style="margin:0">
      <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px">📌 สถานะ</label>
      <select id="history-status-filter" class="form-control" style="width:auto;min-width:140px">
        <option value="all">ทั้งหมด</option>
        <option value="pending">⏳ รอรับออเดอร์</option>
        <option value="cooking">🍳 กำลังปรุง</option>
        <option value="ready">✅ พร้อมเสิร์ฟ</option>
        <option value="completed">🎉 รับอาหารแล้ว</option>
        <option value="cancelled">❌ ยกเลิก</option>
      </select>
    </div>
    <div class="form-group" style="margin:0">
      <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px">🔍 ค้นหา</label>
      <input type="text" id="history-search" class="form-control" style="width:auto;min-width:180px" placeholder="ออเดอร์, ลูกค้า, ร้าน...">
    </div>
    <button class="btn btn-primary btn-sm" onclick="filterAdminHistory()" style="height:42px;padding:0 20px">🔍 กรอง</button>
    <button class="btn btn-outline btn-sm" onclick="resetHistoryFilter()" style="height:42px;padding:0 16px">↩️ รีเซ็ต</button>
  </div>

  <!-- RESULT SUMMARY -->
  <div id="history-result-summary" style="margin-bottom:12px;font-size:0.9rem;color:var(--gray)">
    แสดง ${App.orders.length} รายการ
  </div>

  <div class="table-wrapper">
    <table id="history-table">
      <thead><tr>
        <th style="color:#fff">ออเดอร์</th>
        <th style="color:#fff">ลูกค้า</th>
        <th style="color:#fff">ร้าน</th>
        <th style="color:#fff">รายการ</th>
        <th style="color:#fff">ยอด</th>
        <th style="color:#fff">สถานะ</th>
        <th style="color:#fff">วันที่</th>
      </tr></thead>
      <tbody>
        ${App.orders.map(o => `<tr class="history-row" data-date="${o.orderDate}" data-status="${o.status}" data-search="${o.id.toLowerCase()} ${o.customerName.toLowerCase()} ${o.shopName.toLowerCase()} ${o.items.map(i => i.name).join(' ').toLowerCase()}">
          <td><strong>${o.id}</strong></td><td>${o.customerName}</td><td>${o.shopName}</td>
          <td style="max-width:200px">${o.items.map(i => i.name).join(', ')}</td>
          <td style="font-weight:700">${formatPrice(o.total)}</td>
          <td><span class="badge ${STATUS_MAP[o.status].badge}">${STATUS_MAP[o.status].icon} ${STATUS_MAP[o.status].label}</span></td>
          <td style="font-size:0.85rem">${o.orderDate}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- EXPORT CSV MODAL -->
  <div id="export-csv-modal" class="modal-overlay">
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h2 style="margin:0;display:flex;align-items:center;gap:8px"><span style="font-size:1.4rem">📥</span> ดาวน์โหลดข้อมูลคำสั่งซื้อ</h2>
        <button class="modal-close" onclick="closeExportModal()">&times;</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:18px;padding:24px">
        <div style="background:var(--cream);padding:14px 18px;border-radius:10px;border-left:4px solid var(--primary)">
          <div style="font-size:0.92rem;color:#333">เลือกช่วงวันที่และสถานะที่ต้องการ Export เป็นไฟล์ <strong>CSV</strong></div>
          <div style="font-size:0.82rem;color:var(--gray);margin-top:4px">ไฟล์ที่ได้สามารถเปิดด้วย Excel ได้ทันที (รองรับภาษาไทย)</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-group" style="margin:0">
            <label style="font-weight:700;margin-bottom:6px;display:block">📅 จากวันที่ <span style="color:var(--danger)">*</span></label>
            <input type="date" id="export-start-date" class="form-control">
          </div>
          <div class="form-group" style="margin:0">
            <label style="font-weight:700;margin-bottom:6px;display:block">📅 ถึงวันที่ <span style="color:var(--danger)">*</span></label>
            <input type="date" id="export-end-date" class="form-control">
          </div>
        </div>
        <div class="form-group" style="margin:0">
          <label style="font-weight:700;margin-bottom:6px;display:block">📌 สถานะ</label>
          <select id="export-status-filter" class="form-control" onchange="updateExportPreview()">
            <option value="all">ทั้งหมด</option>
            <option value="pending">⏳ รอรับออเดอร์</option>
            <option value="cooking">🍳 กำลังปรุง</option>
            <option value="ready">✅ พร้อมเสิร์ฟ</option>
            <option value="completed">🎉 รับอาหารแล้ว</option>
            <option value="cancelled">❌ ยกเลิก</option>
          </select>
        </div>
        <div id="export-preview" style="background:#F0FFF4;padding:14px 18px;border-radius:10px;border:1px solid #C6F6D5;display:flex;align-items:center;gap:12px">
          <span style="font-size:1.6rem">📊</span>
          <div>
            <div style="font-weight:700;color:var(--primary-dark)">กดปุ่ม "ค้นหาและแสดงตัวอย่าง" ก่อน</div>
            <div style="font-size:0.82rem;color:var(--gray)">เพื่อดูจำนวนข้อมูลก่อนดาวน์โหลด</div>
          </div>
        </div>
        <button class="btn btn-outline" onclick="updateExportPreview()" style="width:100%">🔍 ค้นหาและแสดงตัวอย่าง</button>
        <div style="display:flex;gap:12px">
          <button class="btn btn-primary btn-lg" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px" onclick="confirmExportCSV()">
            <span style="font-size:1.1rem">📥</span> ดาวน์โหลด CSV
          </button>
          <button class="btn btn-outline btn-lg" style="flex:0.4" onclick="closeExportModal()">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>`;
}

// --- History Filter & Export Functions ---
function filterAdminHistory() {
  const startDateStr = document.getElementById('history-start-date').value;
  const endDateStr = document.getElementById('history-end-date').value;
  const statusFilter = document.getElementById('history-status-filter').value;
  const searchQuery = document.getElementById('history-search').value.toLowerCase().trim();

  if (!startDateStr || !endDateStr) {
    showToast('กรุณาเลือกวันที่ให้ครบถ้วน', 'error');
    return;
  }

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  if (startDate > endDate) {
    showToast('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด', 'error');
    return;
  }

  const rows = document.querySelectorAll('.history-row');
  let count = 0;
  let totalRevenue = 0;

  rows.forEach(row => {
    const rowDate = new Date(row.dataset.date);
    const rowStatus = row.dataset.status;
    const rowSearch = row.dataset.search;

    let show = true;

    // Date filter
    if (rowDate < startDate || rowDate > endDate) show = false;

    // Status filter
    if (statusFilter !== 'all' && rowStatus !== statusFilter) show = false;

    // Text search filter
    if (searchQuery && !rowSearch.includes(searchQuery)) show = false;

    if (show) {
      row.style.display = '';
      count++;
      // Sum revenue from visible rows
      const order = App.orders.find(o => o.id === row.querySelector('td strong').textContent);
      if (order && order.status !== 'cancelled') totalRevenue += order.total;
    } else {
      row.style.display = 'none';
    }
  });

  const summary = document.getElementById('history-result-summary');
  if (summary) {
    summary.innerHTML = `พบ <strong style="color:var(--primary)">${count}</strong> รายการ · รายได้รวม <strong style="color:var(--success)">${formatPrice(totalRevenue)}</strong>`;
  }

  showToast(`กรองข้อมูลเสร็จสิ้น พบ ${count} รายการ`, 'success');
}

function resetHistoryFilter() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  document.getElementById('history-start-date').value = monthAgo;
  document.getElementById('history-end-date').value = today;
  document.getElementById('history-status-filter').value = 'all';
  document.getElementById('history-search').value = '';

  const rows = document.querySelectorAll('.history-row');
  rows.forEach(row => row.style.display = '');

  const summary = document.getElementById('history-result-summary');
  if (summary) summary.innerHTML = `แสดง ${rows.length} รายการ`;

  showToast('รีเซ็ตตัวกรองเรียบร้อย', 'success');
}

// --- Export Modal Functions ---
function openExportModal() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('export-start-date').value = monthAgo;
  document.getElementById('export-end-date').value = today;
  document.getElementById('export-status-filter').value = 'all';
  document.getElementById('export-preview').innerHTML = `
    <span style="font-size:1.6rem">📊</span>
    <div>
      <div style="font-weight:700;color:var(--primary-dark)">กดปุ่ม "ค้นหาและแสดงตัวอย่าง" ก่อน</div>
      <div style="font-size:0.82rem;color:var(--gray)">เพื่อดูจำนวนข้อมูลก่อนดาวน์โหลด</div>
    </div>`;
  document.getElementById('export-csv-modal').classList.add('active');
}

function closeExportModal() {
  document.getElementById('export-csv-modal').classList.remove('active');
}

function getExportFilteredOrders() {
  const startDateStr = document.getElementById('export-start-date').value;
  const endDateStr = document.getElementById('export-end-date').value;
  const statusFilter = document.getElementById('export-status-filter').value;

  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  if (startDate > endDate) return null;

  return App.orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    if (orderDate < startDate || orderDate > endDate) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });
}

function updateExportPreview() {
  const startDateStr = document.getElementById('export-start-date').value;
  const endDateStr = document.getElementById('export-end-date').value;

  if (!startDateStr || !endDateStr) {
    showToast('กรุณาเลือกวันที่ให้ครบถ้วน', 'error');
    return;
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (startDate > endDate) {
    showToast('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด', 'error');
    return;
  }

  const orders = getExportFilteredOrders();
  if (!orders) return;

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  const preview = document.getElementById('export-preview');
  if (orders.length === 0) {
    preview.innerHTML = `
      <span style="font-size:1.6rem">😕</span>
      <div>
        <div style="font-weight:700;color:var(--danger)">ไม่พบข้อมูลในช่วงเวลาที่เลือก</div>
        <div style="font-size:0.82rem;color:var(--gray)">ลองเปลี่ยนช่วงวันที่หรือสถานะดู</div>
      </div>`;
    preview.style.background = '#FFF5F5';
    preview.style.borderColor = '#FED7D7';
  } else {
    preview.innerHTML = `
      <span style="font-size:1.6rem">✅</span>
      <div style="flex:1">
        <div style="font-weight:700;color:var(--primary-dark)">พบ ${orders.length} รายการ พร้อมดาวน์โหลด</div>
        <div style="font-size:0.82rem;color:var(--gray);margin-top:4px;display:flex;gap:12px;flex-wrap:wrap">
          <span>💰 รายได้: <strong style="color:var(--success)">${formatPrice(revenue)}</strong></span>
          <span>✅ สำเร็จ: ${completedCount}</span>
          <span>❌ ยกเลิก: ${cancelledCount}</span>
        </div>
      </div>`;
    preview.style.background = '#F0FFF4';
    preview.style.borderColor = '#C6F6D5';
  }
}

function confirmExportCSV() {
  const orders = getExportFilteredOrders();

  if (!orders || orders.length === 0) {
    showToast('ไม่มีข้อมูลที่จะ Export กรุณาค้นหาก่อน', 'error');
    return;
  }

  // Build CSV content with BOM for Thai character support
  const BOM = '\uFEFF';
  const headers = ['ออเดอร์', 'ลูกค้า', 'ร้านค้า', 'รายการอาหาร', 'จำนวน(ชิ้น)', 'ยอดรวม(บาท)', 'สถานะ', 'เวลารับ', 'วันที่สั่ง'];
  const csvRows = [headers.join(',')];

  orders.forEach(o => {
    const items = o.items.map(i => `${i.name} x${i.qty}`).join(' / ');
    const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
    const statusLabel = STATUS_MAP[o.status] ? STATUS_MAP[o.status].label : o.status;
    const row = [
      o.id,
      `"${o.customerName}"`,
      `"${o.shopName}"`,
      `"${items}"`,
      totalQty,
      o.total,
      `"${statusLabel}"`,
      o.pickupTime,
      o.orderDate
    ];
    csvRows.push(row.join(','));
  });

  // Add summary row
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  csvRows.push('');
  csvRows.push(`"รวมทั้งสิ้น","${orders.length} รายการ","","","","${totalRevenue}","","",""`);

  const csvContent = BOM + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const filename = `canteen_orders_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  closeExportModal();
  showToast(`Export สำเร็จ! ${orders.length} รายการ → ${filename} 📥`, 'success');
}

// ===== ADMIN: ANNOUNCEMENTS =====
function adminAnnouncePage() {
  const targetLabels = { all: 'ทั้งหมด', customer: 'นิสิต', vendor: 'ร้านค้า' };
  const targetBadgeColors = { all: '#6366F1', customer: '#10B981', vendor: '#F59E0B' };

  return `
  <div class="page-header"><h1>📢 จัดการประกาศระบบ (System Announcements)</h1></div>

  <div style="display:flex;flex-direction:column;gap:24px;align-items:stretch">
    <!-- LEFT: CREATE FORM -->
    <div class="card"><div class="card-body" style="padding:28px">
      <h3 style="margin-bottom:20px;display:flex;align-items:center;gap:8px">📝 สร้างประกาศใหม่</h3>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="form-group" style="margin:0">
            <label style="font-weight:700;margin-bottom:6px;display:block">หัวข้อประกาศ <span style="color:var(--danger)">*</span></label>
            <input type="text" id="announce-title" class="form-control" placeholder="เช่น แจ้งปิดปรับปรุงชั่วคราว...">
          </div>
          <div class="form-group" style="margin:0">
            <label style="font-weight:700;margin-bottom:6px;display:block">รายละเอียด <span style="color:var(--danger)">*</span></label>
            <textarea id="announce-message" class="form-control" rows="4" placeholder="พิมพ์เนื้อหาที่ต้องการประกาศ..."></textarea>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <label style="font-weight:700;margin-bottom:2px;display:block">กลุ่มเป้าหมาย (Target)</label>
          <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--cream);border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all 0.2s" onclick="this.querySelector('input').checked=true">
            <input type="radio" name="announce-target" value="all" checked style="accent-color:var(--primary);width:18px;height:18px">
            <span>ทั้งหมด <span style="color:var(--gray);font-size:0.85rem">(All Users)</span></span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--cream);border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all 0.2s" onclick="this.querySelector('input').checked=true">
            <input type="radio" name="announce-target" value="customer" style="accent-color:var(--primary);width:18px;height:18px">
            <span>เฉพาะนิสิต <span style="color:var(--gray);font-size:0.85rem">(Customer)</span></span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--cream);border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all 0.2s" onclick="this.querySelector('input').checked=true">
            <input type="radio" name="announce-target" value="vendor" style="accent-color:var(--primary);width:18px;height:18px">
            <span>เฉพาะร้านค้า <span style="color:var(--gray);font-size:0.85rem">(Vendor)</span></span>
          </label>
          <button class="btn btn-primary btn-lg" style="margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px" onclick="createAnnouncementFromForm()">
            📢 เผยแพร่ประกาศ
          </button>
        </div>
      </div>
    </div></div>

    <!-- RIGHT: ANNOUNCEMENT HISTORY TABLE -->
    <div class="card"><div class="card-body" style="padding:28px">
      <h3 style="margin-bottom:20px">📋 ประวัติการประกาศล่าสุด</h3>
      ${ANNOUNCEMENTS.length === 0 ? `
        <div class="empty-state" style="padding:40px 0"><div class="empty-icon">📭</div><h3>ยังไม่มีประกาศ</h3><p>สร้างประกาศใหม่ได้ที่ด้านซ้าย</p></div>
      ` : `
      <div class="table-wrapper" style="overflow-x:auto">
        <table style="min-width:100%">
          <thead><tr>
            <th style="color:#fff;white-space:nowrap">วันที่สร้าง</th>
            <th style="color:#fff">หัวข้อประกาศ</th>
            <th style="color:#fff;white-space:nowrap">กลุ่มเป้าหมาย</th>
            <th style="color:#fff">สถานะ</th>
            <th style="color:#fff">จัดการ</th>
          </tr></thead>
          <tbody>
            ${ANNOUNCEMENTS.map(a => {
              const isExpired = new Date(a.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const statusLabel = a.active ? (isExpired ? 'Expired' : 'Active') : 'Inactive';
              const statusColor = a.active ? (isExpired ? 'var(--gray)' : 'var(--success)') : 'var(--danger)';
              return `<tr>
              <td style="font-size:0.85rem;white-space:nowrap">${a.date}</td>
              <td>
                <div style="font-weight:700;font-size:0.9rem">${a.title}</div>
                <div style="font-size:0.78rem;color:var(--gray);margin-top:2px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.message}</div>
              </td>
              <td><span style="background:${targetBadgeColors[a.target] || '#6366F1'};color:#fff;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;white-space:nowrap">${targetLabels[a.target] || a.target}</span></td>
              <td><span style="color:${statusColor};font-weight:700;font-size:0.85rem">${statusLabel}</span></td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteAnnouncement(${a.id})" title="ลบประกาศ" style="white-space:nowrap">🗑️ ลบ</button>
              </td>
            </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      `}
    </div></div>
  </div>`;
}

// --- Announcement Functions ---
async function createAnnouncementFromForm() {
  const title = document.getElementById('announce-title').value.trim();
  const message = document.getElementById('announce-message').value.trim();
  const targetRadio = document.querySelector('input[name="announce-target"]:checked');
  const target = targetRadio ? targetRadio.value : 'all';

  if (!title) {
    showToast('กรุณากรอกหัวข้อประกาศ', 'error');
    document.getElementById('announce-title').focus();
    return;
  }
  if (!message) {
    showToast('กรุณากรอกรายละเอียดประกาศ', 'error');
    document.getElementById('announce-message').focus();
    return;
  }

  try {
    // Save to backend DB
    await api.createAnnouncement({ title, content: message });
    // Reload announcements from DB so ID is correct
    const ann = await api.getAnnouncements();
    ANNOUNCEMENTS = (ann || []).map(a => ({
      id: a.id, title: a.title, message: a.content, target: 'all', date: a.createdAt, active: true
    }));
    document.getElementById('announce-title').value = '';
    document.getElementById('announce-message').value = '';
    showToast(`📢 เผยแพร่ประกาศ "${title}" เรียบร้อยแล้ว!`, 'success');
    render();
  } catch (err) {
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function confirmDeleteAnnouncement(id) {
  const announce = ANNOUNCEMENTS.find(a => a.id === id);
  if (!announce) return;
  if (!confirm(`🗑️ ต้องการลบประกาศ "${announce.title}" ใช่หรือไม่?`)) return;

  const index = ANNOUNCEMENTS.findIndex(a => a.id === id);
  if (index > -1) {
    ANNOUNCEMENTS.splice(index, 1);
    saveState();
    showToast('ลบประกาศเรียบร้อยแล้ว 🗑️', 'success');
    render();
  }
}

function toggleAnnounceActive(id) {
  const announce = ANNOUNCEMENTS.find(a => a.id === id);
  if (!announce) return;
  announce.active = !announce.active;
  saveState();
  showToast(`${announce.active ? '🔔 เปิด' : '🔕 ปิด'}การแสดงประกาศ "${announce.title}"`, 'success');
  render();
}
