# Visual Feature Guide - ReportIQ Advanced Analytics

## Dashboard Page Layout

### Section 1: Analytics Header
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Test Execution Analytics                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Section 2: Key Metrics Cards (Responsive Grid)
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Runs  │   Passed    │   Failed    │   Running   │  Pass Rate  │
│      4      │      3      │      0      │      1      │   75.0%     │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

Each card includes:
- Colored left border (Blue, Green, Red, Orange, Purple)
- Light background color matching the border
- Large number display
- Descriptive label

### Section 3: Analytics Charts (Three-Chart Layout)
```
┌──────────────────────────────┬──────────────────────────────┐
│   Tests by Status            │   Tests by Browser           │
│   (Pie Chart)                │   (Bar Chart)                │
│                              │                              │
│     [Pie visualization]      │   [Bar visualization]        │
└──────────────────────────────┴──────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│   Test Results Overview (Passed vs Failed)                   │
│   (Stacked Bar Chart)                                        │
│                                                              │
│          [Bar visualization]                                 │
└──────────────────────────────────────────────────────────────┘
```

### Section 4: Filter Panel
```
┌───────────────────────────────────────────────────────────────────┐
│  From Date     To Date     Browser    Status     Tag        [Export]│
│  [▼ dropdown]  [▼ dropdown] [Chrome  ▼] [PASS ▼] [Search...] [Excel]│
└───────────────────────────────────────────────────────────────────┘
```

Features:
- Date pickers (from/to)
- Browser selector (All, Chrome, Firefox, Safari)
- Status selector (All, Passed, Failed, Running)
- Tag search input
- Export Excel button (green styling)
- Clear Filters button (appears when filters active)

### Section 5: Data Table
```
┌──────────────┬──────────┬────────┬──────────┬──────────────┬────────────┬──────────────┐
│ Browser      │ Tags     │ Status │ Tests    │ Pass / Fail  │ Started    │ Finished     │
├──────────────┼──────────┼────────┼──────────┼──────────────┼────────────┼──────────────┤
│ Chrome       │ P1,Smoke │ PASS   │ 5        │ ✓ 5  ✗ 0     │ Jan 17,... │ Jan 17,...   │
├──────────────┼──────────┼────────┼──────────┼──────────────┼────────────┼──────────────┤
│ Chrome       │ Smoke    │ PASS   │ 4        │ ✓ 4  ✗ 0     │ Jan 17,... │ Jan 17,...   │
├──────────────┼──────────┼────────┼──────────┼──────────────┼────────────┼──────────────┤
│ Firefox      │ P1       │ RUNNING│ 3        │ ✓ 2  ✗ 1     │ Jan 17,... │ -            │
└──────────────┴──────────┴────────┴──────────┴──────────────┴────────────┴──────────────┘
```

Table Features:
- Hover highlighting on rows
- Click row to navigate to execution details
- Status shown with color chip
- Pass/fail counts with colored badges

---

## Execution Detail Page Layout

### Section 1: Header
```
┌─────────────────────────────────────────────┐
│ [← Back to Dashboard]                       │
│ Execution Run Details | Chrome | ✓ PASS     │
│ Started: Jan 17, 2:30 PM • Finished: Jan 17, 2:31 PM
└─────────────────────────────────────────────┘
```

### Section 2: Performance Metrics Cards (Five-Card Grid)
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Tests │   Passed    │   Failed    │  Pass Rate  │ Avg Duration│
│      5      │      5      │      0      │   100.0%    │    2.45s    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Section 3: Analytics Charts (Two-Chart Layout)
```
┌──────────────────────────────┬──────────────────────────────┐
│   Test Status Distribution   │   Test Duration Timeline     │
│   (Pie Chart)                │   (Line Chart)               │
│                              │                              │
│     [Pie visualization]      │   [Line visualization]       │
│                              │                              │
│     Passed: 5                │   Y-axis: Duration (seconds) │
│     Failed: 0                │   X-axis: Test Case # (TC1-5)│
└──────────────────────────────┴──────────────────────────────┘
```

### Section 4: Filter & Export Panel
```
┌────────────────────────────────────────────────────────────────┐
│ Filter by Status: [All Tests ▼]      [Excel] [PDF]             │
└────────────────────────────────────────────────────────────────┘
```

Features:
- Status filter dropdown (All Tests, Passed, Failed)
- Excel export button (green)
- PDF export button (blue)
- Filtered count display

### Section 5: Test Case Details Table
```
┌──────────────────────┬────────┬───────┬──────────┬──────────┬──────────┐
│ Test Case            │ Status │ Steps │ Duration │ Started  │ Finished │
├──────────────────────┼────────┼───────┼──────────┼──────────┼──────────┤
│ invalidLoginError    │ PASS   │ 3     │ 1.23s    │ 2:30:05  │ 2:30:08  │
├──────────────────────┼────────┼───────┼──────────┼──────────┼──────────┤
│ successfulLogin      │ PASS   │ 4     │ 2.45s    │ 2:30:09  │ 2:30:13  │
├──────────────────────┼────────┼───────┼──────────┼──────────┼──────────┤
│ dynamicLoading       │ PASS   │ 2     │ 1.67s ⚠  │ 2:30:14  │ 2:30:16  │
├──────────────────────┼────────┼───────┼──────────┼──────────┼──────────┤
│ dropdownSelect       │ PASS   │ 3     │ 1.89s    │ 2:30:17  │ 2:30:20  │
├──────────────────────┼────────┼───────┼──────────┼──────────┼──────────┤
│ checkboxToggle       │ PASS   │ 2     │ 0.98s    │ 2:30:21  │ 2:30:23  │
└──────────────────────┴────────┴───────┴──────────┴──────────┴──────────┘

⚠ = Duration highlighted if > 80% of maximum duration
```

Table Features:
- Color-coded status chips
- Duration warnings for slow tests
- Click row to view test case details
- Precise timestamp display

---

## Color Scheme Reference

### Metric Cards
| Metric | Color | Hex |
|--------|-------|-----|
| Total Runs | Blue | #3b82f6 |
| Passed | Green | #10b981 |
| Failed | Red | #ef4444 |
| Running | Orange | #f59e0b |
| Pass Rate | Purple | #6366f1 |

### Chart Colors
| Element | Color | Hex |
|---------|-------|-----|
| Pass/Success | Green | #10b981 |
| Fail/Error | Red | #ef4444 |
| Running/In Progress | Orange | #f59e0b |
| Primary | Blue | #3b82f6 |
| Secondary | Purple | #8b5cf6 |

### Status Chips
| Status | Chip Color | Text Color |
|--------|-----------|-----------|
| PASS | Green (#10b981) | White |
| FAIL | Red (#ef4444) | White |
| RUNNING | Orange (#f59e0b) | White |

---

## Responsive Design Breakpoints

### Desktop (≥ 1200px)
- 5 metric cards per row
- 2 charts per row
- Full-width filters
- Expanded table

### Tablet (600px - 1199px)
- 2 metric cards per row
- 1 chart per row
- Stacked filter inputs
- Scrollable table

### Mobile (< 600px)
- 1 metric card per row
- Full-width stacked charts
- Vertical filter inputs
- Horizontal table scroll

---

## Interactive Elements

### Filters
- **Date Fields**: Calendar picker (HTML5)
- **Dropdown Selects**: Material-UI Select component
- **Text Input**: Search/tag filter
- **Button**: Clear Filters (conditional display)

### Export Buttons
- **Excel**: Green button with download icon
- **PDF**: Blue button with download icon
- **Disabled State**: When no data to export

### Charts
- **Tooltips**: Hover to see exact values
- **Responsive**: Resize with container
- **Empty State**: Message when no data

### Table Rows
- **Hover Effect**: Light gray background
- **Clickable**: Cursor changes to pointer
- **Navigation**: Click to drill down

---

## Data Flow Visualization

```
Dashboard Page
    ↓
[Load test runs from API]
    ↓
[Display raw runs in state]
    ↓
[Apply filters via useMemo]
    ↓
[Calculate metrics via useMemo]
    ↓
[Prepare chart data via useMemo]
    ↓
┌─────────────────────────────────────┐
│ Render:                             │
│ - Metric cards                      │
│ - Charts                            │
│ - Filter panel                      │
│ - Data table                        │
└─────────────────────────────────────┘
    ↓
[Every 4 seconds: reload data]
```

---

## Accessibility Features

✅ Semantic HTML structure
✅ ARIA labels on interactive elements
✅ Color contrast WCAG AA compliant
✅ Keyboard navigation support
✅ Focus indicators visible
✅ Alt text for images/icons
✅ Descriptive button labels
✅ Form inputs properly labeled

---

## Performance Optimizations

✅ **Memoization**: useMemo for filters, metrics, chart data
✅ **Lazy Loading**: Charts load when visible
✅ **Code Splitting**: Components imported on demand
✅ **Image Optimization**: SVG logos, no large images
✅ **Event Debouncing**: Auto-refresh every 4 seconds (not continuous)
✅ **Virtual Scrolling**: Large tables with virtualization
✅ **CSS-in-JS**: Material-UI sx prop for styling

---

## Export File Examples

### Excel Export Structure
```
File: test-execution-report-2026-01-17.xlsx

Sheet 1: "Summary"
├─ Test Execution Summary
├─ Total Runs: 4
├─ Passed: 3
├─ Failed: 0
├─ Running: 1
├─ Total Tests: 16
├─ Passed Tests: 15
├─ Failed Tests: 1
└─ Pass Rate %: 93.75

Sheet 2: "Test Runs"
├─ Browser | Tags | Status | Test Cases | Passed | Failed | Started | Finished
├─ chrome  | P1,Smoke | PASS | 5 | 5 | 0 | 2026-01-17 14:30:00 | 2026-01-17 14:31:00
└─ ... (more rows)
```

### PDF Export Structure
```
┌─────────────────────────────────────────┐
│       Test Execution Report             │
├─────────────────────────────────────────┤
│ Browser: Chrome                         │
│ Status: PASS                            │
│ Started: 2026-01-17 14:30:00           │
│ Finished: 2026-01-17 14:31:00          │
│                                         │
│ Summary Metrics                         │
│ ├─ Total Test Cases: 5                 │
│ ├─ Passed: 5 (100%)                    │
│ ├─ Failed: 0                           │
│ ├─ Average Duration: 2.45s             │
│ └─ Max Duration: 4.32s                 │
│                                         │
│ Test Cases                              │
│ ┌──────────────┬───────┬──────┬────┐  │
│ │ Test Case    │ Status│ Steps│ Dur│  │
│ ├──────────────┼───────┼──────┼────┤  │
│ │ Test 1       │ PASS  │ 3    │ 1.2│  │
│ └──────────────┴───────┴──────┴────┘  │
└─────────────────────────────────────────┘
```

---

## Usage Scenarios

### Scenario 1: Daily Test Report
1. Open Dashboard
2. Set date filter to today
3. View summary metrics
4. Click Export Excel
5. Share report with team

### Scenario 2: Browser Compatibility Check
1. Open Dashboard
2. Use Browser filter to select Chrome
3. Review status and pass rate
4. Switch to Firefox, compare results
5. Export comparison data

### Scenario 3: Performance Investigation
1. Navigate to Execution Detail
2. Review Test Duration Timeline
3. Identify slow tests (red duration)
4. Click test case for step-level details
5. Export PDF for documentation

### Scenario 4: Flakiness Analysis
1. Filter to recent runs
2. Look for patterns in failed tests
3. Compare multiple run details
4. Export test case data to CSV
5. Analyze in spreadsheet for trends

---

**Design System**: Material-UI 6.3.0
**Chart Library**: Recharts 2.10.3
**Export Format**: XLSX (Excel), PDF (jsPDF), CSV (custom)
**Last Updated**: January 17, 2026
