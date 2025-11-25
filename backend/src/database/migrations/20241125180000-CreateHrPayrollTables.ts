import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateHrPayrollTables20241125180000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_period',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          { name: 'status', type: 'varchar' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] })],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_rule',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'category', type: 'varchar' },
          { name: 'calculation_type', type: 'varchar' },
          { name: 'amount', type: 'numeric', precision: 15, scale: 4, isNullable: true },
          { name: 'rate', type: 'numeric', precision: 10, scale: 4, isNullable: true },
          { name: 'formula', type: 'varchar', isNullable: true },
          { name: 'priority', type: 'int' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] })],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_employee_config',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'base_salary', type: 'numeric', precision: 15, scale: 2 },
          { name: 'currency', type: 'varchar' },
          { name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 },
          { name: 'is_taxable', type: 'boolean', default: true },
        ],
        indices: [new TableIndex({ columnNames: ['employee_id'], isUnique: true })],
        foreignKeys: [new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] })],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_input',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'period_id', type: 'int' },
          { name: 'type', type: 'varchar' },
          { name: 'quantity', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'amount', type: 'numeric', precision: 15, scale: 2, isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['period_id'], referencedTableName: 'hr_payroll_period', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_result',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'period_id', type: 'int' },
          { name: 'gross_salary', type: 'numeric', precision: 15, scale: 2 },
          { name: 'taxable_salary', type: 'numeric', precision: 15, scale: 2 },
          { name: 'employee_contributions', type: 'numeric', precision: 15, scale: 2 },
          { name: 'employer_contributions', type: 'numeric', precision: 15, scale: 2 },
          { name: 'net_salary', type: 'numeric', precision: 15, scale: 2 },
          { name: 'status', type: 'varchar' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['period_id'], referencedTableName: 'hr_payroll_period', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_payroll_result_line',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'payroll_result_id', type: 'int' },
          { name: 'rule_id', type: 'int', isNullable: true },
          { name: 'label', type: 'varchar' },
          { name: 'amount', type: 'numeric', precision: 15, scale: 2 },
          { name: 'quantity', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'is_taxable', type: 'boolean', default: true },
          { name: 'is_employee_expense', type: 'boolean', default: true },
          { name: 'is_employer_expense', type: 'boolean', default: false },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['payroll_result_id'], referencedTableName: 'hr_payroll_result', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['rule_id'], referencedTableName: 'hr_payroll_rule', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hr_payroll_result_line');
    await queryRunner.dropTable('hr_payroll_result');
    await queryRunner.dropTable('hr_payroll_input');
    await queryRunner.dropTable('hr_payroll_employee_config');
    await queryRunner.dropTable('hr_payroll_rule');
    await queryRunner.dropTable('hr_payroll_period');
  }
}
