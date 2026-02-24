# Product Requirements Document (PRD): Lumina Analytics Dashboard

## 1. Executive Summary

**Lumina Analytics Dashboard** is a professional-grade, interactive data visualization and analysis platform designed to empower users to transform raw CSV data into actionable insights. The platform combines real-time data simulation, advanced statistical modeling, interactive charting, and optional AI-driven conversational analysis to provide a comprehensive solution for data exploration, analysis, and reporting.

The application targets data analysts, business executives, and product managers who need to quickly visualize, understand, and communicate data insights without requiring advanced technical knowledge.

---

## 2. Product Objectives

1. **Simplify Data Exploration** - Enable non-technical users to upload, parse, and visualize CSV data instantly with zero configuration
2. **Provide Deep Statistical Insights** - Automatically calculate and surface key metrics, distributions, and correlations
3. **Enable Real-time Monitoring** - Offer a "Live Mode" to simulate streaming data for monitoring and simulation use cases
4. **Support Professional Communication** - Provide high-quality visualizations and export capabilities for executive presentations
5. **Optional AI Enhancement** - Leverage conversational AI to provide contextual insights and chart recommendations
6. **Ensure Data Persistence** - Maintain user datasets and chart configurations across sessions

---

## 3. Target Audience

### Primary Users
- **Data Analysts**: Need exploratory data analysis (EDA) tools for quick insight discovery
- **Business Executives**: Require high-level summaries, KPI tracking, and visual dashboards
- **Product Managers**: Track user metrics, engagement trends, and feature performance
- **Marketing Teams**: Analyze campaign performance and customer behavior

### Secondary Users
- Educators teaching data science or analytics
- Consultants building quick analysis reports for clients
- Anyone needing rapid data visualization without Python/R knowledge

---

## 4. Functional Requirements

### 4.1 Data Management

#### 4.1.1 CSV File Ingestion
- **Upload Interface**: Modal-based file picker for local CSV uploads
- **Parser**: PapaParse integration for client-side parsing
  - Support for standard comma-separated values
  - Automatic header row detection
  - Dynamic typing (automatic number/string inference)
  - Configurable delimiters, quotes, and escape characters
- **File Size Limits**: Support for datasets up to practical browser memory limits (~50MB)
- **Error Handling**: User-friendly error messages for malformed CSV

#### 4.1.2 Schema Detection
Automatic classification of columns on upload:
- **Numeric Columns**: Float and integer values (used for charting Y-axis, statistics)
- **Categorical Columns**: String values (used for grouping, filtering, pie chart labels)
- **Null Handling**: Automatic detection and count of missing values per column

Sample detection logic:
```
- Column "Sales": [100, 150, 200]  ->  Numeric
- Column "Region": ["North", "South"]  ->  Categorical
- Column "Active": [true, false]  ->  Categorical (boolean treated as string for labels)
```

#### 4.1.3 Data Persistence
- **Local Storage**: Automatic save/load of datasets using browser localStorage
  - Serialization of full Dataset objects (metadata + data rows)
  - Session survival across page refreshes
  - Dataset list in sidebar showing all saved datasets
- **Dataset Metadata**:
  - `id`: Unique identifier (UUID)
  - `name`: User-provided or filename-derived
  - `createdAt`: Timestamp for sorting/reference
  - `columns`: Full list of column names
  - `numericColumns`: Subset of columns containing numeric data
  - `categoricalColumns`: Subset of columns containing non-numeric data
  - `data`: Array of row objects

#### 4.1.4 Live Simulation Mode
A toggleable "Live Mode" that simulates real-time data updates:
- **Random Walk Algorithm**:
  - Applied to all numeric columns
  - Each update: `newValue = currentValue + random(-offset, +offset)`
  - Offset is calculated as `10% of column mean`
- **Update Frequency**: 1.5-second intervals
- **Behavior**: 
  - New rows are appended; old rows are dropped (maintains fixed window size)
  - Preserves categorical columns unchanged
  - Useful for monitoring dashboard demos and streaming simulation
- **Toggle**: Button in top header to start/stop live mode
- **Status Indicator**: Visual indicator showing live mode is active

---

### 4.2 Visualization Engine

#### 4.2.1 Supported Chart Types

All charts rendered via **Recharts** (D3-based React library):

| Chart Type | Best For | Required Axes | Features |
|-----------|----------|----------------|----------|
| **Line** | Time series, trends, sequential data | X (domain), Y (numeric) | Smooth curves, multi-series support |
| **Area** | Cumulative trends, filled regions | X (domain), Y (numeric) | Stacked area, gradient fills |
| **Bar** | Categorical comparisons, rankings | X (categorical), Y (numeric) | Horizontal/vertical variants |
| **Scatter** | Correlation analysis, outlier detection | X (numeric), Y (numeric) | Point clouds, bubble sizes |
| **Pie** | Composition, market share, percentages | Single numeric field | Donut variant, percentage labels |

#### 4.2.2 Chart Configuration
Each chart is defined by:
```typescript
{
  id: string;           // Unique chart identifier
  type: ChartType;      // One of Line, Bar, Area, Scatter, Pie
  xAxisKey: string;     // Column name for X-axis (or category in Pie)
  yAxisKey: string;     // Column name for Y-axis (or numeric in Pie)
  color: string;        // Hex color for chart rendering (#rrggbb)
  title: string;        // User-provided or AI-suggested title
}
```

#### 4.2.3 Interactive Controls
- **Tooltips**: Hover over data points to see exact values
- **Legends**: Identify series/colors when applicable
- **Responsive Scaling**: Charts adapt to container sizing
- **Zoom/Pan**: Native Recharts zoom capabilities for large datasets
- **Click Actions**: Click on chart title to expand to fullscreen modal

#### 4.2.4 Chart Management
- **Add Chart**: Modal with dropdown selectors for chart type and axis configuration
- **Remove Chart**: Delete button on each chart container
- **Reorder**: Charts display in creation order (future: drag-to-reorder)
- **Expand**: Fullscreen modal view for detailed inspection
- **Duplicate**: Clone chart configuration with modified title

#### 4.2.5 Export Capabilities
- **SVG Export**: Individual charts can be exported as vector SVG files
  - Click "Download" button on chart
  - Filename: `{chart-title}.svg`
  - Preserves colors, text, and styling
- **Image Export**: Planned enhancement using html2canvas for PNG/JPG

---

### 4.3 Statistical Analysis Engine

#### 4.3.1 Descriptive Statistics
Automatic calculation for all numeric columns:

**Univariate Statistics:**
- **Mean**: Average value
- **Median**: Middle value (50th percentile)
- **Std Dev**: Standard deviation (spread measure)
- **Min/Max**: Range boundaries
- **Q1/Q3**: First and third quartiles (25th, 75th percentiles)
- **Null Count**: Number of missing/invalid values

**Display**:
- Table format in Statistics tab
- Sortable columns (click column header)
- Color-coded cells for easy scanning
- Inline "Distribution" mini-histogram for each column

#### 4.3.2 Correlation Analysis
**Pearson Correlation Matrix**:
- Calculated between all numeric column pairs
- Values range from -1 (perfect negative) to +1 (perfect positive)
- Color-coded heatmap:
  - **Dark Blue** (0.7-1.0): Strong positive correlation
  - **Light Blue** (0.3-0.7): Moderate positive
  - **Gray** (-0.3-0.3): No correlation
  - **Light Red** (-0.7 to -0.3): Moderate negative
  - **Dark Red** (-1.0 to -0.7): Strong negative correlation

**Use Cases**:
- Identify which metrics move together
- Find redundant features for modeling
- Discover hidden relationships in data

#### 4.3.3 Distribution Analysis
**Histograms**:
- Inline mini-histograms (sparkline style) in the Numeric Summaries table
- Shows frequency distribution of values
- Helps identify skewness, outliers, bimodal distributions
- 10-15 bins by default

---

### 4.4 Data Inspector

#### 4.4.1 Raw Data Grid
- **Tabular View**: Full dataset displayed in scrollable table
- **Column Headers**: Includes column name and inferred type
- **Sorting**: Click column header to sort A -> Z or Z -> A
- **Pagination**: Show 25/50/100 rows per page
- **Search/Filter**: Filter rows by column value (case-insensitive substring match)

#### 4.4.2 Filter Controls
- **Column Selector**: Dropdown to choose which column to filter on
- **Filter Value**: Text input for search term
- **Live Filtering**: Results update as user types
- **Clear Filter**: Reset to show all rows

#### 4.4.3 Data Quality Indicators
- Row count display
- Total null counts by column
- Data type summary (e.g., "5 numeric | 3 categorical")

---

### 4.5 AI Insights & Conversational Assistant (Optional)

**Note**: AI features require API key configuration and are optional. The dashboard fully functions without AI.

#### 4.5.1 One-Click Analysis
**"Analyze with AI" Button** (in AI Insights tab):
- Sends dataset sample to AI model for analysis
- Generates structured response with:
  - **Summary**: 2-3 sentence overview of the dataset
  - **Trends**: List of 3-5 identified patterns or trends
  - **Anomalies**: Potential outliers or unexpected values
  - **Recommendation**: Suggested chart type for best visualization

Example output:
```
Summary: "This sales dataset spans Q1-Q2 with 500 records across 3 regions."
Trends: 
  - "Sales peak on Fridays (15% above weekly average)"
  - "North region shows consistent 8% MoM growth"
Anomalies:
  - "March 15th spike in returns (3x normal)"
Recommendation: "Time series chart for sales by date, grouped by region"
```

#### 4.5.2 Conversational Chat Interface
**Lumina AI Assistant**:
- Sidebar chat panel showing conversation history
- Context-aware responses about current dataset
- Features:
  - Understanding of dataset schema and sample data
  - Multi-turn conversation with memory of previous messages
  - Ability to suggest specific chart configurations

**Sample Interactions**:
- User: "What sectors are underperforming?"
- Assistant: "Based on the data, Healthcare shows 12% lower margins. Let me create a comparison chart. [Suggests bar chart config]"
- User: "Show me a trend over time"
- Assistant: "[Creates line chart suggestion with date on X-axis, revenue on Y-axis]"

#### 4.5.3 Function Calling
When user asks for specific visualizations:
- AI generates chart configuration JSON
- User sees suggested chart in a preview
- One-click button to add suggestion to dashboard
- Configuration includes:
  - Chart type (Line, Bar, Area, Scatter, Pie)
  - X/Y axis mappings
  - Suggested colors
  - Default title

---

### 4.6 User Interface Layout

#### 4.6.1 Application Structure
```

  Sidebar (264px)    Main Content       
                                        
 - Logo "Lumina"     
 - Navigation         Header (64px)   
    Dashboard       
    Statistics                       
    Data Inspector   Active Tab      
    AI Insights      Content Area    
                       (scrollable)   
 - Datasets List                      
   + New Dataset                      
                     
 - Footer (status)                      

```

#### 4.6.2 Sidebar Navigation
**Fixed Left Sidebar** (264px):
- **Header**: Lumina logo + app name
- **Menu Buttons**: 4 navigation tabs
  - Dashboard (BarChart2 icon)
  - Statistics (Calculator icon)
  - Data Inspector (Database icon)
  - AI Insights (BrainCircuit icon)
- **Datasets Section**: 
  - List of all uploaded datasets
  - Active dataset highlighted with blue accent
  - Pulse indicator showing active selection
  - Plus button to upload new dataset
- **Footer**: App version + online status indicator

#### 4.6.3 Header (Top Navigation Bar)
**Height**: 64px, dark with blur backdrop

**Left Side**:
- Dynamic title based on active tab
- Current dataset name in muted badge

**Right Side**:
- "Upload Dataset" button (primary action)
- "Live Mode" toggle with indicator
- Settings menu (gear icon) - future: theme, defaults, etc.
- Menu options:
  - Export as PNG (future)
  - Clear all data
  - Help/Documentation

#### 4.6.4 Tab: Dashboard
**Purpose**: Visual analytics workspace showing all charts for active dataset

**Content**:
- Grid layout of chart containers
- Responsive grid (auto-fit columns)
- Each chart container shows:
  - Chart title (editable on click)
  - Rendered Recharts visualization
  - 3 action buttons:
    - Expand (fullscreen modal)
    - Download (SVG export)
    - Delete (remove chart)
  - Hover effects for interactivity

**Add Chart Button**:
- Large "+ Add Chart" button in grid
- Opens modal with:
  - Chart type selector (5 radio buttons)
  - X-axis column dropdown (numeric or categorical)
  - Y-axis column dropdown (numeric, or hidden for Pie)
  - Color picker
  - Title input field
  - "Create" button to add to dashboard

#### 4.6.5 Tab: Statistics
**Purpose**: Statistical analysis and data quality overview

**Sections**:
1. **Numeric Summaries Table**:
   - 8 columns: Column Name, Mean, Median, Std Dev, Min, Max, Missing, Distribution
   - One row per numeric column
   - Sortable headers (click to sort)
   - Inline mini-histograms in Distribution column

2. **Correlation Heatmap**:
   - Matrix view of all numeric column pairs
   - Color gradient (blue = positive, red = negative)
   - Hoverable cells showing exact correlation values
   - Symmetric matrix (only show upper triangle)
   - Tooltip on hover with correlation strength label

#### 4.6.6 Tab: Data Inspector
**Purpose**: Raw data exploration and filtering

**Components**:
1. **Filter Bar**:
   - Column selector dropdown
   - Text input for filter value
   - "Clear" button to reset
   - Live results as user types

2. **Data Table**:
   - Scrollable, horizontal and vertical
   - Column headers (sortable)
   - Row striping for readability
   - Hover highlighting
   - Status row showing: "Showing X of Y rows"

#### 4.6.7 Tab: AI Insights
**Purpose**: AI-powered analysis and conversational assistance

**Layout**:
- **Left Panel** (60%): Chat conversation area
  - Message history (scrollable)
  - User messages: Blue background, right-aligned
  - AI messages: Gray background, left-aligned
  - Input field at bottom with Enter to send
  - Shift+Enter for multiline input
  - Send button (paper plane icon)

- **Right Panel** (40%): AI Insights summary (if available)
  - Summary card
  - Trends list
  - Anomalies list
  - Recommendation badge
  - "Analyze Dataset" button to generate fresh insights

**Optional State**: If no analysis yet, show prompt to click "Analyze Dataset"

#### 4.6.8 Modals

**Upload Modal**:
- File input (drag-and-drop support)
- Selected filename display
- "Upload" button
- "Cancel" button
- Title: "Import a CSV Dataset"

**Chart Configuration Modal**:
- Appears after clicking "+ Add Chart"
- Sections:
  - Chart Type (5 radio buttons with icons)
  - X-Axis: Dropdown of all columns
  - Y-Axis: Dropdown of numeric columns (hidden if Pie)
  - Color: Color picker (default random)
  - Title: Text input (pre-filled with suggestion)
- Buttons: Create | Cancel

**Expanded Chart Modal**:
- Full-screen or large modal showing single chart
- Chart takes up ~90% of modal space
- Download and close buttons

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **Load Time**: Initial page load < 2 seconds (cached)
- **Dataset Handling**: Smooth interaction with datasets up to 10,000 rows
- **Chart Rendering**: Charts render in < 500ms for typical datasets
- **Filtering**: Filter results update with < 100ms latency
- **Live Mode**: Update frequency 1.5 seconds without UI lag
- **Memory**: Efficient use of browser memory; graceful degradation for large files

### 5.2 Reliability & Data Integrity
- **Data Persistence**: Datasets persist across browser sessions
- **Error Recovery**: Graceful error handling with user-friendly messages
- **Validation**: Input validation for all user submissions
- **Null Safety**: Proper handling of missing/null values throughout

### 5.3 User Experience & Design
- **Theme**: Dark luxury aesthetic
  - Primary background: Slate-950 (#030712)
  - Secondary: Slate-900 (#0f172a), Slate-800 (#1e293b)
  - Accent: Indigo/Blue (#3b82f6, #4f46e5)
  - Secondary accent: Emerald (#10b981), Amber (#f59e0b)
  - Border: Slate-800 with low contrast
  - Effects: Glassmorphism (blur, transparency)

- **Typography**: 
  - Font family: System sans-serif (font-sans in Tailwind)
  - Sizes: 12px (xs), 14px (sm), 16px (base), 18px (lg), 20px (xl)
  - Weights: Regular (400), Semibold (600), Bold (700)

- **Icons**: Lucide React (24x24px at standard size)
- **Spacing**: Consistent 4px base unit grid (padding, margins, gaps)
- **Accessibility**:
  - High contrast text on dark backgrounds (WCAG AA)
  - Keyboard navigation support (Tab, Enter, Esc)
  - Hover states for all interactive elements
  - Alt text for important icons
  - Focus states for form inputs

### 5.4 Responsiveness
- **Desktop**: Optimized for 1920x1080 and up
- **Tablet**: Sidebar collapses to icons; responsive grid
- **Mobile**: Full mobile responsiveness (future enhancement)
- **Breakpoints**: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### 5.5 Browser Compatibility
- **Supported**: Chrome/Edge (latest 2 versions), Firefox (latest 2 versions), Safari (latest 2 versions)
- **Features**: ES2020+, Web APIs (localStorage, File API, Canvas)
- **Polyfills**: None required for modern browsers

### 5.6 Security
- **CSP Headers**: Restrict external resources
- **Input Sanitization**: Escape all user input before rendering or storing
- **No Backend**: Client-side only; no transmission of data to external servers (except optional AI API calls)
- **CORS**: Required if using external AI API
- **API Key**: Never expose API keys in client code; use proxy or environment variables

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 (Functional Components + Hooks) | UI rendering, state management |
| **Language** | TypeScript 5.8+ | Type safety, better DX |
| **Build Tool** | Vite 6.2 | Fast bundling, HMR, optimized builds |
| **Styling** | Tailwind CSS 3.4+ | Utility-first CSS, dark theme |
| **Charts** | Recharts 3.4+ | D3-based charting, React-friendly |
| **Icons** | Lucide React 0.554+ | 500+ icons, consistent styling |
| **CSV Parser** | PapaParse 5.x | Client-side CSV parsing, flexible |
| **Statistics** | simple-statistics 7.8+ | Mean, median, std dev, correlation |
| **AI SDK** | @google/genai 1.30+ | Optional: AI analysis & chat |
| **Storage** | Browser localStorage | Dataset persistence |

### 6.2 Project Structure

```
lumina-analytics-project/
 index.html              # Entry point
 index.tsx               # React root
 App.tsx                 # Main component, routing logic
 types.ts                # TypeScript interfaces
 vite.config.ts          # Vite configuration
 tsconfig.json           # TypeScript configuration
 package.json            # Dependencies
 tailwind.config.ts      # Tailwind theme customization

 components/             # React components
    ChartContainer.tsx   # Individual chart wrapper + controls
    ChatPanel.tsx        # AI chat interface
    Modal.tsx            # Reusable modal component
    Spinner.tsx          # Loading indicator
    StatisticsPanel.tsx  # Statistics tables & heatmap

 services/               # Business logic
    db.ts               # localStorage persistence layer
    geminiService.ts    # Optional AI integration (wrapper)
    statisticsService.ts # Calculations (mean, correlation, etc.)

 styles/                 # Global styles (if needed)
    index.css           # Tailwind imports, global overrides

 README.md               # User documentation
 PRD.md                  # This document
 metadata.json           # App metadata
```

### 6.3 Data Flow

#### Dataset Upload & Parsing
```
User Upload  ->  File Input  ->  PapaParse  ->  Schema Detection  ->  localStorage  ->  UI Update
```

#### Chart Creation
```
User Config  ->  Modal Submission  ->  ChartConfig Creation  ->  localStorage  ->  ChartContainer Render (Recharts)
```

#### Statistics Calculation
```
Dataset Selected  ->  statisticsService.ts (simple-statistics)  ->  Memoized Results  ->  Display Tables/Heatmap
```

#### AI Analysis (Optional)
```
User Clicks "Analyze"  ->  Send Sample to geminiService  ->  Parse Response  ->  Display Summary/Trends/Anomalies
```

#### Live Mode
```
Toggle ON  ->  setInterval (1500ms)  ->  Random Walk Algorithm  ->  Data Update  ->  Chart Re-render (automatic via React)
```

### 6.4 Key Libraries & Their Roles

**Recharts**:
- Renders all chart types (Line, Bar, Area, Scatter, Pie)
- Handles responsiveness, tooltips, legends
- D3 under the hood; React-friendly wrapper

**PapaParse**:
- Parses CSV text into JavaScript arrays
- Handles edge cases: quoted fields, different delimiters
- Client-side only; no server dependency

**simple-statistics**:
- Pure JavaScript implementation of common statistics
- Functions: `mean()`, `median()`, `standardDeviation()`, `quantile()`, `sampleCorrelation()`
- No external dependencies

**@google/genai** (Optional):
- Official Google Generative AI SDK
- Used for Gemini model API calls
- Requires API key; not included if not used
- Can be removed entirely for non-AI deployments

---

## 7. Data Models

### 7.1 Core Types (types.ts)

```typescript
// Primitive type for any data value
export type DataValue = string | number | boolean | null;

// Single row of data
export interface DataPoint {
  [key: string]: DataValue;
}

// Complete dataset
export interface Dataset {
  id: string;                  // UUID
  name: string;                // User-provided name
  data: DataPoint[];           // All rows
  columns: string[];           // All column names
  numericColumns: string[];    // Detected numeric columns
  categoricalColumns: string[]; // Detected categorical columns
  createdAt: number;           // Timestamp
}

// Chart rendering configuration
export enum ChartType {
  LINE = 'Line',
  BAR = 'Bar',
  AREA = 'Area',
  SCATTER = 'Scatter',
  PIE = 'Pie',
}

export interface ChartConfig {
  id: string;         // UUID
  type: ChartType;    // Chart type
  xAxisKey: string;   // Column name for X-axis
  yAxisKey: string;   // Column name for Y-axis
  color: string;      // Hex color (#rrggbb)
  title: string;      // Chart title
}

// AI Analysis result
export interface AIInsight {
  summary: string;           // 2-3 sentence overview
  trends: string[];          // Array of identified trends
  anomalies: string[];       // Array of potential outliers
  recommendation: string;    // Suggested chart type
}

// Summary statistics for one numeric column
export interface NumericSummary {
  column: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  q1: number;              // 25th percentile
  q3: number;              // 75th percentile
  nullCount: number;       // Missing values
}

// Correlation between two numeric columns
export interface CorrelationResult {
  col1: string;
  col2: string;
  correlation: number;    // -1 to 1
}

// Chat message in conversation
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  suggestedActions?: {     // AI can suggest charts
    label: string;
    action: 'create_chart';
    payload: Partial<ChartConfig>;
  }[];
}
```

---

## 8. User Stories & Workflows

### 8.1 Workflow: First-Time User Onboarding

```gherkin
 User visits site
    ->  See main dashboard with "Upload Dataset" prompt
    ->  Zero friction entry point
   
 User clicks "Upload Dataset"
    ->  Modal opens with file input (drag-and-drop)
    ->  User selects CSV from computer
   
 System parses CSV
    ->  Shows preview rows
    ->  Detects column types
    ->  Saves to localStorage
   
 User sees populated Dashboard tab
    ->  Dataset appears in sidebar
    ->  Empty chart grid with "+ Add Chart" button
   
 User adds first chart
    ->  Clicks "+ Add Chart"
    ->  Selects "Line" chart type
    ->  Chooses date column for X, sales for Y
    ->  Clicks "Create"
   
 Chart appears on dashboard
    ->  User can now see trends
    ->  Can download as SVG
```

### 8.2 Workflow: Data Analysis & Insights

```gherkin
 User uploads sales data (500 rows, 5 columns)
   
 User navigates to Statistics tab
    ->  Sees table with 5 rows (one per numeric column)
    ->  Sees Mean, Median, Std Dev, etc.
    ->  Notices one column has high std dev (outliers?)
   
 User clicks on Distribution mini-histogram
    ->  Sees the column has bimodal distribution
    ->  Hypothesis: Two different customer segments
   
 User creates Scatter chart
    ->  Column A vs Column B
    ->  Visually confirms clustering
   
 User goes to Correlation heatmap
    ->  Sees which metrics move together
    ->  Identifies strong positive correlation between Price and Margin
   
 User creates Bar chart showing Revenue by Region
    ->  Default sorting shows best-performing region
    ->  Can filter data by date to narrow down
   
 User exports charts as SVGs
    ->  Builds presentation deck manually or via Power Point
```

### 8.3 Workflow: Real-Time Monitoring (Live Mode)

```gherkin
 User has uploaded streaming dataset
   (e.g., hourly server metrics)
   
 User creates Line chart with timestamp on X, CPU usage on Y
   
 User clicks "Live Mode" toggle in header
    ->  Button changes color (indicates active)
    ->  Chart data starts updating every 1.5 seconds
    ->  New data point appends; old ones scroll off window
   
 User watches the chart "stream" live
    ->  Can pause live mode to inspect specific point
    ->  Can resume live mode
   
 User can toggle live mode off to stop updates
    ->  Chart remains in last state shown
```

### 8.4 Workflow: AI-Assisted Analysis (Optional)

```gherkin
 User navigates to AI Insights tab
   
 User clicks "Analyze Dataset with AI"
    ->  System sends sample (first 30 rows) to AI model
    ->  Shows loading indicator
   
 AI returns analysis summary
    ->  Summary: "This dataset tracks quarterly sales"
    ->  Trends: ["Q3 growth increased 12%", "East region outperforming"]
    ->  Anomalies: ["Feb 15 spike unexplained"]
    ->  Recommendation: "Time series or stacked bar chart"
   
 User starts chatting with AI Assistant
    ->  User: "What's driving the Feb 15 spike?"
    ->  AI: "Sales spike aligned with promo campaign launch. Recommend visualizing by product category."
    ->  AI suggests Bar chart config automatically
   
 User clicks "Create Suggested Chart"
    ->  Chart added to dashboard instantly
   
 User continues chat for deeper insights
    ->  AI remembers context of conversation
    ->  Can reference specific columns and metrics
```

---

## 9. Future Roadmap

### Phase 2: Enhanced Features
- **Advanced Filtering**: Global dashboard filters (date ranges, categorical selections)
- **Shared Dashboards**: Export dashboard configuration as JSON; share URL
- **Data Export**: Export filtered/analyzed data back as CSV
- **Custom Themes**: User-selectable color themes (Light, Dark, High Contrast)
- **Multiple Datasets**: Compare/merge multiple datasets side-by-side
- **Report Builder**: Structured report templates with sections, styling, export to PDF

### Phase 3: Data Integration
- **SQL Database Connections**: Live queries to PostgreSQL, MySQL, etc.
- **Google Sheets Integration**: Connect to Google Sheets; auto-sync
- **REST API Integration**: Fetch data from custom endpoints
- **Real-time WebSocket**: Actual streaming data (not simulation)
- **Data Refresh Schedule**: Automatic periodic updates for connected sources

### Phase 4: Advanced Analytics
- **Predictive Models**: Time-series forecasting (ARIMA, Prophet)
- **Clustering**: K-means, hierarchical clustering visualization
- **Anomaly Detection**: Statistical anomaly flagging
- **Regression Analysis**: Linear/polynomial fit lines on scatter plots
- **Custom Formulas**: Derived columns with user-defined calculations
- **A/B Test Framework**: Statistical test builders for experiments

### Phase 5: Collaboration & Governance
- **User Accounts**: Authentication, user profiles
- **Team Workspaces**: Shared datasets, access control
- **Audit Logs**: Track who accessed/modified data
- **Data Governance**: Tagging, lineage, metadata management
- **Comments & Annotations**: Collaborators can add notes to charts
- **Version Control**: Revert to previous dataset/dashboard states

### Phase 6: Mobile & Embedded
- **Responsive Mobile App**: Full mobile UI for iOS/Android
- **Embed Charts**: Share individual charts as embeddable widgets
- **Mobile Native**: React Native app for offline mobile analysis
- **Progressive Web App**: Installable, offline-capable PWA

---

## 10. Success Metrics & KPIs

### User Adoption
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- New user signups / downloads

### Engagement
- Avg. datasets uploaded per user per month
- Avg. charts created per dataset
- Avg. session duration
- Feature usage: % using Statistics, AI Insights, Live Mode, etc.

### Data Volume
- Avg. dataset size (rows, columns)
- Max dataset size successfully handled
- Concurrent users support level

### Satisfaction
- Net Promoter Score (NPS)
- Customer satisfaction surveys
- App store ratings (if published)
- GitHub stars / community engagement

### Performance
- Page load time (p50, p95)
- Time to interactive (TTI)
- Chart render time
- Error rate / crash frequency

---

## 11. Acceptance Criteria

### MVP (Minimum Viable Product)
- [x] CSV upload with PapaParse
- [x] Schema detection (numeric vs categorical)
- [x] 5 chart types (Line, Bar, Area, Scatter, Pie)
- [x] Descriptive statistics (mean, median, std dev, min, max, nulls)
- [x] Correlation matrix
- [x] Data filtering & sorting
- [x] Chart export as SVG
- [x] localStorage persistence
- [x] Dark luxury UI theme
- [x] Live mode simulation

### Phase 1 Enhancements
- [ ] AI Insights integration (optional, API key gated)
- [ ] Chat assistant with chart suggestions
- [ ] Distribution histograms
- [ ] Fuzzy dataset search/loading
- [ ] Mobile responsiveness improvements

### Phase 2+ (Future)
- [ ] Advanced report builder
- [ ] Multiple simultaneous datasets
- [ ] Data export (CSV, JSON)
- [ ] Custom themes & branding
- [ ] Collaborative features
- [ ] Database integrations
- [ ] Predictive analytics
- [ ] Mobile app

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **Numeric Column** | Column containing numeric values (int, float); used for Y-axis, correlation, statistics |
| **Categorical Column** | Column containing non-numeric values (string, enum); used for grouping, pie labels, X-axis |
| **Schema Detection** | Automatic identification of column types on dataset import |
| **Correlation** | Pearson correlation coefficient (-1 to +1) measuring linear relationship between two numeric variables |
| **Heatmap** | Color-coded matrix visualization; here used for correlation matrix |
| **Outlier** | Data point significantly different from others; potential data quality issue or real anomaly |
| **Live Mode** | Real-time data simulation using random walk algorithm; useful for demos and monitoring scenarios |
| **AI Insights** | One-click automated analysis providing summary, trends, anomalies, recommendations |
| **Function Calling** | AI capability to suggest structured outputs (e.g., chart configs) that can be actioned by UI |
| **SVG Export** | Save chart as scalable vector graphic; preserves quality at any size, ideal for presentations |
| **Recharts** | React charting library built on D3; used for all visualizations |
| **localStorage** | Browser's client-side storage; persists data across page refreshes |

---

## 13. Appendices

### Appendix A: Example CSV Dataset

```csv
Date,Region,Sales,Margin,Category,Units
2024-01-01,North,15000,0.35,Electronics,450
2024-01-01,South,12000,0.32,Apparel,350
2024-01-01,East,18000,0.40,Electronics,520
2024-01-02,North,16500,0.36,Apparel,480
2024-01-02,South,13200,0.33,Electronics,380
...
```

**Expected columns detected**:
- Numeric: Sales, Margin, Units
- Categorical: Date (as string), Region, Category

**Example analyses**:
- Line chart: Date vs Sales (trend over time)
- Bar chart: Region vs Sales (regional comparison)
- Scatter chart: Units vs Margin (correlation analysis)
- Pie chart: Category (sales composition)

### Appendix B: Color Palette

```css
/* Primary Backgrounds */
--bg-primary: #030712;    /* slate-950 */
--bg-secondary: #0f172a;  /* slate-900 */
--bg-tertiary: #1e293b;   /* slate-800 */

/* Accents */
--accent-primary: #3b82f6;    /* blue-500 */
--accent-primary-dark: #4f46e5; /* indigo-500 */
--accent-secondary: #10b981;   /* emerald-500 */
--accent-tertiary: #f59e0b;    /* amber-500 */

/* Alert States */
--error: #ef4444;     /* red-500 */
--warning: #f59e0b;   /* amber-500 */
--success: #10b981;   /* emerald-500 */
--info: #3b82f6;      /* blue-500 */

/* Text */
--text-primary: #f1f5f9;   /* slate-100 */
--text-secondary: #cbd5e1; /* slate-300 */
--text-muted: #94a3b8;     /* slate-400 */
```

### Appendix C: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Open upload modal |
| `Tab` | Navigate between UI elements |
| `Enter` | Confirm modal; send chat message |
| `Shift + Enter` | Multiline in textarea (chat) |
| `Esc` | Close modals; exit fullscreen chart |
| `Ctrl/Cmd + S` | Save current state (auto-saved to localStorage) |

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2024-02-24 | Product Team | Initial PRD; MVP scope |
| 2.0 | 2024-03-15 | Product Team | Added Phase 2-6 roadmap; updated AI section for optional support |

---

**End of PRD Document**
