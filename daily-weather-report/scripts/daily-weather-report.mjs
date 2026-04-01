#!/usr/bin/env node
/**
 * Daily Weather Report Generator
 * Generates a comprehensive travel report for Wuhan Jiangxia district
 * 
 * Usage:
 *   node daily-weather-report.mjs [options]
 * 
 * Options:
 *   --city, -c     City/district (default: Wuhan Jiangxia)
 *   --plate, -p    License plate (default: 鄂A57HZ5)
 *   --days, -d     Forecast days (default: 3)
 *   --format, -f   Output format: text|json (default: text)
 * 
 * The script fetches weather data from weather.com.cn for Wuhan Jiangxia (code: 101200105)
 * and generates a structured travel report.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

const DEFAULT_CITY = '武汉江夏区';
const DEFAULT_PLATE = '鄂A57HZ5';
const DEFAULT_DAYS = 3;
const DEFAULT_FORMAT = 'text';
const WEATHER_CITY_CODE = '101200105';

function parseArgs(argv) {
  const args = { city: DEFAULT_CITY, plate: DEFAULT_PLATE, days: DEFAULT_DAYS, format: DEFAULT_FORMAT };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--city' || arg === '-c') args.city = argv[++i];
    else if (arg === '--plate' || arg === '-p') args.plate = argv[++i];
    else if (arg === '--days' || arg === '-d') args.days = parseInt(argv[++i]);
    else if (arg === '--format' || arg === '-f') args.format = argv[++i];
    else if (arg === '--help' || arg === '-h') { help(); process.exit(0); }
  }
  return args;
}

function help() {
  console.log('Daily Weather Report Generator');
  console.log('Usage: node daily-weather-report.mjs [options]');
  console.log('');
  console.log('Options:');
  console.log('  --city, -c     City/district (default: ' + DEFAULT_CITY + ')');
  console.log('  --plate, -p    License plate (default: ' + DEFAULT_PLATE + ')');
  console.log('  --days, -d     Forecast days (default: ' + DEFAULT_DAYS + ')');
  console.log('  --format, -f   Output format: text|json (default: text)');
  console.log('  --help, -h     Show this help');
}

function httpGet(urlStr, encoding) {
  if (encoding === undefined) encoding = 'utf-8';
  return new Promise(function(resolve, reject) {
    const url = new URL(urlStr);
    const protocol = url.protocol === 'https:' ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.weather.com.cn/',
      },
      timeout: 15000,
    };
    const req = protocol.get(urlStr, options, function(res) {
      const chunks = [];
      res.on('data', function(chunk) { chunks.push(chunk); });
      res.on('end', function() {
        const data = Buffer.concat(chunks).toString(encoding, 'replace');
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    req.on('timeout', function() { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function getTodayInfo() {
  const now = new Date();
  const dateStr = now.getFullYear() + 'nian' + (now.getMonth()+1) + 'yue' + now.getDate() + 'ri';
  const dayNames = ['周日','周一','周二','周三','周四','周五','周六'];
  const dayName = dayNames[now.getDay()];
  return { now: now, dateStr: dateStr, dayName: dayName };
}

function getPlateRestriction(plate) {
  const match = plate.match(/[A-Za-z](\d)/);
  if (!match) {
    return { plate: plate, lastDigit: null, canCrossToday: false, reason: 'Cannot parse plate number' };
  }
  const lastDigit = parseInt(match[1], 10);
  const day = new Date().getDate();
  const isOdd = (day % 2 === 1);
  let canCross = false;
  let reason = '';
  if (isOdd && (lastDigit % 2 === 1)) {
    canCross = true;
    reason = 'Today (' + day + ', odd), plate ending ' + lastDigit + ' (odd) - ALLOWED';
  } else if (!isOdd && (lastDigit % 2 === 0)) {
    canCross = true;
    reason = 'Today (' + day + ', even), plate ending ' + lastDigit + ' (even) - ALLOWED';
  } else if (isOdd) {
    reason = 'Today (' + day + ', odd), plate ending ' + lastDigit + ' (even) - NOT ALLOWED';
  } else {
    reason = 'Today (' + day + ', even), plate ending ' + lastDigit + ' (odd) - NOT ALLOWED';
  }
  return { plate: plate, lastDigit: lastDigit, canCrossToday: canCross, reason: reason };
}

function stripHtmlTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseWeatherPage(html) {
  // Try to find the 7-day forecast block
  const forecast = [];
  
  // Look for the 7d div
  const div7dMatch = html.match(/id="7d"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div[^>]*id="livezs"/);
  if (!div7dMatch) {
    // Try alternative: find all li blocks in weather list
    const liBlocks = html.match(/<li[^>]*class="[^"]*sky[^"]*"[^>]*>[\s\S]*?<\/li>/gi);
    if (liBlocks && liBlocks.length > 0) {
      for (let i = 0; i < Math.min(liBlocks.length, 7); i++) {
        const block = liBlocks[i];
        const dateMatch = block.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const weaMatch = block.match(/title="([^"]+)"[^>]*class="wea"|class="wea"[^>]*title="([^"]+)"|class="wea"[^>]*>([^<]+)</);
        const temMatch = block.match(/<span>(\d+)[^<]*<\/span>\/[^<]*<i>(\d+)/);
        
        let weather = '';
        if (weaMatch) {
          weather = (weaMatch[1] || weaMatch[2] || weaMatch[3] || '').trim();
        }
        
        forecast.push({
          date: dateMatch ? dateMatch[1].trim() : ('Day ' + (i+1)),
          weather: weather,
          tempHigh: temMatch ? temMatch[1] : '',
          tempLow: temMatch ? temMatch[2] : '',
        });
      }
    }
  } else {
    // Parse from the 7d div
    const content = div7dMatch[1];
    const liBlocks = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    
    for (let i = 0; i < Math.min(liBlocks.length, 7); i++) {
      const block = liBlocks[i];
      const dateMatch = block.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const weaMatch = block.match(/class="wea"[^>]*title="([^"]+)"|title="([^"]+)"[^>]*class="wea"/);
      const temMatch = block.match(/<span>(\d+)[^<]*<\/span>\/[^<]*<i>(\d+)/);
      
      let weather = '';
      if (weaMatch) {
        weather = (weaMatch[1] || weaMatch[2] || '').trim();
      }
      
      forecast.push({
        date: dateMatch ? dateMatch[1].trim() : ('Day ' + (i+1)),
        weather: weather,
        tempHigh: temMatch ? temMatch[1] : '',
        tempLow: temMatch ? temMatch[2] : '',
      });
    }
  }
  
  return forecast.length > 0 ? forecast : null;
}

function hasRainInWeather(weatherText) {
  if (!weatherText) return false;
  return weatherText.indexOf('雨') !== -1 || weatherText.indexOf('雪') !== -1;
}

async function main(argv) {
  const opts = parseArgs(argv);
  const todayInfo = getTodayInfo();
  const now = todayInfo.now;
  const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  
  console.error('[INFO] Fetching weather for ' + opts.city + '...');
  console.error('[INFO] Date: ' + todayInfo.dateStr + ' (' + todayInfo.dayName + ')');
  
  let weatherData = null;
  let fetchSuccess = false;
  try {
    // Fetch from weather.com.cn using the Jiangxia city code
    const weatherUrl = 'https://www.weather.com.cn/weather/' + WEATHER_CITY_CODE + '.shtml';
    console.error('[INFO] Fetching: ' + weatherUrl);
    const resp = await httpGet(weatherUrl);
    console.error('[INFO] Response status: ' + resp.status);
    
    if (resp.status === 200) {
      weatherData = parseWeatherPage(resp.body);
      console.error('[INFO] Parsed ' + (weatherData ? weatherData.length : 0) + ' forecast days');
      fetchSuccess = true;
    }
  } catch (e) {
    console.error('[WARN] Weather fetch failed: ' + e.message);
  }
  
  const plateInfo = getPlateRestriction(opts.plate);
  
  if (opts.format === 'json') {
    const report = {
      date: todayStr,
      dateStr: todayInfo.dateStr,
      dayName: todayInfo.dayName,
      city: opts.city,
      plate: opts.plate,
      plateRestriction: plateInfo,
      weather: weatherData,
      fetchSuccess: fetchSuccess,
      forecastDays: opts.days,
    };
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
    return;
  }
  
  // Text format
  const lines = [];
  lines.push('=== DAILY TRAVEL REPORT ===');
  lines.push(todayInfo.dateStr + ' (' + todayInfo.dayName + ') | ' + opts.city);
  lines.push('');
  
  // Section 1: Today's weather
  lines.push('[1] TODAY\'S WEATHER');
  if (weatherData && weatherData.length > 0) {
    const today = weatherData[0];
    lines.push('  Weather: ' + (today.weather || 'N/A'));
    if (today.tempHigh || today.tempLow) {
      lines.push('  Temperature: ' + (today.tempLow || '?') + 'C - ' + (today.tempHigh || '?') + 'C');
    }
    const hasRain = hasRainInWeather(today.weather);
    lines.push('  Rain: ' + (hasRain ? 'YES - bring umbrella!' : 'No rain'));
    if (today.weather.indexOf('暴雨') !== -1 || today.weather.indexOf('台风') !== -1) {
      lines.push('  WARNING: Extreme weather! Stay safe.');
    }
  } else {
    lines.push('  Weather: Data unavailable (manual check recommended)');
    lines.push('  Rain: Bring umbrella as a precaution');
  }
  lines.push('');
  
  // Section 2: Key periods
  lines.push('[2] RUSH HOUR ANALYSIS');
  const weatherDesc = (weatherData && weatherData[0]) ? weatherData[0].weather : '';
  const hasRainNow = hasRainInWeather(weatherDesc);
  
  lines.push('Morning (7:00-9:00):');
  if (hasRainNow) {
    lines.push('  - Rain: reduced visibility, slippery roads');
    lines.push('  - Leave 15-20 min earlier than usual');
  } else {
    lines.push('  - Normal weather, standard commute');
  }
  lines.push('');
  lines.push('Evening (18:00-20:00):');
  if (hasRainNow) {
    lines.push('  - Possible lingering rain');
    lines.push('  - Higher congestion expected, drive carefully');
  } else {
    lines.push('  - Normal weather, standard commute');
  }
  lines.push('');
  
  // Section 3: Traffic
  lines.push('[3] TRAFFIC RESTRICTIONS');
  lines.push('Plate: ' + opts.plate);
  lines.push('Yangtze/Han River Bridge: 7:00-22:00 odd-even restriction');
  if (plateInfo.lastDigit !== null) {
    lines.push('Today: ' + plateInfo.reason);
    if (!plateInfo.canCrossToday) {
      lines.push('*** CANNOT cross bridges today - use alternate routes ***');
    }
  }
  lines.push('');
  lines.push('Current restrictions (Mar-Apr):');
  lines.push('  - Cherry blossom season (3/7-4/12): road controls in Luojia Mountain/East Lake area');
  lines.push('  - Tomb-sweeping weekend (4/4-6): expect congestion at cemeteries');
  lines.push('  - Jiangxia district roads: normal, no major closures');
  lines.push('');
  
  // Section 4: Future forecast
  lines.push('[4] FORECAST (NEXT ' + opts.days + ' DAYS)');
  if (weatherData && weatherData.length > 1) {
    for (let i = 1; i <= Math.min(opts.days, weatherData.length - 1); i++) {
      const day = weatherData[i];
      const rain = hasRainInWeather(day.weather) ? '[RAIN]' : '[CLEAR]';
      const temp = (day.tempLow || '?') + 'C-' + (day.tempHigh || '?') + 'C';
      lines.push('  ' + day.date + ': ' + (day.weather || 'N/A') + ' | ' + temp + ' ' + rain);
    }
  } else {
    lines.push('  Forecast data unavailable - recommend manual check');
  }
  lines.push('');
  
  // Section 5: Summary
  lines.push('[5] SUMMARY');
  const items = [];
  if (hasRainNow) items.push('Bring umbrella and warm clothes');
  if (plateInfo.lastDigit !== null && !plateInfo.canCrossToday) {
    items.push('CANNOT cross bridges today - plan alternate route');
  }
  items.push('Weekend (4/4-6) tomb-sweeping: expect peak congestion');
  if (items.length === 0) items.push('Normal travel day - no special warnings');
  items.forEach(function(item) { lines.push('  - ' + item); });
  
  console.log(lines.join('\n'));
  process.exit(0);
}

main(process.argv).catch(function(err) {
  console.error('[ERROR] ' + err.message);
  process.exit(1);
});
