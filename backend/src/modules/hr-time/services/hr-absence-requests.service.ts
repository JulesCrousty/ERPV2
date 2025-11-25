import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { HrAbsenceRequest, HrAbsenceStatus } from '../entities/hr-absence-request.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateAbsenceRequestDto } from '../dto/create-absence-request.dto';
import { UpdateAbsenceRequestStatusDto } from '../dto/update-absence-request-status.dto';

@Injectable()
export class HrAbsenceRequestsService {
  private readonly logger = new Logger(HrAbsenceRequestsService.name);

  constructor(
    @InjectRepository(HrAbsenceRequest)
    private readonly absencesRepository: Repository<HrAbsenceRequest>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async requestAbsence(dto: CreateAbsenceRequestDto): Promise<HrAbsenceRequest> {
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const overlap = await this.absencesRepository.findOne({
      where: {
        employee: { id: employee.id },
        status: Not(HrAbsenceStatus.REJECTED),
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      } as any,
    });
    if (overlap) {
      throw new BadRequestException('Absence overlap detected');
    }

    const absence = this.absencesRepository.create({
      employee,
      startDate,
      endDate,
      type: dto.type,
      status: HrAbsenceStatus.PENDING,
      requestedAt: new Date(),
      comment: dto.comment,
    });
    this.logger.log(`Absence request created for employee ${employee.id}`);
    return this.absencesRepository.save(absence);
  }

  async updateStatus(id: number, dto: UpdateAbsenceRequestStatusDto): Promise<HrAbsenceRequest> {
    const absence = await this.absencesRepository.findOne({ where: { id } });
    if (!absence) {
      throw new NotFoundException('Absence request not found');
    }
    if (absence.status !== HrAbsenceStatus.PENDING) {
      throw new BadRequestException('Only pending requests can transition');
    }
    const validator = await this.usersRepository.findOne({ where: { id: dto.validated_by } });
    if (!validator) {
      throw new NotFoundException('Validator not found');
    }
    this.logger.log(`Updating absence request ${id} to ${dto.status}`);
    absence.status = dto.status;
    absence.validatedBy = validator;
    absence.validatedAt = new Date();
    absence.comment = dto.comment ?? absence.comment;
    return this.absencesRepository.save(absence);
  }
}
