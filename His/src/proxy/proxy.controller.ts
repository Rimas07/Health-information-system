/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Req, Res, Body, UseGuards, SetMetadata } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantAuthenticationGuard } from 'src/guards/tenant-auth.guard';
import logger from 'src/config/logger'

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Proxy')
@ApiBearerAuth('bearer')
@UseGuards(TenantAuthenticationGuard)
@Controller('proxy')
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) { }

    /**
     * Health check
     */
    @Public()
    @Get('health')
    @ApiOperation({
        summary: 'Proxy health check',
        description: 'Checking the Status of the  Proxy'
    })
    @ApiResponse({
        status: 200,
        description: 'The proxy is working fine.'
    })
    health() {
        return this.proxyService.health();
    }

    @Post('mongo/*path')
    @ApiOperation({
        summary: 'HTTP Proxy to MongoDB (POST)',
        description: 'Настоящий HTTP Proxy который перехватывает и пересылает запросы в MongoDB'
    })
    async proxyToMongoDB(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            logger.info({ action: 'proxyToMongoDB', method: req.method, path: req.path })


            
            await this.proxyService.handleProxyRequest(req, res);

        } catch (error) {
            logger.error({ action: 'proxyToMongoDB', error: (error as Error).message })
            res.status(500).json({
                success: false,
                error: 'Proxy controller error',
                message: (error as Error).message
            });
        }
    }

    @Get('mongo/*path')
    @ApiOperation({
        summary: 'HTTP Proxy to MongoDB (GET)',
        description: 'GET запросы к MongoDB через прокси. Для операций чтения используйте этот метод.'
    })
    async proxyToMongoDBGet(@Req() req: Request, @Res() res: Response) {
        try {
            logger.info({ action: 'proxyToMongoDBGet', method: req.method, path: req.path })


           
            await this.proxyService.handleProxyRequest(req, res);

        } catch (error) {
            logger.error({ action: 'proxyToMongoDBGet', error: (error as Error).message })
            res.status(500).json({
                success: false,
                error: 'Proxy controller error',
                message: (error as Error).message
            });
        }
    }

    @Post('test')
    @ApiOperation({
        summary: 'Test Proxy validation',
        description: 'Test function for checking the operation of Data-Limiting Proxy'
    })
    @ApiResponse({
        status: 200,
        description: 'the test was successful'
    })
    async testProxy(@Req() req: Request) {
        try {
            logger.info({ action: 'testProxy', message: 'Proxy test started' })


            const result = await this.proxyService.processRequest(req);

            logger.info({ action: 'testProxy', message: 'Proxy test completed successfully' })


            return {
                success: true,
                message: 'Proxy validation passed!',
                result: result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.info({ action: 'testProxy', message: 'Proxy test failed' })


            return {
                success: false,
                error: (error as Error).message,
                details: (error as Error).stack,
                timestamp: new Date().toISOString()
            };
        }
    }

    @Post('start')
    @ApiOperation({
        summary: 'Start HTTP Proxy Server',
        description: 'Запускает отдельный HTTP Proxy сервер на порту 3001'
    })
    async startProxyServer() {
        try {
            this.proxyService.startProxyServer(3001);
            return {
                success: true,
                message: 'HTTP Proxy server started on port 3001',
                endpoints: {
                    health: 'http://localhost:3001/proxy/health',
                    mongo: 'http://localhost:3001/mongo/*path',
                    test: 'http://localhost:3001/proxy/test'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to start proxy server',
                message: (error as Error).message
            };
        }
    }
}





