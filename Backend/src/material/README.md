# Módulo Material - Documentação

## Visão Geral
O módulo Material permite que Professores e Coordenadores façam upload e gerenciem materiais didáticos (PDFs, vídeos e links) associados a turmas e disciplinas.

## Estrutura Criada

### Entidades
- **Material** ([material.entity.ts](entities/material.entity.ts))
  - `id`: UUID único
  - `titulo`: Título do material (máx 200 caracteres)
  - `descricao`: Descrição opcional do material
  - `tipo`: PDF | VIDEO | LINK
  - `origem`: URL | LOCAL
  - `url`: URL externa (obrigatória se origem=URL)
  - `filePath`: Caminho do arquivo (se origem=LOCAL)
  - `mimeType`: Tipo MIME do arquivo
  - `tamanho`: Tamanho do arquivo em bytes
  - Relações: `professor` (obrigatório), `turma` (opcional), `disciplina` (opcional)

### Enums
- **TipoMaterial**: PDF, VIDEO, LINK
- **OrigemMaterial**: URL, LOCAL

### DTOs
- **CreateMaterialDto**: Validação para criar material
- **UpdateMaterialDto**: Validação para atualizar material
- **ListMaterialDto**: Filtros para listar materiais

### Rotas (Base: `/materiais`)

#### POST `/materiais`
Criar novo material (Professor/Coordenação)

**Multipart Form Data:**
```
titulo: string (obrigatório)
descricao: string (opcional)
tipo: 'PDF' | 'VIDEO' | 'LINK'
origem: 'URL' | 'LOCAL'
url: string (obrigatório se origem=URL)
turmaId: uuid (opcional)
disciplinaId: uuid (opcional)
file: arquivo (obrigatório se origem=LOCAL)
```

**Exemplo cURL - Upload LOCAL:**
```bash
curl -X POST http://localhost:3000/materiais \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "titulo=Apostila de Matemática" \
  -F "descricao=Material de apoio para trigonometria" \
  -F "tipo=PDF" \
  -F "origem=LOCAL" \
  -F "turmaId=uuid-da-turma" \
  -F "disciplinaId=uuid-da-disciplina" \
  -F "file=@/caminho/para/arquivo.pdf"
```

**Exemplo cURL - URL Externa:**
```bash
curl -X POST http://localhost:3000/materiais \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Vídeo Aula - Derivadas",
    "descricao": "Explicação sobre derivadas",
    "tipo": "VIDEO",
    "origem": "URL",
    "url": "https://youtube.com/watch?v=exemplo",
    "disciplinaId": "uuid-da-disciplina"
  }'
```

#### GET `/materiais`
Listar materiais com filtros opcionais

**Query Params:**
- `turmaId`: uuid (opcional)
- `disciplinaId`: uuid (opcional)
- `tipo`: PDF | VIDEO | LINK (opcional)

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/materiais?turmaId=uuid&tipo=PDF" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "titulo": "Apostila de Matemática",
    "descricao": "Material de apoio",
    "tipo": "PDF",
    "origem": "LOCAL",
    "filePath": "file-123456.pdf",
    "fileUrl": "http://localhost:3000/uploads/file-123456.pdf",
    "mimeType": "application/pdf",
    "tamanho": 1024000,
    "professor": { ... },
    "turma": { ... },
    "disciplina": { ... },
    "criadoEm": "2026-01-07T...",
    "atualizadoEm": "2026-01-07T..."
  }
]
```

#### GET `/materiais/:id`
Obter detalhes de um material específico

**Exemplo:**
```bash
curl -X GET http://localhost:3000/materiais/uuid-do-material \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### PATCH `/materiais/:id`
Atualizar material (Professor/Coordenação)

Aceita os mesmos campos do POST, todos opcionais. Pode incluir novo arquivo para substituir.

**Exemplo:**
```bash
curl -X PATCH http://localhost:3000/materiais/uuid-do-material \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "titulo=Novo Título" \
  -F "file=@/caminho/para/novo-arquivo.pdf"
```

#### DELETE `/materiais/:id`
Remover material (Professor/Coordenação)

Remove o registro e o arquivo físico (se LOCAL).

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/materiais/uuid-do-material \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Configuração

### Upload
- **Diretório**: `./uploads`
- **Formatos permitidos**: PDF, JPG, JPEG, MP4, AVI, MOV, MKV
- **Tamanho máximo**: 50MB
- **Servir arquivos**: `http://localhost:3000/uploads/{filename}`

### Permissões
- **Criar/Editar/Deletar**: Professor, Coordenação
- **Listar/Visualizar**: Todos (autenticados)

## Migração

A entidade foi criada e registrada em:
- [data-source.ts](../data-source.ts)
- [app.module.ts](../app.module.ts)

**Para gerar a migração:**
```bash
cd Backend
npm run build
npm run migration:generate -- -d src/data-source.ts src/database/migrations/CreateMaterialTable
```

**Para executar a migração:**
```bash
npm run migration:run -- -d src/data-source.ts
```

## Arquivos Criados

```
src/material/
├── enums/
│   ├── tipo-material.enum.ts
│   └── origem-material.enum.ts
├── entities/
│   └── material.entity.ts
├── dto/
│   ├── create-material.dto.ts
│   ├── update-material.dto.ts
│   └── list-material.dto.ts
├── material.controller.ts
├── material.service.ts
└── material.module.ts
```

## Próximos Passos

1. **Instalar dependências** (se necessário):
   ```bash
   cd Backend
   npm install
   ```

2. **Gerar e executar migração** (PC com acesso ao MySQL):
   ```bash
   npm run build
   npm run migration:generate -- -d src/data-source.ts src/database/migrations/CreateMaterialTable
   npm run migration:run -- -d src/data-source.ts
   ```

3. **Testar rotas** usando Postman/Insomnia/cURL

## Validações

- URL obrigatória se `origem=URL`
- Arquivo obrigatório se `origem=LOCAL`
- Professor é obrigatório (extraído do token JWT)
- Turma e Disciplina são opcionais
- Ao deletar, arquivo físico é removido automaticamente

## Observações

- Arquivos são armazenados em `./uploads` com nome único (timestamp + random)
- Arquivos antigos são removidos ao substituir ou deletar
- URLs de arquivos locais são retornadas automaticamente nas listagens
- Relações com Turma/Disciplina podem ser null (material geral)
