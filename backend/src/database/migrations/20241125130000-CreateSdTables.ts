import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateSdTables20241125130000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sd_customer',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'customer_code', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'address', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar', isNullable: true },
          { name: 'postal_code', type: 'varchar', isNullable: true },
          { name: 'country', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'payment_terms', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'customer_code'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'sd_sales_order',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'order_number', type: 'varchar' },
          { name: 'customer_id', type: 'int' },
          { name: 'order_date', type: 'date' },
          { name: 'requested_delivery_date', type: 'date', isNullable: true },
          { name: 'currency', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'total_net_amount', type: 'numeric', precision: 18, scale: 2 },
          { name: 'total_gross_amount', type: 'numeric', precision: 18, scale: 2 },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [new TableIndex({ columnNames: ['company_id', 'order_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['company_id'], referencedTableName: 'core_company', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['customer_id'], referencedTableName: 'sd_customer', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'auth_user', referencedColumnNames: ['id'] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'sd_sales_order_item',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'sales_order_id', type: 'int' },
          { name: 'line_number', type: 'int' },
          { name: 'material_id', type: 'int' },
          { name: 'description', type: 'varchar' },
          { name: 'quantity', type: 'numeric', precision: 18, scale: 3 },
          { name: 'uom', type: 'varchar' },
          { name: 'unit_price', type: 'numeric', precision: 18, scale: 2 },
          { name: 'discount_percent', type: 'numeric', precision: 5, scale: 2, default: 0 },
          { name: 'net_amount', type: 'numeric', precision: 18, scale: 2 },
          { name: 'tax_percent', type: 'numeric', precision: 5, scale: 2, default: 0 },
          { name: 'tax_amount', type: 'numeric', precision: 18, scale: 2 },
          { name: 'gross_amount', type: 'numeric', precision: 18, scale: 2 },
          { name: 'delivered_quantity', type: 'numeric', precision: 18, scale: 3, default: 0 },
          { name: 'invoiced_quantity', type: 'numeric', precision: 18, scale: 3, default: 0 },
        ],
        indices: [new TableIndex({ columnNames: ['sales_order_id', 'line_number'], isUnique: true })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['sales_order_id'],
            referencedTableName: 'sd_sales_order',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sd_sales_order_item');
    await queryRunner.dropTable('sd_sales_order');
    await queryRunner.dropTable('sd_customer');
  }
}
