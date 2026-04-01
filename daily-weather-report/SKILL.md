---
name: daily-weather-report
description: 每日出行早报 - 生成武汉江夏区天气+交通+限行综合报告。自动查询当日天气、未来3天预报、武汉交通限行信息，并针对早晚高峰给出出行建议。
metadata:
  {"openclaw":{"emoji":"🌤️","requires":{"bins":["node"],"env":[]}}}
tags: [weather, wuhan, traffic, daily-report, china]
---

# Daily Weather Report Skill

## Usage for Agent

When the user requests a daily travel report, run:

```bash
node skills/daily-weather-report/scripts/daily-weather-report.mjs
```

The script will output a formatted travel report including:
1. Today's weather (Wuhan Jiangxia)
2. Rush hour analysis (morning 7-9am, evening 6-8pm)
3. Traffic restrictions and plate-based bridge crossing rules
4. 3-day weather forecast
5. Summary with actionable recommendations

## Options

- `--city, -c`: City/district (default: 武汉江夏区)
- `--plate, -p`: License plate for restriction check (default: 鄂A57HZ5)
- `--days, -d`: Forecast days (default: 3)
- `--format, -f`: Output format: text|json (default: text)

## Example Output

```
=== DAILY TRAVEL REPORT ===
2026年3月31日 (周二) | 武汉江夏区

[1] TODAY'S WEATHER
  Weather: 小雨转晴
  Temperature: 11C - 17C
  Rain: YES - bring umbrella!

[2] RUSH HOUR ANALYSIS
Morning (7:00-9:00):
  - Rain: reduced visibility, slippery roads
  - Leave 15-20 min earlier than usual
...

[3] TRAFFIC RESTRICTIONS
Plate: 鄂A57HZ5
Today: Today (31, odd), plate ending 5 (odd) - ALLOWED
...

[4] FORECAST (NEXT 3 DAYS)
...

[5] SUMMARY
  - Bring umbrella and warm clothes
  - CANNOT cross bridges today - plan alternate route
```

## Notes

- Weather data source: weather.com.cn (city code: 101200105 for Wuhan Jiangxia)
- Traffic restrictions: Wuhan traffic management bureau announcements
- Bridge restrictions: Yangtze River Bridge & Han River Bridge odd-even rule (7:00-22:00 on weekdays)
- If weather parsing fails, fall back to web search for weather data

# 每日出行早报 (Daily Weather Report)

自动生成武汉江夏区综合出行报告，包含天气、交通限行、早晚高峰分析。

## 使用方法

```bash
node skills/daily-weather-report/scripts/daily-weather-report.mjs [options]
```

### 选项

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--city, -c` | 城市/区域 | 武汉江夏区 |
| `--plate, -p` | 车牌号（用于限行判断）| 鄂A57HZ5 |
| `--days, -d` | 未来预报天数 | 3 |

### 示例

```bash
# 使用默认配置（武汉江夏区，鄂A57HZ5，3天预报）
node skills/daily-weather-report/scripts/daily-weather-report.mjs

# 自定义城市和车牌
node skills/daily-weather-report/scripts/daily-weather-report.mjs --city "武汉" --plate "鄂A12345"

# 查询5天预报
node skills/daily-weather-report/scripts/daily-weather-report.mjs --days 5
```

## 报告内容结构

生成的报告包含以下模块：

### 1. 今日天气
- 天气状况、温度、风力
- 是否下雨判断
- 极端天气预警（如有）

### 2. 重点时段分析
- **早高峰 7:00-9:00**：天气影响 + 拥堵预警
- **晚高峰 18:00-20:00**：天气影响 + 拥堵预警

### 3. 交通出行
- 武汉现行限行规则（长江大桥/江汉桥单双号限行）
- 针对指定车牌的限行提醒
- 近期重大交通管控（赏花季、清明等）
- 道路封禁信息

### 4. 未来3天天气预报
- 每日天气、气温、整体评价

### 5. 综合出行建议
- 时段별具体建议
- 限行提醒
- 穿着/装备建议

## 数据来源

- 天气预报：中国天气网 (weather.com.cn)
- 交通限行：武汉市公安局交通管理局通告
- 路况信息：武汉交警官方发布

## Agent 使用指引

当用户请求"每日出行早报"、"生成出行报告"、"今日出行建议"时，使用本 skill。

调用脚本后，将输出的报告内容整理为格式化消息发送给用户。

如脚本执行失败，可回退到手动网络搜索方式生成报告。
