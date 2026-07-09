import { Inject, Injectable, UsePipes, ValidationPipe, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { LimitsService } from 'src/limits/limits.service';
import { Connection, Model } from 'mongoose';
import { Patient, PatientSchema } from './patient.schema';
import { CreatePatientDto, UpdatePatientDto } from './patient.dto';
import logger from 'src/config/logger'

@Injectable()
export class PatientsService {
    constructor(@Inject('TENANT_CONNECTION') private tenantConnection: Connection,
        private readonly limitsService: LimitsService,
    ) { }

    async getPatients(tenantId: string) {
        try {
            await this.limitsService.checkQueriesLimit(tenantId);
            const tenantConnection = this.tenantConnection.useDb(`tenant_${tenantId}`);
            const PatientModel = tenantConnection.model(Patient.name, PatientSchema);
            return await PatientModel.find();
        } catch (error) {
            logger.error({ action: 'getPatients', tenantId, error: (error as Error).message })


            throw new InternalServerErrorException(
                `Failed to fetch patients: ${(error as Error).message}`

            );
        }
    }

    async getPatientById(tenantId: string, patientId: string) {
        await this.limitsService.checkQueriesLimit(tenantId);
        const tenantConnection = this.tenantConnection.useDb(`tenant_${tenantId}`);
        const PatientModel = tenantConnection.model(Patient.name, PatientSchema);
        return PatientModel.findById(patientId);
    }

    async createPatient(tenantId: string, createPatientDto: CreatePatientDto, req?: Request) {
        const context = (req as any)?.limitsContext;
        const estimatedSizeKB = 1;

        try {
            await this.limitsService.checkDocumentsLimit(tenantId, 1, context);
            await this.limitsService.checkDataSizeLimit(tenantId, estimatedSizeKB, context);
        } catch (error) {
            logger.error({ action: 'createPatient', error: (error as Error).message })

            throw error;
        }
        const tenantDb = this.tenantConnection.useDb(`tenant_${tenantId}`);
        const PatientModel = tenantDb.model(Patient.name, PatientSchema);
       
        const newPatient = new PatientModel({ ...createPatientDto });
        const savedPatient = await newPatient.save();

        await this.limitsService.updateUsage(tenantId, 1, 1);
        return savedPatient;
    }
    async createBulkPatients(tenantId: string, patientsDto: CreatePatientDto[]) {
        await this.limitsService.checkDocumentsLimit(tenantId, patientsDto.length);

        const tenantDb = this.tenantConnection.useDb(`tenant_${tenantId}`);
        const PatientModel = tenantDb.model(Patient.name, PatientSchema);

        const createdPatients = await PatientModel.insertMany(patientsDto);


        await this.limitsService.updateUsage(tenantId, patientsDto.length, patientsDto.length);

        return createdPatients;
    }

    async updatePatient(tenantId: string, patientId: string, updatePatientDto: UpdatePatientDto, req?: Request) {
        const context = (req as any)?.limitsContext;

        const tenantConnection = this.tenantConnection.useDb(`tenant_${tenantId}`);
        const PatientModel = tenantConnection.model(Patient.name, PatientSchema);

        const existingPatient = await PatientModel.findById(patientId);
        if (!existingPatient) {
            throw new NotFoundException('Пациент не найден');
        }
        const updatedPatient = await PatientModel.findByIdAndUpdate(
            patientId,
            updatePatientDto,
            { new: true, runValidators: true }
        );

        return updatedPatient;
    }

    async deletePatient(tenantId: string, patientId: string, req?: Request) {
        const context = (req as any)?.limitsContext;

        const tenantConnection = this.tenantConnection.useDb(`tenant_${tenantId}`);
        const PatientModel = tenantConnection.model(Patient.name, PatientSchema);

        const existingPatient = await PatientModel.findById(patientId);
        if (!existingPatient) {
            throw new NotFoundException('Пациент не найден');
        }

        const deletedPatient = await PatientModel.findByIdAndDelete(patientId);
        await this.limitsService.updateUsage(tenantId, -1, -1);

        return deletedPatient;
    }
}


