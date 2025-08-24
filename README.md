This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## UI Components and shadcn Conventions

- **Default UI path**: Place reusable primitives in `components/ui/` (e.g., `components/ui/button.tsx`).
- **Blocks**: Place higher-level sections (marketing, hero, etc.) in `components/blocks/` (e.g., `components/blocks/hero-section-9.tsx`).
- **Utilities**: Common helpers live in `lib/` (e.g., `lib/utils.ts` provides `cn`).

### Installed Block: Hero Section 9
- Entry: `components/blocks/hero-section-9.tsx` exporting `HeroSection`.
- Demo: `components/blocks/demo.tsx` rendering `HeroSection`.
- Integrated on `app/page.tsx` above the editor.

### Required Dependencies for shadcn Button
Install once:

```bash
npm i @radix-ui/react-slot class-variance-authority
```

### Tailwind and Theme Tokens
This project uses Tailwind CSS v4 with design tokens in `app/globals.css` using CSS variables and the `@theme` inline mapping for shadcn-compatible colors (background, foreground, primary, secondary, accent, muted, destructive, border, input, ring, radius).

### Optional: shadcn CLI
If you prefer generating components via CLI:

```bash
npx shadcn@latest init
# then add components, e.g.
npx shadcn@latest add button
```

This repository already includes a Button in `components/ui/button.tsx`, compatible with shadcn API.
