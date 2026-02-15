(function() {
  'use strict';

  /**
   * CulturalMapItineraryCalendar
   * Google Calendar URL generation for itinerary stops.
   * No DOM, no external dependencies.
   */

  /**
   * Build a Google Calendar event creation URL.
   *
   * @param {Object} params
   * @param {string} params.title - Event title
   * @param {string} params.startDate - 'YYYY-MM-DD'
   * @param {string} params.startTime - 'HH:MM' (24h)
   * @param {number} params.durationMinutes - Duration in minutes
   * @param {string} params.location - Event location string
   * @param {string} params.description - Event description
   * @param {string} [params.timezone] - IANA timezone (default: 'America/Los_Angeles')
   * @returns {string} Google Calendar URL
   */
  function buildGoogleCalendarUrl(params) {
    var title = params.title || '';
    var startDate = params.startDate || '';
    var startTime = params.startTime || '09:00';
    var durationMinutes = params.durationMinutes || 60;
    var location = params.location || '';
    var description = params.description || '';
    var timezone = params.timezone || 'America/Los_Angeles';

    // Build start datetime: YYYYMMDDTHHMMSS
    var datePart = startDate.replace(/-/g, '');
    var timeParts = startTime.split(':');
    var startHour = parseInt(timeParts[0], 10) || 0;
    var startMin = parseInt(timeParts[1], 10) || 0;
    var start = datePart + 'T' +
      String(startHour).padStart(2, '0') +
      String(startMin).padStart(2, '0') + '00';

    // Calculate end time
    var totalMinutes = startHour * 60 + startMin + durationMinutes;
    var endHour = Math.floor(totalMinutes / 60);
    var endMin = totalMinutes % 60;

    // Handle day overflow (stop running past midnight)
    if (endHour >= 24) {
      endHour = 23;
      endMin = 59;
    }

    var end = datePart + 'T' +
      String(endHour).padStart(2, '0') +
      String(endMin).padStart(2, '0') + '00';

    var base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    var queryParts = [
      'text=' + encodeURIComponent(title),
      'dates=' + start + '/' + end,
      'ctz=' + encodeURIComponent(timezone),
      'location=' + encodeURIComponent(location),
      'details=' + encodeURIComponent(description)
    ];

    return base + '&' + queryParts.join('&');
  }

  /**
   * Get the next Saturday as 'YYYY-MM-DD'.
   * If today is Saturday, returns today.
   *
   * @returns {string} 'YYYY-MM-DD'
   */
  function getNextSaturday() {
    var now = new Date();
    var day = now.getDay(); // 0=Sun, 6=Sat
    var daysUntilSat = (6 - day + 7) % 7;
    // If today is Saturday (day===6), daysUntilSat = 0, which is correct
    var sat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat);

    var yyyy = sat.getFullYear();
    var mm = String(sat.getMonth() + 1).padStart(2, '0');
    var dd = String(sat.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }

  /**
   * Convenience wrapper: build a Google Calendar URL for a resolved itinerary stop.
   *
   * @param {Object} stop - Resolved stop (from resolveItineraryStops), must have .data, .time, .duration, .narrative
   * @param {Object} itinerary - The parent itinerary object (for title)
   * @param {string} [dateStr] - 'YYYY-MM-DD', defaults to getNextSaturday()
   * @returns {string} Google Calendar URL
   */
  function buildStopCalendarUrl(stop, itinerary, dateStr) {
    if (!stop || !stop.data) return '';

    var date = dateStr || getNextSaturday();
    var assetName = stop.data.n || stop.asset || 'Visit';
    var itineraryTitle = (itinerary && itinerary.title) ? itinerary.title : 'Itinerary';

    // Build location from asset data
    var locationParts = [];
    if (stop.data.a) locationParts.push(stop.data.a);
    if (stop.data.c) locationParts.push(stop.data.c);
    locationParts.push('CA');
    var location = locationParts.join(', ');

    return buildGoogleCalendarUrl({
      title: assetName + ' - ' + itineraryTitle,
      startDate: date,
      startTime: stop.time || '09:00',
      durationMinutes: stop.duration || 60,
      location: location,
      description: stop.narrative || ''
    });
  }

  window.CulturalMapItineraryCalendar = {
    buildGoogleCalendarUrl: buildGoogleCalendarUrl,
    getNextSaturday: getNextSaturday,
    buildStopCalendarUrl: buildStopCalendarUrl
  };

})();
