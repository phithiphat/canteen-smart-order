const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SHOPS = [
  { id: 1, name: 'ร้านครัวคุณแม่', category: 'อาหารตามสั่ง', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', open: true, owner: 'คุณสมศรี', username: 'vendor1' },
  { id: 2, name: 'ร้านก๋วยเตี๋ยวลุงสมชาย', category: 'ก๋วยเตี๋ยว', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', open: true, owner: 'คุณสมชาย', username: 'vendor2' },
  { id: 3, name: 'ร้านส้มตำแม่พร', category: 'อาหารอีสาน', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop', open: true, owner: 'คุณแม่พร', username: 'vendor3' },
  { id: 4, name: 'ร้านข้าวมันไก่เฮียหลี', category: 'อาหารจานเดียว', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', open: false, owner: 'เฮียหลี', username: 'vendor4', suspended: true },
  { id: 5, name: 'ร้านเครื่องดื่ม Cool Cool', category: 'เครื่องดื่ม', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', open: true, owner: 'คุณณัฐ', username: 'vendor5' },
];

const MENUS = [
  { shopId: 1, name: 'ข้าวกะเพราหมูสับ', price: 45, image: 'img/ข้าวกะเพราหมูสับ.jpg', available: true },
  { shopId: 1, name: 'ข้าวผัดหมู', price: 40, image: 'img/ข้าวผัดหมู.jpg', available: true },
  { shopId: 1, name: 'ข้าวไข่เจียว', price: 35, image: 'img/ข้าวไข่เจียว.jpg', available: true },
  { shopId: 1, name: 'ข้าวคะน้าหมูกรอบ', price: 50, image: 'img/ข้าวคะน้าหมูกรอบ.jpg', available: false },
  { shopId: 2, name: 'ก๋วยเตี๋ยวเรือ', price: 40, image: 'img/ก๋วยเตี๋ยวเรือ.jpg', available: true },
  { shopId: 2, name: 'ก๋วยเตี๋ยวต้มยำ', price: 45, image: 'img/ก๋วยเตี๋ยวต้มยำ.jpg', available: true },
  { shopId: 2, name: 'บะหมี่แห้ง', price: 40, image: 'img/บะหมี่แห้ง.jpg', available: true },
  { shopId: 3, name: 'ส้มตำไทย', price: 35, image: 'img/ส้มตำไทย.jpeg', available: true },
  { shopId: 3, name: 'ส้มตำปูปลาร้า', price: 45, image: 'img/ส้มตำปูปลาร้า.avif', available: true },
  { shopId: 3, name: 'ไก่ย่าง', price: 60, image: 'img/ไก่ย่าง.jpg', available: true },
  { shopId: 4, name: 'ข้าวมันไก่ต้ม', price: 45, image: 'img/ข้าวมันไก่ต้ม.jpg', available: true },
  { shopId: 4, name: 'ข้าวมันไก่ทอด', price: 50, image: 'img/ข้าวมันไก่ทอด.jpg', available: true },
  { shopId: 5, name: 'ชาเย็น', price: 25, image: 'img/ชาเย็น.jpg', available: true },
  { shopId: 5, name: 'กาแฟเย็น', price: 30, image: 'img/กาแฟเย็น.avif', available: true },
  { shopId: 5, name: 'น้ำส้มคั้น', price: 35, image: 'img/น้ำส้มคั้น.jpg', available: true },
];

async function main() {
  console.log('Seeding database...');
  
  // 1. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@bu.ac.th' },
    update: {},
    create: {
      email: 'admin@bu.ac.th',
      name: 'ผู้ดูแลระบบ',
      password: 'adminpass',
      role: 'ADMIN'
    }
  });

  // 2. Create Vendors
  for (const shop of SHOPS) {
    const email = `${shop.username}@bu.ac.th`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        vendorProfile: {
          update: {
            isSuspended: shop.suspended ? true : false,
            isOpen: shop.open
          }
        }
      },
      create: {
        email,
        name: shop.owner,
        password: 'password',
        role: 'VENDOR',
        vendorProfile: {
          create: {
            storeName: shop.name,
            description: shop.category,
            isOpen: shop.open,
            isSuspended: shop.suspended ? true : false
          }
        }
      },
      include: { vendorProfile: true }
    });

    const vendorId = user.vendorProfile.id;

    // 3. Create Menus for Vendor
    const shopMenus = MENUS.filter(m => m.shopId === shop.id);
    for (const menu of shopMenus) {
      // Check if menu exists to avoid duplicates
      const existingMenu = await prisma.menu.findFirst({
        where: { vendorId, name: menu.name }
      });
      if (!existingMenu) {
        await prisma.menu.create({
          data: {
            vendorId,
            name: menu.name,
            price: menu.price,
            imageUrl: menu.image,
            isAvailable: menu.available
          }
        });
      }
    }
  }

  // 4. Create Announcements
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
      await prisma.announcement.createMany({
        data: [
          { title: 'ปิดปรับปรุงระบบ', content: 'ระบบจะปิดปรับปรุงวันที่ 25 เม.ย. 2569 เวลา 22:00-06:00' },
          { title: 'โปรโมชั่นพิเศษ!', content: 'สั่งอาหารครบ 100 บาท รับส่วนลด 10% ตลอดสัปดาห์นี้' }
        ]
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
