(function() {
  'use strict';

  function normalizeEventToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  function makeEventVenueKey(name, city) {
    return `${normalizeEventToken(name)}|${normalizeEventToken(city)}`;
  }

  function parseEventDate(value) {
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function isEventUpcoming(event) {
    const start = parseEventDate(event && event.start_iso);
    const end = parseEventDate(event && event.end_iso) || start;
    if (!start || !end) return false;
    return end.getTime() >= Date.now();
  }

  function isEventWithinDays(event, days) {
    const start = parseEventDate(event && event.start_iso);
    const end = parseEventDate(event && event.end_iso) || start;
    if (!start || !end) return false;
    const now = Date.now();
    const max = now + (days * 24 * 60 * 60 * 1000);
    const startTs = start.getTime();
    const endTs = end.getTime();
    return endTs >= now && startTs <= max;
  }

  function isWeekendEvent(event, defaultTimezone) {
    const start = parseEventDate(event && event.start_iso);
    if (!start) return false;
    const tz = (event && event.timezone) || defaultTimezone || 'America/Los_Angeles';
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(start);
    return weekday === 'Sat' || weekday === 'Sun';
  }

  function getDateKeyInTimezone(date, tz) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value || '0000';
    const month = parts.find((p) => p.type === 'month')?.value || '00';
    const day = parts.find((p) => p.type === 'day')?.value || '00';
    return `${year}-${month}-${day}`;
  }

  function isEventToday(event, defaultTimezone) {
    const start = parseEventDate(event && event.start_iso);
    const end = parseEventDate(event && event.end_iso) || start;
    if (!start || !end) return false;
    const tz = (event && event.timezone) || defaultTimezone || 'America/Los_Angeles';
    const todayKey = getDateKeyInTimezone(new Date(), tz);
    const startKey = getDateKeyInTimezone(start, tz);
    const endKey = getDateKeyInTimezone(end, tz);
    return todayKey >= startKey && todayKey <= endKey;
  }

  function formatEventDateRange(event, defaultTimezone) {
    const start = parseEventDate(event && event.start_iso);
    const end = parseEventDate(event && event.end_iso);
    if (!start || !end) return 'Schedule pending';
    const tz = (event && event.timezone) || defaultTimezone || 'America/Los_Angeles';
    const dayFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit'
    });
    return `${dayFmt.format(start)} • ${timeFmt.format(start)}-${timeFmt.format(end)}`;
  }

  function getEventDisplayDescription(event) {
    const raw = String((event && event.description) || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (raw) return raw;
    if (Array.isArray(event && event.tags) && event.tags.length) {
      return `Type: ${event.tags.slice(0, 2).join(' • ')}`;
    }
    return 'Details available in the event link.';
  }

  window.CulturalMapEventsUtils = {
    normalizeEventToken,
    makeEventVenueKey,
    parseEventDate,
    isEventUpcoming,
    isEventWithinDays,
    isWeekendEvent,
    isEventToday,
    formatEventDateRange,
    getEventDisplayDescription
  };
})();
