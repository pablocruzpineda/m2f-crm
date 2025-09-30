# Contributing to M2F CRM

First off, thank you for considering contributing to M2F CRM! It's people like you that make M2F CRM such a great tool.

## 🌟 Ways to Contribute

- Report bugs
- Suggest new features or enhancements
- Improve documentation
- Submit pull requests
- Help answer questions in discussions
- Write tutorials or blog posts
- Share the project with others

## 📋 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Note your environment** (OS, browser, Node version)

## 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

## 🔧 Pull Request Process

1. **Fork the repository** and create your branch from `develop`
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`

2. **Follow the project structure** (Feature-Sliced Design)
   - Place files in the correct layer (features, entities, shared, etc.)
   - Follow the naming conventions
   - Export through index.ts files

3. **Write clean, readable code**
   - Use TypeScript strictly
   - Follow functional programming patterns (unless OOP makes sense)
   - Write descriptive variable and function names
   - Add comments for complex logic

4. **Write tests**
   - Unit tests for utilities and functions
   - Integration tests for features
   - Ensure tests pass: \`npm test\`

5. **Update documentation**
   - Update README if needed
   - Add JSDoc comments to functions
   - Update CHANGELOG.md

6. **Format your code**
   \`\`\`bash
   npm run format
   \`\`\`

7. **Commit your changes** using conventional commits
   \`\`\`bash
   git commit -m "feat: add amazing feature"
   \`\`\`

   Commit types:
   - \`feat:\` - New feature
   - \`fix:\` - Bug fix
   - \`docs:\` - Documentation changes
   - \`style:\` - Code style changes (formatting, etc.)
   - \`refactor:\` - Code refactoring
   - \`test:\` - Adding or updating tests
   - \`chore:\` - Maintenance tasks

8. **Push to your fork**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`

9. **Open a Pull Request**
   - Fill in the PR template
   - Link related issues
   - Request review from maintainers

## 📐 Architecture Guidelines

### Feature-Sliced Design Structure

\`\`\`
src/
├── app/        - App initialization, providers, routing
├── pages/      - Route pages (composition only)
├── widgets/    - Complex UI blocks
├── features/   - User interactions and business logic
├── entities/   - Business entities (data models)
└── shared/     - Reusable code
\`\`\`

### Dependency Rule

- **Never import from upper layers**
- \`shared\` can't import from \`entities\`
- \`entities\` can't import from \`features\`
- \`features\` can't import from \`pages\`

### File Organization

Each feature/component should have:
\`\`\`
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── useComponentName.ts (if needed)
├── types.ts (if needed)
└── index.ts (public exports)
\`\`\`

## 🎨 Code Style

### TypeScript
- Enable all strict mode options
- Use \`type\` for type imports: \`import type { User } from './types'\`
- Prefer interfaces for objects, types for unions
- Use Zod for runtime validation

### React
- Prefer functional components
- Use hooks for state and side effects
- Keep components small and focused
- Extract complex logic to custom hooks

### Naming Conventions
- Components: PascalCase (\`ContactCard\`)
- Functions/variables: camelCase (\`getUserData\`)
- Constants: UPPER_SNAKE_CASE (\`MAX_ITEMS\`)
- Types/Interfaces: PascalCase (\`User\`, \`ContactData\`)
- Files: PascalCase for components, camelCase for utilities

### Comments
\`\`\`typescript
/**
 * Get user by ID
 * 
 * @param id - User ID
 * @returns User object or null
 */
export const getUserById = async (id: string) => {
  // Implementation
}
\`\`\`

## 🧪 Testing

- Write tests for all new features
- Aim for >70% code coverage
- Test edge cases and error handling
- Use descriptive test names

\`\`\`typescript
describe('ContactCard', () => {
  it('should display contact name and email', () => {
    // Test implementation
  });

  it('should call onEdit when edit button is clicked', () => {
    // Test implementation
  });
});
\`\`\`

## 📦 Adding Dependencies

- Discuss major dependencies in an issue first
- Keep bundle size in mind
- Check for existing alternatives in the project
- Update package.json with exact versions

## 🔒 Security

- Never commit sensitive data (.env files)
- Follow security best practices
- Report security vulnerabilities privately

## 📝 Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Create ADRs (Architecture Decision Records) for major decisions
- Keep API documentation up to date

## ❓ Questions?

- Check existing issues and discussions
- Ask in GitHub Discussions
- Join our Discord community

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

Happy coding! 🚀
