# Workflow Builder

A modern, drag-and-drop workflow builder application built with React, TypeScript, and Shopify Polaris design system. Create, manage, and visualize automated workflows with an intuitive interface.

## 🚀 Features

### Authentication & User Management
- **Secure Login/Register**: Modern authentication system with email/password
- **User Profile**: Display user email in the top navigation
- **Session Management**: Automatic token-based session handling
- **Protected Routes**: Secure access to authenticated content

### Workflow Management
- **Workflow List**: View all your created workflows
- **Create New Workflows**: Start building from scratch
- **Edit Existing Workflows**: Modify and update your workflows
- **Workflow Dashboard**: Visual workflow builder interface

### UI/UX Improvements
- **Modern Design**: Beautiful gradient backgrounds and modern styling
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Enhanced Navigation**: Top bar with user menu and sidebar navigation
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages with Polaris Banners
- **No Alerts**: Clean notification system without browser alerts

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **React Router**: Client-side routing with protected routes
- **Shopify Polaris**: Consistent design system and components
- **Vite**: Fast development and build tooling
- **Modern ES6+**: Latest JavaScript features

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drag-drop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🏗️ Project Structure

```
drag-drop/
├── src/
│   ├── components/          # React components
│   │   ├── Login.tsx       # Login page component
│   │   ├── Register.tsx    # Registration page component
│   │   ├── WorkflowList.tsx # Workflow list component
│   │   ├── WorkflowDashboard.tsx # Main workflow builder
│   │   └── ...             # Other components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and API helpers
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎨 UI Components

### Login Page
- **Modern gradient background** with purple/blue theme
- **Enhanced form validation** with real-time feedback
- **Loading states** and error handling
- **Responsive design** for all screen sizes
- **Auto-focus** on email field for better UX

### Register Page
- **Streamlined registration** (email, password, confirm password)
- **Password validation** with helpful hints
- **Success feedback** with automatic redirect
- **Consistent styling** with login page

### Navigation
- **Top Bar**: User email display, navigation menu
- **Sidebar**: Quick access to workflows and new workflow creation
- **Breadcrumbs**: Clear navigation path
- **User Menu**: Logout and navigation options

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API endpoint URL

### Polaris Theme Customization
The app uses Shopify Polaris design system with custom styling:
- Gradient backgrounds
- Custom button styles
- Enhanced card layouts
- Improved typography

## 🚀 Development

### Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Polaris Components**: Consistent UI components
- **Functional Components**: Modern React patterns

## 🔒 Security Features

- **Token-based Authentication**: JWT tokens for session management
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Secure Storage**: LocalStorage for token management
- **Input Validation**: Client-side form validation
- **Error Handling**: Secure error messages without sensitive data exposure

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Optimized layout with collapsible navigation
- **Mobile**: Touch-friendly interface with mobile-optimized components


**Built with ❤️ using React, TypeScript, and Shopify Polaris** 