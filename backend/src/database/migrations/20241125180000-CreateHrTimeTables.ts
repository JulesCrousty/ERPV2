import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateHrTimeTables20241125180000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hr_work_schedule',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'employee_id', type: 'int', isNullable: true },
          { name: 'name', type: 'varchar' },
          { name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_work_schedule_day',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'work_schedule_id', type: 'int' },
          { name: 'weekday', type: 'int' },
          { name: 'start_time', type: 'varchar' },
          { name: 'end_time', type: 'varchar' },
          { name: 'break_minutes', type: 'int' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['work_schedule_id'], referencedTableName: 'hr_work_schedule', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
        indices: [new TableIndex({ columnNames: ['work_schedule_id', 'weekday'], isUnique: true })],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_time_punch',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'punch_type', type: 'varchar' },
          { name: 'timestamp', type: 'timestamp' },
          { name: 'source', type: 'varchar' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_time_correction',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'time_punch_id', type: 'int' },
          { name: 'requested_by', type: 'int' },
          { name: 'requested_at', type: 'timestamp' },
          { name: 'reason', type: 'varchar' },
          { name: 'approved_by', type: 'int', isNullable: true },
          { name: 'approved_at', type: 'timestamp', isNullable: true },
          { name: 'new_timestamp', type: 'timestamp' },
          { name: 'status', type: 'varchar' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['time_punch_id'], referencedTableName: 'hr_time_punch', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['requested_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['approved_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_absence_request',
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
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_calendar',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_calendar_exception',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'calendar_id', type: 'int' },
          { name: 'date', type: 'date' },
          { name: 'type', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['calendar_id'], referencedTableName: 'hr_calendar', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
        indices: [new TableIndex({ columnNames: ['calendar_id', 'date'], isUnique: true })],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_overtime_rule',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'description', type: 'varchar' },
          { name: 'rate', type: 'numeric', precision: 5, scale: 2 },
          { name: 'min_minutes', type: 'int' },
          { name: 'max_minutes', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'hr_overtime_entry',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'employee_id', type: 'int' },
          { name: 'rule_id', type: 'int' },
          { name: 'date', type: 'date' },
          { name: 'minutes', type: 'int' },
          { name: 'validated_by', type: 'int', isNullable: true },
          { name: 'validated_at', type: 'timestamp', isNullable: true },
          { name: 'status', type: 'varchar' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['employee_id'], referencedTableName: 'hr_employee', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['rule_id'], referencedTableName: 'hr_overtime_rule', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['validated_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hr_overtime_entry');
    await queryRunner.dropTable('hr_overtime_rule');
    await queryRunner.dropTable('hr_calendar_exception');
    await queryRunner.dropTable('hr_calendar');
    await queryRunner.dropTable('hr_absence_request');
    await queryRunner.dropTable('hr_time_correction');
    await queryRunner.dropTable('hr_time_punch');
    await queryRunner.dropTable('hr_work_schedule_day');
    await queryRunner.dropTable('hr_work_schedule');
  }
}
