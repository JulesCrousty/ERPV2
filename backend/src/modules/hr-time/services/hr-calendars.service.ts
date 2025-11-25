import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrCalendar } from '../entities/hr-calendar.entity';
import { HrCalendarException, HrCalendarExceptionType } from '../entities/hr-calendar-exception.entity';
import { Company } from '../../core/entities/company.entity';
import { CreateCalendarDto } from '../dto/create-calendar.dto';
import { CreateCalendarExceptionDto } from '../dto/create-calendar-exception.dto';

@Injectable()
export class HrCalendarsService {
  private readonly logger = new Logger(HrCalendarsService.name);

  constructor(
    @InjectRepository(HrCalendar)
    private readonly calendarsRepository: Repository<HrCalendar>,
    @InjectRepository(HrCalendarException)
    private readonly exceptionsRepository: Repository<HrCalendarException>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async createCalendar(dto: CreateCalendarDto): Promise<HrCalendar> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const calendar = this.calendarsRepository.create({ company, name: dto.name });
    this.logger.log(`Calendar ${dto.name} created for company ${company.id}`);
    return this.calendarsRepository.save(calendar);
  }

  async addException(dto: CreateCalendarExceptionDto): Promise<HrCalendarException> {
    const calendar = await this.calendarsRepository.findOne({ where: { id: dto.calendar_id } });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    const existing = await this.exceptionsRepository.findOne({
      where: { calendar: { id: calendar.id }, date: new Date(dto.date) },
    });
    if (existing) {
      throw new BadRequestException('Exception already exists for this date');
    }
    const exception = this.exceptionsRepository.create({
      calendar,
      date: new Date(dto.date),
      type: dto.type as HrCalendarExceptionType,
      description: dto.description,
    });
    this.logger.log(`Exception ${dto.type} added to calendar ${calendar.id}`);
    return this.exceptionsRepository.save(exception);
  }
}
