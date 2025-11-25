import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMmTables20241125120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mm_material',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'material_code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'material_type', type: 'varchar' },
          { name: 'base_uom', type: 'varchar' },
          { name: 'purchasing_group', type: 'varchar', isNullable: true },
          { name: 'valuation_class', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'material_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['company_id'],
            referencedTableName: 'core_company',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_vendor',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'vendor_code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'address', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar', isNullable: true },
          { name: 'country', type: 'varchar', isNullable: true },
          { name: 'payment_terms', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'vendor_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['company_id'],
            referencedTableName: 'core_company',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_purchase_requisition',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'pr_number', type: 'varchar' },
          { name: 'requester_id', type: 'int', isNullable: true },
          { name: 'status', type: 'varchar' },
          { name: 'requested_date', type: 'date' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'pr_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['requester_id'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_purchase_requisition_item',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'requisition_id', type: 'int' },
          { name: 'line_number', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'desired_delivery_date', type: 'date', isNullable: true },
          { name: 'note', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['requisition_id'], referencedTableName: 'mm_purchase_requisition', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_purchase_order',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'po_number', type: 'varchar' },
          { name: 'vendor_id', type: 'int', isNullable: true },
          { name: 'order_date', type: 'date' },
          { name: 'currency', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'po_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['vendor_id'], referencedTableName: 'mm_vendor', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_purchase_order_item',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'purchase_order_id', type: 'int' },
          { name: 'line_number', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'received_quantity', type: 'numeric', precision: 18, scale: 3, default: 0 },
          { name: 'uom', type: 'varchar' },
          { name: 'unit_price', type: 'numeric', precision: 18, scale: 2 },
          { name: 'delivery_date', type: 'date', isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['purchase_order_id'], referencedTableName: 'mm_purchase_order', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_goods_receipt',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'gr_number', type: 'varchar' },
          { name: 'posting_date', type: 'date' },
          { name: 'vendor_id', type: 'int', isNullable: true },
          { name: 'purchase_order_id', type: 'int', isNullable: true },
          { name: 'status', type: 'varchar' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'gr_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['vendor_id'], referencedTableName: 'mm_vendor', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['purchase_order_id'], referencedTableName: 'mm_purchase_order', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_goods_receipt_item',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'goods_receipt_id', type: 'int' },
          { name: 'line_number', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'storage_location_code', type: 'varchar' },
          { name: 'unit_price', type: 'numeric', precision: 18, scale: 2 },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['goods_receipt_id'], referencedTableName: 'mm_goods_receipt', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mm_stock',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'storage_location_code', type: 'varchar' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3, default: 0 },
          { name: 'total_value', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'currency', type: 'varchar' },
          { name: 'last_movement_at', type: 'timestamp' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'material_id', 'storage_location_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['material_id'], referencedTableName: 'mm_material', referencedColumnNames: ['id'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mm_stock');
    await queryRunner.dropTable('mm_goods_receipt_item');
    await queryRunner.dropTable('mm_goods_receipt');
    await queryRunner.dropTable('mm_purchase_order_item');
    await queryRunner.dropTable('mm_purchase_order');
    await queryRunner.dropTable('mm_purchase_requisition_item');
    await queryRunner.dropTable('mm_purchase_requisition');
    await queryRunner.dropTable('mm_vendor');
    await queryRunner.dropTable('mm_material');
  }
}
