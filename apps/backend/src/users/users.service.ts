import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 處理 LINE 登入 (如果不存在就建立，存在就更新資料)
  async lineLogin(profile: { lineId: string; displayName: string; pictureUrl?: string }) {
    const user = await this.prisma.user.upsert({
      where: { lineId: profile.lineId },
      update: {}, // 目前資料庫 User 表只有 lineId 和 phone，暫不更新其他欄位
      create: { 
        lineId: profile.lineId 
      }
    });
    // 將前端需要的名稱與頭像合併回傳，但不寫入目前沒有這些欄位的資料庫
    return { ...user, displayName: profile.displayName, pictureUrl: profile.pictureUrl };
  }

  // 取得特定會員的歷史訂單
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
