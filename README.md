# PetGuia Quiz Web

Versão web do quiz/onboarding do app PetGuia, construída com Next.js, TypeScript, Tailwind CSS e Zustand.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Estado Global:** Zustand (com persistência)
- **Ícones:** Lucide React
- **Fontes:** BB Anonym Pro (local) e Montserrat (Google Fonts)

## Estrutura do Projeto

- `/app`: Páginas e layout (App Router)
- `/components`: Componentes React
  - `/quiz`: Componentes específicos do quiz
    - `/steps`: Componentes para cada etapa do fluxo
- `/store`: Gerenciamento de estado com Zustand (`quizStore.ts`)
- `/types`: Definições de tipos TypeScript (`quiz.ts`)
- `/constants`: Dados estáticos (`quizData.ts`, `breeds.ts`)
- `/lib`: Utilitários (`utils.ts`, `slugify.ts`, `imageHelpers.ts`)
- `/public`: Assets estáticos (imagens, fontes)

## Fluxo Implementado

Atualmente, o fluxo "Behavior" está completamente implementado, seguindo a ordem:

1. Carousel Intro
2. Intention
3. Gender
4. Name
5. Age
6. Breed
7. Social Proof (Interstitial)
8. Health
9. Activity
10. Commands
11. Identification (Slider)
12. Intermediate (Interstitial)
13. Problems (+ Priority Modal)
14. Identification Problem (Slider)
15. Context
16. Impact
17. Specific Situation
18. Path A/B
19. Progress Screen (Interstitial)
20. Time
21. Preparation (Loading)
22. Result
23. Paywall (Placeholder)

## Como Rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse `http://localhost:3000` (redireciona automaticamente para `/quiz`).

## Notas de Desenvolvimento

- O estado do quiz é persistido no `localStorage`.
- As imagens são carregadas dinamicamente com base na raça e nível de atividade.
- O design system segue fielmente as especificações do app mobile.
