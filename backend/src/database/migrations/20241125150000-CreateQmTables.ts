import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateQmTables20241125150000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qm_inspection_lot',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'lot_number', type: 'varchar' },
          { name: 'reference_type', type: 'varchar' },
          { name: 'reference_id', type: 'int', isNullable: true },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'lot_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qm_characteristic',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'description', type: 'varchar' },
          { name: 'lower_limit', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'upper_limit', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'target_value', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'uom', type: 'varchar' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'code'], isUnique: true })],
        foreignKeys: [new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] })],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qm_inspection_result',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'inspection_lot_id', type: 'int' },
          { name: 'characteristic_id', type: 'int' },
          { name: 'measured_value', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'ok', type: 'boolean', isNullable: true },
          { name: 'recorded_by', type: 'int', isNullable: true },
          { name: 'recorded_at', type: 'timestamp' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['inspection_lot_id'], referencedTableName: 'qm_inspection_lot', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['characteristic_id'], referencedTableName: 'qm_characteristic', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['recorded_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qm_usage_decision',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'inspection_lot_id', type: 'int' },
          { name: 'decision', type: 'varchar' },
          { name: 'comments', type: 'varchar', isNullable: true },
          { name: 'decided_by', type: 'int', isNullable: true },
          { name: 'decided_at', type: 'timestamp' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['inspection_lot_id'], referencedTableName: 'qm_inspection_lot', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['decided_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qm_quality_level',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'quality_score', type: 'numeric', precision: 5, scale: 2, default: 0 },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'material_id'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('qm_quality_level');
    await queryRunner.dropTable('qm_usage_decision');
    await queryRunner.dropTable('qm_inspection_result');
    await queryRunner.dropTable('qm_characteristic');
    await queryRunner.dropTable('qm_inspection_lot');
  }
}
