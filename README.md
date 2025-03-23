# PwZap: Secure Password Generator

A modern, user-friendly web application for generating secure passwords and passphrases with customizable options. Built with Next.js and TypeScript.

## Features

- **Dual Generation Modes**: Create both random passwords and memorable passphrases
- **Customization Options**:
  - Basic/Advanced security levels
  - Adjustable password length (8-32 characters)
  - Variable word count for passphrases (4-16 words)
  - Custom separators, symbols, and capitalization options
- **Client-Side Processing**: All password generation happens in the browser for maximum security
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Automatically adapts to your system preferences

## Technical Details

- Built with Next.js and TypeScript
- Zero external dependencies for core password generation logic
- Secure API implementation for word fetching with content filtering
- Copy-to-clipboard functionality with fallback methods
- Modern UI with accessible design patterns

## Security

- No passwords are stored or transmitted
- Includes security hardening against inappropriate content
- Server-side API route for secure word generation

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

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/words](http://localhost:3000/api/words). This endpoint is used for secure word generation.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
