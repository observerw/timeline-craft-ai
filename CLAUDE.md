# GEMINI.md

## Project Overview

This project is **Timeline Craft AI**, an intelligent video creation tool. It allows users to create video content from text descriptions using a timeline-based editor.

The application is built with a modern frontend stack:

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Linting:** ESLint
- **Formatting:** Prettier

The core features include a timeline for managing video segments, AI-powered image generation for video frames, and automated video synthesis.

## Building and Running

### Development

To run the application in a local development environment:

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the development server:**

   ```bash
   pnpm run dev
   ```

### Production Build

To create a production-ready build of the application:

```bash
pnpm run build
```

### Linting

To check the code for linting errors:

```bash
pnpm run lint
```

## Development Conventions

- **Code Style:** The project uses Prettier for automated code formatting.
- **Linting:** ESLint is configured to enforce code quality and catch potential errors.
- **Git Hooks:** Husky is used to run pre-commit hooks, ensuring that code is formatted and linted before being committed.

---

## Technical Guidance for Developers

### Project Structure

The `src` directory is organized as follows:

- `components/`: Contains all React components.
  - `ui/`: Reusable, generic UI components from `shadcn/ui`. These should be stateless and presentation-focused.
  - `studio/`: Components specific to the video editing studio interface, which may contain business logic.
- `hooks/`: Custom React hooks for shared logic (e.g., `use-mobile` for responsive checks).
- `lib/`: Utility functions and libraries (e.g., `utils.ts` for helper functions).
- `pages/`: Top-level page components that are mapped to routes.
- `App.tsx`: The main application component where routing is defined.
- `main.tsx`: The entry point of the application.

### Adding New Components

#### UI Components (shadcn/ui)

This project uses `shadcn/ui` for its component library. To add a new component from the library:

1. **Use the CLI:** Run the following command and select the component you need:

   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

   This will add the component's source file to `src/components/ui`.

2. **Import and Use:** Import the new component from its file in `src/components/ui` and use it in your code.

#### Custom Components

For new features, create custom components inside the most relevant directory (e.g., `src/components/studio` for editor-related features).

- **File Naming:** Use PascalCase for component file names (e.g., `MyNewComponent.tsx`).
- **Structure:** Keep components focused on a single responsibility. If a component becomes too complex, break it down into smaller, more manageable components.
- **Styling:** Use Tailwind CSS classes for styling. Avoid writing separate CSS files unless absolutely necessary.

### State Management

The application uses **TanStack Query (React Query)** for managing server state (fetching, caching, and updating data from APIs).

- **Usage:** When fetching data, use the `useQuery` hook. For mutations (creating, updating, deleting data), use `useMutation`.
- **Location:** API-related hooks should be co-located with the features that use them or placed in a dedicated `src/queries` directory if the application scales.

For client-side state that needs to be shared across multiple components, use React Context or a dedicated state management library if the complexity grows.

### Routing

Routing is handled by **React Router**.

- **Configuration:** Routes are defined in `src/App.tsx`.
- **Adding a New Page:**
  1. Create a new page component in `src/pages` (e.g., `About.tsx`).
  2. Import the new page in `App.tsx` and add a new `<Route>` entry.

### Troubleshooting

- **Dependency Issues:** If you encounter issues after pulling new changes, run `pnpm install` to ensure all dependencies are up-to-date.
- **Linting/Formatting Errors:** Run `pnpm run lint` and `pnpm run format` to automatically fix many common errors. The pre-commit hook should prevent these from being committed, but it's good practice to run them manually.
- **Build Failures:** Check the console output from `pnpm run build` for specific errors. Often, these are related to TypeScript type errors or incorrect import paths.
