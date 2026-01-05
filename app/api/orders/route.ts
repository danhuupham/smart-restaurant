import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, items, note } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // 1. Tính toán tổng tiền chính xác từ Database (Server-side validation)
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      // Lấy thông tin sản phẩm từ DB
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      let itemPrice = Number(product.price);
      let modifierRecords = [];

      // Tính tiền Modifiers (Topping/Size)
      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          const modOption = await prisma.modifierOption.findUnique({ where: { id: mod.modifierOptionId } });
          if (modOption) {
            itemPrice += Number(modOption.priceAdjustment);
            modifierRecords.push({
              modifierOptionId: modOption.id,
              priceAtOrder: modOption.priceAdjustment
            });
          }
        }
      }

      totalAmount += itemPrice * item.quantity;

      // Chuẩn bị dữ liệu để insert
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price, // Giá gốc tại thời điểm đặt
        totalPrice: itemPrice * item.quantity, // Giá tổng (gồm modifier)
        notes: item.notes || '',
        modifiers: {
          create: modifierRecords
        }
      });
    }

    // 2. Tạo Order Transaction (Tất cả hoặc không gì cả)
    const newOrder = await prisma.order.create({
      data: {
        tableId: tableId,
        totalAmount: totalAmount,
        status: 'PENDING', // Mặc định là chờ Waiter duyệt
        notes: note,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: {
            product: true,
            modifiers: {
              include: { modifierOption: true }
            }
          }
        },
        table: true
      }
    });

    return NextResponse.json(newOrder);

  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo đơn hàng' }, { status: 500 });
  }
}