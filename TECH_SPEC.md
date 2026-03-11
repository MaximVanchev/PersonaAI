# PersonaAI - Technical Specification

## Project Overview

PersonaAI is a Next.js-based AI-powered application that enables users to create, manage, and interact with AI-driven personas through conversational interfaces. The application supports persona-specific conversations, file ingestion for context grounding, and optional avatar video sessions via HeyGen integration.

### Core Purpose

- Generate and manage AI personas with unique characteristics, personalities, and expertise
- Enable contextual conversations with personas using OpenAI's GPT models
- Support file upload and processing to ground AI responses in user data
- Provide an interactive chat interface with optional video avatar integration

## Architecture Overview

### Technology Stack

#### Frontend

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI primitives with custom component library
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono
- **State Management**: React hooks and Server Components
- **Notifications**: React Hot Toast

#### Backend

- **Runtime**: Node.js (v18+)
- **API Routes**: Next.js App Router API endpoints
- **Database ORM**: Prisma 6.17.1
- **Database**: PostgreSQL (production) / SQLite (development)
- **AI Integration**: OpenAI SDK (@ai-sdk/openai)
- **File Processing**: Mammoth (Word), PDF-Parse, XLSX

#### Third-Party Integrations

- **AI Provider**: OpenAI (GPT-5.1 model)
- **Avatar Service**: HeyGen Streaming Avatar SDK
- **Database**: PostgreSQL for production deployment

### Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├─────────────────────────────────────────────────────────┤
│  • React Components (Home, Persona Chat, Settings)     │
│  • UI Components (Forms, Lists, Chat Interface)        │
│  • Client-side State Management                        │
│  • HeyGen Video Avatar Integration                     │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                 API Routes Layer                        │
├─────────────────────────────────────────────────────────┤
│  • /api/persona (CRUD operations)                      │
│  • /api/chat/send (message processing)                 │
│  • /api/conversation (conversation management)         │
│  • /api/file (file upload/processing)                  │
│  • /api/heygen (avatar session management)             │
│  • /api/message (message retrieval)                    │
│  • /api/health (health checks)                         │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                           │
├─────────────────────────────────────────────────────────┤
│  • personaService.ts (AI persona generation)           │
│  • fileConverter.ts (file processing utilities)        │
│  • Request handlers for external APIs                  │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Layer                              │
├─────────────────────────────────────────────────────────┤
│  • Prisma ORM                                          │
│  • PostgreSQL Database                                 │
│  • Database Models: Persona, Conversation, Message,    │
│    File                                                 │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
├─────────────────────────────────────────────────────────┤
│  • OpenAI API (GPT-5.1)                               │
│  • HeyGen Streaming Avatar API                         │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Entities

#### Persona

Primary entity representing AI personas with configurable characteristics:

```sql
- id (Int, Primary Key, Auto-increment)
- name (String) - Persona display name
- role (String) - Professional/functional role
- age (Int) - Persona age
- gender (String) - Persona gender identity
- tone (String, Optional) - Communication tone
- expertise (String, Optional) - Areas of expertise
- biography (String, Optional) - Background story
- goal (String, Optional) - Persona objectives
- temperature (Float, Optional) - AI response creativity level
- model (String, Optional) - AI model to use
- systemPrompt (String, Optional) - Custom system prompt
- createdAt (DateTime) - Creation timestamp
```

#### Conversation

Represents conversation threads between users and personas:

```sql
- id (Int, Primary Key, Auto-increment)
- personaId (Int, Foreign Key → Persona.id)
- title (String, Optional) - Conversation title
- createdAt (DateTime) - Creation timestamp
- updatedAt (DateTime) - Last modification timestamp
```

#### Message

Individual messages within conversations:

```sql
- id (Int, Primary Key, Auto-increment)
- conversationId (Int, Foreign Key → Conversation.id)
- role (MessageRole: system|user|assistant) - Message sender type
- content (String) - Message content
- createdAt (DateTime) - Creation timestamp
```

#### File

Uploaded files for context grounding:

```sql
- id (Int, Primary Key, Auto-increment)
- fileName (String) - Original file name
- content (Json) - Processed file content
- createdAt (DateTime) - Upload timestamp
```

### Database Relationships

- **Persona → Conversations**: One-to-many
- **Conversation → Messages**: One-to-many
- **Files**: Independent entity used for context during persona generation

## Data Flow

### 1. Persona Generation Flow

```
User Input (GenerateForm)
    ↓
API Route: /api/persona/generate
    ↓
personaService.generatePersonas()
    ↓
OpenAI API (GPT-5.1) with structured output
    ↓
Persona creation in database
    ↓
Response to client
    ↓
UI update with new personas
```

### 2. Chat Message Flow

```
User Message Input (ChatUIComponent)
    ↓
API Route: /api/chat/send
    ↓
Store user message in database
    ↓
Retrieve conversation context + file content (if available)
    ↓
Generate system prompt with persona characteristics
    ↓
OpenAI API call with context
    ↓
Store AI response in database
    ↓
Return response to client
    ↓
Update chat UI with new message
```

### 3. File Processing Flow

```
File Upload (FileIngestForm)
    ↓
API Route: /api/file/create
    ↓
fileConverter.convertFileToJSON()
    ↓
Format-specific processing:
    • Word (.docx) → mammoth extraction
    • PDF (.pdf) → pdf-parse extraction
    • Excel (.xlsx/.xls) → XLSX parsing
    • Text (.txt) → direct content read
    ↓
Store processed content in database
    ↓
Available for persona generation context
```

### 4. HeyGen Avatar Integration Flow

```
Chat Interface Initialization
    ↓
HeyGenComponent mounting
    ↓
API Route: /api/heygen/session
    ↓
HeyGen API session creation
    ↓
WebSocket connection establishment
    ↓
Real-time avatar video streaming
    ↓
Synchronized chat responses with avatar
```

## Key Features

### 1. AI Persona Management

- **Generation**: Custom AI personas based on user criteria
- **Configuration**: Detailed personality, expertise, and behavior settings
- **Persistence**: Database storage with full CRUD operations
- **Customization**: System prompts, temperature settings, model selection

### 2. Conversational Interface

- **Multi-turn Conversations**: Persistent conversation threads
- **Context Awareness**: Previous messages maintained for continuity
- **File-grounded Responses**: AI responses informed by uploaded documents
- **Real-time Chat**: Instant message processing and display

### 3. File Processing & Context Integration

- **Multi-format Support**: Word, PDF, Excel, Text files
- **Content Extraction**: Structured data extraction from various formats
- **Context Grounding**: File content used to inform AI responses
- **Metadata Preservation**: File names and creation timestamps stored

### 4. Video Avatar Integration (Optional)

- **HeyGen SDK**: Streaming avatar video integration
- **Synchronized Responses**: Avatar lip-sync with AI responses
- **Configurable Avatars**: Different avatars per persona characteristics
- **WebSocket Communication**: Real-time video streaming

## API Endpoints

### Persona Management

- `GET /api/persona/all` - Retrieve all personas
- `POST /api/persona/generate` - Generate new personas
- `GET /api/persona/[id]` - Get specific persona
- `PUT /api/persona/[id]` - Update persona
- `DELETE /api/persona/[id]` - Delete persona

### Conversation Management

- `POST /api/conversation/create` - Create new conversation
- `GET /api/conversation/[id]` - Get conversation details
- `GET /api/conversation/personaConversations` - Get conversations by persona

### Message Management

- `POST /api/chat/send` - Send message and get AI response
- `GET /api/message/conversationMessages` - Retrieve conversation messages

### File Management

- `POST /api/file/create` - Upload and process file
- `GET /api/file/names` - Get all file names
- `GET /api/file/[id]` - Get specific file
- `DELETE /api/file/[id]` - Delete file

### HeyGen Integration

- `POST /api/heygen/session` - Create HeyGen session

### System

- `GET /api/health` - Health check endpoint

## Security Considerations

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
SHADOW_DATABASE_URL=postgresql://username:password@host:port/shadow_db
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_HEYGEN_API_KEY=your_heygen_api_key
NEXT_PUBLIC_HEYGEN_SERVER_URL=wss://api.heygen.com
NEXT_PUBLIC_HEYGEN_DEFAULT_AVATAR=avatar_id
```

### Data Protection

- API keys stored in environment variables
- Database credentials secured
- File uploads validated and sanitized
- User input validation using Zod schemas

## Hosting Requirements

### Infrastructure Requirements

#### Minimum VPS Specifications

- **CPU**: 2 vCPU cores minimum
- **RAM**: 4GB minimum (8GB recommended for production)
- **Storage**: 20GB SSD minimum (50GB recommended)
- **Bandwidth**: Unmetered or high allocation (for video streaming)
- **Operating System**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+

#### Recommended Production Specifications

- **CPU**: 4 vCPU cores
- **RAM**: 8GB-16GB
- **Storage**: 50GB-100GB SSD
- **Bandwidth**: Unmetered
- **CDN**: Optional but recommended for global performance

### Software Dependencies

#### Core Runtime

- **Node.js**: Version 18 or higher
- **npm**: Latest version
- **Git**: For deployment and updates

#### Database

- **PostgreSQL**: Version 12+ (recommended for production)
  - Connection pooling recommended for high traffic
  - Regular backups essential
- **SQLite**: Acceptable for development/testing only

#### Process Management

- **PM2**: Recommended for production process management
- **systemd**: Alternative for Linux service management
- **Docker**: Optional containerization

#### Reverse Proxy & SSL

- **Nginx**: Recommended for reverse proxy, SSL termination, and static file serving
- **Apache**: Alternative web server option
- **Let's Encrypt**: Free SSL certificates

### Network Requirements

#### Ports

- **3000**: Next.js application (internal)
- **80**: HTTP (redirect to HTTPS)
- **443**: HTTPS (public access)
- **5432**: PostgreSQL (internal, secured)

#### External Services

- **OpenAI API**: Reliable internet connection required
- **HeyGen API**: WebSocket support for video streaming
- **CDN**: Optional for improved global performance

### Deployment Configuration

#### Environment Setup

```bash
# Node.js and npm installation
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL setup
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb personaai
sudo -u postgres createuser --interactive

# PM2 installation
npm install -g pm2

# Application deployment
git clone <repository-url>
cd PersonaAI
npm install
npx prisma generate
npm run build
```

#### Production Process Management

```json
// ecosystem.config.json
{
  "name": "PersonaAI",
  "script": "server.js",
  "instances": 1,
  "exec_mode": "cluster",
  "env_production": {
    "NODE_ENV": "production",
    "PORT": 3000
  },
  "autorestart": true,
  "max_restarts": 10,
  "max_memory_restart": "1G"
}
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring & Maintenance

#### Health Checks

- `/api/health` endpoint for application status
- Database connection monitoring
- File system space monitoring
- Memory and CPU usage tracking

#### Logging

- Application logs: `./logs/combined.log`
- Error logs: `./logs/err.log`
- Access logs: Nginx access logs
- PM2 logs: `pm2 logs`

#### Backup Strategy

- **Database**: Daily automated PostgreSQL dumps
- **Files**: Regular backup of uploaded files and application data
- **Code**: Version control with Git
- **Configuration**: Environment variables and config files

#### Scaling Considerations

- **Horizontal**: Load balancer with multiple application instances
- **Database**: PostgreSQL read replicas for read-heavy workloads
- **CDN**: CloudFlare or AWS CloudFront for static assets
- **File Storage**: External storage service (AWS S3, DigitalOcean Spaces)

### Cloud Provider Recommendations

#### Budget-Friendly Options

- **DigitalOcean Droplets**: $20-40/month for 4GB-8GB instances
- **Vultr**: Similar pricing with global locations
- **Linode**: Reliable with good documentation

#### Enterprise Options

- **AWS EC2**: Full AWS ecosystem integration
- **Google Cloud Compute**: Advanced monitoring and scaling
- **Azure VMs**: Integration with Microsoft services

#### Managed Database Options

- **DigitalOcean Managed PostgreSQL**: $15+/month
- **AWS RDS**: Scalable with automated backups
- **PlanetScale**: Serverless MySQL alternative (requires schema changes)

## Development Workflow

### Local Development Setup

```bash
# Clone and install
git clone <repository>
cd PersonaAI
npm install

# Database setup
npx prisma generate
npx prisma db push  # for development

# Environment configuration
cp .env.example .env.local
# Configure OpenAI API key and database URL

# Start development server
npm run dev
```

### Production Deployment Process

1. **Code Preparation**: Build optimization and dependency installation
2. **Database Migration**: Prisma schema deployment
3. **Environment Configuration**: Production environment variables
4. **Process Management**: PM2 or systemd service setup
5. **Reverse Proxy**: Nginx configuration and SSL setup
6. **Monitoring**: Health checks and log monitoring setup

## Performance Considerations

### Optimization Strategies

- **Next.js Turbopack**: Enabled for faster builds and development
- **Database Indexing**: Indexes on frequently queried fields
- **Caching**: Redis for session and response caching (optional)
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js built-in image optimization

### Scalability Factors

- **Database Connection Pooling**: Prevents connection exhaustion
- **File Upload Limits**: Configure based on server capacity
- **Memory Management**: Monitor Node.js heap usage
- **CPU Usage**: Monitor during AI model calls

## Future Enhancement Opportunities

### Technical Improvements

- Redis integration for caching and sessions
- WebSocket implementation for real-time features
- Container orchestration with Docker/Kubernetes
- Microservices architecture for large-scale deployment
- GraphQL API implementation for efficient data fetching

### Feature Additions

- Multi-user support with authentication
- Persona sharing and collaboration
- Advanced file processing (video, audio)
- Custom AI model fine-tuning
- Integration with additional AI providers
- Mobile application development

This technical specification provides a comprehensive overview of the PersonaAI application architecture, deployment requirements, and operational considerations for successful production hosting.
