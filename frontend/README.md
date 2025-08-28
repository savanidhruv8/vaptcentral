# VAPT Dashboard Frontend

A modern React frontend for the VAPT (Vulnerability Assessment and Penetration Testing) dashboard.

## Features

- ✅ Modern React with Vite build system
- ✅ Tailwind CSS for styling
- ✅ Responsive dashboard layout
- ✅ File upload with drag & drop support
- ✅ Interactive charts and analytics (Recharts)
- ✅ Data tables with filtering
- ✅ Real-time API integration
- ✅ Professional UI with Hero Icons

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5175 (or the port shown in terminal)
- **Backend API**: http://127.0.0.1:8001/api

## Fixed Issues

### Tailwind CSS v4 Configuration
Updated to use the new Tailwind CSS v4 configuration:
- PostCSS plugin updated to `@tailwindcss/postcss`
- CSS imports updated to use `@import "tailwindcss"`
- Configuration moved to CSS-based `@theme` directive

## Components Overview

### Navigation & Layout
- Tab-based navigation with active state indication
- Responsive design for all screen sizes
- Professional iconography using Hero Icons

### Dashboard Features
- Real-time statistics from backend API
- Recent uploads tracking
- Color-coded metrics cards

### File Upload
- Drag & drop Excel upload with validation
- Processing progress indication
- Success/error feedback
- Format requirements guide

### Data Tables
- Filterable tables for proposals, scopes, and vulnerabilities
- Color-coded status indicators
- Loading states and error handling

### Analytics
- Interactive charts for vulnerability analysis
- Pie charts for criticality distribution
- Bar charts for environment analysis
- Trend analysis with line charts

## Tech Stack

- **React** with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **Hero Icons** for UI icons
