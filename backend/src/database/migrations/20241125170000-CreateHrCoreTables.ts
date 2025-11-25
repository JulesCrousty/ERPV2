import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateHrCoreTables20241125170000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hr_department',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_position',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'department_id', type: 'int' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['department_id'], referencedTableName: 'hr_department', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_employee',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'user_id', type: 'int', isNullable: true },
          { name: 'employee_number', type: 'varchar' },
          { name: 'first_name', type: 'varchar' },
          { name: 'last_name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'hire_date', type: 'date' },
          { name: 'termination_date', type: 'date', isNullable: true },
          { name: 'position_id', type: 'int', isNullable: true },
          { name: 'department_id', type: 'int', isNullable: true },
          { name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'employee_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['position_id'], referencedTableName: 'hr_position', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['department_id'], referencedTableName: 'hr_department', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_contract',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date', isNullable: true },
          { name: 'contract_type', type: 'varchar' },
          { name: 'base_salary', type: 'numeric', precision: 15, scale: 2 },
          { name: 'currency', type: 'varchar' },
          { name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_skill',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_employee_skill',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'skill_id', type: 'int' },
          { name: 'level', type: 'int' },
          { name: 'assigned_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['employee_id', 'skill_id'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['skill_id'], referencedTableName: 'hr_skill', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_training',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_employee_training',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'training_id', type: 'int' },
          { name: 'employee_id', type: 'int' },
          { name: 'assigned_at', type: 'timestamp' },
          { name: 'completion_date', type: 'date', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['training_id'], referencedTableName: 'hr_training', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_job_history',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'previous_department_id', type: 'int', isNullable: true },
          { name: 'previous_position_id', type: 'int', isNullable: true },
          { name: 'new_department_id', type: 'int' },
          { name: 'new_position_id', type: 'int' },
          { name: 'change_date', type: 'date' },
          { name: 'reason', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['previous_department_id'], referencedTableName: 'hr_department', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['previous_position_id'], referencedTableName: 'hr_position', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['new_department_id'], referencedTableName: 'hr_department', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['new_position_id'], referencedTableName: 'hr_position', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_absence',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          { name: 'type', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'requested_at', type: 'timestamp' },
          { name: 'validated_by', type: 'int', isNullable: true },
          { name: 'validated_at', type: 'timestamp', isNullable: true },
          { name: 'comment', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['validated_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_employee_document',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'file_name', type: 'varchar' },
          { name: 'file_path', type: 'varchar' },
          { name: 'document_type', type: 'varchar' },
          { name: 'uploaded_at', type: 'timestamp' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hr_employee_document');
    await queryRunner.dropTable('hr_absence');
    await queryRunner.dropTable('hr_job_history');
    await queryRunner.dropTable('hr_employee_training');
    await queryRunner.dropTable('hr_training');
    await queryRunner.dropTable('hr_employee_skill');
    await queryRunner.dropTable('hr_skill');
    await queryRunner.dropTable('hr_contract');
    await queryRunner.dropTable('hr_employee');
    await queryRunner.dropTable('hr_position');
    await queryRunner.dropTable('hr_department');
  }
}
