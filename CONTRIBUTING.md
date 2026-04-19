# Contributing to Rial Exchange Rates Archive

Thank you for your interest in contributing to this project! Please follow these guidelines to ensure a smooth
contribution process.

## Project Structure

```
src/
├── components/      # Reusable Vue components
├── composables/     # Vue composition functions
├── constants/       # Application constants and presets
├── services/        # Data fetching services
├── styles/          # Global CSS and design tokens
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Code Standards

### Vue Components

- Use `<script setup>` syntax for new components
- Use TypeScript for all script sections
- Follow the composition API pattern
- Use props validation with TypeScript interfaces

### Naming Conventions

- Components: PascalCase (e.g., `LineChart.vue`)
- Composables: camelCase starting with 'use' (e.g., `useTheme.ts`)
- Files: kebab-case for regular files, PascalCase for components
- Directories: kebab-case


## Pull Request Process

1. Create a feature branch
2. Make your changes following the code standards
3. Run all checks: `bun run lint && bun run typecheck`
4. Run the formatting command: `bun run format`
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
