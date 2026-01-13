import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSecurityAndAuditFieldsToUsuario26120000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("usuarios", [
            // No MySQL, use 'tinyint' com width 1 para booleano
            new TableColumn({
                name: "termosAceitos",
                type: "tinyint",
                width: 1,
                default: 0
            }),
            new TableColumn({
                name: "termosAceitosEm",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "twoFactorSecret",
                type: "varchar",
                length: "255", // Sempre defina tamanho para varchar no MySQL
                isNullable: true
            }),
            new TableColumn({
                name: "twoFactorEnabled",
                type: "tinyint",
                width: 1,
                default: 0
            }),
            // Verifique se seu MySQL é 5.7+ para usar JSON
            new TableColumn({
                name: "codigosReserva",
                type: "json",
                isNullable: true
            }),
            new TableColumn({
                name: "tokenVersion",
                type: "int",
                default: 0
            }),
            new TableColumn({
                name: "ultimoLoginEm",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "ultimoLoginIp",
                type: "varchar",
                length: "45", // Padrão para IPv6
                isNullable: true
            }),
            new TableColumn({
                name: "refreshTokenHash",
                type: "varchar",
                length: "255",
                isNullable: true
            }),
            new TableColumn({
                name: "refreshTokenExpiraEm",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "tentativasLoginFalhas",
                type: "int",
                default: 0
            }),
            new TableColumn({
                name: "bloqueadoAte",
                type: "timestamp",
                isNullable: true
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Importante: dropColumns precisa de um array de strings com os nomes exatos
        await queryRunner.dropColumns("usuarios", [
            "termosAceitos",
            "termosAceitosEm",
            "twoFactorSecret",
            "twoFactorEnabled",
            "codigosReserva",
            "tokenVersion",
            "ultimoLoginEm",
            "ultimoLoginIp",
            "refreshTokenHash",
            "refreshTokenExpiraEm",
            "tentativasLoginFalhas",
            "bloqueadoAte"
        ]);
    }
}