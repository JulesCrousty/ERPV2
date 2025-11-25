import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateFiTables20241125110000 implements MigrationInterface {
  name = 'CreateFiTables20241125110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fi_account',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          {
            name: 'type',
            type: 'enum',
            enumName: 'fi_account_type_enum',
            enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'OFF_BALANCE'],
          },
          { name: 'is_recon_account', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
        uniques: [new TableUnique({ columnNames: ['company_id', 'code'] })],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'fi_account',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'fi_document',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'document_number', type: 'varchar' },
          { name: 'document_date', type: 'date' },
          { name: 'posting_date', type: 'date' },
          { name: 'currency', type: 'varchar' },
          { name: 'reference', type: 'varchar', isNullable: true },
          { name: 'fiscal_period_id', type: 'int' },
          {
            name: 'status',
            type: 'enum',
            enumName: 'fi_document_status_enum',
            enum: ['PARKED', 'POSTED', 'REVERSED'],
            default: `'POSTED'`,
          },
          { name: 'total_debit', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'total_credit', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
        uniques: [new TableUnique({ columnNames: ['company_id', 'document_number'] })],
      }),
      true,
    );

    await queryRunner.createForeignKeys('fi_document', [
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['fiscal_period_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_fiscal_period',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'auth_user',
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'fi_document_line',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'fi_document_id', type: 'int' },
          { name: 'line_number', type: 'int' },
          { name: 'fi_account_id', type: 'int' },
          { name: 'debit', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'credit', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'text', type: 'varchar', isNullable: true },
          { name: 'cost_center', type: 'varchar', isNullable: true },
          { name: 'profit_center', type: 'varchar', isNullable: true },
          { name: 'customer_id', type: 'int', isNullable: true },
          { name: 'vendor_id', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
        uniques: [new TableUnique({ columnNames: ['fi_document_id', 'line_number'] })],
        checks: [
          new TableCheck({
            name: 'CHK_fi_document_line_debit_credit',
            expression: '("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('fi_document_line', [
      new TableForeignKey({
        columnNames: ['fi_document_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fi_document',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['fi_account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fi_account',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'fi_period_control',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'fiscal_year_id', type: 'int' },
          { name: 'fiscal_period_id', type: 'int' },
          { name: 'is_open_for_posting', type: 'boolean', default: true },
        ],
        uniques: [new TableUnique({ columnNames: ['company_id', 'fiscal_period_id'] })],
      }),
      true,
    );

    await queryRunner.createForeignKeys('fi_period_control', [
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['fiscal_year_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_fiscal_year',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['fiscal_period_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_fiscal_period',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const periodTable = await queryRunner.getTable('fi_period_control');
    if (periodTable) {
      for (const fk of periodTable.foreignKeys) {
        await queryRunner.dropForeignKey('fi_period_control', fk);
      }
    }
    await queryRunner.dropTable('fi_period_control');

    const lineTable = await queryRunner.getTable('fi_document_line');
    if (lineTable) {
      for (const fk of lineTable.foreignKeys) {
        await queryRunner.dropForeignKey('fi_document_line', fk);
      }
    }
    await queryRunner.dropTable('fi_document_line');

    const documentTable = await queryRunner.getTable('fi_document');
    if (documentTable) {
      for (const fk of documentTable.foreignKeys) {
        await queryRunner.dropForeignKey('fi_document', fk);
      }
    }
    await queryRunner.dropTable('fi_document');

    const accountTable = await queryRunner.getTable('fi_account');
    if (accountTable) {
      for (const fk of accountTable.foreignKeys) {
        await queryRunner.dropForeignKey('fi_account', fk);
      }
    }
    await queryRunner.dropTable('fi_account');

    await queryRunner.query('DROP TYPE IF EXISTS "fi_document_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "fi_account_type_enum"');
  }
}
