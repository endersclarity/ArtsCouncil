# User Stories: Nevada County Cultural Asset Map

**Project:** Nevada County Arts Council Cultural Mapping Initiative
**Date:** 2026-02-08
**Core Value:** Enable spontaneous cultural engagement by making it effortless to discover what's open and what's happening at this moment
**Context:** 687 cultural assets across 10 categories; website is single-page MapLibre GL JS app

---

## Persona Overview

This document presents user stories for 6 distinct personas representing the primary audiences for Nevada County's cultural asset map. Each persona includes background, goals, pain points, and 3-5 detailed user stories with mapping-specific acceptance criteria.

### Persona Summary Table

| Persona | Primary Goal | Key Pain Point | Tech Comfort |
|---------|-------------|----------------|--------------|
| **Weekend Visitor** | Discover authentic local experiences | Overwhelmed by generic tourism sites, unsure what's actually worth visiting | Medium |
| **Local Resident** | Stay connected to community cultural events | Doesn't know what's happening in their own county, feels disconnected | Medium-High |
| **Tour Guide/Operator** | Create compelling themed routes | Manual route planning is time-consuming, hard to share with clients | High |
| **Cultural Institution Staff** | Understand visitation patterns and gaps | No visibility into which sites are under-visited or overlooked | Medium-High |
| **Accessibility-Focused User** | Find venues that accommodate mobility/sensory needs | Venue accessibility info is inconsistent or missing entirely | Medium |
| **Researcher/Historian** | Explore cultural heritage connections | Data is scattered, lacks narrative context connecting sites | High |

---

## Persona 1: Weekend Visitor (Sarah)

### Background
**Name:** Sarah Chen
**Age:** 34
**Location:** Sacramento, CA (2-hour drive)
**Occupation:** Marketing Manager
**Visit Frequency:** 3-4 times per year
**Device:** iPhone 15, uses Google Maps habitually

### Goals
- Find authentic, off-the-beaten-path cultural experiences
- Make spontaneous day-trip decisions ("What's open right now?")
- Avoid tourist traps and chain establishments
- Experience local art, history, and performance venues

### Pain Points
- Generic tourism websites show same 5 attractions repeatedly
- Doesn't know which venues are actually open on weekends
- Hard to discover hidden gems (small galleries, local theaters)
- Overwhelmed by too many options without curation or themes
- Mobile experience on most cultural maps is clunky

### User Stories

#### Story 1.1: Discover What's Open Right Now
**As a** weekend visitor arriving in Nevada County around noon
**I want to** filter the map to show only cultural venues open right now
**So that** I can make immediate decisions and not waste time driving to closed locations

**Acceptance Criteria:**
- [ ] Given I load the map on mobile between 12pm-2pm Saturday, the "Open Now" filter toggle is visible above the map (no hidden hamburger menu)
- [ ] When I tap "Open Now", closed venues dim to 40% opacity within 500ms and remain clickable but visually de-emphasized
- [ ] When I tap any open venue marker, the tooltip displays "Open until 5:00 PM" in green text with clock icon
- [ ] When I tap a closed venue marker, the tooltip displays "Closed • Opens Monday 10:00 AM" in gray text
- [ ] Given a venue has no hours data, the tooltip shows "Hours not available" with a link to the venue website
- [ ] When I disable the "Open Now" filter, all venues return to full opacity within 300ms
- [ ] The filter state persists if I zoom/pan the map but resets if I refresh the page

**Related Gap:** Currently no real-time open/closed status (all venues shown equally)

---

#### Story 1.2: Explore Galleries Within Walking Distance
**As a** visitor who just parked in downtown Grass Valley
**I want to** see all galleries and art venues within a 10-minute walk from my location
**So that** I can create an impromptu gallery walk without driving

**Acceptance Criteria:**
- [ ] Given I allow location access, the map centers on my GPS position within 2 seconds with a blue dot marker
- [ ] When I select the "Galleries" category pill, only gallery/studio markers remain at full opacity
- [ ] Given I'm in downtown Grass Valley, I can see at least 4-6 gallery markers within a 0.5-mile radius
- [ ] When I tap any gallery marker, the tooltip shows: name, address, current open/closed status, and estimated walk time ("7 min walk")
- [ ] When I tap "Get Directions" in the detail panel, it opens Google Maps with walking directions (not driving)
- [ ] The map uses clustering at zoom level <14; when I tap a cluster, it expands to show individual venues
- [ ] On mobile, the "Galleries" pill button has a 44px touch target and uses the gallery category color (#8b4d8b)

**Related Gap:** No proximity-based filtering or walk-time estimates

---

#### Story 1.3: Follow a Curated Gold Rush Heritage Trail
**As a** history enthusiast visiting Nevada County
**I want to** experience the "Gold Rush Heritage Trail" curated experience
**So that** I can follow a themed route connecting authentic historical sites with narrative context

**Acceptance Criteria:**
- [ ] Given I scroll to the "Curated Experiences" section above the map, I see a horizontal card for "Gold Rush Heritage Trail" with title, description snippet, and MUSE magazine theme preview
- [ ] When I click "Activate Experience", the map transitions to MUSE theme (teal/rust/sage color palette) with 300ms fade, and non-trail venues dim to 30% opacity
- [ ] When the experience activates, a route line with animated dashes connects 8 numbered stops in sequence
- [ ] When I hover over/tap a stop marker, I see: stop number, venue name, and a 1-2 sentence narrative connector ("Where Chinese miners built stone walls...")
- [ ] Given I'm viewing stop #3, the info panel displays narrative text, an optional historical photo, and a "Next Stop" button that flies the camera to stop #4 with 2-second animation
- [ ] When I click "Exit Experience", the map returns to default theme and all venues return to full opacity within 300ms
- [ ] On mobile, the numbered stop markers are 36px diameter with high contrast (white numbers on teal circles)
- [ ] The experience works offline if I've loaded it once (route line and narrative text cached in localStorage)

**Related Gap:** No thematic routes or progressive narrative experiences

---

#### Story 1.4: Find Venues Open This Evening
**As a** visitor planning dinner and evening entertainment
**I want to** see which performance venues and restaurants are open after 6pm tonight
**So that** I can combine dining with live music or theater

**Acceptance Criteria:**
- [ ] Given it's 4:30pm Saturday, I can activate both "Performance Venues" category pill and "Open Now" filter simultaneously
- [ ] When both filters are active, the map shows only performance venues currently open, and the active filter pills have checkmark icons
- [ ] When I tap a venue marker, the tooltip shows: "Open until 10:00 PM" and lists any events tonight ("Live Jazz • 7:30 PM")
- [ ] Given it's 6:00pm, the map automatically refreshes open/closed status without requiring page reload (checks every 10 minutes)
- [ ] When a venue closes while I'm viewing the map (e.g., gallery closes at 6pm), it smoothly fades to "Closed" state within 30 seconds
- [ ] The detail panel includes a "Plan My Evening" button that saves the venue to a temporary "My Day" list (localStorage, persists until midnight)
- [ ] When I tap "View My Day" (floating button bottom-right), I see my saved venues in a list with open/closed status and estimated travel times

**Related Gap:** No time-of-day awareness or multi-venue itinerary planning

---

#### Story 1.5: Search for Specific Venue by Name
**As a** visitor who heard about "The Center for the Arts" from a friend
**I want to** quickly find it on the map by typing the name
**So that** I don't have to scroll through 687 venues manually

**Acceptance Criteria:**
- [ ] Given I tap the search icon (top-right), a search input expands with autofocus and placeholder text "Search 687 venues..."
- [ ] When I type "Center", autocomplete suggestions appear after 2 characters with up to 5 matches ("The Center for the Arts", "Nevada County Historical Center")
- [ ] When I select "The Center for the Arts" from suggestions, the map flies to that venue with 1.5-second animation (pitch 45°, zoom 16)
- [ ] When the venue is centered, its marker pulses 3 times (scale 1.0 → 1.4 → 1.0 over 1.2 seconds) and the detail panel auto-opens
- [ ] The search supports fuzzy matching ("center arts" finds "The Center for the Arts")
- [ ] Given a venue has multiple aliases ("North Columbia Schoolhouse" = "Columbia Schoolhouse"), search finds both
- [ ] On mobile, the search input takes full width and has 48px height with clear/close button

**Related Gap:** No search functionality (users must browse or use category filters only)

---

## Persona 2: Local Resident (Marcus)

### Background
**Name:** Marcus Thompson
**Age:** 42
**Location:** Nevada City, CA (resident for 12 years)
**Occupation:** High school teacher
**Visit Frequency:** Lives here, visits venues 2-3x/month
**Device:** Android phone + desktop PC

### Goals
- Stay informed about community cultural events and activities
- Support local artists, museums, and performance spaces
- Discover new venues he didn't know existed in his own county
- Share recommendations with out-of-town friends and family

### Pain Points
- Feels disconnected from cultural scene despite living here
- Events are announced on scattered Facebook pages and newsletters
- Didn't realize certain venues existed until stumbling across them
- Friends ask "What should we do in Nevada County?" and he draws a blank
- Tourism maps feel designed for visitors, not locals

### User Stories

#### Story 2.1: Discover Venues I Didn't Know About
**As a** local resident who's lived here 12+ years
**I want to** see all cultural venues in Nevada County at once, including hidden/lesser-known ones
**So that** I can discover places I never knew existed in my own community

**Acceptance Criteria:**
- [ ] Given I load the map zoomed to Nevada County bounds, I see 687 venue markers clustered by geographic density
- [ ] When I click "Show All" (disabling all category filters), the map displays all 10 categories with color-coded markers
- [ ] When I hover over any marker, the tooltip shows: venue name, category, city, and a "Local Favorite" badge (if venue has >50 visits/month from local zip codes)
- [ ] Given I toggle the "New This Year" filter (if implemented), venues added/updated in last 12 months have a sparkle icon overlay
- [ ] When I click the "Explore All" directory button, I see a paginated list (30 per page) with sorting options: "Alphabetical", "Category", "City", "Recently Added"
- [ ] The directory list includes a "Visited" checkbox per venue that syncs to localStorage so I can track which ones I've been to
- [ ] On desktop, I can hold Shift and click multiple markers to add them to a "Share with Friends" list that generates a shareable URL

**Related Gap:** No way to surface "hidden gems" or distinguish new/recently updated venues

---

#### Story 2.2: Find Events Happening This Weekend
**As a** local resident looking for weekend plans
**I want to** see all cultural events happening Saturday-Sunday across all venue types
**So that** I can choose activities without checking 10 different websites and Facebook pages

**Acceptance Criteria:**
- [ ] Given it's Thursday afternoon, I can toggle an "Events This Weekend" filter above the map
- [ ] When the filter is active, only venues with scheduled events Sat-Sun show at full opacity, others dim to 30%
- [ ] When I tap a venue marker with events, the tooltip shows: venue name + "2 events this weekend" in orange text with calendar icon
- [ ] When I open the detail panel, I see event cards below venue info: event title, date/time, brief description, ticket link
- [ ] Given a venue has multiple events (e.g., Friday Night Live Concert Series), they appear as a scrollable list in the panel
- [ ] When I tap "Add to Calendar" on an event, it generates an .ics file download or opens a Google Calendar add-event URL
- [ ] The event data refreshes daily (fetched from Trumba RSS/iCal feeds in Phase 2)
- [ ] On mobile, event cards stack vertically with 16px padding and have high-contrast CTA buttons ("Get Tickets", "Learn More")

**Related Gap:** No event aggregation or "what's happening" discovery (Phase 2 feature)

---

#### Story 2.3: Share a Custom Route with Friends Visiting
**As a** local resident whose friends are visiting from out of town
**I want to** create a custom day-trip route of my favorite spots and send them a shareable link
**So that** they can follow my recommendations without me having to text them 5 different addresses

**Acceptance Criteria:**
- [ ] Given I'm logged in (optional feature), I can click "Create Custom Route" button in the top toolbar
- [ ] When I enter route creation mode, I can click up to 10 venue markers to add them as stops; they get numbered in sequence
- [ ] When I've added 3+ stops, I can drag stop numbers in the sidebar list to reorder them, and the route line updates in real-time
- [ ] When I click "Preview Route", the map draws a driving route line with turn-by-turn directions and shows total distance + estimated time
- [ ] When I click "Save & Share", a modal appears where I can: (a) name the route, (b) add optional description, (c) copy a shareable URL
- [ ] Given I share the URL with friends, when they open it, the map loads with my custom route pre-activated and numbered stops
- [ ] The custom route persists in my "My Routes" list (localStorage or account-based) and I can edit/delete it later
- [ ] On mobile, stop selection has haptic feedback and the route line has 4px stroke width for visibility

**Related Gap:** No user-generated routes or sharing functionality

---

#### Story 2.4: Filter by Family-Friendly Venues
**As a** parent of two elementary-age kids
**I want to** filter venues by "Family-Friendly" tag
**So that** I can find museums, trails, and events appropriate for children without reading every venue description

**Acceptance Criteria:**
- [ ] Given venue data includes a "family_friendly" boolean field, I can toggle a "Family-Friendly" pill in the filter row
- [ ] When the filter is active, only tagged venues remain at full opacity; non-tagged venues dim to 30%
- [ ] When I hover over a family-friendly venue marker, the tooltip includes a green "Family-Friendly" badge with a family icon
- [ ] The detail panel lists family-friendly features: "stroller accessible", "children's activities", "playground nearby", "restrooms"
- [ ] Given a venue hosts kids' events (e.g., children's theater, art classes), those events are highlighted in orange in the event list
- [ ] When I combine "Family-Friendly" with "Open Now", the map shows only currently open family-friendly venues
- [ ] The filter includes a tooltip: "Venues with activities for kids under 12" to clarify criteria
- [ ] On mobile, the "Family-Friendly" pill uses an icon (family symbol) + text for clarity

**Related Gap:** No attribute-based filtering beyond 10 category types

---

#### Story 2.5: View Venue Updates and Announcements
**As a** local resident subscribed to Arts Council updates
**I want to** see recent announcements about venue closures, new openings, or special programming
**So that** I stay informed without having to follow individual venue social media accounts

**Acceptance Criteria:**
- [ ] Given I load the map homepage, a dismissible notification banner appears if there are announcements (e.g., "3 new venues added this month!")
- [ ] When I click "View Updates", a modal opens showing a chronological feed of announcements: new venues, temporary closures, special events
- [ ] Each announcement includes: date, venue name (linked), update type (New, Closure, Reopening, Special Event), and 1-2 sentence description
- [ ] Given a venue on the map has a recent update (last 30 days), its marker has a small orange dot overlay in the top-right corner
- [ ] When I hover over a marker with an update dot, the tooltip shows: "Updated Feb 1: New exhibit opening"
- [ ] The updates feed is sortable by: "Most Recent", "Category", "Update Type"
- [ ] On mobile, the updates modal takes full screen with pull-to-dismiss gesture and smooth scrolling

**Related Gap:** No way to communicate venue updates or keep users informed of map changes

---

## Persona 3: Tour Guide/Operator (Elena)

### Background
**Name:** Elena Rodriguez
**Age:** 38
**Location:** Nevada City, CA
**Occupation:** Owner, "Nevada County Heritage Tours" (small business)
**Visit Frequency:** Daily operations, 5-6 tours per week
**Device:** iPad Pro + MacBook for tour planning

### Goals
- Create compelling themed tour routes efficiently
- Provide clients with professional route maps and itineraries
- Differentiate tours from competitors with unique storytelling
- Access venue details (hours, accessibility, parking) quickly during tour planning
- Share tour previews with potential clients on website

### Pain Points
- Manual route planning in Google Maps is tedious and doesn't highlight cultural context
- Hard to visualize thematic connections between venues
- Clients ask for printed maps, but generic printouts lack branding
- Venue hours change seasonally and she finds out when clients arrive at closed door
- No easy way to embed her curated routes on her business website

### User Stories

#### Story 3.1: Build a Themed "Wine & Art" Tour Route
**As a** tour operator creating a new "Wine & Art" afternoon tour
**I want to** select wineries and galleries from the map and connect them into a logical route
**So that** I can visualize drive times, plan the tour sequence, and provide clients with a map

**Acceptance Criteria:**
- [ ] Given I'm in route creation mode, I can filter by multiple categories simultaneously ("Wineries" + "Galleries") using checkboxes, not exclusive pills
- [ ] When I click markers to add them to my tour, they appear numbered (1, 2, 3...) in the order selected, and a route line auto-draws between them
- [ ] When I drag stop numbers in the sidebar list to reorder, the route line re-calculates and shows updated drive time + total distance
- [ ] Given I've added 5 stops, the route summary shows: "4.2 hours total (2.5 hrs activity time + 1.7 hrs drive time)" based on venue typical visit durations
- [ ] When I click "Optimize Route", the system reorders stops to minimize drive time while respecting any "must be first/last" constraints I set
- [ ] When I click "Preview Tour", the map auto-plays a camera animation flying through each stop in sequence (3 seconds per stop)
- [ ] The route detail panel lists each stop with: name, category, arrival time (based on start time I set), suggested duration, and notes field for my custom commentary
- [ ] On iPad, I can use Apple Pencil to add freehand notes/annotations to the map that appear when I share the route

**Related Gap:** No tour-operator-specific tools or route optimization

---

#### Story 3.2: Check Real-Time Venue Hours Before Tour
**As a** tour operator leading a group of 12 people
**I want to** verify that all stops on today's tour are currently open
**So that** I avoid embarrassing situations where we arrive at closed venues

**Acceptance Criteria:**
- [ ] Given I've saved a tour route, I can open it from "My Routes" and see live open/closed status for all stops
- [ ] When I open the route at 7:00 AM (2 hours before tour start), stops opening at 9:00 AM show: "Opens in 2 hours" in yellow with clock icon
- [ ] When I open the route at 9:15 AM, stops that opened at 9:00 AM show: "Open until 5:00 PM" in green
- [ ] Given a stop on my route is unexpectedly closed today (holiday closure), its marker has a red "Closed Today" badge and the route summary shows a warning: "⚠️ Stop #3 closed today"
- [ ] When I tap the warning, the system suggests alternative venues in the same category within 5 miles: "Nearby galleries open now"
- [ ] The route detail panel shows a "Last Verified" timestamp for hours data per venue ("Updated 2 days ago") so I can judge freshness
- [ ] On iPad, I can enable "Tour Day Mode" which keeps the screen awake and shows current stop + next stop in a HUD overlay

**Related Gap:** No real-time status checks for saved routes or tour-day tools

---

#### Story 3.3: Embed Tour Route on Business Website
**As a** tour operator promoting tours on my business website
**I want to** embed a live, interactive map of my "Gold Rush Heritage Trail" route
**So that** potential clients can explore the tour route before booking

**Acceptance Criteria:**
- [ ] Given I've created a public tour route, I can click "Embed on Website" and get an `<iframe>` code snippet
- [ ] When I paste the iframe into my website, the map loads with my route pre-activated, numbered stops, and route line visible
- [ ] The embedded map is responsive (adapts to container width) and includes zoom/pan controls but hides the "Create Route" and "My Routes" buttons
- [ ] When a website visitor clicks a stop marker in the embedded map, the tooltip shows: venue name, description, and "Book This Tour" CTA button linking back to my booking page
- [ ] The embedded map uses my tour name as the heading: "Gold Rush Heritage Trail - 4 Hours" with tour description below the map
- [ ] Given I update the route on the cultural map site, the embedded version auto-updates (no need to replace iframe code)
- [ ] The embed URL includes optional parameters: `?hideControls=true`, `?startStop=3`, `?theme=muse` for customization
- [ ] On mobile, the embedded map height is 400px minimum and touch interactions work smoothly

**Related Gap:** No embed functionality or public sharing for business use cases

---

#### Story 3.4: Print Professional Tour Itineraries
**As a** tour operator providing printed materials to clients
**I want to** export a PDF itinerary with map, stop details, and my branding
**So that** clients have a keepsake and can follow along during the tour

**Acceptance Criteria:**
- [ ] Given I've created a tour route, I can click "Export PDF" in the route detail panel
- [ ] When I click export, a modal opens with options: (a) include map image (static or multi-page with stops), (b) include venue photos, (c) add custom header/footer with my business logo and contact info
- [ ] When I click "Generate PDF", the system creates a multi-page document: (p1) map overview with numbered stops, (p2-n) one page per stop with photo, description, hours, parking notes, and my custom commentary
- [ ] The PDF uses the current map theme (default or MUSE) for colors and styling, so printed materials match the visual brand
- [ ] Given I have a paid/pro account (future), I can upload my business logo and set default header/footer text that auto-applies to all exports
- [ ] The PDF includes a QR code linking to the live, interactive version of the route on the cultural map website
- [ ] On desktop, the PDF opens in a new tab with print dialog; on mobile, it triggers a download to Files app
- [ ] The export includes metadata: route name, creation date, total distance/time, and "Powered by Nevada County Arts Council" credit

**Related Gap:** No print/export functionality for offline use or professional materials

---

#### Story 3.5: Receive Alerts for Venue Changes Affecting My Tours
**As a** tour operator with 5 saved routes featuring specific venues
**I want to** be notified when venues on my routes change hours or close temporarily
**So that** I can update my tour plans and inform clients proactively

**Acceptance Criteria:**
- [ ] Given I've created a saved route, I can toggle "Watch for Updates" on that route in the "My Routes" list
- [ ] When a venue on a watched route changes hours, closes temporarily, or is removed from the map, I receive an email alert within 24 hours: "Update: [Venue Name] on your [Route Name] tour"
- [ ] The email includes: what changed, effective date, suggested alternative venues (if closure), and a link to edit my route
- [ ] When I log into the map site, a notification badge appears on "My Routes" icon showing number of unread alerts
- [ ] When I click the badge, a notifications panel opens showing all recent alerts with: date, venue, route affected, and action buttons ("View Route", "Dismiss", "Find Alternative")
- [ ] Given I don't have an account, I can still receive alerts by entering my email when I create a route; alerts are tied to a unique route ID stored in my browser
- [ ] The alert system respects frequency preferences: "Real-time", "Daily digest", or "Weekly digest"
- [ ] On mobile, alerts can optionally trigger push notifications (if user has installed the PWA and granted permission)

**Related Gap:** No update notifications or saved-route monitoring

---

## Persona 4: Cultural Institution Staff (Priya)

### Background
**Name:** Priya Kapoor
**Age:** 45
**Location:** Grass Valley, CA
**Occupation:** Director, Nevada County Historical Society
**Visit Frequency:** Uses map weekly for strategic planning
**Device:** Desktop PC + occasional mobile

### Goals
- Understand which cultural sites are under-visited or overlooked
- Identify geographic gaps in cultural programming (underserved areas)
- Advocate for funding/support for smaller, lesser-known institutions
- Collaborate with other venues on cross-promotional opportunities
- Track trends in visitor interests (e.g., which categories are popular)

### Pain Points
- No visibility into aggregated visitation patterns across county cultural assets
- Doesn't know which venues lack accessibility or modern amenities
- Hard to make data-driven case for funding when data is scattered
- Other institutions are "competitors" but could be partners if connections were visible
- Map looks like a public-facing tool, not a planning/advocacy resource

### User Stories

#### Story 4.1: Identify Under-Visited Venues in My Category
**As a** historical society director
**I want to** see which "Historic Preservation" venues have the lowest visitation or engagement
**So that** I can advocate for increased promotion or resources for those sites

**Acceptance Criteria:**
- [ ] Given I'm logged in with an "Institution Admin" role, I can access a "Data & Insights" dashboard tab (not visible to public users)
- [ ] When I open the dashboard, I can filter by category ("Historic Preservation") and see a table of all venues ranked by estimated monthly visitation (low to high)
- [ ] The table columns include: venue name, city, estimated visits/month, last data update, accessibility score (1-5), and "Data Source" (Google Popular Times or manual input)
- [ ] When I click a venue row, the map highlights that venue and shows a detail panel with: visitation trend graph (last 6 months), hours completeness (has full hours vs "hours unknown"), and website/contact completeness
- [ ] Given a venue has <50 visits/month, it's flagged as "Under-Visited" with an icon, and I can click "Generate Report" to export a PDF summary for grant applications
- [ ] The dashboard includes a geographic heatmap showing visitation density across Nevada County, so I can identify underserved areas (e.g., eastern county vs Nevada City corridor)
- [ ] On desktop, the dashboard is a full-width panel with sortable/filterable data table and embedded map side-by-side

**Related Gap:** No analytics dashboard or institution-facing tools

---

#### Story 4.2: Find Venues Missing Accessibility Information
**As a** cultural institution director focused on inclusivity
**I want to** identify which venues lack accessibility data on the map
**So that** I can reach out to those venues and help them document/improve accessibility

**Acceptance Criteria:**
- [ ] Given I'm in the "Data & Insights" dashboard, I can filter by "Accessibility Data Completeness" (Complete, Partial, Missing)
- [ ] When I select "Missing", the map highlights venues with no accessibility info (wheelchair access, parking, restrooms, sensory accommodations)
- [ ] The results table shows: venue name, category, contact email/phone, and a "Reach Out" button that opens a pre-filled email template: "Hi [venue], we'd like to help you document accessibility features for the Nevada County Cultural Map..."
- [ ] Given I click "Bulk Export", I get a CSV of venues missing accessibility data with columns: name, address, contact info, category, website
- [ ] When I mark a venue as "Contacted" in the dashboard, it moves to a separate "In Progress" list and I can add follow-up notes
- [ ] The dashboard shows a progress bar: "348 of 687 venues (51%) have complete accessibility data" to track overall map completeness
- [ ] On desktop, the accessibility audit view shows the map + data table + action buttons (export, email templates, mark completed) in a unified workflow

**Related Gap:** No institution-side tools for data quality monitoring or outreach

---

#### Story 4.3: Discover Cross-Promotion Opportunities
**As a** historical society director
**I want to** find nearby galleries and performance venues to partner with on events
**So that** we can cross-promote and bring more visitors to both institutions

**Acceptance Criteria:**
- [ ] Given I'm viewing my venue's detail page (Nevada County Historical Society), I can click "Find Partners Nearby"
- [ ] When I click it, the map draws a 2-mile radius circle around my venue and highlights venues in complementary categories (galleries, performance venues, fairs/festivals)
- [ ] The results panel lists potential partners ranked by: proximity, category compatibility, and similar visitor demographics (if data available)
- [ ] When I select a potential partner venue, I see: contact info, typical visitor count, recent events, and a "Send Collaboration Inquiry" button
- [ ] The inquiry button opens an email template: "Hi [venue name], I'm Priya from Nevada County Historical Society. We're [2 miles] apart and serve similar audiences. Let's explore a joint event or promotion..."
- [ ] Given I've contacted 3+ partners, I can create a "Partnership Group" in my dashboard that shows all venues in the group on the map with a connecting polygon shape
- [ ] The "Find Partners" tool includes filters: max distance (1/2/5 miles), category types, open/closed status match (e.g., "venues also open Saturdays")
- [ ] On desktop, the partnership workflow is a wizard: (1) define search criteria, (2) review matches, (3) add to partnership group, (4) send outreach

**Related Gap:** No venue-to-venue relationship tools or collaboration features

---

#### Story 4.4: Track Seasonal Visitation Trends
**As a** cultural institution director planning next year's programming
**I want to** see when different venue types are most popular (by month/season)
**So that** I can schedule events during peak visitor interest times

**Acceptance Criteria:**
- [ ] Given I'm in the "Data & Insights" dashboard, I can view a "Seasonal Trends" report with a line graph showing visitation by category (10 lines, one per category) over last 12 months
- [ ] The graph is interactive: when I hover over a data point, I see "Galleries - July 2025: 4,200 estimated visits (+15% vs June)"
- [ ] When I click a category line (e.g., "Performance Venues"), the graph zooms to show only that category with a breakdown by individual venues (top 10 most visited)
- [ ] The report includes insight cards: "Peak Season: June-August for Galleries" and "Lowest Visitation: January-February for Outdoor Venues"
- [ ] Given I select a specific venue (e.g., "Nevada County Historical Society"), I can see its individual trend line compared to category average
- [ ] When I click "Download Report", I get a PDF with graphs, insights, and data table for use in board meetings or grant proposals
- [ ] The dashboard allows me to compare current year vs previous year trends side-by-side
- [ ] On desktop, the trends view is full-width with date range picker (last 6 months, 1 year, 2 years) and export options

**Related Gap:** No longitudinal data tracking or trend analysis features

---

#### Story 4.5: Submit Venue Updates on Behalf of My Institution
**As a** cultural institution director
**I want to** update my venue's information directly from the map (hours, events, accessibility)
**So that** visitors always see accurate info without waiting for Arts Council staff to make edits

**Acceptance Criteria:**
- [ ] Given I'm logged in with a verified institution account, I can click "Edit My Venue" on my venue's detail panel
- [ ] When I click edit, an inline form appears with editable fields: hours (daily schedule), phone, website, description, accessibility features, current events
- [ ] When I update hours, I can set: regular weekly hours, special holiday hours, seasonal closures (e.g., "Closed January-March")
- [ ] When I add an event, I can enter: title, date/time, description, ticket link, and toggle "Display on Map" to make it appear in the "Events This Weekend" filter
- [ ] Given I submit changes, they go through a simple approval workflow: auto-approved if I've edited <3 times and account is verified; otherwise queued for Arts Council admin review
- [ ] The edit form includes a "Preview" button that shows how my changes will look in the tooltip and detail panel before submitting
- [ ] When my edits are approved and published, I receive an email confirmation: "Your updates to [venue name] are now live on the Nevada County Cultural Map"
- [ ] On mobile, the edit form is full-screen with scrollable sections (Hours, Contact, Events, Accessibility) and a sticky "Save Changes" button at bottom

**Related Gap:** No self-service venue editing or institution accounts

---

## Persona 5: Accessibility-Focused User (James)

### Background
**Name:** James Mitchell
**Age:** 58
**Location:** Truckee, CA (30 miles from Nevada County)
**Occupation:** Retired software engineer
**Visit Frequency:** 1-2 times per month
**Device:** iPhone with VoiceOver enabled, occasionally uses desktop with screen reader

### Goals
- Find cultural venues with full wheelchair accessibility (ramps, elevators, accessible restrooms)
- Avoid venues with barriers (stairs-only entry, gravel parking)
- Discover sensory-friendly venues (quiet spaces, low-stimulation environments)
- Plan visits with confidence that he won't encounter unexpected barriers

### Pain Points
- Venue websites often don't list accessibility features
- Google Maps shows "wheelchair accessible entrance" but not parking or restrooms
- Photos can't tell him if a gallery has narrow aisles or tight corners
- Accessibility info is inconsistent (some venues list detailed info, others nothing)
- Map interfaces are often not keyboard-navigable or screen-reader-friendly

### User Stories

#### Story 5.1: Filter by Wheelchair Accessibility
**As a** wheelchair user
**I want to** filter the map to show only venues with full wheelchair accessibility
**So that** I can plan visits without worrying about physical barriers

**Acceptance Criteria:**
- [ ] Given I load the map, I can toggle an "Accessible Venues" filter pill in the main filter row (same level as category pills)
- [ ] When the filter is active, only venues tagged as "Wheelchair Accessible" remain at full opacity; others dim to 30%
- [ ] The "Accessible" tag requires: accessible entrance (ramp or level entry), accessible parking within 100 feet, and accessible restroom
- [ ] When I hover over an accessible venue marker, the tooltip includes a green "Wheelchair Accessible" badge with wheelchair icon
- [ ] When I open the detail panel, an "Accessibility" section lists: entrance type (ramp/level), parking (# of accessible spaces + distance to entrance), restroom, elevator (if multi-floor), and aisle width (if gallery/museum)
- [ ] Given a venue has partial accessibility (e.g., accessible entrance but no accessible restroom), it's NOT included in the filter results, but the detail panel notes: "Partial Accessibility - see details"
- [ ] The filter includes a tooltip: "Venues with accessible entrance, parking, and restrooms" to clarify criteria
- [ ] On mobile, the "Accessible" pill uses an icon (wheelchair) + text and has 48px touch target

**Related Gap:** No accessibility filtering or detailed accessibility metadata

---

#### Story 5.2: View Venue Accessibility Details Before Visiting
**As a** wheelchair user planning a visit to a museum
**I want to** read detailed accessibility info (not just "yes/no") in the venue detail panel
**So that** I can assess if it meets my specific needs (e.g., automatic doors, wide aisles)

**Acceptance Criteria:**
- [ ] Given I tap a venue marker and open the detail panel, the "Accessibility" section appears below venue description with expandable sub-sections
- [ ] The accessibility info is structured: (a) Parking & Entrance, (b) Interior Navigation, (c) Restrooms, (d) Sensory Environment, (e) Additional Notes
- [ ] Parking & Entrance includes: number of accessible spaces, distance to entrance, entrance type (ramp grade, automatic doors, door width), curb cuts
- [ ] Interior Navigation includes: elevator availability, aisle width (galleries/museums), seating availability (performance venues), flooring type (carpet/hardwood/gravel)
- [ ] Restrooms include: accessible stall availability, grab bar locations, sink height, family/single-use option
- [ ] Sensory Environment includes: typical noise level (quiet/moderate/loud), lighting (bright/dim/natural), crowdedness, quiet spaces available
- [ ] Additional Notes includes free-text from venue staff (e.g., "Service animals welcome", "Staff trained in mobility assistance")
- [ ] Each sub-section uses icons + text for scannability and screen-reader clarity
- [ ] On mobile, the accessibility section is collapsed by default with a "View Accessibility Details" button; when expanded, it takes full panel width

**Related Gap:** No structured accessibility metadata or venue-provided details

---

#### Story 5.3: Report Accessibility Barriers
**As a** wheelchair user who encountered an unexpected barrier at a venue
**I want to** submit a report updating the venue's accessibility info
**So that** other users don't face the same issue and the venue is aware

**Acceptance Criteria:**
- [ ] Given I've visited a venue and encountered a barrier (e.g., ramp was too steep, restroom inaccessible), I can click "Report Accessibility Issue" in the detail panel
- [ ] When I click it, a form appears with fields: (a) issue type (parking, entrance, interior, restroom, other), (b) description (free text), (c) photo upload (optional), (d) visit date
- [ ] The form includes checkboxes: "This venue should NOT be tagged as 'Wheelchair Accessible'" and "I consent to sharing this report with venue management"
- [ ] When I submit the report, it's sent to: (a) Arts Council map admins for review, (b) venue contact email (if consent given), and (c) saved in a "Accessibility Reports" database
- [ ] Given a venue has 2+ unresolved barrier reports, a yellow warning icon appears on its marker and tooltip: "⚠️ Accessibility concerns reported"
- [ ] The detail panel shows: "X users reported accessibility issues (last 6 months)" with a "View Reports" button that opens a summary of concerns
- [ ] When venue staff respond to a report (e.g., "We've installed a new ramp"), the response appears under the report and the warning icon is re-evaluated
- [ ] On mobile, the report form is full-screen with photo upload via camera or gallery, and a "Submit Anonymously" option

**Related Gap:** No user reporting or accessibility issue tracking

---

#### Story 5.4: Find Sensory-Friendly Venues
**As a** parent of a child with autism
**I want to** find cultural venues with low sensory stimulation (quiet, dim lighting, uncrowded)
**So that** my family can enjoy cultural experiences without sensory overload

**Acceptance Criteria:**
- [ ] Given I load the map, I can toggle a "Sensory-Friendly" filter pill in the filter row (adjacent to "Accessible Venues")
- [ ] When the filter is active, only venues tagged as "Sensory-Friendly" remain at full opacity
- [ ] The "Sensory-Friendly" tag requires: typical noise level ≤ moderate, availability of quiet spaces, low crowdedness, and flexible visit pacing (no timed entry)
- [ ] When I hover over a sensory-friendly venue marker, the tooltip includes a purple "Sensory-Friendly" badge with a quiet icon (ear with sound waves off)
- [ ] When I open the detail panel, the "Sensory Environment" section lists: typical noise level, lighting type, crowdedness rating (low/medium/high), availability of quiet retreat spaces, and sensory-friendly events (if any)
- [ ] Given a venue offers special sensory-friendly hours (e.g., "Quiet Mornings: Tuesdays 9-11am"), those hours appear in the "Hours" section with a badge
- [ ] The filter includes a tooltip: "Venues with low sensory stimulation and quiet spaces" to clarify criteria
- [ ] On mobile, the "Sensory-Friendly" pill uses an icon + text and has 48px touch target

**Related Gap:** No sensory environment metadata or neurodivergent-friendly filtering

---

#### Story 5.5: Keyboard Navigate Map and Interact with Venues
**As a** screen reader user (VoiceOver on iPhone)
**I want to** navigate the map using keyboard/swipe gestures and activate venue markers
**So that** I can use the map independently without relying on mouse/touch-to-precise-point interactions

**Acceptance Criteria:**
- [ ] Given I navigate to the map page via screen reader, the map container has a descriptive label: "Interactive map showing 687 cultural venues in Nevada County. Use arrow keys to pan, +/- to zoom, and Tab to navigate markers."
- [ ] When I press Tab, focus moves to the first visible venue marker; subsequent Tab presses cycle through markers in top-to-bottom, left-to-right order
- [ ] When a marker is focused, the screen reader announces: "Marker 1 of 687: The Center for the Arts, Performance Venue, Grass Valley. Press Enter to open details."
- [ ] When I press Enter on a focused marker, the detail panel opens and focus moves to the panel's close button, allowing me to Tab through panel content
- [ ] Given I activate a category filter pill via keyboard (Tab to pill, Enter to toggle), the screen reader announces: "Galleries filter active. 84 venues shown."
- [ ] The map supports keyboard shortcuts: Arrow keys pan, +/- zoom, Home returns to Nevada County bounds, Escape closes detail panel/modal
- [ ] All interactive elements (markers, pills, buttons, links) have visible focus indicators (2px blue outline) and meet WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- [ ] On mobile with VoiceOver, swipe gestures navigate markers sequentially, and double-tap activates; map pan/zoom are accessible via VoiceOver rotor gestures
- [ ] The map includes a "Skip to venue list" button (visible on focus) that jumps to the text-based directory for users who prefer non-visual navigation

**Related Gap:** Map keyboard navigation and screen reader support likely incomplete (test needed)

---

## Persona 6: Researcher/Historian (Dr. Alison)

### Background
**Name:** Dr. Alison Wu
**Age:** 52
**Location:** UC Davis (visiting Nevada County for research)
**Occupation:** Cultural Geography Professor
**Visit Frequency:** 3-4 research trips per year
**Device:** MacBook Pro, occasionally iPad for field notes

### Goals
- Explore spatial patterns in cultural heritage (e.g., Gold Rush sites cluster along Highway 49)
- Identify narrative connections between venues (e.g., artists who exhibited at multiple galleries)
- Export data for academic analysis (GIS software, statistical tools)
- Understand historical context and provenance of cultural assets
- Contribute research findings back to the community

### Pain Points
- Cultural data is scattered across county historical society, venue websites, and oral histories
- No way to export venue data for spatial analysis in QGIS or ArcGIS
- Map doesn't show temporal dimension (when sites were established, historical eras)
- Narrative connections between venues are invisible (thematic links, historical relationships)
- Academic citation of map data is unclear (who authored, when updated, data provenance)

### User Stories

#### Story 6.1: Explore Spatial Patterns in Gold Rush Heritage
**As a** cultural geography researcher
**I want to** filter the map to show only Gold Rush-era historic sites and visualize their spatial distribution
**So that** I can analyze settlement patterns along mining routes

**Acceptance Criteria:**
- [ ] Given venue data includes a "Historical Era" field, I can open an advanced filter panel and select "Gold Rush (1848-1870)"
- [ ] When the era filter is active, only venues tagged with that era remain visible, and a temporal slider appears showing the date range
- [ ] The map supports multiple era selections simultaneously (e.g., "Gold Rush" + "Victorian (1870-1910)") to compare periods
- [ ] When I hover over a historic venue marker, the tooltip shows: name, category, established date (e.g., "Est. 1851"), and era tag(s)
- [ ] The map includes a "Heatmap View" toggle that visualizes venue density by era using color gradients (red = high density, blue = low)
- [ ] When I activate the "Gold Rush Heritage Trail" curated experience, the detail panel includes historical context: "These 8 sites trace the 1849 mining boom along the Yuba River watershed..."
- [ ] Given I zoom out to Nevada County bounds, I can see spatial clustering along Highway 49 corridor (where mining towns developed)
- [ ] On desktop, the advanced filter panel is a sidebar with era checkboxes, date range slider, and a "Historical Context" info button linking to county history resources

**Related Gap:** No temporal/historical metadata or era-based filtering

---

#### Story 6.2: Export Venue Data for GIS Analysis
**As a** researcher preparing a spatial analysis paper
**I want to** download all venue data as a GeoJSON or CSV file with complete attribute table
**So that** I can analyze it in QGIS, run spatial statistics, and create academic visualizations

**Acceptance Criteria:**
- [ ] Given I load the map, I can click a "Download Data" button in the top toolbar (visible to all users, not just admins)
- [ ] When I click it, a modal appears with export options: (a) format (GeoJSON, CSV, KML, Shapefile), (b) filter by current map view or all 687 venues, (c) include all fields or selected fields only
- [ ] The GeoJSON export includes: geometry (Point coordinates), name, category, address, city, description, hours (as structured JSON), website, phone, established date, historical era, accessibility features
- [ ] The CSV export includes: all fields above (latitude/longitude as separate columns) plus data provenance: "Source: Nevada County Arts Council Cultural Asset Map, downloaded [date], URL: [map URL]"
- [ ] Given I've applied filters (e.g., "Galleries" + "Open Now"), the export respects those filters and the filename reflects them: "nevada-county-galleries-open-now-2026-02-08.geojson"
- [ ] The export includes metadata: EPSG:4326 coordinate system (WGS84), data last updated date, Arts Council contact info, and a Creative Commons license (CC BY 4.0)
- [ ] When I click "Download", the file is generated client-side (no server upload) and downloads immediately (< 2 seconds for 687 venues)
- [ ] On desktop, the export modal includes a "Citation Format" section with pre-formatted APA and MLA citations I can copy for academic papers

**Related Gap:** No data export functionality (map data is not downloadable)

---

#### Story 6.3: Discover Narrative Connections Between Venues
**As a** historian researching local art movements
**I want to** see which artists/organizations are connected to multiple venues (e.g., a painter exhibited at 3 galleries)
**So that** I can map networks of cultural influence

**Acceptance Criteria:**
- [ ] Given venue data includes a "Related People/Orgs" field (e.g., "Founded by: Jane Smith" or "Exhibits work of: John Doe"), I can search for a person's name (e.g., "Jane Smith")
- [ ] When I search for "Jane Smith", the map highlights all venues connected to that person (galleries where she exhibited, historical sites she founded, etc.) with colored connector lines
- [ ] The search results panel lists: "Jane Smith is connected to 4 venues: [list with links]" and a brief bio snippet if available
- [ ] When I click a connector line, a popover appears showing the relationship: "Jane Smith exhibited at this gallery 1965-1972"
- [ ] Given I select "Network View" mode, the map transforms into a force-directed graph showing venues as nodes and relationships as edges (using a library like D3.js)
- [ ] The network view is filterable by relationship type: "Artist/Exhibit", "Founder/Established", "Collaborator", "Historical Link"
- [ ] When I click a node (venue) in network view, I can "Explore Connections" which expands to show second-degree connections (people connected to people)
- [ ] On desktop, the network view is an overlay panel that can be resized/dismissed, and I can export the network graph as a PNG or GraphML file for analysis in Gephi

**Related Gap:** No relational data or network visualization features

---

#### Story 6.4: View Historical Photos and Timeline
**As a** historian documenting Nevada County's cultural evolution
**I want to** see historical photos of venues and a timeline of when they were established
**So that** I can contextualize cultural development over time

**Acceptance Criteria:**
- [ ] Given a venue has historical photos in its data (e.g., "1920 photo of Empire Mine"), I can view a photo carousel in the detail panel
- [ ] The photo carousel includes: image, caption, year taken, photographer credit (if known), and a "View High-Res" link for archival-quality images
- [ ] When I toggle "Timeline View" in the top toolbar, the map transforms to show a horizontal timeline (1840-present) with venue markers positioned by established date
- [ ] The timeline is zoomable (decade view, year view, event view) and supports scrubbing: when I drag the timeline slider, the map shows only venues that existed at that moment in time
- [ ] Given I scrub to "1865", the map shows only venues established by then (e.g., early mining camps, Victorian-era buildings) and dims venues not yet established
- [ ] The timeline includes milestone markers: "1849: Gold Rush begins", "1940: Tourism boom", "2010: Arts Council map project launched"
- [ ] When I hover over a timeline marker, a tooltip shows: venue name, established date, and thumbnail photo if available
- [ ] On desktop, the timeline view is a split-screen: timeline on bottom (200px height), map on top, with synchronized interactions

**Related Gap:** No temporal visualization or historical photo archive

---

#### Story 6.5: Cite Map Data with Provenance
**As a** researcher writing an academic paper
**I want to** cite the Nevada County Cultural Map with proper attribution and understand data provenance
**So that** I can meet academic citation standards and readers can verify my sources

**Acceptance Criteria:**
- [ ] Given I click "About This Map" in the footer, a modal opens with: (a) project history, (b) data sources, (c) last updated date, (d) maintainer contact (Arts Council), (e) license (Creative Commons), (f) suggested citation formats
- [ ] The citation section includes pre-formatted citations: APA ("Nevada County Arts Council. (2026). Nevada County Cultural Asset Map [Interactive map]. Retrieved February 8, 2026, from https://..."), MLA, Chicago
- [ ] The "Data Provenance" section lists: original data source (ArcGIS 687 features, 2019), update history (added 23 venues 2024, refreshed hours 2026), and contributors (Arts Council staff, volunteer mappers)
- [ ] Given a specific venue, I can click "View Provenance" in the detail panel to see: when it was added to the map, who added it, data source (scraped from ArcGIS, manually entered, submitted by venue), last verification date
- [ ] The map footer includes a persistent DOI link (if Arts Council obtains one) so the dataset is permanently citable even if the website URL changes
- [ ] When I export data (see Story 6.2), the downloaded file includes a README.txt with full provenance and citation info
- [ ] On desktop, the "About" modal has tabs: Overview, Citation, Provenance, License, Contact
- [ ] The license is explicit: "Data is licensed CC BY 4.0. You may use, modify, and distribute with attribution."

**Related Gap:** No provenance documentation, citation guidance, or data licensing information

---

## Cross-Cutting User Stories

These stories apply to multiple personas and represent foundational UX needs.

### Story X.1: Fast Initial Load on Mobile
**As any user** on a mobile device with moderate LTE connection
**I want** the map to load and become interactive in under 3 seconds
**So that** I don't abandon the site due to slow performance

**Acceptance Criteria:**
- [ ] Given I load the map on a mobile device with "Fast 3G" throttling (Lighthouse test), the initial render (hero + map tiles + markers) happens within 3 seconds
- [ ] The map uses progressive loading: basemap tiles and category pills load first (1 sec), venue markers load next (2 sec), full venue data loads lazily (on marker click)
- [ ] Large assets (images, fonts, JS libraries) are lazy-loaded: `image_data.json` loads only after first marker click
- [ ] The initial map view is optimized: shows Nevada County bounds with clustered markers (not all 687 individual markers)
- [ ] Performance budget: initial JS bundle < 200KB gzipped, initial CSS < 50KB, data.json < 150KB
- [ ] The map includes a loading skeleton: gray placeholder boxes for hero stats, pills, and map during initial load
- [ ] On desktop, performance targets are stricter: interactive in < 2 seconds on cable connection

---

### Story X.2: Work Offline After First Load
**As any user** in a rural area with spotty cell signal
**I want** the map to continue working after I've loaded it once, even if I lose connection
**So that** I can navigate cultural venues without constant internet access

**Acceptance Criteria:**
- [ ] Given I've loaded the map once, the core assets (HTML, CSS, JS, data.json, basemap tiles for current view) are cached in the browser via Service Worker
- [ ] When I lose connection and reload the page, the map loads from cache with a banner: "You're offline. Showing cached data from [date]."
- [ ] Offline mode supports: viewing cached venues, panning/zooming within cached tile bounds, category filtering, venue detail panels
- [ ] Offline mode does NOT support: real-time open/closed status (shows "Status unavailable offline"), venue search (requires API), new venue data (shows last cached version)
- [ ] Given I've activated a curated experience (e.g., "Gold Rush Heritage Trail"), the route line and narrative text are cached and work offline
- [ ] The map automatically fetches fresh data when connection is restored (background sync) and shows a toast: "Map updated with latest data"
- [ ] On mobile, the map is installable as a PWA (Progressive Web App) with an "Add to Home Screen" prompt after 2nd visit

---

### Story X.3: Accessible Color Contrast
**As any user** with low vision or color blindness
**I want** all text and interactive elements to have sufficient contrast against backgrounds
**So that** I can read and interact with the map comfortably

**Acceptance Criteria:**
- [ ] All text meets WCAG 2.1 AA contrast ratios: normal text ≥4.5:1, large text ≥3:1, UI components ≥3:1
- [ ] Category pill buttons use sufficient contrast: text color vs pill background, and pill border vs page background
- [ ] Map markers use patterns + color: e.g., galleries = purple circle with diagonal stripes, so color-blind users can distinguish categories
- [ ] The "Open Now" status uses icon + text + color: green dot + "Open now" (not just green dot alone)
- [ ] Tooltip text (white on dark semi-transparent background) has ≥7:1 contrast (WCAG AAA)
- [ ] The MUSE theme (teal/rust/sage) is tested for color-blind simulation: Deuteranopia, Protanopia, Tritanopia modes
- [ ] All interactive elements (buttons, links, markers) have visible focus states with ≥3:1 contrast against adjacent colors
- [ ] The map includes a "High Contrast Mode" toggle (optional) that switches to pure black/white/yellow palette for maximum contrast

---

## Acceptance Criteria: Mapping-Specific Patterns

These patterns apply broadly across user stories and ensure spatial UX quality.

### Map Interaction Standards
- **Touch targets:** All interactive elements (markers, buttons, pills) ≥44px on mobile
- **Gesture support:** Pinch-zoom, two-finger pan, tap-to-activate, long-press for context menu
- **Clustering:** Use marker clusters at zoom < 14; expand to individual markers at zoom ≥14
- **Smooth transitions:** All map animations (flyTo, filter changes, theme switches) use easing curves and take 300-500ms
- **Viewport awareness:** Tooltips and detail panels stay within viewport on mobile (no off-screen content)

### Performance Thresholds
- **Time to Interactive (TTI):** < 3 seconds on mobile 4G, < 2 seconds on desktop broadband
- **First Contentful Paint (FCP):** < 1.5 seconds
- **Marker rendering:** 687 markers (clustered) render in < 500ms
- **Filter response:** Category filter changes update map in < 300ms
- **Search results:** Autocomplete suggestions appear within 200ms of typing

### Accessibility Requirements
- **Keyboard navigation:** All map interactions accessible via keyboard (Tab, Enter, Arrow keys, Escape)
- **Screen reader support:** Markers, filters, and panels have descriptive ARIA labels
- **Focus management:** Focus moves logically (map → filters → markers → detail panel → close button)
- **Color independence:** Information conveyed with color ALSO conveyed with text/icons/patterns
- **Text scaling:** UI remains usable at 200% browser zoom (WCAG 2.1 AA)

---

## Summary: User Story Inventory

**Total User Stories:** 30 (5 personas × 5 stories + 6 cross-cutting)

**By Theme:**
- Real-time discovery (open/closed, events): 7 stories
- Spatial filtering (proximity, category, attributes): 8 stories
- Curated experiences (routes, themes): 5 stories
- Data/analytics (institution dashboards): 4 stories
- Accessibility (physical + digital): 6 stories
- Research/export (GIS, provenance): 4 stories
- Performance/offline: 3 stories

**By Priority (inferred from FEATURES.md):**
- **P1 (Phase 1 - MVP):** Open/closed status, category filtering, mobile UX, search (8 stories)
- **P2 (Phase 1.5 - Polish):** Time-aware suggestions, curated routes, accessibility filters (10 stories)
- **P3 (Phase 2+):** Events, institution dashboards, network viz, data export (12 stories)

**Cross-References to Gap Analysis (from Task #1):**
- [To be filled in after feature-auditor completes gap analysis]
- Example: Story 1.1 addresses Gap #1 "No real-time open/closed filtering"
- Example: Story 6.2 addresses Gap #8 "No data export for research use"

---

**Document Status:** COMPLETE
**Next Steps:**
1. Coordinate with feature-auditor to map stories to gap analysis findings
2. Validate stories with feature-strategist for feasibility/trade-offs
3. Prioritize stories for Phase 1 roadmap (Task #5)
