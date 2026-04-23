# 🍽️ Canteen Smart Order
ระบบสั่งอาหารโรงอาหารอัจฉริยะ — สั่งล่วงหน้า ไม่ต้องรอคิว

---

## 📦 โครงสร้างโปรเจกต์

```
project canteen/
├── backend/        ← Express.js API Server + Prisma ORM
│   ├── routes/     ← API Routes (auth, orders, vendors, menus, admin)
│   ├── prisma/     ← Database schema & migrations
│   ├── middlewares/
│   ├── index.js
│   ├── seed.js     ← เติมข้อมูลตัวอย่างลง DB
│   └── .env        ← Database URL & Secrets
└── frontend/       ← Static HTML/CSS/JS (เปิดด้วย Live Server)
    ├── index.html
    ├── css/
    └── js/
```

---

## 🚀 วิธีติดตั้งและรัน

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/phithiphat/canteen-smart-order.git
cd canteen-smart-order
```

---

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

---

### 3. ตั้งค่า Database (ไม่ต้องทำ ถ้า .env มีอยู่แล้ว)

ไฟล์ `backend/.env` มีอยู่แล้วในโปรเจกต์นี้ พร้อมใช้งานได้ทันที  
(เชื่อมต่อกับ Supabase Database ของกลุ่ม)

---

### 4. Sync Database Schema

```bash
npx prisma generate
```

---

### 5. (Optional) เติมข้อมูลตัวอย่าง

> ⚠️ รันแค่ครั้งแรกเท่านั้น ถ้า DB มีข้อมูลแล้วไม่ต้องรัน

```bash
node seed.js
```

---

### 6. รัน Backend Server

```bash
npm run dev
```

> Server จะรันที่ `http://localhost:3000`

---

### 7. เปิด Frontend

เปิดโฟลเดอร์ `frontend/` ด้วย **VS Code** แล้วใช้ **Live Server**:

1. ติดตั้ง Extension: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. คลิกขวาที่ `frontend/index.html` → **"Open with Live Server"**
3. Browser จะเปิดที่ `http://127.0.0.1:5500/frontend/`

---

## 👤 บัญชีสำหรับทดสอบ

| Role | Email | Password |
|------|-------|----------|
| 🎓 นิสิต (Customer) | `student1@bu.ac.th` | *(ใส่อะไรก็ได้)* |
| 🏪 ร้านส้มตำแม่พร | `vendor3@bu.ac.th` | `password` |
| 🏪 ร้านครัวคุณแม่ | `vendor1@bu.ac.th` | `password` |
| 🏪 ร้านก๋วยเตี๋ยวลุงสมชาย | `vendor2@bu.ac.th` | `password` |
| 🏪 ร้านเครื่องดื่ม Cool Cool | `vendor5@bu.ac.th` | `password` |
| 🔐 Admin | `admin@bu.ac.th` | `adminpass` |

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | JWT (JSON Web Token) |

---

## ⚠️ Requirements

- **Node.js** v18+ ([ดาวน์โหลด](https://nodejs.org))
- **VS Code** + Extension **Live Server**
- Internet connection (เพื่อเชื่อมต่อ Supabase)
