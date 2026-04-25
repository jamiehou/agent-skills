---
name: sales-report
description: Generate formatted sales analysis reports from Excel order data. Use when the user asks to analyze, generate, or output a sales report from structured data files (e.g., overseas orders, distributor sales, subscription revenue). Triggers on: "生成销售报表", "分析销售数据", "输出报表", "按代理商", "按月统计", "sales report", "销售报告".
---

# Sales Report

Generate two formatted analysis tables from Excel order data:

1. **Monthly sales by product category** — each row = month, columns = product categories
2. **Monthly sales by product category AND distributor** — table 1 broken down by distributor

## Core Rules

### Data Filters (always apply)
- Read only the **first sheet** (`sheet_index=0`)
- Only columns **A through P** (`usecols='A:P'`)
- Filter: `Invoice date` (column N, index 13) must have a value AND match the target year
- Ignore columns beyond P

### Product Categorization
Map the product name field (column H, index 7) into four categories:

| Category | Rule |
|----------|------|
| `会员码` | Product contains "WPS Pro" but **NOT** "WPS Pro for Team" |
| `License` | Product contains "WPS Office For Business" |
| `toT线下` | Product contains "WPS Pro for Team" |
| `其他` | All remaining products |

### Output Columns
Use these exact column positions:
- `Distributor`: column B (index 1)
- `Invoice date`: column N (index 13)
- `Total amount`: column M (index 12)
- `Product`: column H (index 7, the Unnamed_7 field)

## Workflow

1. Read the Excel file using `pandas.read_excel` with `sheet_name=0, usecols='A:P'`
2. Rename columns using positional index mapping (see script for exact indices)
3. Parse `Invoice date` as datetime, filter to target year
4. Apply `categorize()` function to the product column to create `Product Category`
5. Add a `Month` column (1–12) derived from the invoice date
6. Generate **Table 1**: pivot table — index=`Month`, columns=`Product Category`, values=`Total amount`, aggfunc=`sum`
7. Generate **Table 2**: for each month, pivot table — index=`Distributor`, columns=`Product Category`, values=`Total amount`, aggfunc=`sum`; sort by distributor subtotal descending
8. Print both tables in plain text format with `$` currency formatting

## Running the Script

```bash
python skills/sales-report/scripts/analyze.py --file "<filepath>" --year <YYYY>
```

Arguments:
- `--file, -f` (required): Path to the Excel file
- `--year, -y` (optional, default=2026): Year to filter
- `--sheet, -s` (optional, default=0): Sheet index

## Constraints

- Always set `fill_value=0` on pivot tables so missing cells show `$0` instead of NaN
- Always ensure all four category columns exist in output (add missing ones as zero columns)
- Sort Table 2 distributors by subtotal descending within each month
- Print a section header before each table with the year in Chinese (e.g., `【表1】2026年各月各产品类目销售总额`)
