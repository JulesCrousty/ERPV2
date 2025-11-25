import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrWorkSchedule } from './entities/hr-work-schedule.entity';
import { HrWorkScheduleDay } from './entities/hr-work-schedule-day.entity';
import { HrTimePunch } from './entities/hr-time-punch.entity';
import { HrTimeCorrection } from './entities/hr-time-correction.entity';
import { HrAbsenceRequest } from './entities/hr-absence-request.entity';
import { HrCalendar } from './entities/hr-calendar.entity';
import { HrCalendarException } from './entities/hr-calendar-exception.entity';
import { HrOvertimeRule } from './entities/hr-overtime-rule.entity';
import { HrOvertimeEntry } from './entities/hr-overtime-entry.entity';
import { HrWorkSchedulesService } from './services/hr-work-schedules.service';
import { HrTimePunchesService } from './services/hr-time-punches.service';
import { HrAbsenceRequestsService } from './services/hr-absence-requests.service';
import { HrCalendarsService } from './services/hr-calendars.service';
import { HrOvertimeService } from './services/hr-overtime.service';
import { HrWorkSchedulesController } from './controllers/hr-work-schedules.controller';
import { HrTimePunchesController } from './controllers/hr-time-punches.controller';
import { HrAbsenceRequestsController } from './controllers/hr-absence-requests.controller';
import { HrCalendarsController } from './controllers/hr-calendars.controller';
import { HrOvertimeController } from './controllers/hr-overtime.controller';
import { HrEmployee } from '../hr/entities/hr-employee.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrWorkSchedule,
      HrWorkScheduleDay,
      HrTimePunch,
      HrTimeCorrection,
      HrAbsenceRequest,
      HrCalendar,
      HrCalendarException,
      HrOvertimeRule,
      HrOvertimeEntry,
      HrEmployee,
      Company,
      User,
    ]),
  ],
  providers: [
    HrWorkSchedulesService,
    HrTimePunchesService,
    HrAbsenceRequestsService,
    HrCalendarsService,
    HrOvertimeService,
  ],
  controllers: [
    HrWorkSchedulesController,
    HrTimePunchesController,
    HrAbsenceRequestsController,
    HrCalendarsController,
    HrOvertimeController,
  ],
})
export class HrTimeModule {}
