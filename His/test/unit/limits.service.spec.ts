import { LimitsService } from '../../src/limits/limits.service';
import { ForbiddenException } from '@nestjs/common';

describe('LimitsService', () => {
    let service: LimitsService;
    let mockLimitsModel: any;
    let mockUsageModel: any;
    let mockAuditService: any;
    let mockMonitoring: any;

    beforeEach(() => {
        mockLimitsModel = {
            findOne: jest.fn(),
        };

        mockUsageModel = {
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
        };

        mockAuditService = {
            emit: jest.fn(),
        };

        mockMonitoring = {
            recordLimitViolation: jest.fn(),
            recordResourceUsage: jest.fn(),
        };

        service = new LimitsService(
            { model: jest.fn() } as any,
            mockAuditService,
            mockMonitoring,
        );

        (service as any).limitsModel = mockLimitsModel;
        (service as any).usageModel = mockUsageModel;
    });

    describe('checkQueriesLimit', () => {

        it('пропускает запрос если нет лимита для тенанта', async () => {
            mockLimitsModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            await expect(
                service.checkQueriesLimit('tenant_123')
            ).resolves.not.toThrow();
        });

        it('бросает 403 если лимит реально превышен', async () => {
            mockLimitsModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ monthlyQueries: 10 })
            });

            mockUsageModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });

            mockUsageModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ queriesCount: 10 })
            });

            await expect(
                service.checkQueriesLimit('tenant_123')
            ).rejects.toThrow(ForbiddenException);
        });

    });
});
