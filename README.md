# SmartField Connect

SmartField Connect is a web and mobile-ready application for agricultural field operations. It centralizes projects, tasks, supplier interactions, dashboards, and user workflows for teams working around farms and field activities.

The repository is useful as a portfolio project because it shows React, TypeScript, Supabase, authentication flows, dashboard UI, and mobile packaging with Capacitor.

## Features

- Agricultural project dashboard with task and progress views
- Authentication and protected routes
- Supplier and conversation workflows
- Supabase-backed data services and Edge Functions
- Responsive React interface with Tailwind CSS and shadcn/ui
- Capacitor setup for Android builds

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
- Capacitor

## Project Structure

```text
smartfield-connect/
|-- android/        # Capacitor Android project
|-- public/         # Static assets
|-- src/            # React application source
|-- supabase/       # Supabase config and functions
|-- package.json
`-- README.md
```

## Run Locally

```bash
npm install
npm run dev
```

The Vite development server will print the local URL in the terminal.

## Build

```bash
npm run build
```

## Notes

This project was built as an applied agriculture management application. The strongest technical signals are the frontend architecture, Supabase integration, authentication flow, dashboard structure, and mobile-ready setup.
