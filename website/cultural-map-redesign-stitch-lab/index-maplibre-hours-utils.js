(function() {
  'use strict';

  function getNowInTimezone(timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).formatToParts(new Date());
    const toValue = (type) => (parts.find((p) => p.type === type) || {}).value || '';
    const weekday = toValue('weekday');
    const hour = parseInt(toValue('hour') || '0', 10);
    const minute = parseInt(toValue('minute') || '0', 10);
    const dayPeriod = (toValue('dayPeriod') || '').toUpperCase();
    let h24 = hour % 12;
    if (dayPeriod === 'PM') h24 += 12;
    return { weekday, minutes: (h24 * 60) + minute };
  }

  function normalizeHoursText(value) {
    return String(value || '')
      .replace(/[\u202f\u2009\u00a0]/g, ' ')
      .replace(/[‐‑‒–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseTimeToken(token, fallbackPeriod) {
    const cleaned = normalizeHoursText(token).replace(/\./g, '');
    const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?/);
    if (!match) return null;
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2] || '0', 10);
    const period = (match[3] ? match[3].toUpperCase() : (fallbackPeriod || '')).toUpperCase();
    if (!period || (period !== 'AM' && period !== 'PM')) return null;
    let h24 = hour % 12;
    if (period === 'PM') h24 += 12;
    return { minutes: (h24 * 60) + minute, period };
  }

  function getTodayHoursEntry(hours, timezone) {
    if (!Array.isArray(hours) || hours.length === 0) return null;
    const now = getNowInTimezone(timezone || 'America/Los_Angeles');
    const prefix = `${now.weekday}:`.toLowerCase();
    const line = hours.find((entry) => typeof entry === 'string' && entry.toLowerCase().startsWith(prefix));
    return line || null;
  }

  function parseTodayRanges(todayEntry) {
    if (!todayEntry) return null;
    const normalized = normalizeHoursText(todayEntry);
    const splitIdx = normalized.indexOf(':');
    if (splitIdx < 0) return null;
    const schedule = normalized.slice(splitIdx + 1).trim();
    if (!schedule) return null;
    if (/open 24 hours/i.test(schedule)) return { state: 'open', ranges: '24h', display: schedule };
    if (/^closed$/i.test(schedule)) return { state: 'closed', ranges: [], display: schedule };

    const ranges = [];
    for (const part of schedule.split(',')) {
      const segment = part.trim();
      const rangeMatch = segment.match(/(.+?)\s*-\s*(.+)/);
      if (!rangeMatch) continue;
      const end = parseTimeToken(rangeMatch[2], null);
      const start = parseTimeToken(rangeMatch[1], end ? end.period : null);
      if (!start || !end) continue;
      ranges.push({ start: start.minutes, end: end.minutes });
    }
    if (!ranges.length) return { state: 'unknown', ranges: [], display: schedule };
    return { state: 'range', ranges, display: schedule };
  }

  function isOpenAtNow(ranges, timezone) {
    const now = getNowInTimezone(timezone || 'America/Los_Angeles').minutes;
    for (const range of ranges) {
      if (range.start === range.end) return true;
      if (range.start < range.end) {
        if (now >= range.start && now < range.end) return true;
      } else if (now >= range.start || now < range.end) {
        return true;
      }
    }
    return false;
  }

  function getHoursState(venue, timezone) {
    const parsed = parseTodayRanges(getTodayHoursEntry(venue && venue.h, timezone));
    if (!parsed) return 'unknown';
    if (parsed.state === 'open' || parsed.state === 'closed' || parsed.state === 'unknown') return parsed.state;
    return isOpenAtNow(parsed.ranges, timezone) ? 'open' : 'closed';
  }

  function getHoursLabel(state) {
    if (state === 'open') return 'Open now';
    if (state === 'closed') return 'Closed now';
    return 'Hours unknown';
  }

  function getHoursRank(state) {
    if (state === 'open') return 0;
    if (state === 'unknown') return 1;
    return 2;
  }

  function getTodayHoursDisplay(venue, timezone) {
    const parsed = parseTodayRanges(getTodayHoursEntry(venue && venue.h, timezone));
    if (!parsed) return null;
    return parsed.display || null;
  }

  window.CulturalMapHoursUtils = {
    getNowInTimezone,
    normalizeHoursText,
    parseTimeToken,
    getTodayHoursEntry,
    parseTodayRanges,
    isOpenAtNow,
    getHoursState,
    getHoursLabel,
    getHoursRank,
    getTodayHoursDisplay
  };
})();
