<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lumina Analytics Dashboard

A high-performance, interactive data visualization dashboard featuring real-time data updates, dynamic charting capabilities, and statistical analysis.

## Features

- **CSV Data Upload** - Import and visualize your data
- **Multiple Chart Types** - Line, Bar, Area, Scatter, and Pie charts
- **Real-time Updates** - Simulate live data streaming
- **Statistical Analysis** - View key metrics and distributions
- **Data Filtering** - Filter datasets by column values
- **AI-Powered Insights** - Get automated data analysis (requires API configuration)
- **Interactive Chat** - Ask questions about your data

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **(Optional) Set up AI features:**
   - Create a `.env.local` file in the root directory
   - Add your API key: `API_KEY=your_api_key_here`
   - Without this, the dashboard still works for charting and statistics

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run preview
```
