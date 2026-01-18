// prisma/seed.ts

import { PrismaClient, UserRole, TableStatus, ProductStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Xóa dữ liệu cũ (để tránh trùng lặp khi chạy lại)
  await prisma.orderItemModifier.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productModifierGroup.deleteMany()
  await prisma.modifierOption.deleteMany()
  await prisma.modifierGroup.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.user.deleteMany()

  // 2. Tạo Users (Hash password)
  console.log('Creating users...')
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password@123', saltRounds);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@smart.restaurant',
        password: hashedPassword,
        name: 'Chủ Quán (Admin)',
        role: UserRole.ADMIN,
      },
      {
        email: 'waiter@smart.restaurant',
        password: hashedPassword,
        name: 'Nguyễn Văn A (Phục vụ)',
        role: UserRole.WAITER,
      },
      {
        email: 'kitchen@smart.restaurant',
        password: hashedPassword,
        name: 'Trần Văn B (Bếp)',
        role: UserRole.KITCHEN,
      },
    ],
  })

  // 3. Tạo Bàn
  console.log('Creating tables...')
  const tablesData = Array.from({ length: 10 }).map((_, i) => ({
    tableNumber: `T-${i + 1}`,
    capacity: 4,
    status: TableStatus.AVAILABLE,
    qrToken: `token-table-${i + 1}`, // Giả lập token
  }))
  await prisma.table.createMany({ data: tablesData })

  // 4. Tạo Danh mục (Categories)
  console.log('Creating categories...')
  const catAppetizer = await prisma.category.create({ data: { name: 'Khai Vị', displayOrder: 1 } })
  const catFood = await prisma.category.create({ data: { name: 'Món Chính', displayOrder: 2 } })
  const catDrink = await prisma.category.create({ data: { name: 'Đồ Uống', displayOrder: 3 } })
  const catDessert = await prisma.category.create({ data: { name: 'Tráng Miệng', displayOrder: 4 } })

  // 5. Tạo Modifiers (Topping/Size)
  console.log('Creating modifiers...')
  // Group: Size đồ uống
  const sizeGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Size',
      selectionType: 'SINGLE',
      isRequired: true,
      minSelections: 1,
      maxSelections: 1,
      options: {
        create: [
          { name: 'Size M', priceAdjustment: 0 },
          { name: 'Size L', priceAdjustment: 5000 },
        ],
      },
    },
  })

  // Group: Topping
  const toppingGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Topping',
      selectionType: 'MULTIPLE',
      isRequired: false,
      maxSelections: 5,
      options: {
        create: [
          { name: 'Trân châu đen', priceAdjustment: 5000 },
          { name: 'Thạch dừa', priceAdjustment: 5000 },
          { name: 'Pudding trứng', priceAdjustment: 10000 },
          { name: 'Kem cheese', priceAdjustment: 15000 },
        ],
      },
    },
  })

  // Group: Mức đá (Sugar/Ice)
  const iceGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Mức Đá',
      selectionType: 'SINGLE',
      isRequired: true,
      options: {
        create: [
          { name: '100% Đá', priceAdjustment: 0 },
          { name: '70% Đá', priceAdjustment: 0 },
          { name: '50% Đá', priceAdjustment: 0 },
          { name: '30% Đá', priceAdjustment: 0 },
          { name: 'Không Đá', priceAdjustment: 0 },
        ],
      },
    },
  })

  // 6. Tạo Sản phẩm (Products)
  console.log('Creating products...')

  // --- KHAI VỊ ---
  await prisma.product.create({
    data: {
      name: 'Nem Rán Hà Nội',
      description: 'Nem rán giòn rụm nhân thịt, mộc nhĩ, miến, cà rốt',
      price: 45000,
      categoryId: catAppetizer.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://icdn.one/upload/2020/11/13/20201113061759-f9295f1c.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Gỏi Cuốn Tôm Thịt',
      description: 'Gỏi cuốn tôm tươi, thịt ba chỉ, bún và rau sống, chấm mắm nêm',
      price: 35000,
      categoryId: catAppetizer.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://naucohungthinh.com/files/media/202109/5519_4.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Nộm Đu Đủ Bò Khô',
      description: 'Đu đủ xanh giòn, bò khô, lạc rang, rau thơm',
      price: 40000,
      categoryId: catAppetizer.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://i.ytimg.com/vi/ueSmw3tgXBI/maxresdefault.jpg', isPrimary: true } }
    }
  })

  // --- MÓN CHÍNH ---
  await prisma.product.create({
    data: {
      name: 'Phở Bò Đặc Biệt',
      description: 'Tô đặc biệt gồm tái, nạm, gầu, gân, bò viên thượng hạng',
      price: 75000,
      categoryId: catFood.id,
      status: ProductStatus.AVAILABLE,
      isChefRecommended: true,
      images: { create: { url: 'https://vietnamtravellife.vn/wp-content/uploads/2023/11/pho-bo.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Bún Chả Hà Nội',
      description: 'Chả viên và chả miếng nướng than hoa, ăn kèm bún và nem',
      price: 65000,
      categoryId: catFood.id,
      status: ProductStatus.AVAILABLE,
      isChefRecommended: true,
      images: { create: { url: 'https://sunhouse.com.vn/pic/news/images/image-20211229181528-1.jpeg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Cơm Rang Dưa Bò',
      description: 'Cơm rang vàng giòn với dưa chua và thịt bò thăn xào đậm đà',
      price: 55000,
      categoryId: catFood.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://barona.vn/storage/meo-vat/45/com-rang-dua-bo-thanh-pham.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Bún Bò Huế',
      description: 'Hương vị cố đó với chân giò, tiết, chả cua',
      price: 60000,
      categoryId: catFood.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://www.hungryhuy.com/wp-content/uploads/bun-bo-hue-bowl.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Bánh Mì Thập Cẩm',
      description: 'Pate, thịt xá xíu, chả lụa, dưa góp',
      price: 30000,
      categoryId: catFood.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://2sao.vietnamnetjsc.vn/images/2020/02/28/19/32/banhmi-1.jpg', isPrimary: true } }
    }
  })

  // --- ĐỒ UỐNG ---
  await prisma.product.create({
    data: {
      name: 'Cà Phê Sữa Đá',
      description: 'Cà phê Robusta Việt Nam pha phin với sữa đặc',
      price: 35000,
      categoryId: catDrink.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://giacaphe.com/wp-content/uploads/2023/03/ca-phe-sua-da-2.jpg', isPrimary: true } },
      modifierGroups: {
        create: [{ modifierGroupId: iceGroup.id, displayOrder: 1 }]
      }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Trà Sữa Trân Châu Đường Đen',
      description: 'Sữa tươi thanh trùng với đường đen Hàn Quốc và trân châu',
      price: 45000,
      categoryId: catDrink.id,
      status: ProductStatus.AVAILABLE,
      isChefRecommended: true,
      images: { create: { url: 'https://cdn.tgdd.vn/Files/2022/01/21/1412109/huong-dan-cach-lam-tra-sua-tran-chau-duong-den-202201211522033706.jpg', isPrimary: true } },
      modifierGroups: {
        create: [
          { modifierGroupId: sizeGroup.id, displayOrder: 1 },
          { modifierGroupId: toppingGroup.id, displayOrder: 2 },
          { modifierGroupId: iceGroup.id, displayOrder: 3 },
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Trà Đào Cam Sả',
      description: 'Trà đào mát lạnh với miếng đào giòn và hương sả thơm',
      price: 40000,
      categoryId: catDrink.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://cdn.tgdd.vn/2020/07/CookRecipe/GalleryStep/thanh-pham-273.jpg', isPrimary: true } },
      modifierGroups: {
        create: [
          { modifierGroupId: sizeGroup.id, displayOrder: 1 },
          { modifierGroupId: iceGroup.id, displayOrder: 2 },
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Nước Ép Dưa Hấu',
      description: 'Nước ép dưa hấu nguyên chất không đường',
      price: 40000,
      categoryId: catDrink.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://cookbeo.com/media/2020/12/nuoc-ep-dua-hau/coc-nuoc-ep-dua-hau.jpg', isPrimary: true } },
      modifierGroups: {
        create: [
          { modifierGroupId: iceGroup.id, displayOrder: 1 },
        ]
      }
    }
  })

  // --- TRÁNG MIỆNG ---
  await prisma.product.create({
    data: {
      name: 'Chè Khúc Bạch',
      description: 'Khúc bạch phô mai béo ngậy, hạnh nhân và nhãn lồng',
      price: 35000,
      categoryId: catDessert.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://bepbtn.vn/wp-content/uploads/2022/06/che-khuc-bach.jpg', isPrimary: true } }
    }
  })

  await prisma.product.create({
    data: {
      name: 'Bánh Flan',
      description: 'Bánh flan trứng sữa mềm mịn',
      price: 20000,
      categoryId: catDessert.id,
      status: ProductStatus.AVAILABLE,
      images: { create: { url: 'https://satrafoods.com.vn/uploads/Images/mon-ngon-moi-ngay/banh-flan.jpg', isPrimary: true } }
    }
  })

  console.log('✅ Seed data successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })