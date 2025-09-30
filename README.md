# 🚀 M2F CRM - Multi-Tenant Customer Relationship Management

An open-source, serverless CRM platform built with modern web technologies. Deploy to Vercel in minutes with full multi-tenancy support, real-time chat, customizable pipelines, and beautiful theming.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18.x-blue)

## ✨ Features

### Core Features
- 🔐 **Multi-tenancy** - Isolated workspaces with custom branding
- 👥 **Contact Management** - Complete CRUD with custom fields
- 🎯 **Custom Pipelines** - Drag-and-drop funnel management
- 💬 **Real-time Chat** - Built-in messaging with contacts
- 🎨 **Theme Customization** - Logo upload & color palette selection
- 📊 **Dashboard & Analytics** - Insights and metrics
- 🔍 **Advanced Search** - Filter and find anything fast
- ⚡ **Serverless** - Zero infrastructure management

### Technical Highlights
- **Feature-Sliced Design** - Scalable architecture
- **Type-safe** - Full TypeScript coverage
- **Real-time** - Supabase subscriptions
- **Responsive** - Mobile-first design
- **Accessible** - WCAG compliant components
- **Fast** - Optimized bundle & loading states

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State**: Zustand, React Query (TanStack Query)
- **Forms**: React Hook Form, Zod
- **Routing**: React Router
- **Deployment**: Vercel (or any static host)

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/m2f-crm.git
   cd m2f-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Quick setup (creates .env from template)
   ./scripts/setup.sh
   
   # Or manually:
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Follow the detailed guide: [docs/PHASE_1_SETUP.md](docs/PHASE_1_SETUP.md)
   
   Quick summary:
   - Create a Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - This creates all tables with RLS policies

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── app/                    # Application layer
│   ├── providers/          # Context providers
│   └── router/            # Route configuration
├── pages/                  # Page components
│   ├── dashboard/
│   ├── contacts/
│   ├── pipelines/
│   ├── chat/
│   └── settings/
├── widgets/                # Complex UI blocks
│   ├── ContactCard/
│   ├── PipelineBoard/
│   └── ChatSidebar/
├── features/               # Business features
│   ├── auth/
│   ├── contact-create/
│   ├── pipeline-manage/
│   └── message-send/
├── entities/               # Business entities
│   ├── contact/
│   ├── pipeline/
│   ├── message/
│   └── workspace/
└── shared/                 # Shared code
    ├── ui/                # UI components (Shadcn)
    ├── lib/               # Libraries & utilities
    ├── hooks/             # Custom hooks
    ├── config/            # Configuration
    └── types/             # TypeScript types
```

## 🏛️ Architecture

This project follows **Feature-Sliced Design (FSD)** with clean architecture principles:

- **Layered Architecture**: Clear separation of concerns
- **Functional-First**: 90% functional, 10% OOP where beneficial
- **Type Safety**: Strict TypeScript with Zod validation
- **Dependency Rule**: Lower layers don't import from upper layers
- **Public API**: Each feature/entity exports through index.ts

## 🗄️ Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migrations (coming in Phase 1)

3. Enable Row Level Security (RLS) policies for multi-tenancy

## 🚢 Deployment

### Deploy to Vercel

1. **Fork this repository**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Add environment variables

3. **Configure environment variables**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy!** 🎉

### Deploy to Other Platforms

This is a static site and can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages

Build command: `npm run build`
Output directory: `dist`

## 🛣️ Roadmap

- [x] **Phase 0**: Project Foundation ✅
- [x] **Phase 1**: Supabase Setup & Multi-tenancy ✅
- [x] **Phase 2**: Authentication System ✅
- [x] **Phase 3**: Core Layout & Navigation ✅
- [x] **Phase 4**: Contact Management ✅
  - Full CRUD operations
  - Search, filter, sort, pagination
  - Contact tags and labels
  - Responsive design
- [ ] **Phase 5**: Deal/Opportunity Pipeline (Next)
- [ ] **Phase 6**: Task & Activity Management
- [ ] **Phase 7**: Email Integration
- [ ] **Phase 8**: Dashboard & Analytics
- [ ] **Phase 9-20**: Additional features

**Current Status**: 4/20 phases complete (20%)

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting
- All our contributors!

## ⚙️ Development Status

**Current Phase**: Phase 4 - Contact Management ✅ COMPLETE

**What's Working**:
- ✅ Multi-tenant workspaces with RLS
- ✅ Authentication & authorization
- ✅ Contact CRUD operations
- ✅ Search, filter, sort contacts
- ✅ Contact detail and edit pages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Type-safe API layer
- ✅ Real-time updates via React Query

**Next Up**: Phase 5 - Deal/Opportunity Pipeline

**Documentation**: See `docs/` folder for detailed guides

---

Made with ❤️ by the open-source community

