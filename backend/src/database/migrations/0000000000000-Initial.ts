import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial0000000000000 implements MigrationInterface {
    name = 'Initial0000000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {}

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
