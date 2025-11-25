import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrEmployeeDocument } from '../entities/hr-employee-document.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { UploadEmployeeDocumentDto } from '../dto/upload-employee-document.dto';

@Injectable()
export class HrEmployeeDocumentsService {
  private readonly logger = new Logger(HrEmployeeDocumentsService.name);

  constructor(
    @InjectRepository(HrEmployeeDocument)
    private readonly documentsRepository: Repository<HrEmployeeDocument>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
  ) {}

  async upload(dto: UploadEmployeeDocumentDto): Promise<HrEmployeeDocument> {
    this.logger.log(`Uploading document for employee ${dto.employee_id}`);
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const document = this.documentsRepository.create({
      employee,
      fileName: dto.file_name,
      filePath: dto.file_path,
      documentType: dto.document_type,
      uploadedAt: new Date(),
    });
    return this.documentsRepository.save(document);
  }

  findAll(): Promise<HrEmployeeDocument[]> {
    return this.documentsRepository.find();
  }
}
