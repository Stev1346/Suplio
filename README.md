# GotATune – MVP Product Readme

## Overview

**GotATune** is a QR-based song request system that allows guests at an event to request and vote on songs during a DJ set.

Guests scan a QR code, submit song requests, and vote on what should be played next. DJs manage incoming requests through a simple live dashboard.

The product is designed to:

- Reduce interruptions at the DJ booth
- Increase crowd engagement
- Give DJs better control over requests

The MVP focuses on **speed of development, low infrastructure cost, and simple UX**.

---

# Product Identity

**Product Name:** GotATune  
**Tagline:** *GotATune? Scan. Request. Vote.*

## Brand Personality

GotATune should communicate:

- Professional DJ tool
- Crowd participation
- Fun event energy
- Clean modern tech product

Tone:

- Friendly
- Energetic
- Simple
- Event-focused

---

# Color System

## Primary Color
**Midnight Navy**  
`#0F172A`

Represents professionalism, trust, and nightlife atmosphere.

Usage:
- Navigation bars
- Dashboard background
- Header sections

---

## Secondary Color
**Electric Teal**  
`#14B8A6`

Represents energy and modern tech.

Usage:
- Primary buttons
- Active elements
- Links
- Request actions

---

## Tertiary Color
**Vibrant Coral**  
`#F97316`

Represents fun and attention.

Usage:
- Vote buttons
- Vote counters
- Highlighted activity

---

## Auxiliary Color
**Soft Slate Gray**  
`#64748B`

Represents neutral UI structure.

Usage:
- Secondary text
- Borders
- UI separators

---

# MVP Goals

The MVP should prove that:

1. Guests will scan a QR code to submit requests
2. Guests will vote on songs
3. DJs find the dashboard useful
4. Events can run smoothly without guests approaching the booth

The MVP intentionally avoids advanced features.

Focus is on **core usability and reliability**.

---

# Core User Flow

## Guest Flow

1. Guest scans QR code
2. Guest lands on request page
3. Guest submits a song request
4. Guest sees the top requested songs
5. Guest votes on songs

## DJ Flow

1. DJ creates event
2. DJ receives event link and QR code
3. Guests submit requests
4. Requests appear in dashboard
5. DJ accepts, rejects, or marks songs as played
6. DJ can pause requests if needed

---

# Core MVP Pages

## 1. Guest Request Page

Purpose: Allow guests to quickly submit a request.

Mobile-first design.

### Layout

Header

GotATune  
Scan. Request. Vote.

Search input (optional for MVP)

Manual request fields:
- Song Name
- Artist (optional)
- Message for DJ (optional)

Primary Button: Request Song

Below request form:
Top Requested Tonight

Example list:
1. Mr. Brightside — 12 votes
2. Yeah! — 10 votes
3. September — 7 votes

### UI Notes

Header background: Midnight Navy  
Primary button: Electric Teal  
Vote indicators: Coral

---

# 2. Voting Page

Purpose: Encourage crowd participation and prevent duplicate requests.

Guests are redirected here after submitting a request.

### Layout

Header

GotATune  
Vote for the next song

Top Requested Songs

Each song card contains:
- Song Title
- Artist
- Vote Count
- Vote Button

Bottom Button: Submit Another Request

### UI Notes

Vote buttons: Coral  
Cards: white background with subtle shadow

---

# 3. DJ Dashboard

Purpose: Allow DJs to manage requests during an event.

Desktop-first layout.

### Layout

Header

GotATune Dashboard

Event Name  
Total Requests

Top Requested Section:
1. Mr. Brightside — 12 votes
2. Yeah! — 10 votes
3. September — 7 votes

Request List

Each request includes:
- Song Title
- Artist
- Message (optional)
- Vote Count

Action Buttons:
- Accept
- Reject
- Played

---

# DJ Controls

## Allow Requests Toggle

DJs can enable or disable incoming requests.

Use cases:
- Temporarily pause requests
- Prevent spam
- Control flow during key moments of a set

Included in MVP.

---

# Planned Future Features (Not MVP)

- Do Not Play List
- Song filtering
- Music service integrations
- Guest limits
- Guest tipping / paid priority requests
- DJ analytics
- Venue branding
- Request cooldowns

These will likely be **subscription features**.

---

# Database Model

## Events
Fields: id, name, event_code, created_at, allow_requests (boolean)

## Requests
Fields: id, event_id, song_name, artist, message, votes, status, created_at
Status: pending, accepted, rejected, played

## Votes
Fields: id, request_id, created_at

Votes do not require user accounts in MVP.

---

# System Architecture (Low Cost / Fast Build)

Goals:
- Fast development
- Minimal infrastructure
- Monthly cost < $20

## Frontend
Framework: Next.js  
Hosting: Vercel (free tier)

## Backend
Backend-as-a-Service: Supabase  
- PostgreSQL database
- Real-time subscriptions
- API endpoints
- Authentication for future use

## Real-Time Updates
Supabase Realtime for live requests and votes

## QR Code Generation
Use library/API for event URL QR codes: `event-url.com/event/{event_code}`

---

# Hosting Cost Estimate

- Vercel hosting: $0
- Supabase database: $0
- Domain name: ~$10/year
- Total: $0–$10/month (under $20 even with moderate usage)

---

# Tech Stack Summary

Frontend: Next.js, React  
Backend: Supabase  
Database: PostgreSQL (Supabase)  
Hosting: Vercel  
Realtime: Supabase Realtime

---

# MVP Feature List

**Included:**
- Create event
- Event QR code
- Submit request
- Vote on requests
- Top requested songs
- DJ dashboard
- Accept / reject / played actions
- Allow requests toggle

**Not Included:**
- User accounts
- Music API integration
- Payments
- Analytics
- Request filtering
- Do-not-play list

---

# MVP Development Timeline

Week 1: Project setup, database schema, event creation, request submission
Week 2: Voting system, DJ dashboard, real-time updates
Week 3: UI polish, QR code generation, testing at live event

---

# Product Vision

GotATune aims to become the easiest way for crowds to interact with DJs during events.

Long-term possibilities:
- DJ tools ecosystem
- Venue integrations
- Paid priority requests
- Event analytics
- Music platform integrations

Immediate focus: **Let guests request songs without interrupting the DJ.**

---

**GotATune**  
*GotATune? Scan. Request. Vote.*

