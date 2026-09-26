import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 【資安防護 1】Helmet - 自動設置多項 HTTP 標頭以防止 XSS、Clickjacking 等攻擊
  app.use(helmet());

  // 【資安防護 2】CORS 限制 - 拒絕未經授權的網域發起請求 (白名單機制)
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 【資安防護 3】全域驗證管線 - 自動剝離與阻擋惡意竄改的 Payload 欄位
  // 增加 JSON Payload 上限至 50MB (為了允許 Base64 圖片上傳)
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // 自動過濾掉 DTO 沒有定義的欄位
    forbidNonWhitelisted: true,   // 如果傳入未知欄位，直接拋出錯誤拒絕請求
    transform: true,              // 自動轉換型別 (例如 String 轉 Number)
  }));

  await app.listen(3000);
}
bootstrap();
