import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCoreTables20240505121000 implements MigrationInterface {
  name = 'CreateCoreTables20240505121000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'core_company',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'core_currency',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'label', type: 'varchar' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'core_fiscal_year',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'year', type: 'int' },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'core_fiscal_period',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'period_number', type: 'int' },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          { name: 'fiscal_year_id', type: 'int' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'core_fiscal_period',
      new TableForeignKey({
        columnNames: ['fiscal_year_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_fiscal_year',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('core_fiscal_period');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('fiscal_year_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('core_fiscal_period', foreignKey);
    }
    await queryRunner.dropTable('core_fiscal_period');
    await queryRunner.dropTable('core_fiscal_year');
    await queryRunner.dropTable('core_currency');
    await queryRunner.dropTable('core_company');
  }
}
