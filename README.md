# 🕐 CRONOS-APP

Aplicativo web moderno para **gestão de tempo e apontamento de horas**, com rastreamento de tarefas diárias, categorização e exportação em Excel.

## ✨ Características

- ✅ **Registro de Horas**: Entrada, saída, intervalo de almoço
- ✅ **Gestão de Tarefas**: Criar, editar, remover tarefas com categorias e clientes
- ✅ **Apontamentos**: Marcar tarefas como "apontadas" (faturadas)
- ✅ **Backlog**: Gerenciar tarefas futuras
- ✅ **Temas Customizáveis**: 4 opções de temas com persistência em localStorage
- ✅ **Exportação**: Gerar relatórios em Excel
- ✅ **Responsivo**: Design adaptável para mobile e desktop

## 🚀 Tech Stack

| Tecnologia         | Versão  | Propósito                    |
| ------------------ | ------- | ---------------------------- |
| **React**          | 19.2.0  | Framework UI                 |
| **Vite**           | 7.2.4   | Build tool (⚡ muito rápido) |
| **Tailwind CSS**   | 3.4.18  | Estilização utility-first    |
| **Zustand**        | Latest  | Gerenciamento de estado      |
| **Axios**          | 1.13.4  | Cliente HTTP                 |
| **React Toastify** | 11.0.5  | Notificações                 |
| **Lucide React**   | 0.554.0 | Ícones SVG                   |
| **ESLint**         | 9.39.1  | Linting                      |

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Integração com backend REST
│   ├── axios.js           # Configuração Axios com interceptors
│   ├── errorHandler.js    # Tratamento centralizado de erros
│   └── *.js               # Rotas da API (dias, tarefas, etc)
│
├── components/            # Componentes React reutilizáveis
│   ├── Cards/            # Componentes de exibição (TaskCard, DiaCard, etc)
│   ├── Forms/            # Componentes de formulário (BacklogPanel)
│   ├── Layout/           # Header, footer, layout
│   └── Common/           # Componentes genéricos (SeletorData, SeletorTema, etc)
│
├── context/              # Context API
│   └── ThemeContext.jsx  # Gerenciamento de temas
│
├── hooks/                # Custom hooks
│   ├── useDias.js        # Hook para gerenciar dias
│   └── useTaskForm.js    # Hook para formulário de tarefas
│
├── pages/                # Páginas principais
│   └── LandingPage.jsx   # Container principal
│
├── views/                # Views/telas específicas
│   ├── HomeView.jsx      # Lista de dias com filtros
│   └── DetalhesView.jsx  # Detalhes de um dia
│
├── store/                # Zustand store
│   └── index.js          # Estado centralizado da app
│
├── constants/            # Constantes globais
│   └── index.js          # Temas, endpoints, mensagens, etc
│
├── utils/                # Funções utilitárias
│   ├── dateUtils.js      # Manipulação de datas
│   ├── tempo.js          # Cálculos de tempo/duração
│   └── index.js          # Exports centralizados
│
├── styles/               # CSS global
│   ├── style.css         # Estilos base
│   ├── components.css    # Estilos de componentes
│   └── variables.css     # Variáveis CSS
│
└── libs/                 # Bibliotecas customizadas

```

## 🛠️ Instalação & Setup

### Pré-requisitos

- Node.js 18+
- npm 9+

### Passos

1. **Clonar o repositório**

   ```bash
   git clone <repo-url>
   cd CRONOS-APP
   ```

2. **Instalar dependências**

   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**

   ```bash
   # Copiar template de env
   cp .env.example .env

   # Editar .env com suas configurações (URL do backend, etc)
   ```

4. **Iniciar servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

   A aplicação abrirá em `http://localhost:5173`

5. **Build para produção**
   ```bash
   npm run build
   ```

## 📖 Guia de Desenvolvimento

### Variáveis de Ambiente

```env
# .env
VITE_API_URL=http://localhost:8080/api     # URL do backend
VITE_API_TIMEOUT=5000                      # Timeout em ms
VITE_ENV=development                       # Ambiente
VITE_ENABLE_LOGS=true                      # Habilitar logs
VITE_ENABLE_DEVTOOLS=true                  # Habilitar devtools Zustand
```

### Usando a Store (Zustand)

```javascript
import { useStore } from "@store";

export function MyComponent() {
  // Acessar estado
  const dias = useStore((state) => state.dias);
  const setDias = useStore((state) => state.setDias);

  // Ou desestruturar
  const { dias, addDia, removeDia } = useStore();

  return <div>{dias.length} dias</div>;
}
```

### Tratamento de Erros API

```javascript
import { executeApiCall } from "@api/errorHandler";

const loadDias = async () => {
  const data = await executeApiCall(() => diasAPI.list());
  // Erros são tratados automaticamente com toast
};
```

### Constants Globais

```javascript
import { TEMAS, API_CONFIG, ENDPOINTS, MENSAGENS_ERRO } from "@constants";

// Exemplo: usar configuração de API
console.log(API_CONFIG.BASE_URL);
```

### Path Aliases

Imports limpos com aliases configurados em `vite.config.js`:

```javascript
// ✅ Bom
import { Header } from "@components/Layout";
import { useStore } from "@store";
import { API_CONFIG } from "@constants";

// ❌ Evitar
import Header from "../../../components/Layout/Header";
```

## 🎨 Temas

A aplicação suporta 4 temas customizáveis:

- **Default**: Verde (padrão)
- **Rosa**: Tons de rosa
- **Dark**: Tema escuro
- **Dark Rosa**: Tema escuro com rosa

Temas são salvos em `localStorage` sob a chave `cronos-tema`.

## 🔌 API Integration

O backend deve estar rodando em `http://localhost:8080` com os seguintes endpoints:

```
GET    /api/dias              # Listar dias
POST   /api/dias              # Criar dia
PUT    /api/dias/{id}         # Atualizar dia
DELETE /api/dias/{id}         # Deletar dia

GET    /api/tarefas           # Listar tarefas
POST   /api/tarefas           # Criar tarefa
PUT    /api/tarefas/{id}      # Atualizar tarefa
DELETE /api/tarefas/{id}      # Deletar tarefa

GET    /api/categorias        # Listar categorias
GET    /api/clientes          # Listar clientes
GET    /api/backlog           # Listar backlog
POST   /api/export            # Exportar Excel
```

## 📦 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com HMR
npm run build    # Build otimizado para produção
npm run lint     # Verificar código com ESLint
npm run preview  # Previewar build de produção localmente
```

## 🐛 Debugging

### Zustand DevTools

Se `VITE_ENABLE_DEVTOOLS=true`, você pode inspecionar estado em: `http://localhost:5173?debug=true`

### Logs

Habilitar/desabilitar com `VITE_ENABLE_LOGS` no `.env`

### React DevTools

Extensão browser recomendada para inspecionar componentes

## 📝 Convenções de Código

### Nomes de Componentes

- PascalCase: `TaskCard.jsx`, `DiaCard.jsx`
- Um componente por arquivo
- Arquivo CSS junto ao JSX: `TaskCard.jsx` + `TaskCard.css`

### Hooks Customizados

- Nome com prefixo `use`: `useDias`, `useTaskForm`
- Arquivo em `src/hooks/`

### Imports

- Usar path aliases (@components, @api, etc)
- Agrupar imports: react/libs → internos especializados
- Manter ordem alfabética quando possível

## 🚧 Roadmap de Melhorias

- [ ] TypeScript migration (gradual)
- [ ] Testes automatizados (vitest + RTL)
- [ ] Validação com Zod
- [ ] Progressive Web App (PWA)
- [ ] Offline-first com IndexedDB
- [ ] Dark mode melhorado
- [ ] i18n (internacionalização)

## 📄 Licença

[Sua Licença Aqui]

## 👤 Autor

[Seu Nome] - [@seu-github](https://github.com)

---

**Made with ❤️ using React + Vite + Tailwind**
