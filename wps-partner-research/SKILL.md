---
name: wps-partner-research
description: "Generate structured overseas partner DD reports for WPS Office distribution partners. Use when: partner DD, overseas distributor analysis, WPS channel partner evaluation, 合作伙伴尽调, 海外分销商调查, WPS代理商尽调"
license: MIT
---

# WPS Partner Due Diligence Report Skill

## Overview

Generate structured overseas partner due diligence (DD) reports for WPS Office international distribution partners (member codes / License / toT offline channels). Follow the 12-section DD template, with WPS product distribution as the evaluation lens.

## Core Assumptions

- Our business: WPS Office overseas member code + License product distribution
- Report language: Simplified Chinese
- Target regions: All countries outside mainland China
- Output: Plain text markdown, suitable for Feishu or email

## Report Structure (12 Sections)

### Section 1 — 基础公司信息
Table: | 项目 | 内容 | 核实方法 | 状态 |
Always end with 红旗信号 subsection listing anomalies.
Common flags: no website, residential address, only personal email, single owner.

### Section 2 — 股东与管理层
Cover: founder background, shareholding, management team, VC/PE.
End with 风险信号 subsection.

### Section 3 — 业务与产品能力
Always include WPS product fit table:
| WPS产品线 | 适配度 | 理由 |
List required materials to obtain from the partner.

### Section 4 — 市场与客户
Always note government procurement channels as positive signal.
Include WPS License market fit analysis.

### Section 5 — 财务健康状况
State "未公开" if no data. Flag as risk if company is >3 years old with no financials.

### Section 6 — 法律与合规
Compliance table with status for: court records, tax, sanctions, bankruptcy.

### Section 7 — 运营能力
Critical for WPS: evaluate digital delivery capability for member codes and License activation.

### Section 8 — 声誉与市场口碑
Check: Google, Trustpilot, news, local platforms. State "无法评估" if no data.

### Section 9 — 合作风险评估
Weighted scoring table (6 dimensions, total out of 100):
- 80+: 推荐合作
- 60-80: 小规模测试性合作
- <60: 不建议合作

### Section 10 — 实际合作验证步骤
Numbered steps 1-6: initial DD -> document request -> video call -> trial order -> reference check -> contract.

### Section 11 — 需要对方提供的文件清单
Numbered checklist of required documents.

### Section 12 — 最终结论与建议
Per-product recommendations (Member Code / License / toT offline) + next-step actions.
Always end with 免责声明.

## Information Sources

1. National business registry
2. LinkedIn / company website
3. Government procurement databases
4. Sanctions/PEP screening
5. Industry databases (Statista, 6WResearch, etc.)

## Key Red Flags

- No official website or LinkedIn
- Residential address
- Single beneficial owner, no management team
- No public financials for companies older than 3 years
- No digital delivery capability (critical for WPS member codes)
- Located outside commercial hub

## Scoring Model (Default)

| 维度 | 权重 |
|------|------|
| 公司真实性 | 20% |
| 财务稳定性 | 20% |
| 业务能力 | 20% |
| 市场信誉 | 15% |
| 合规与认证 | 15% |
| 沟通与合作 | 10% |

## How to Run

When user provides company name + country + background:
1. Conduct web research (tavily-search + multi-search)
2. Look up national business registries
3. Search sanctions/PEP lists
4. Evaluate WPS product fit
5. Fill all 12 sections in Simplified Chinese
6. Include report number: DD-{COUNTRY}-{NAME}-{DATE}
7. End with 免责声明
8. **Save report as MD file** to:
   `C:\Users\Administrator\openclaw_output\due_diligence_reports\{REPORT_NO}.md`
   - Create directory if not exists
   - Write full report content to the .md file
   - Report file name format: `DD-{COUNTRY_CODE}-{COMPANY_NAME_ABBREV}-{YYYYMMDD}.md`

## Constraints

- Use Simplified Chinese throughout the report
- Use Chinese punctuation: ，。：；？！""『』
- Do not fabricate — state "未查到公开信息" if unknown
- Always include 免责声明 at end
- Always save the completed report as an .md file to the local output directory
