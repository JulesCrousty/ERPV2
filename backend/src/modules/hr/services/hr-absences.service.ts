import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrAbsence, HrAbsenceStatus } from '../entities/hr-absence.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { CreateAbsenceDto } from '../dto/create-absence.dto';
import { UpdateAbsenceStatusDto } from '../dto/update-absence-status.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class HrAbsencesService {
  private readonly logger = new Logger(HrAbsencesService.name);

  constructor(
    @InjectRepository(HrAbsence)
    private readonly absencesRepository: Repository<HrAbsence>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateAbsenceDto): Promise<HrAbsence> {
    this.logger.log(`Creating absence for employee ${dto.employee_id}`);
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const absence = this.absencesRepository.create({
      employee,
      startDate: new Date(dto.start_date),
      endDate: new Date(dto.end_date),
      type: dto.type,
      status: HrAbsenceStatus.PENDING,
      requestedAt: new Date(),
      comment: dto.comment,
    });
    return this.absencesRepository.save(absence);
  }

  findAll(): Promise<HrAbsence[]> {
    return this.absencesRepository.find();
  }

  async updateStatus(id: number, dto: UpdateAbsenceStatusDto): Promise<HrAbsence> {
    const absence = await this.absencesRepository.findOne({ where: { id } });
    if (!absence) {
      throw new NotFoundException('Absence not found');
    }
    const user = await this.usersRepository.findOne({ where: { id: dto.validated_by } });
    if (!user) {
      throw new NotFoundException('Validator not found');
    }
    this.logger.log(`Updating absence ${id} status to ${dto.status}`);
    absence.status = dto.status;
    absence.validatedBy = user;
    absence.validatedAt = new Date();
    absence.comment = dto.comment ?? absence.comment;
    return this.absencesRepository.save(absence);
  }
}
