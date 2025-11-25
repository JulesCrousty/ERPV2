import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAnalyticsTables20250101090000 implements MigrationInterface {
  name = 'CreateAnalyticsTables20250101090000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'analytics_datasource',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'entity_name', type: 'varchar' },
          { name: 'allowed_fields', type: 'text', isArray: true },
          { name: 'filterable_fields', type: 'text', isArray: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'analytics_datasource',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createIndex('analytics_datasource', new TableIndex({ columnNames: ['code'], isUnique: true }));

    await queryRunner.createTable(
      new Table({
        name: 'analytics_metric',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'datasource_id', type: 'int' },
          { name: 'aggregation', type: 'varchar' },
          { name: 'field', type: 'varchar' },
          { name: 'filters', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('analytics_metric', [
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['datasource_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'analytics_datasource',
        onDelete: 'CASCADE',
      }),
    ]);
    await queryRunner.createIndex('analytics_metric', new TableIndex({ columnNames: ['code'], isUnique: true }));

    await queryRunner.createTable(
      new Table({
        name: 'analytics_dataset',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'datasources', type: 'jsonb' },
          { name: 'fields', type: 'jsonb' },
          { name: 'filters', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'analytics_dataset',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createIndex('analytics_dataset', new TableIndex({ columnNames: ['code'], isUnique: true }));

    await queryRunner.createTable(
      new Table({
        name: 'analytics_dashboard',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'layout', type: 'jsonb' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'analytics_dashboard',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createIndex('analytics_dashboard', new TableIndex({ columnNames: ['code'], isUnique: true }));

    await queryRunner.createTable(
      new Table({
        name: 'analytics_widget',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'dashboard_id', type: 'int' },
          { name: 'type', type: 'varchar' },
          { name: 'dataset_code', type: 'varchar' },
          { name: 'metric_code', type: 'varchar', isNullable: true },
          { name: 'config', type: 'jsonb' },
          { name: 'position', type: 'jsonb' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'analytics_widget',
      new TableForeignKey({
        columnNames: ['dashboard_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'analytics_dashboard',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'analytics_query_log',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int', isNullable: true },
          { name: 'datasource_code', type: 'varchar' },
          { name: 'filters', type: 'jsonb' },
          { name: 'duration_ms', type: 'int' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'analytics_query_log',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'auth_user',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queryLog = await queryRunner.getTable('analytics_query_log');
    if (queryLog) {
      for (const fk of queryLog.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_query_log', fk);
      }
    }
    await queryRunner.dropTable('analytics_query_log');

    const widgetTable = await queryRunner.getTable('analytics_widget');
    if (widgetTable) {
      for (const fk of widgetTable.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_widget', fk);
      }
    }
    await queryRunner.dropTable('analytics_widget');

    const dashboardTable = await queryRunner.getTable('analytics_dashboard');
    if (dashboardTable) {
      for (const fk of dashboardTable.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_dashboard', fk);
      }
    }
    await queryRunner.dropTable('analytics_dashboard');

    const datasetTable = await queryRunner.getTable('analytics_dataset');
    if (datasetTable) {
      for (const fk of datasetTable.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_dataset', fk);
      }
    }
    await queryRunner.dropTable('analytics_dataset');

    const metricTable = await queryRunner.getTable('analytics_metric');
    if (metricTable) {
      for (const fk of metricTable.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_metric', fk);
      }
    }
    await queryRunner.dropTable('analytics_metric');

    const datasourceTable = await queryRunner.getTable('analytics_datasource');
    if (datasourceTable) {
      for (const fk of datasourceTable.foreignKeys) {
        await queryRunner.dropForeignKey('analytics_datasource', fk);
      }
    }
    await queryRunner.dropTable('analytics_datasource');
  }
}
