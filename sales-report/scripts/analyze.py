"""
Sales Report Analyzer
Generates formatted sales analysis tables based on user-defined filters and product categories.
"""
import pandas as pd
import warnings
import argparse
warnings.filterwarnings('ignore')


def run_report(file_path: str, year_filter: int = 2026, sheet_index: int = 0):
    # ── Load: first sheet, columns A-P ─────────────────────────
    df = pd.read_excel(file_path, sheet_name=sheet_index, usecols='A:P')

    # Give clean names by position (A:P = 16 cols, indices 0-15)
    # Col H (index 7) = product, Col N (index 13) = invoice date
    # Col M (index 12) = total amount, Col B (index 1) = distributor
    df.columns = [
        'Country/Area', 'Distributor', 'PO date', 'PO Number',
        'End User Company', 'Mgmt Platform', 'Admin account',
        'Product',          # index 7 = col H
        'License Type', 'Period', 'Unit Price', 'Qty',
        'Total amount',     # index 12 = col M
        'Invoice date',      # index 13 = col N
        'Invoice NO', 'PAIED'
    ]

    # ── Filter: Invoice date has value AND matches target year ─
    df['Invoice date'] = pd.to_datetime(df['Invoice date'], errors='coerce')
    df_filtered = df[
        df['Invoice date'].notna() &
        (df['Invoice date'].dt.year == year_filter)
    ].copy()

    if len(df_filtered) == 0:
        print(f'No records found for year {year_filter}.')
        return

    df_filtered['Month'] = df_filtered['Invoice date'].dt.month

    # ── Product categorization ──────────────────────────────────
    def categorize(val):
        if pd.isna(val):
            return '其他'
        v = str(val)
        if 'WPS Pro' in v and 'WPS Pro for Team' not in v:
            return '会员码'
        elif 'WPS Office For Business' in v:
            return 'License'
        elif 'WPS Pro for Team' in v:
            return 'toT线下'
        return '其他'

    df_filtered['Product Category'] = df_filtered['Product'].apply(categorize)

    # ── Summary ─────────────────────────────────────────────────
    dmin = df_filtered['Invoice date'].min().strftime('%Y-%m-%d')
    dmax = df_filtered['Invoice date'].max().strftime('%Y-%m-%d')
    cats_order = ['会员码', 'License', 'toT线下', '其他']
    print(f'\nFiltered: {len(df_filtered)} records | {dmin} ~ {dmax}\n')

    # ============================================================
    # TABLE 1 — Monthly sales by product category
    # ============================================================
    t1 = df_filtered.pivot_table(
        index='Month',
        columns='Product Category',
        values='Total amount',
        aggfunc='sum',
        fill_value=0,
    )
    for c in cats_order:
        if c not in t1.columns:
            t1[c] = 0
    t1 = t1[cats_order]
    t1['月度总计'] = t1.sum(axis=1)
    months = sorted(t1.index)

    print('=' * 80)
    print(f'【表1】{year_filter}年各月各产品类目销售总额')
    print('=' * 80)
    hdr = f'{"月份":<6}' + ''.join(f'{c:>15}' for c in t1.columns)
    print(hdr)
    print('-' * 80)
    for m in months:
        row = f'{m:<6}' + ''.join(
            f'${t1.loc[m, c]:>13,.0f} ' for c in t1.columns
        )
        print(row)
    print('-' * 80)
    tot_row = f'{"总计":<6}' + ''.join(
        f'${t1[c].sum():>13,.0f} ' for c in t1.columns
    )
    print(tot_row)

    # ============================================================
    # TABLE 2 — Monthly by distributor
    # ============================================================
    print()
    print('=' * 80)
    print(f'【表2】{year_filter}年各月各产品类目 — 代理商细分')
    print('=' * 80)

    for m in months:
        mdata = df_filtered[df_filtered['Month'] == m]
        t2 = mdata.pivot_table(
            index='Distributor',
            columns='Product Category',
            values='Total amount',
            aggfunc='sum',
            fill_value=0,
        )
        for c in cats_order:
            if c not in t2.columns:
                t2[c] = 0
        t2 = t2[cats_order]
        t2['代理商小计'] = t2.sum(axis=1)
        t2 = t2.sort_values('代理商小计', ascending=False)

        print(f'\n--- {m}月 ---')
        hdr2 = f'{"代理商":<46}' + ''.join(
            f'{c:>13}' for c in t2.columns
        )
        print(hdr2)
        print('-' * 140)
        for dist in t2.index:
            row2 = f'{str(dist):<46}' + ''.join(
                f'${t2.loc[dist, c]:>11,.0f} ' for c in t2.columns
            )
            print(row2)
        print('-' * 140)
        sub_tot = f'{"本月总计":<46}' + ''.join(
            f'${t2[c].sum():>11,.0f} ' for c in t2.columns
        )
        print(sub_tot)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Sales Report Analyzer')
    parser.add_argument('--file', '-f', required=True, help='Path to Excel file')
    parser.add_argument('--year', '-y', type=int, default=2026, help='Year to filter')
    parser.add_argument('--sheet', '-s', type=int, default=0, help='Sheet index (0-based)')
    args = parser.parse_args()
    run_report(file_path=args.file, year_filter=args.year, sheet_index=args.sheet)
