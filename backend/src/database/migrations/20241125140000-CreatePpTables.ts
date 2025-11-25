import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePpTables20241125140000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pp_work_center',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'capacity_per_hour', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'cost_per_hour', type: 'numeric', precision: 18, scale: 2, isNullable: true },
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
        name: 'pp_routing',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'routing_code', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'material_id', 'routing_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_routing_operation',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'routing_id', type: 'int' },
          { name: 'operation_number', type: 'int' },
          { name: 'work_center_id', type: 'int' },
          { name: 'description', type: 'varchar' },
          { name: 'setup_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'processing_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'move_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'queue_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'sequence', type: 'int', isNullable: true },
        ],
        indices: [new TableIndex({ columnNames: ['routing_id', 'operation_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['routing_id'], referencedTableName: 'pp_routing', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['work_center_id'], referencedTableName: 'pp_work_center', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_bom',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'bom_code', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'material_id', 'bom_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_bom_item',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'bom_id', type: 'int' },
          { name: 'component_material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'scrap_percent', type: 'numeric', precision: 5, scale: 2, default: 0 },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['bom_id'], referencedTableName: 'pp_bom', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['component_material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_production_order',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'order_number', type: 'varchar' },
          { name: 'material_id', type: 'int' },
          { name: 'planned_quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'bom_id', type: 'int', isNullable: true },
          { name: 'routing_id', type: 'int', isNullable: true },
          { name: 'start_date_planned', type: 'timestamp', isNullable: true },
          { name: 'end_date_planned', type: 'timestamp', isNullable: true },
          { name: 'start_date_actual', type: 'timestamp', isNullable: true },
          { name: 'end_date_actual', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'order_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['bom_id'], referencedTableName: 'pp_bom', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['routing_id'], referencedTableName: 'pp_routing', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_production_order_operation',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'production_order_id', type: 'int' },
          { name: 'operation_number', type: 'int' },
          { name: 'work_center_id', type: 'int' },
          { name: 'description', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'planned_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'actual_time_hours', type: 'numeric', precision: 18, scale: 3, isNullable: true },
          { name: 'sequence', type: 'int' },
        ],
        indices: [new TableIndex({ columnNames: ['production_order_id', 'operation_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['production_order_id'],
            referencedTableName: 'pp_production_order',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({ columnNames: ['work_center_id'], referencedTableName: 'pp_work_center', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_material_consumption',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'production_order_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'storage_location_code', type: 'varchar' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'movement_type', type: 'varchar' },
          { name: 'posting_date', type: 'timestamp' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['production_order_id'], referencedTableName: 'pp_production_order', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pp_finished_goods_receipt',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'production_order_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'storage_location_code', type: 'varchar' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'movement_type', type: 'varchar' },
          { name: 'posting_date', type: 'timestamp' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['production_order_id'], referencedTableName: 'pp_production_order', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pp_finished_goods_receipt');
    await queryRunner.dropTable('pp_material_consumption');
    await queryRunner.dropTable('pp_production_order_operation');
    await queryRunner.dropTable('pp_production_order');
    await queryRunner.dropTable('pp_bom_item');
    await queryRunner.dropTable('pp_bom');
    await queryRunner.dropTable('pp_routing_operation');
    await queryRunner.dropTable('pp_routing');
    await queryRunner.dropTable('pp_work_center');
  }
}
