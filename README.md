# PersonaAI

PersonaAI is a Next.js application for creating, managing, and chatting with AI-driven personas. It supports persona-specific conversations, file ingestion to ground responses in your data, and optional avatar video sessions via HeyGen.

The project uses the App Router, Prisma for data, and a set of API routes to handle personas, conversations, messages, files, and HeyGen sessions.

**Key Features**

- Persona generation and listing
- Conversation threads per persona
- Chat UI with message roles
- File ingestion and retrieval for context
- Optional HeyGen session integration

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables in a `.env` file. See the Environment section below.

3. Set up Prisma schema and generate client

```bash
npm run prisma:generate
# If migrations are needed:
npm run prisma:migrate
```

4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

- **App Router**: Pages and routes under [app](app)
  - Home: [app/page.tsx](app/page.tsx)
  - Layout: [app/layout.tsx](app/layout.tsx)
  - Global styles: [app/globals.css](app/globals.css)
  - API routes: [app/api](app/api)
    - Chat: [app/api/chat/send](app/api/chat/send)
    - Conversation: [app/api/conversation](app/api/conversation)
    - Files: [app/api/file](app/api/file)
    - Health: [app/api/health/route.ts](app/api/health/route.ts)
    - HeyGen: [app/api/heygen/session](app/api/heygen/session)
    - Messages: [app/api/message/conversationMessages](app/api/message/conversationMessages)
    - Persona: [app/api/persona](app/api/persona)
- **Components**: UI and feature components under [components](components)
  - Home: [components/home](components/home)
  - Persona chat & sidebar: [components/persona](components/persona)
  - Settings (file ingest): [components/settings](components/settings)
  - UI primitives: [components/ui](components/ui)
- **Lib**: Client utilities and services under [lib](lib)
  - Prisma client: [lib/prisma.ts](lib/prisma.ts)
  - Shared utils: [lib/utils.ts](lib/utils.ts)
  - API request wrappers: [lib/api](lib/api)
  - Services (file conversion, persona): [lib/services](lib/services)
- **Prisma**: Schema and migrations under [prisma](prisma)
- **Generated Prisma Client**: [generated/prisma](generated/prisma)
- **Server**: PM2/Node server entry at [server.js](server.js)
- **Deployment Docs**: [DEPLOYMENT.md](DEPLOYMENT.md) and PM2 config [ecosystem.config.json](ecosystem.config.json)

## Environment

Create a `.env` in the project root. Typical variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# HeyGen (if using avatar sessions)
NEXT_PUBLIC_HEYGEN_API_KEY="your_heygen_api_key"
NEXT_PUBLIC_HEYGEN_SERVER_URL="wss://api.heygen.com"
NEXT_PUBLIC_HEYGEN_FEMALE_AVATAR="Rika_Chair_Sitting_public"
NEXT_PUBLIC_HEYGEN_MALE_AVATAR="Pedro_Chair_Sitting_public"

# Any model or provider keys needed by chat
OPENAI_API_KEY="your_openai_key"
```

Adjust according to your environment and any providers you use.

## Scripts

- `dev`: Start Next.js dev server
- `build`: Build the app
- `start`: Start the production server
- `prisma:generate`: Generate Prisma client
- `prisma:migrate`: Apply Prisma migrations

Check [package.json](package.json) for the full list.

## Data Model (Prisma)

Prisma is used for persistence. The schema lives at [prisma/schema.prisma](prisma/schema.prisma), with migrations under [prisma/migrations](prisma/migrations).

Common commands:

```bash
npm run prisma:generate   # generate client from schema
npm run prisma:migrate    # apply latest migrations to your DB
```

Tables include personas, conversations, messages, and files. Recent migrations:

- [20251020065918_init_personas](prisma/migrations/20251020065918_init_personas/migration.sql)
- [20251020133051_init_conversation_message](prisma/migrations/20251020133051_init_conversation_message/migration.sql)
- [20251030152512_added_file_table](prisma/migrations/20251030152512_added_file_table)
- Further updates in later migrations folders

## API Overview

Client-side wrappers for API endpoints are under [lib/api](lib/api).

- **Persona**: [lib/api/persona.request.ts](lib/api/persona.request.ts)
  - List all personas, generate a persona, fetch by id
- **Conversation**: [lib/api/conversation.request.ts](lib/api/conversation.request.ts)
  - Create conversation, list persona conversations, get by id
- **Message**: [lib/api/message.request.ts](lib/api/message.request.ts)
  - Fetch messages for a conversation
- **Chat**: [lib/api/chat.request.ts](lib/api/chat.request.ts)
  - Send chat prompts bound to persona + conversation
- **Files**: [lib/api/files.request.ts](lib/api/files.request.ts)
  - Upload/ingest files and list file names
- **HeyGen**: [lib/api/heygen.request.ts](lib/api/heygen.request.ts)
  - Start a HeyGen session (optional)

Types are defined under [types](types), e.g. [types/shared/persona.type.ts](types/shared/persona.type.ts), [types/shared/conversations.type.ts](types/shared/conversations.type.ts), [types/shared/message.type.ts](types/shared/message.type.ts), and [types/shared/file.type.ts](types/shared/file.type.ts).

## Using the App

- **Home**: Start at [app/page.tsx](app/page.tsx). Generate a new persona or select one.
- **Persona Page**: Navigate to [app/persona/[id]/page.tsx](app/persona/%5Bid%5D/page.tsx). Chat via [components/persona/ChatUIComponent.tsx](components/persona/ChatUIComponent.tsx) and view conversations in [components/persona/ConversationSidebar.tsx](components/persona/ConversationSidebar.tsx).
- **Files**: In Settings at [app/settings/page.tsx](app/settings/page.tsx), upload files via [components/settings/FileIngestForm.tsx](components/settings/FileIngestForm.tsx) and browse via [components/settings/FileListComponent.tsx](components/settings/FileListComponent.tsx). These files can be used to ground responses.
- **HeyGen**: If configured, use [components/persona/HeyGenComponent.tsx](components/persona/HeyGenComponent.tsx) to manage sessions.

## Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md). This project includes a PM2 setup:

- PM2 ecosystem: [ecosystem.config.json](ecosystem.config.json)
- Node server entry: [server.js](server.js)

Typical flow:

```bash
npm run build
npm run start
# or using PM2
pm2 start ecosystem.config.json
pm2 status
pm2 logs
```

Configure environment variables on your server and ensure the database is reachable. If deploying behind a reverse proxy, set `NEXT_PUBLIC_APP_URL` appropriately.

## Troubleshooting

- **Prisma engine issues**: Ensure the proper `libquery_engine` binary is available (generated under [generated/prisma](generated/prisma)) and your `DATABASE_URL` is correct.
- **Migrations not applied**: Run `npm run prisma:migrate` and re-check the target database.
- **API errors**: Inspect server logs, verify env variables (OpenAI/HeyGen keys), and confirm routes exist under [app/api](app/api).
- **CORS or URL mismatches**: Set `NEXT_PUBLIC_APP_URL` consistently for client and server.
- **Build failures**: Check [next.config.ts](next.config.ts) and TypeScript config [tsconfig.json](tsconfig.json) for misconfigurations.

## Contributing

Issues and contributions are welcome. Please follow the existing code style and keep changes minimal and focused.

## License

Internal use or private project. If you intend to open-source, add an appropriate license.
