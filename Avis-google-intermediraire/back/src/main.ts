import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as nodeCrypto from 'crypto';

// Polyfill for @nestjs/schedule which uses crypto.randomUUID() without importing
// @nestjs/schedule v6.0.1 has a bug where it uses crypto without importing it
// In Node.js 18+, crypto is available but may not have randomUUID in some contexts
const globalCrypto = (globalThis as any).crypto || (global as any).crypto;

if (!globalCrypto || typeof globalCrypto.randomUUID !== 'function') {
  // Try to define it using Object.defineProperty (works if configurable)
  try {
    const cryptoPolyfill = {
      randomUUID: () => nodeCrypto.randomUUID(),
      getRandomValues: (arr: any) => {
        const bytes = nodeCrypto.randomBytes(arr.length);
        for (let i = 0; i < arr.length; i++) {
          arr[i] = bytes[i];
        }
        return arr;
      },
    };
    
    // Try to override using defineProperty
    Object.defineProperty(globalThis, 'crypto', {
      value: cryptoPolyfill,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (error) {
    // If that fails, try to add randomUUID to existing crypto object
    try {
      if (globalCrypto && typeof globalCrypto === 'object') {
        (globalCrypto as any).randomUUID = () => nodeCrypto.randomUUID();
      }
    } catch (e) {
      // Last resort: patch the module that needs it
      console.warn('Could not set crypto polyfill, @nestjs/schedule may fail');
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ,
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || '';
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
