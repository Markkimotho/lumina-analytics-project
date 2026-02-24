# Lumina Analytics Dashboard - Local Testing Guide

##  Current Status

- **Dev Server**: Running on `http://localhost:3000`
- **Build**:  Compiles without errors
- **Dependencies**:  All installed
- **Database**:  localStorage enabled

---

## Quick Start

### 1. Access the Application
Open your browser and navigate to: **http://localhost:3000**

You should see the Lumina Analytics Dashboard with:
- Dark luxury theme (slate-950 background, blue accents)
- Left sidebar with navigation menu
- Empty state prompting to upload data

### 2. Upload Sample Data
- Click the **"Upload Data"** button (or the `+` icon in the Datasets sidebar)
- Use the included **`sample-data.csv`** file located in the project root
- The file contains 30 rows of sales data across 3 regions with 8 columns

---

## Feature Testing Checklist

### A. Data Upload & Schema Detection 
**Test**: Upload the sample CSV
**Expected Results**:
- [ ] File uploads successfully
- [ ] Data appears in the sidebar as "sample-data"
- [ ] Dashboard tab shows 3 stat cards:
  - Total Records: 30
  - Columns: 8
  - Last Updated: Today's date
- [ ] Default chart is created (Line chart with first two numeric columns)

**Numeric Columns Detected**: Sales, Margin, Units, Clicks, Conversion
**Categorical Columns Detected**: Date, Region, Category

---

### B. Dashboard & Chart Management 
**Test**: Interact with the Dashboard tab
**Expected Results**:
- [ ] At least one default chart appears on load
- [ ] Chart is fully interactive (hover shows tooltips)
- [ ] Chart has action buttons:
  - **Expand** (fullscreen icon): Click to view chart full-screen
  - **Download** (download icon): Saves as SVG file
  - **Delete** (trash icon): Removes chart from dashboard

**Create Additional Charts**:
- [ ] Click **"+ Add Chart"** button
- [ ] In the modal, select:
  - Chart Type: **Bar**
  - X Axis: **Region**
  - Y Axis: **Sales**
- [ ] Chart appears on dashboard showing sales by region
- [ ] Delete chart to clean up

---

### C. Data Filtering 
**Test**: Use the filter bar in Dashboard
**Expected Results**:
- [ ] Filter bar appears above charts
- [ ] Select Column: **Region**
- [ ] Enter Value: **North**
- [ ] All charts update to show only North region data
- [ ] Record count updates to show filtered rows only
- [ ] Click **"Clear"** to reset filter

---

### D. Statistics Tab 
**Test**: Navigate to Statistics tab (left sidebar)
**Expected Results**:

**Numeric Summaries Table**:
- [ ] Shows one row per numeric column (5 total)
- [ ] Displays: Mean, Median, Std Dev, Min, Max, Missing
- [ ] Each row has a Distribution mini-histogram
- [ ] Values are mathematically accurate (verify one manually)

**Correlation Heatmap**:
- [ ] Shows correlation matrix for all numeric columns
- [ ] Color coding:
  - Blue = positive correlation
  - Gray = no correlation
  - Red = negative correlation
- [ ] Hovering on cells shows exact correlation value
- [ ] Symmetric matrix (no duplicate pairs)

**Sample Expected Correlations**:
- Sales  <->  Units: ~0.90 (strong positive)  ->  Blue
- Sales  <->  Margin: ~0.75 (positive)  ->  Blue
- Margin  <->  Units: Should be moderate  ->  Light Blue

---

### E. Data Inspector Tab 
**Test**: Navigate to Data Inspector tab
**Expected Results**:
- [ ] Table displays all 30 rows with 8 columns
- [ ] Column headers are: Date, Region, Sales, Margin, Category, Units, Clicks, Conversion
- [ ] Can scroll horizontally and vertically
- [ ] Status bar shows: "Showing 30 rows" (or filtered count)

**Test Sorting**:
- [ ] Click **"Sales"** column header
- [ ] Rows sort descending by Sales value
- [ ] Click again to toggle ascending
- [ ] Verified: East region has highest sales (~20,000)

**Test Filtering**:
- [ ] Use the filter dropdowns above the table
- [ ] Select Column: **Category**
- [ ] Enter Value: **Electronics**
- [ ] Table shows only Electronics rows (~15 of 30)

---

### F. Live Mode (Simulation) 
**Test**: Real-time data streaming simulation
**Expected Results**:
- [ ] **"Live Mode"** toggle visible in top header
- [ ] Default state: "Static Data" (gray button)
- [ ] Click toggle  ->  State changes to "Live Stream" (red button)
- [ ] Charts begin updating every 1.5 seconds
- [ ] Data points shift due to random walk algorithm (10% noise applied)
- [ ] Click toggle again to pause live mode
- [ ] Chart freezes at current state

**Behavior to Observe**:
- Sales values fluctuate but remain within reasonable range
- Margin percentages stay consistent
- No new rows added (window maintained)

---

### G. Chart Export 
**Test**: SVG export functionality
**Expected Results**:
- [ ] Create any chart (e.g., Line chart)
- [ ] Click **Download** button on chart
- [ ] File `chart-title.svg` downloads to Downloads folder
- [ ] SVG file opens in browser and renders correctly
- [ ] Verify: Chart colors, labels, and data are preserved

**Tip**: Open downloaded SVG in VS Code to verify it's valid XML; or open in browser to view.

---

### H. AI Insights Tab (Optional) 
**Note**: This feature is optional and requires an API key. It works without the key but shows limitations.

**Test**: Navigate to AI Insights tab
**Expected Results**:
- [ ] Shows empty state with "Generate Report" button
- [ ] ChatPanel is visible on the right
- [ ] Chat input allows typing messages

**Without API Key**:
- [ ] "Generate Report" shows error or fallback message
- [ ] Chat may work with basic responses (depends on configuration)

**With API Key** (if configured in `.env.local`):
1. Set `API_KEY=your_key` in `.env.local`
2. Restart dev server
3. Click "Generate Report"  ->  Analysis generated with:
   - Summary of dataset
   - List of key trends
   - Anomalies detected
   - Recommendation for best chart type
4. Start chatting:
   - Ask: "What region has the highest sales?"
   - AI responds with context-aware answer
   - AI may suggest chart configuration

---

### I. Dataset Persistence 
**Test**: localStorage integration
**Expected Results**:
- [ ] Upload sample data
- [ ] Create a chart
- [ ] **Refresh page** (Cmd+R or F5)
- [ ] Page reloads
- [ ] Dataset and chart still visible
- [ ] Data is loaded from localStorage automatically
- [ ] No re-upload needed

---

### J. UI/UX & Theme 
**Test**: Visual design verification
**Expected Results**:
- [ ] **Color Scheme**: Dark luxury (slate-950 background, indigo-500 accents)
- [ ] **Sidebar**: Fixed left panel with navigation and dataset list
- [ ] **Header**: Top bar with dataset name and Live Mode toggle
- [ ] **Icons**: All buttons use Lucide React icons
- [ ] **Typography**: Clean, readable fonts
- [ ] **Spacing**: Consistent 4px grid
- [ ] **Hover States**: All buttons have proper hover effects
- [ ] **Accessibility**: High contrast text (white on dark)
- [ ] **Responsive**: Resizable window still displays properly

---

## Test Scenarios

### Scenario 1: Sales Analysis Workflow
1. Upload `sample-data.csv`
2. View Dashboard  ->  Default chart shows
3. Go to Statistics  ->  Examine correlation between Sales and Units
4. Create Bar chart (Region vs Sales)  ->  See East region outperforms
5. Filter by Region "East"  ->  See top performers
6. Go to Data Inspector  ->  Verify exact values
7. Export Bar chart as SVG

**Expected Outcome**: Complete analysis workflow with visualizations

---

### Scenario 2: Live Monitoring Demo
1. Upload sample data
2. Create a Line chart (Date vs Sales)
3. Enable Live Mode
4. Watch the chart update for 30 seconds (20 updates)
5. Observe realistic data fluctuation
6. Take screenshot for demo purposes
7. Disable Live Mode

**Expected Outcome**: Streaming animation demonstration

---

### Scenario 3: Multi-Chart Dashboard
1. Upload data
2. Create 4 different charts:
   - Line: Date vs Sales
   - Bar: Region vs Units
   - Scatter: Margin vs Clicks
   - Pie: Category (distribution)
3. Apply filter: Category = "Electronics"
4. All 4 charts update simultaneously
5. Expand one chart to fullscreen
6. Return to normal view

**Expected Outcome**: Multi-chart responsive dashboard

---

## Configuration (Optional)

### Enable AI Features
To enable AI-powered analysis:

1. **Get an API Key**:
   - Sign up at https://ai.google.dev/
   - Create a free API key for Generative AI
   - Cost: Free tier available with usage limits

2. **Configure Locally**:
   ```bash
   # Create .env.local in project root
   echo "API_KEY=your_google_api_key_here" > .env.local
   ```

3. **Restart Dev Server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Test AI Features**:
   - Go to AI Insights tab
   - Click "Generate Report"  ->  Should work now
   - Use Chat to ask questions about data

---

## Sample Data Description

The included `sample-data.csv` contains:
- **Date Range**: Jan 1-30, 2024
- **Rows**: 30 sales records
- **Regions**: North, South, East (competitors for analysis)
- **Metrics**: Sales, Margin %, Units sold, Click-through, Conversion rate
- **Categories**: Electronics, Apparel

**Interesting Patterns**:
- East region outperforms (18k-21k sales vs 12k-15k South)
- Strong correlation between Sales and Units (higher volume = higher revenue)
- Margin consistent across regions (~32-43%)
- Electronics more profitable than Apparel

---

## Troubleshooting

### Issue: Page shows blank white screen
**Solution**: 
- Check console (F12  ->  Console tab) for errors
- Verify localhost:3000 is correct
- Clear browser cache (Cmd+Shift+Delete)
- Restart dev server

### Issue: CSV upload fails
**Solution**:
- Verify CSV has header row
- Check comma delimiter (not semicolon)
- Try with `sample-data.csv` first
- Check file is valid UTF-8 encoding

### Issue: Charts not rendering
**Solution**:
- Ensure you have numeric columns for Y-axis
- Select different columns in chart modal
- Check browser console for warnings
- Refresh page and try again

### Issue: localStorage not persisting data
**Solution**:
- Check browser localStorage isn't disabled
- Try private/incognito window (some blocks storage)
- Verify app has permission to use localStorage
- Check storage quota (usually 5-10MB per domain)

### Issue: AI features not working
**Solution**:
- AI features are optional; app works without API key
- If you want AI: configure `.env.local` with API key
- Verify API key is valid and has quota
- Check network tab (F12) for API call errors

---

##  Feature Coverage Summary

| Feature | Status | Notes |
|---------|--------|-------|
| CSV Upload |  Fully Functional | PapaParse integration |
| Schema Detection |  Fully Functional | Auto numeric/categorical |
| 5 Chart Types |  Fully Functional | Line, Bar, Area, Scatter, Pie |
| Chart Export |  Fully Functional | SVG format |
| Statistics |  Fully Functional | Mean, Median, Std Dev, Correlation |
| Data Filtering |  Fully Functional | Column & value filters |
| Data Grid |  Fully Functional | Scrollable, sortable table |
| Live Mode |  Fully Functional | Real-time simulation |
| localStorage |  Fully Functional | Dataset persistence |
| Dark Theme |  Fully Functional | Luxury design |
| AI Insights | Optional | Requires API key |
| Chat Assistant | Optional | Requires API key |

---

## Support & Next Steps

1. **Test all features** using the checklist above
2. **Report any bugs** or unexpected behavior
3. **Suggest improvements** for UI/UX
4. **Deploy to production** when ready:
   ```bash
   npm run build
   # Deploy dist/ folder to hosting
   ```

---

**Last Updated**: February 24, 2026  
**Version**: 2.0.0  
**Running**: `npm run dev` on `http://localhost:3000`
