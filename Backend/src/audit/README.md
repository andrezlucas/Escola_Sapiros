# Módulo Audit - Auditoria de Ações

## Visão Geral
O módulo `Audit` registra ações relevantes do sistema de forma legível e segura, adequada para auditoria administrativa. Ele captura automaticamente ações marcadas com `@Audit` em controllers e também permite chamadas diretas via `AuditService.log()`.

## Estrutura Criada

### Entidade
- **AuditLog** ([entities/audit-log.entity.ts](entities/audit-log.entity.ts))
  - `id`: UUID (PK)
  - `usuario_id`, `usuario_nome`, `usuario_role`: dados do usuário (cópia para leitura)
  - `acao`: descrição humana da ação
  - `entidade`, `entidade_id`: qual registro foi afetado
  - `descricao`: texto livre opcional
  - `metadata`: JSON com dados estruturados (sem PII sensível)
  - `ip`, `user_agent`: contexto da requisição
  - `criado_em`: timestamp (indexado)

### Decorator `@Audit`
Permite marcar handlers para auditoria automática:
```ts
@Audit({ action: AUDIT_ACTIONS.CREATE_AVISO, entity: 'Aviso', entityIdPath: 'id' })
@Post()
async create(@Body() dto: CreateAvisoDto, @Req() req: AuthRequest) {
  return this.avisosService.create(dto, req.user);
}
```

### Mapeamento de Ações
[audit.actions.ts](audit.actions.ts) centraliza ações → texto humano:
- `CREATE_AVISO`: "Criou um aviso"
- `UPLOAD_MATERIAL`: "Enviou um material"
- `TOGGLE_USUARIO_STATUS`: "Alterou status de usuário"
- ... (veja o arquivo completo)

### Interceptor Global
`AuditInterceptor` (registrado via `APP_INTERCEPTOR`) só atua se o handler tiver `@Audit`. Ele:
- Extrai `req.user`, `req.ip`, `req.headers['user-agent']`
- Após sucesso do handler, chama `AuditService.log`
- Falhas no log **não** quebram a operação principal

### SecurityAuditInterceptor
Captura eventos de segurança globalmente:
- Login falho, acesso negado, senha expirada
- Tokens inválidos, falha no 2FA
- Contas bloqueadas, tentativas suspeitas
- **Não interfere** no fluxo principal

### AccessAuditMiddleware
Registra acessos a recursos:
- Downloads de arquivos
- Geração de relatórios
- Acesso a recursos protegidos
- **Ignora** arquivos estáticos e health checks

### SystemAuditService
Serviço para eventos de sistema:
- Backup e restauração de dados
- Exportação/importação em massa
- Envio de emails transacionais
- Geração de relatórios administrativos

### Endpoints Administrativos
Base: `/admin/audit` (apenas `Role.COORDENACAO`)

#### GET `/admin/audit`
Consulta paginada com filtros:
- Query params: `usuario_id`, `acao`, `entidade`, `entidade_id`, `usuario_role`, `startDate`, `endDate`, `page`, `limit`
- Resposta: `{ data, meta: { total, page, lastPage } }`

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/admin/audit?acao=Criou&page=1&limit=20" \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### DELETE `/admin/audit/purge`
Remove logs anteriores a uma data:
- Query: `before=YYYY-MM-DD` (obrigatório)
- Resposta: `{ message: "Purge concluído com sucesso." }`

**Exemplo:**
```bash
curl -X DELETE "http://localhost:3000/admin/audit/purge?before=2024-01-01" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Segurança e Retenção

- **Não armazena PII sensível**: senhas, tokens, CPFs completos, etc.
- **Truncamento**: `descricao` (2000 chars), `metadata` (4000 chars JSON)
- **Índices**: `criado_em`, `usuario_id`, `acao`, `(entidade, entidade_id)`
- **Retenção sugerida**: 365 dias (use endpoint `purge` para limpeza)

## Como Usar

### 1) Marcar handlers com `@Audit`
```ts
import { Audit } from '../audit/audit.decorator';
import { AUDIT_ACTIONS } from '../audit/audit.actions';

@Audit({ action: AUDIT_ACTIONS.CREATE_TURMA, entity: 'Turma', entityIdPath: 'id' })
@Post()
async create(@Body() dto: CreateTurmaDto, @Req() req: AuthRequest) {
  return this.turmaService.create(dto);
}
```

### 2) Chamada direta (services internos)
```ts
import { AuditService } from '../audit/audit.service';

await this.auditService.log({
  usuario_id: user.id,
  usuario_role: user.role,
  acao: 'Realizou login',
  entidade: 'Usuario',
  entidade_id: user.id,
  ip: req.ip,
  user_agent: req.headers['user-agent'],
});
```

## Migração

A entidade foi registrada em:
- `data-source.ts`
- `app.module.ts` (com interceptor global)

**Para gerar a migration:**
```bash
cd Backend
npm run build
npm run migration:generate -- -d src/data-source.ts src/database/migrations/CreateAuditLogsTable
```

**Para executar a migration:**
```bash
npm run migration:run -- -d src/data-source.ts
```

## Arquivos Criados

```
src/audit/
├── entities/
│   └── audit-log.entity.ts
├── dto/
│   ├── filter-audit.dto.ts
│   ├── purge-audit.dto.ts
│   └── create-audit.dto.ts
├── audit.actions.ts
├── audit.sanitize.ts
├── audit.decorator.ts
├── audit.interceptor.ts
├── audit.service.ts
├── audit.controller.ts
└── audit.module.ts
```

## Observações

- Logs são gravados de forma assíncrona e resiliente; falhas não afetam o fluxo principal.
- `userName` é buscado automaticamente quando não fornecido.
- `metadata` pode ser usado para registrar mudanças (`{ changes: { campo: [old, new] } }`).
- O interceptor só atua se houver `@Audit`; handlers sem decorator são ignorados.

## Próximos Passos

1. **Instalar dependências** (se necessário):
   ```bash
   cd Backend
   npm install
   ```

2. **Gerar e executar migração**:
   ```bash
   npm run build
   npm run migration:generate -- -d src/data-source.ts src/database/migrations/CreateAuditLogsTable
   npm run migration:run -- -d src/data-source.ts
   ```

3. **Testar endpoints** via Postman/Insomnia/cURL

4. **Adicionar `@Audit`** em outros handlers conforme necessidade.
