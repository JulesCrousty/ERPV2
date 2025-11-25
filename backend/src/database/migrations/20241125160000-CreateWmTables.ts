import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWmTables20241125160000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wm_warehouse',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'wm_warehouse',
      new TableIndex({ name: 'IDX_wm_warehouse_company_code', columnNames: ['company_id', 'code'], isUnique: true }),
    );

    await queryRunner.createForeignKey(
      'wm_warehouse',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'core_company',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wm_storage_type',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'warehouse_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'putaway_strategy', type: 'enum', enum: ['FIXED', 'FILL', 'EMPTY_FIRST'] },
          { name: 'picking_strategy', type: 'enum', enum: ['FIFO', 'LIFO', 'PRIORITY'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'wm_storage_type',
      new TableIndex({
        name: 'IDX_wm_storage_type_warehouse_code',
        columnNames: ['warehouse_id', 'code'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'wm_storage_type',
      new TableForeignKey({
        columnNames: ['warehouse_id'],
        referencedTableName: 'wm_warehouse',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wm_storage_bin',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'storage_type_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'is_blocked', type: 'boolean', default: false },
          { name: 'block_reason', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'wm_storage_bin',
      new TableIndex({
        name: 'IDX_wm_storage_bin_type_code',
        columnNames: ['storage_type_id', 'code'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'wm_storage_bin',
      new TableForeignKey({
        columnNames: ['storage_type_id'],
        referencedTableName: 'wm_storage_type',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wm_bin_stock',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'bin_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3, default: 0 },
          { name: 'uom', type: 'varchar' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'wm_bin_stock',
      new TableIndex({ name: 'IDX_wm_bin_stock_bin_material', columnNames: ['bin_id', 'material_id'], isUnique: true }),
    );

    await queryRunner.createForeignKeys('wm_bin_stock', [
      new TableForeignKey({
        columnNames: ['bin_id'],
        referencedTableName: 'wm_storage_bin',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['material_id'],
        referencedTableName: 'mm_material',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'wm_transport_order',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'to_number', type: 'varchar', isUnique: true },
          { name: 'status', type: 'enum', enum: ['CREATED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: "'CREATED'" },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('wm_transport_order', [
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'core_company',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'auth_user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'wm_warehouse_task',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'transport_order_id', type: 'int' },
          { name: 'task_type', type: 'enum', enum: ['PUTAWAY', 'PICKING', 'INTERNAL_MOVE'] },
          { name: 'status', type: 'enum', enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'], default: "'PENDING'" },
          { name: 'source_bin_id', type: 'int', isNullable: true },
          { name: 'destination_bin_id', type: 'int', isNullable: true },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'sequence', type: 'int' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('wm_warehouse_task', [
      new TableForeignKey({
        columnNames: ['transport_order_id'],
        referencedTableName: 'wm_transport_order',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['source_bin_id'],
        referencedTableName: 'wm_storage_bin',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['destination_bin_id'],
        referencedTableName: 'wm_storage_bin',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['material_id'],
        referencedTableName: 'mm_material',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wm_warehouse_task', true);
    await queryRunner.dropTable('wm_transport_order', true);
    await queryRunner.dropTable('wm_bin_stock', true);
    await queryRunner.dropTable('wm_storage_bin', true);
    await queryRunner.dropTable('wm_storage_type', true);
    await queryRunner.dropTable('wm_warehouse', true);
  }
}
