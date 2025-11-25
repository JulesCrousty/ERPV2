import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { HrTimePunch, HrTimePunchSource, HrTimePunchType } from '../entities/hr-time-punch.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateTimePunchDto } from '../dto/create-time-punch.dto';
import { HrTimeCorrection, HrTimeCorrectionStatus } from '../entities/hr-time-correction.entity';
import { CorrectTimePunchDto } from '../dto/correct-time-punch.dto';
import { HrWorkScheduleDay } from '../entities/hr-work-schedule-day.entity';
import { HrWorkSchedule } from '../entities/hr-work-schedule.entity';
import { HrOvertimeService } from './hr-overtime.service';

@Injectable()
export class HrTimePunchesService {
  private readonly logger = new Logger(HrTimePunchesService.name);

  constructor(
    @InjectRepository(HrTimePunch)
    private readonly punchesRepository: Repository<HrTimePunch>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(HrTimeCorrection)
    private readonly correctionsRepository: Repository<HrTimeCorrection>,
    @InjectRepository(HrWorkSchedule)
    private readonly schedulesRepository: Repository<HrWorkSchedule>,
    @InjectRepository(HrWorkScheduleDay)
    private readonly scheduleDaysRepository: Repository<HrWorkScheduleDay>,
    private readonly overtimeService: HrOvertimeService,
  ) {}

  async punch(dto: CreateTimePunchDto): Promise<HrTimePunch> {
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    let createdBy: User | null = null;
    const source = dto.source ?? HrTimePunchSource.AUTO;
    if (source === HrTimePunchSource.MANUAL || dto.created_by) {
      createdBy = await this.loadUser(dto.created_by);
    }

    const lastPunch = await this.punchesRepository.findOne({
      where: { employee: { id: dto.employee_id } },
      order: { timestamp: 'DESC' },
    });

    this.validatePunchSequence(lastPunch, dto.punch_type);

    const punch = this.punchesRepository.create({
      employee,
      punchType: dto.punch_type,
      timestamp: new Date(dto.timestamp),
      source,
      createdBy,
    });
    const saved = await this.punchesRepository.save(punch);
    this.logger.log(`Recorded punch ${saved.punchType} for employee ${employee.id}`);

    if (dto.punch_type === HrTimePunchType.OUT) {
      await this.handlePostOut(employee, saved.timestamp);
    }

    return saved;
  }

  async requestCorrection(dto: CorrectTimePunchDto): Promise<HrTimeCorrection> {
    const timePunch = await this.punchesRepository.findOne({ where: { id: dto.time_punch_id } });
    if (!timePunch) {
      throw new NotFoundException('Time punch not found');
    }
    const user = await this.loadUser(dto.requested_by);
    const correction = this.correctionsRepository.create({
      timePunch,
      requestedBy: user,
      requestedAt: new Date(),
      reason: dto.reason,
      approvedBy: null,
      approvedAt: null,
      newTimestamp: new Date(dto.new_timestamp),
      status: HrTimeCorrectionStatus.PENDING,
    });
    this.logger.log(`Correction requested for punch ${timePunch.id} by user ${user.id}`);
    return this.correctionsRepository.save(correction);
  }

  async calculateDailyPresence(employeeId: number, date: Date): Promise<{
    actualMinutes: number;
    scheduledMinutes: number;
    differenceMinutes: number;
    overtimeCandidateMinutes: number;
  }> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const punches = await this.punchesRepository.find({
      where: { employee: { id: employeeId }, timestamp: Between(start, end) },
      order: { timestamp: 'ASC' },
    });

    let actualMinutes = 0;
    let sessionStart: Date | null = null;
    let breakStart: Date | null = null;
    let sessionBreak = 0;

    for (const punch of punches) {
      if (punch.punchType === HrTimePunchType.IN) {
        sessionStart = punch.timestamp;
        sessionBreak = 0;
        breakStart = null;
      } else if (punch.punchType === HrTimePunchType.BREAK_START) {
        if (sessionStart) {
          breakStart = punch.timestamp;
        }
      } else if (punch.punchType === HrTimePunchType.BREAK_END) {
        if (breakStart && sessionStart) {
          sessionBreak += this.diffInMinutes(breakStart, punch.timestamp);
          breakStart = null;
        }
      } else if (punch.punchType === HrTimePunchType.OUT && sessionStart) {
        const duration = this.diffInMinutes(sessionStart, punch.timestamp) - sessionBreak;
        actualMinutes += Math.max(duration, 0);
        sessionStart = null;
        sessionBreak = 0;
        breakStart = null;
      }
    }

    const schedule = await this.schedulesRepository.findOne({ where: { employee: { id: employeeId } } });
    let scheduledMinutes = 0;
    if (schedule) {
      const weekday = start.getDay();
      const day = await this.scheduleDaysRepository.findOne({ where: { workSchedule: { id: schedule.id }, weekday } });
      if (day) {
        scheduledMinutes = this.timeRangeMinutes(day.startTime, day.endTime) - day.breakMinutes;
      }
    }

    const differenceMinutes = actualMinutes - scheduledMinutes;
    const overtimeCandidateMinutes = Math.max(differenceMinutes, 0);
    return { actualMinutes, scheduledMinutes, differenceMinutes, overtimeCandidateMinutes };
  }

  private validatePunchSequence(lastPunch: HrTimePunch | null, type: HrTimePunchType) {
    if (!lastPunch) {
      if (type === HrTimePunchType.OUT) {
        throw new BadRequestException('Cannot punch OUT before IN');
      }
      return;
    }

    if (type === HrTimePunchType.IN && lastPunch.punchType === HrTimePunchType.IN) {
      this.logger.warn('Anomaly detected: consecutive IN punches');
      throw new BadRequestException('Previous punch is already IN');
    }
    if (type === HrTimePunchType.OUT && lastPunch.punchType !== HrTimePunchType.IN) {
      this.logger.warn('Invalid OUT punch without open IN');
      throw new BadRequestException('Cannot punch OUT without an open IN');
    }
    if (type === HrTimePunchType.OUT && lastPunch.punchType === HrTimePunchType.OUT) {
      throw new BadRequestException('Previous punch is already OUT');
    }
    if (type === HrTimePunchType.BREAK_START && lastPunch.punchType === HrTimePunchType.BREAK_START) {
      throw new BadRequestException('Break already started');
    }
    if (type === HrTimePunchType.BREAK_END && lastPunch.punchType !== HrTimePunchType.BREAK_START) {
      throw new BadRequestException('No break to end');
    }
  }

  private diffInMinutes(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  private timeRangeMinutes(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  }

  private async loadUser(id?: number | null): Promise<User | null> {
    if (!id) {
      return null;
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async handlePostOut(employee: HrEmployee, timestamp: Date) {
    const presence = await this.calculateDailyPresence(employee.id, timestamp);
    if (presence.overtimeCandidateMinutes > 0) {
      await this.overtimeService.detectAndCreate(employee, timestamp, presence.overtimeCandidateMinutes);
    }
  }
}
