import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { LimitsContextInterceptor } from './limits/limits.interceptor';
import { Logger, ValidationPipe, NotFoundException, Catch, ArgumentsHost } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(NotFoundException)
class SpaFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const isApi = /^\/(auth|tenants|patients|audit|limits|api|proxy|metrics|monitoring)/.test(req.url);
    if (isApi) {
      res.status(404).json(exception.getResponse());
    } else {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    }
  }
}
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MonitoringService } from './monitoring/monitoring.service';
import { MonitoringInterceptor } from './monitoring/monitoring.interceptor';
import { ProxyService } from './proxy/proxy.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); 
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const monitoringService = app.get(MonitoringService);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useGlobalFilters(new SpaFilter());
  app.useGlobalInterceptors(new MonitoringInterceptor(monitoringService));
  app.enableCors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-TENANT-ID'],
    credentials: true
  });
  const config = new DocumentBuilder()
    .setTitle('HIS - Hospital Information System')
    .setDescription('Multi-tenant hospital information management system API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();


  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document) // documetnation which can be accesed from http://localhost:3000/api#/ 
  app.useGlobalInterceptors(new LimitsContextInterceptor());
  app.useGlobalInterceptors(new MonitoringInterceptor(monitoringService));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  
  
  logger.log(`🚀 HTTP Proxy available via ProxyController`);
  logger.log(`📡 MongoDB Proxy: http://localhost:${configService.get<number>('server.port') || 3000}/proxy/mongo/*path`);


  const isLocalDevelopment = !process.env.RENDER || process.env.NODE_ENV === 'development';
  if (isLocalDevelopment) {
    try {
      const proxyService = app.get(ProxyService);
      proxyService.startProxyServer(3001);
      logger.log(`🚀 HTTP Proxy Server started on port 3001 for local development`);
      logger.log(`📡 Local MongoDB Proxy: http://localhost:3001/mongo/*path`);
    } catch (error) {
      logger.warn(`⚠️  Failed to start HTTP Proxy server on port 3001: ${error.message}`);
      logger.warn(`ℹ️  You can still use the proxy via ProxyController on port ${configService.get<number>('server.port') || 3000}`);
    }
  }

  const port = configService.get<number>('server.port') || 3000;
  await app.listen(port);
  
  logger.log(`🏥 HIS Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/api`);
  logger.log(`🗄️  Database: ${configService.get<string>('database.connectionString')}`);
  logger.log(`🐰 RabbitMQ: ${configService.get<string>('rabbitmq.url')} (audit logs)`);
}
bootstrap();
