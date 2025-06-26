# Contributing to Rial Exchange Rates Archive

Thank you for your interest in contributing to this project! Please follow these guidelines to ensure a smooth
contribution process.

## Project Structure

```
src/
├── assets/          # Static assets (images, styles)
├── components/      # Reusable Vue components
│   ├── ui/         # Basic UI components
│   └── features/   # Feature-specific components
├── composables/     # Vue composition functions
├── constants/       # Application constants
├── plugins/         # Vue plugins
├── router/          # Vue Router configuration
├── services/        # API and external services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── views/          # Page-level components
```

## Code Standards

### Vue Components

- Use `<script setup>` syntax for new components
- Use TypeScript for all script sections
- Follow the composition API pattern
- Use props validation with TypeScript interfaces

### Naming Conventions

- Components: PascalCase (e.g., `ExchangeRateChart.vue`)
- Composables: camelCase starting with 'use' (e.g., `useTheme.ts`)
- Files: kebab-case for regular files, PascalCase for components
- Directories: kebab-case

### Import Aliases

Use path aliases for cleaner imports:

```typescript
import {SomeComponent} from '@/components'
import {someService} from '@/services'
import type {SomeType} from '@/types'
```

## Pull Request Process

1. Create a feature branch
2. Make your changes following the code standards
3. Run all checks: `npm run lint && npm run type-check`
4. Run the formatting command: `npm run format`
5. Update documentation if needed
6. Submit a pull request

## Commit Messages

Follow conventional commits format:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `style: formatting changes`
- `refactor: code refactoring`
- `test: adding tests`
- `chore: maintenance tasks`

## Questions?

Feel free to open an issue for questions or discussions about the project.
