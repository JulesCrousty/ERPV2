import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrWorkSchedule } from '../entities/hr-work-schedule.entity';
import { HrWorkScheduleDay } from '../entities/hr-work-schedule-day.entity';
import { CreateWorkScheduleDto } from '../dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from '../dto/update-work-schedule.dto';
import { Company } from '../../core/entities/company.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';

@Injectable()
export class HrWorkSchedulesService {
  private readonly logger = new Logger(HrWorkSchedulesService.name);

  constructor(
    @InjectRepository(HrWorkSchedule)
    private readonly schedulesRepository: Repository<HrWorkSchedule>,
    @InjectRepository(HrWorkScheduleDay)
    private readonly daysRepository: Repository<HrWorkScheduleDay>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
  ) {}

  async create(dto: CreateWorkScheduleDto): Promise<HrWorkSchedule> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    let employee: HrEmployee | null = null;
    if (dto.employee_id) {
      employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    this.logger.log(`Creating work schedule ${dto.name} for company ${company.id}`);
    const days = dto.days.map((d) => this.buildDay(d));
    this.validateDays(days);
    const schedule = this.schedulesRepository.create({
      company,
      employee: employee ?? null,
      name: dto.name,
      weeklyHours: dto.weekly_hours,
      days: days.map((day) => this.daysRepository.create({ ...day })),
    });
    return this.schedulesRepository.save(schedule);
  }

  async update(id: number, dto: UpdateWorkScheduleDto): Promise<HrWorkSchedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id }, relations: ['days'] });
    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }
    if (dto.days) {
      const mappedDays = dto.days.map((d) => this.buildDay(d));
      this.validateDays(mappedDays);
      schedule.days = mappedDays.map((day) => this.daysRepository.create({ ...day, workSchedule: schedule }));
    }
    if (dto.name) {
      schedule.name = dto.name;
    }
    if (dto.weekly_hours !== undefined) {
      schedule.weeklyHours = dto.weekly_hours;
    }
    if (dto.employee_id !== undefined) {
      if (dto.employee_id === null) {
        schedule.employee = null;
      } else {
        const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
        if (!employee) {
          throw new NotFoundException('Employee not found');
        }
        schedule.employee = employee;
      }
    }
    this.logger.log(`Updating work schedule ${schedule.id}`);
    return this.schedulesRepository.save(schedule);
  }

  async assignToEmployee(scheduleId: number, employeeId: number): Promise<HrWorkSchedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }
    const employee = await this.employeesRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    this.logger.log(`Assigning work schedule ${scheduleId} to employee ${employeeId}`);
    schedule.employee = employee;
    return this.schedulesRepository.save(schedule);
  }

  private validateDays(days: HrWorkScheduleDay[]) {
    const seen = new Set<number>();
    for (const day of days) {
      if (seen.has(day.weekday)) {
        throw new BadRequestException('Duplicate weekday provided');
      }
      seen.add(day.weekday);
      if (!this.isValidRange(day.startTime, day.endTime)) {
        throw new BadRequestException('Invalid time range');
      }
    }
  }

  private isValidRange(start: string, end: string): boolean {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    return startMinutes < endMinutes;
  }

  private buildDay(input: { weekday: number; start_time: string; end_time: string; break_minutes: number }): HrWorkScheduleDay {
    return {
      id: undefined as any,
      workSchedule: undefined as any,
      weekday: input.weekday,
      startTime: input.start_time,
      endTime: input.end_time,
      breakMinutes: input.break_minutes,
    };
  }
}
