import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrSkill } from '../entities/hr-skill.entity';
import { HrEmployeeSkill } from '../entities/hr-employee-skill.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { AssignSkillDto } from '../dto/assign-skill.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class HrSkillsService {
  private readonly logger = new Logger(HrSkillsService.name);

  constructor(
    @InjectRepository(HrSkill)
    private readonly skillsRepository: Repository<HrSkill>,
    @InjectRepository(HrEmployeeSkill)
    private readonly employeeSkillsRepository: Repository<HrEmployeeSkill>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateSkillDto): Promise<HrSkill> {
    this.logger.log(`Creating skill ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const skill = this.skillsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
    return this.skillsRepository.save(skill);
  }

  findAll(): Promise<HrSkill[]> {
    return this.skillsRepository.find();
  }

  async assign(dto: AssignSkillDto): Promise<HrEmployeeSkill> {
    this.logger.log(`Assigning skill ${dto.skill_id} to employee ${dto.employee_id}`);
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const skill = await this.skillsRepository.findOne({ where: { id: dto.skill_id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    let record = await this.employeeSkillsRepository.findOne({
      where: { employee: { id: employee.id }, skill: { id: skill.id } },
    });
    if (record) {
      record.level = dto.level;
    } else {
      record = this.employeeSkillsRepository.create({ employee, skill, level: dto.level });
    }
    return this.employeeSkillsRepository.save(record);
  }
}
