import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkflowTables20241125190000 implements MigrationInterface {
  name = 'CreateWorkflowTables20241125190000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workflow_definition',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'company_id', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'document_type', type: 'varchar' },
          { name: 'version', type: 'int' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [
          { name: 'IDX_WORKFLOW_DEFINITION_UNIQ', columnNames: ['company_id', 'document_type', 'version'], isUnique: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'workflow_step_definition',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'workflow_definition_id', type: 'int' },
          { name: 'step_number', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'approver_type', type: 'varchar' },
          { name: 'approver_value', type: 'varchar' },
          { name: 'auto_approve', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'workflow_condition',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'workflow_definition_id', type: 'int' },
          { name: 'expression', type: 'varchar' },
          { name: 'step_number', type: 'int' },
          { name: 'priority', type: 'int' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'workflow_instance',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'workflow_definition_id', type: 'int' },
          { name: 'document_type', type: 'varchar' },
          { name: 'document_id', type: 'int' },
          { name: 'status', type: 'varchar' },
          { name: 'current_step_number', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'workflow_step_instance',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'workflow_instance_id', type: 'int' },
          { name: 'step_number', type: 'int' },
          { name: 'status', type: 'varchar' },
          { name: 'assigned_to_user_id', type: 'int', isNullable: true },
          { name: 'assigned_to_role', type: 'varchar', isNullable: true },
          { name: 'assigned_to_department_id', type: 'int', isNullable: true },
          { name: 'started_at', type: 'timestamp', isNullable: true },
          { name: 'finished_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'workflow_action',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'step_instance_id', type: 'int' },
          { name: 'action_type', type: 'varchar' },
          { name: 'comment', type: 'varchar', isNullable: true },
          { name: 'acted_by', type: 'int', isNullable: true },
          { name: 'acted_at', type: 'timestamp' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'workflow_definition',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'core_company',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_step_definition',
      new TableForeignKey({
        columnNames: ['workflow_definition_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workflow_definition',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_condition',
      new TableForeignKey({
        columnNames: ['workflow_definition_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workflow_definition',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_instance',
      new TableForeignKey({
        columnNames: ['workflow_definition_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workflow_definition',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_step_instance',
      new TableForeignKey({
        columnNames: ['workflow_instance_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workflow_instance',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_step_instance',
      new TableForeignKey({
        columnNames: ['assigned_to_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'auth_user',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_step_instance',
      new TableForeignKey({
        columnNames: ['assigned_to_department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hr_department',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_action',
      new TableForeignKey({
        columnNames: ['step_instance_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workflow_step_instance',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_action',
      new TableForeignKey({
        columnNames: ['acted_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'auth_user',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dropForeignKeys = async (tableName: string, columnNames: string[]) => {
      const table = await queryRunner.getTable(tableName);
      if (!table) return;
      for (const column of columnNames) {
        const fk = table.foreignKeys.find((key) => key.columnNames.includes(column));
        if (fk) {
          await queryRunner.dropForeignKey(tableName, fk);
        }
      }
    };

    await dropForeignKeys('workflow_action', ['step_instance_id', 'acted_by']);
    await dropForeignKeys('workflow_step_instance', ['workflow_instance_id', 'assigned_to_user_id', 'assigned_to_department_id']);
    await dropForeignKeys('workflow_instance', ['workflow_definition_id']);
    await dropForeignKeys('workflow_condition', ['workflow_definition_id']);
    await dropForeignKeys('workflow_step_definition', ['workflow_definition_id']);
    await dropForeignKeys('workflow_definition', ['company_id']);

    await queryRunner.dropTable('workflow_action');
    await queryRunner.dropTable('workflow_step_instance');
    await queryRunner.dropTable('workflow_instance');
    await queryRunner.dropTable('workflow_condition');
    await queryRunner.dropTable('workflow_step_definition');
    await queryRunner.dropTable('workflow_definition');
  }
}
