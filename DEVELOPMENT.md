# 📚 Guia de Desenvolvimento CRONOS-APP

Este documento detalha as melhores práticas, padrões de código e como usar os novos recursos implementados.

## 🏗️ Arquitetura

### Gerenciamento de Estado (Zustand)

Toda aplicação utiliza a store Zustand centralizada. **Nunca use useState para estado global.**

**Arquivo**: `src/store/index.js`

#### Exemplo de Uso:

```javascript
import { useStore } from "@store";

export function DiasList() {
  // Acessar múltiplos valores
  const { dias, filtros, setDiaAtual } = useStore();

  const handleClickDia = (dia) => {
    setDiaAtual(dia);
  };

  return (
    <div>
      {dias.map((dia) => (
        <button key={dia.id} onClick={() => handleClickDia(dia)}>
          {dia.data}
        </button>
      ))}
    </div>
  );
}
```

#### Operações Comuns:

```javascript
const { useStore } = require("@store");

// DIAS
const dias = useStore((state) => state.dias);
useStore.setState((state) => ({ dias: [...state.dias, novoDia] }));

// TAREFAS
useStore.getState().addTarefa(diaId, tarefa);
useStore.getState().updateTarefa(diaId, tarefaId, { apontado: true });
useStore.getState().removeTarefa(diaId, tarefaId);

// FILTROS
useStore.getState().setFiltros({ status: "pendentes", mes: 3 });

// TEMA
useStore.getState().setTema("dark");

// BACKLOG
useStore.getState().addBacklogItem(item);
```

---

## ✋ Tratamento de Erros API

Todos os erros de API são tratados automaticamente com toasts visuais.

**Arquivo**: `src/api/errorHandler.js`

#### Forma Simplificada (Recomendado):

```javascript
import { executeApiCall } from "@api/errorHandler";
import { diasAPI } from "@api";

async function carregarDias() {
  const dias = await executeApiCall(() => diasAPI.getDias());
  if (dias) {
    useStore.setState({ dias });
  }
}
```

#### Forma Avançada (com opções):

```javascript
import { handleApiError } from "@api/errorHandler";

try {
  const response = await diasAPI.getDias();
} catch (error) {
  const erro = handleApiError(error, {
    showToast: false, // Não exibir toast automático
    returnError: true, // Retornar objeto de erro estruturado
  });

  if (erro.status === 401) {
    // Tratamento especial para unauthorized
  }
}
```

---

## 🔧 Variáveis de Ambiente

Todas as configurações críticas usam variáveis de ambiente.

**Arquivo**: `.env` (não versionar), `.env.example` (versionar)

### Acessar em Componentes:

```javascript
import { API_CONFIG, FEATURES } from "@constants";

console.log(API_CONFIG.BASE_URL); // "http://localhost:8080/api"
console.log(API_CONFIG.TIMEOUT); // 5000
console.log(FEATURES.LOGS_HABILITADOS); // true/false
```

---

## 📦 Constants Globais

Todos os valores "mágicos" devem estar em `src/constants/index.js`.

```javascript
import {
  TEMAS, // Array de temas disponíveis
  STORAGE_KEYS, // Chaves de localStorage
  API_CONFIG, // Configuração de API
  ENDPOINTS, // Rotas da API
  MENSAGENS_ERRO, // Mensagens de erro
  STATUS_TAREFA, // Status de tarefas
  VALIDAÇÕES, // Regras de validação
  FEATURES, // Feature flags
} from "@constants";
```

#### Exemplo:

```javascript
// ❌ Evitar
if (tarefa.status === "completa") {
}

// ✅ Bom
import { STATUS_TAREFA } from "@constants";
if (tarefa.status === STATUS_TAREFA.COMPLETA) {
}
```

---

## 🎨 Estrutura de Componentes

### Nova Organização:

```
src/components/
├── Cards/           # Exibição de dados (TaskCard, DiaCard, etc)
├── Forms/           # Formulários (BacklogPanel, etc)
├── Layout/          # Estrutura (Header, Footer, etc)
└── Common/          # Genéricos (SeletorData, SeletorTema, etc)
```

### Convenções:

1. **Um componente por arquivo**
2. **CSS junto ao JSX**
3. **Nomes em PascalCase**
4. **Props bem documentadas**

#### Exemplo de Componente:

```javascript
// src/components/Cards/DiaCard.jsx
import { useStore } from "@store";
import "./DiaCard.css";

/**
 * Card que exibe um dia
 * @param {Object} dia - Dia a exibir
 * @param {Function} onSelect - Callback ao selecionar
 */
export default function DiaCard({ dia, onSelect }) {
  const { setDiaAtual } = useStore();

  const handleClick = () => {
    setDiaAtual(dia);
    onSelect?.(dia);
  };

  return (
    <div className="dia-card" onClick={handleClick}>
      <h3>{dia.data}</h3>
      <p>{dia.tarefas?.length} tarefas</p>
    </div>
  );
}
```

---

## 📝 Imports com Path Aliases

Sempre usar path aliases configurados em `vite.config.js`:

```javascript
// ✅ BOM
import { TaskCard, DiaCard } from "@components/Cards";
import { diasAPI } from "@api";
import { useStore } from "@store";
import { TEMAS } from "@constants";
import { formatarDuracao } from "@utils/tempo";

// ❌ RUIM
import TaskCard from "../../../components/Cards/TaskCard";
```

#### Aliases Disponíveis:

- `@api` - `src/api`
- `@components` - `src/components`
- `@constants` - `src/constants`
- `@context` - `src/context`
- `@hooks` - `src/hooks`
- `@libs` - `src/libs`
- `@pages` - `src/pages`
- `@store` - `src/store`
- `@styles` - `src/styles`
- `@utils` - `src/utils`
- `@views` - `src/views`

---

## 🔄 Fluxo de Dados

```
API Layer (@api)
     ↓
Error Handler (@api/errorHandler)
     ↓
Zustand Store (@store)
     ↓
Components (@components)
```

### Exemplo Completo:

```javascript
// 1. Em um componente
import { useStore } from "@store";
import { diasAPI } from "@api";
import { executeApiCall } from "@api/errorHandler";

export function HomeView() {
  const { dias, setDias } = useStore();

  useEffect(() => {
    loadDias();
  }, []);

  async function loadDias() {
    const data = await executeApiCall(() => diasAPI.getDias());
    if (data) {
      setDias(data); // Atualizar store
    }
  }

  return (
    <div>
      {dias.map((dia) => (
        <DiaCard key={dia.id} dia={dia} />
      ))}
    </div>
  );
}
```

---

## 🎯 Checklist para Novo Componente

- [ ] Criar arquivo em subpasta apropriada (Cards, Forms, Layout, Common)
- [ ] Arquivo CSS junto ao JSX
- [ ] Imports usando path aliases
- [ ] Usar `useStore` para estado global
- [ ] Adicionar comentário JSDoc
- [ ] Exportar em `index.js` da subpasta
- [ ] Atualizar `components/index.js` se necessário

---

## 🐛 Debugging

### Inspecionar State (Zustand)

```javascript
// No console do navegador
const state = window.useStore.getState();
console.log(state.dias);
console.log(state.filtros);
```

### Logs Estruturados

Enabled/disabled via `VITE_ENABLE_LOGS` no `.env`:

```javascript
import { FEATURES } from "@constants";

if (FEATURES.LOGS_HABILITADOS) {
  console.log("[MyComponent] renderizando...");
}
```

### React DevTools

- Extensão recomendada: "React Developer Tools" (Chrome/Firefox)
- Visualize hierarquia de componentes
- Inspecione props e estado

---

## ✅ Checklist de PR

Antes de fazer commit:

- [ ] Sem imports desnecessários
- [ ] Nomes de variáveis claros
- [ ] Sem valores mágicos (usar constants)
- [ ] Sem `console.log` em código de produção
- [ ] Tratamento de erro implementado
- [ ] Path aliases usados
- [ ] CSS bem organizado
- [ ] Componente reutilizável se possível

---

## 📚 Recursos Úteis

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hooks](https://react.dev/reference/react)

---

**Questões?** Abra uma issue ou discuta no team! 🚀
