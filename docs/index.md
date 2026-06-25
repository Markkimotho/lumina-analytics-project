# Lumina Analytics Dashboard


## Overview

**Lumina Analytics** is a high-performance, interactive data visualization dashboard featuring real-time data updates, dynamic charting capabilities, and statistical analysis. Perfect for exploratory data analysis and business intelligence.

## Core Features

### Data Management

- **CSV Data Upload** - Import and visualize your datasets
- **Data Filtering** - Filter datasets by column values
- **Interactive Tables** - Sortable and searchable data tables

### Visualization

- **Multiple Chart Types**:

  - Line charts (time-series)
  - Bar charts (categorical)
  - Area charts (cumulative)
  - Scatter plots (correlation)
  - Pie charts (composition)

- **Real-time Updates** - Simulate live data streaming
- **Dynamic Charting** - Interactive chart customization
- **Legend Management** - Toggle datasets on/off

### Analytics

- **Statistical Analysis** - Key metrics and distributions
- **Summary Statistics** - Mean, median, std dev, quartiles
- **Distribution Analysis** - Data spread visualization

### AI Features

- **AI-Powered Insights** - Automated data analysis (API key required)
- **Interactive Chat** - Ask questions about your data
- **Natural Language Queries** - Describe what you want to analyze

## Responsive Design

Fully responsive dashboard optimized for all screen sizes:

| Device            | Breakpoint | Optimization                               |
| ----------------- | ---------- | ------------------------------------------ |
| **Mobile**        | 320px+     | Full functionality on smartphones          |
| **Tablet**        | 640px+     | Optimized touch-friendly layout            |
| **Desktop**       | 1024px+    | Professional multi-panel view              |
| **Large Screens** | 1280px+    | Enhanced experience with extended features |

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Configuration (Optional AI Features)

Create `.env.local` in the root directory:

```env
API_KEY=your_api_key_here
```

Without this, the dashboard still works fully for charting and statistics.

### Development Server

```bash
npm run dev
```

The app will run at **http://localhost:3000**

### Production Build

```bash
npm run build
npm run preview
```

## Features Highlight

### CSV Upload Workflow

1. Click "Upload CSV" button
2. Select your data file
3. Preview and confirm
4. Automatic type detection
5. Data ready for visualization

### Chart Creation

1. Select data columns
2. Choose chart type
3. Customize colors and labels
4. Export as image (PNG/SVG)

### Statistical Analysis

- View key metrics
- Distribution plots
- Correlation matrices
- Outlier detection
- Data quality checks

### Data Filtering

```javascript
// Example: Filter by date range
filter({ column: "date", operator: ">=", value: "2024-01-01" });
```

## Technology Stack

| Layer                  | Technology                       |
| ---------------------- | -------------------------------- |
| **Frontend Framework** | React + TypeScript               |
| **Charting**           | Plotly.js / Chart.js             |
| **Styling**            | Tailwind CSS                     |
| **State Management**   | React Context / Zustand          |
| **Data Processing**    | Danfo.js (for data manipulation) |
| **Analytics**          | OpenAI API (optional)            |

## Use Cases

- **Business Intelligence** - KPI dashboards
- **Data Exploration** - EDA and data cleaning
- **Financial Analysis** - Trend analysis and forecasting
- **Educational** - Teaching data visualization
- **Research** - Scientific data analysis
- **Operations Monitoring** - Real-time metrics tracking

## Performance

- **Fast Load Times** - Optimized bundle size
- **Real-time Updates** - WebSocket support
- **Large Datasets** - Handles 100k+ rows efficiently
- **Smooth Animations** - GPU-accelerated rendering

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Repository

[View on GitHub](https://github.com/Markkimotho/lumina-analytics-project)
