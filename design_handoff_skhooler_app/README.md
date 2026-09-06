# Handoff: Skhooler community app (frontend)

## Overview

Skhooler is a community platform: a group owner runs a paid or free community with a
discussion feed, a classroom of courses, an events calendar, a member directory and an
owner dashboard. This package covers the **authenticated app** for one group plus the
public group landing page and auth — ten screens in total.

The backend already exists (Express + zod, `backend/src/modules/*`) and the frontend shell
exists (Next 16 app router, React 19, Tailwind v4, zustand, lucide-react, react-hook-form).
This build replaces the current zinc/blue placeholder styling with the Organic design system
and implements the ten screens.

## About the design files

The files in `design/` are **design references created in HTML** — a prototype showing the
intended look, layout and interaction. They are **not production code to copy**. Open
`design/Skhooler.dc.html` in a browser to click through every screen.

Your task is to **recreate these designs in the existing Next.js client** using its
established patterns: app-router route groups, client components with `"use client"`,
zustand for cross-screen state, react-hook-form for forms, lucide-react for icons, and
Tailwind v4 utility classes driven by the `@theme` tokens in `01-tokens.css`.

## Fidelity

**High fidelity, used as a reference.** Colours, type, spacing, radii and copy in the
prototype are final and are documented exactly below. Where the prototype's markup and
idiomatic Next/Tailwind disagree, **prefer idiomatic Next/Tailwind** — the prototype uses
inline styles and a single-file structure purely because of its authoring environment.

Two things to preserve exactly: the token values (`01-tokens.css`) and the copy.

## Environment already in place

`client/package.json`:

```
next 16.3.4 · react 19.2.8 · tailwindcss 4 (@tailwindcss/postcss)
zustand 5 · react-hook-form 7 · lucide-react 1.40 · socket.io-client 4.8
clsx · tailwind-merge · class-variance-authority
```

Existing files worth reading before you start:

| File | What it is | What to do with it |
| --- | --- | --- |
| `client/src/app/globals.css` | Tailwind import + zinc/blue `@theme` | **Replace** the `@theme` block with `01-tokens.css` |
| `client/src/app/layout.js` | Root layout, hard-codes `bg-zinc-50 text-zinc-900` | Update to the new ground/ink tokens, add the two fonts |
| `client/src/components/GlobalNavbar.jsx` | Discover-level nav, zinc styling | Restyle; keep the `useSearchStore` wiring |
| `client/src/components/AuthModal.jsx` | Existing login/signup modal | Restyle to the auth design; keep the store contract |
| `client/src/components/CommunityDetailsClient.jsx` | Public group page | Rebuild against the landing design |
| `client/src/store/*` | `useAuthModalStore`, `useSearchStore`, `useThemeStore` | Keep; add the stores listed in *State management* |

Fonts (Google): **Plus Jakarta Sans** 700/800 (display) and **Manrope** 400/500/600/700
(body). Load with `next/font/google` in the root layout, exposing
`--font-display` / `--font-sans`.

---

## Screens

Routes follow the existing route groups. `[slug]` is the group slug.

| # | Screen | Suggested route | Design reference |
| --- | --- | --- | --- |
| 1 | Public group landing | `/(community)/[slug]` | `scLanding` |
| 2 | Sign up / Log in | modal + `/(main)/login`, `/(main)/signup` | `authOpen` |
| 3 | Community feed | `/(app)/[slug]` | `scFeed` |
| 4 | Post detail | `/(app)/[slug]/posts/[postId]` | `scPost` |
| 5 | Composer | `/(app)/[slug]/posts/new` | `scCompose` |
| 6 | Classroom | `/(app)/[slug]/classroom` | `scClass` |
| 7 | Lesson | `/(app)/[slug]/classroom/[courseSlug]/[lessonId]` | `scLesson` |
| 8 | Calendar | `/(app)/[slug]/calendar` | `scCal` |
| 9 | Members (roster / requests / map) | `/(app)/[slug]/members` | `scMembers` |
| 10 | Owner dashboard | `/(app)/[slug]/dashboard` | `scDash` |
| 11 | Settings (6 tabs) | `/(app)/[slug]/settings/[tab]` | `scSettings` |

Overlays: notifications panel, event dialog, membership dialog, auth dialog.

### App shell (screens 3–11)

- Page ground `--color-ground` (#fdfaf5). Content padding `20px 28px`, column gap 16px.
- **Top bar** (not sticky in the prototype; make it sticky): group avatar 40px circle in
  brand, group name 21px display/800/-0.02em, search input (max 420px, 44px tall, surface
  fill, 40px left padding, 17px lucide `Search` at left 15px), then right-aligned: bell
  icon button 44px on surface with `shadow-soft` and a 20px `--color-alert` unread badge
  offset -2px/-2px, then the current user's 44px avatar.
- **Primary nav**: one segmented control, 6 equal columns, surface fill, 4px padding,
  `rounded-[10px]`, with an absolutely-positioned brand-filled indicator
  `width: calc((100% - 8px) / 6)` translated by `calc(index * 100%)`,
  `transition: transform .22s cubic-bezier(.4,0,.2,1)`. Labels: Community, Classroom,
  Calendar, Members, Dashboard, Settings — 14px/600 body font, active label = ground colour.
  Beside it a ghost button "View public page".
- Feed and dashboard use a `minmax(0,1fr) 340px` grid, gap 20px. Content max-width 1180px
  (860px for post detail and composer).

### 1. Public group landing

Two columns `minmax(0,1fr) 360px`, gap 56px, max-width 1180px, padding `32px 32px 96px`.

- Nav row: brand mark + group name, then "Log in" (secondary) and "Join free" (primary).
- Kicker "Public community · Careers" — 12px/700, `--color-sand-700`.
- `h1` **60px**, 800, -0.02em, max-width 20ch: "Remote jobs, checked by a human before you see them."
- Lead paragraph 19px, max-width 60ch, `--color-sand-800`.
- Four stat pills (`rounded-full`, `14px 24px`, surface + `shadow-soft`): 4,182 members /
  137 online now (preceded by an 8px `--color-online` dot) / 61 lessons / a brand-tinted
  pill "Free + VIP $19/mo". Numbers 22px display/800.
- Cover image 16:9, `rounded-[20px]`, then a 4-up row of 16:10 previews `rounded-[14px]`.
  All imagery is washed: `filter: saturate(.85) contrast(.95)` and slightly lifted.
- "What's inside" — 2×2 cards (surface, `rounded-[16px]`, 24px padding, `shadow-soft`),
  each a 44px tinted icon circle + 19px display title + 15px body.
- Brand panel, `rounded-[20px]`, `56px 48px`: label "Members placed since January" then
  56px display "312 people stopped applying into the void."
- Sticky sign-up card (`top: 28px`, surface, `rounded-[18px]`, 28px, `shadow-md`):
  "Membership", 44px display "Free", body line, primary "Join Remote Jobs HQ" (48px tall),
  secondary "Log in", then a 4-row definition list — Visibility/Public,
  Approval/Automatic, Owner/Tee Addo, Started/Feb 2026.

### 2. Auth

Dialog, `min(440px, 100%)`, surface, 36px padding, `rounded-[20px]`,
`animation: rise .18s ease-out` (`from { opacity:0; translateY(8px) }`).

Brand mark + "skhooler" wordmark, close icon button top-right. Title 26px display.
Sub-line 14px sand-700. Signup adds a First/Last name row (1fr 1fr, gap 12px). Email and
password fields (`.input` equivalent: 46px tall, `--color-sand-100` fill, transparent
border, `rounded-[16px]`). Primary block CTA 48px tall. Footer line switches mode.

Copy: signup → title "Create your account", sub "Join Remote Jobs HQ — free.", CTA
"Create account", footer "Already have an account? Log in". Login → "Log in",
"Welcome back to Remote Jobs HQ.", CTA "Log in", footer "New to Skhooler? Create an account".

Also build the standalone `/login` and `/signup` routes plus **forgot password**,
**reset password** and **verify email** — the API supports all three and the prototype does
not show them; reuse the dialog's field styling on a centred single-column page.

### 3. Community feed

Left column, 16px gap:

- **Composer bar** — surface, `rounded-[16px]`, 18px padding, `shadow-soft`: 42px avatar,
  prompt "Post an update for your members" (16px, sand-600), primary "Write a post".
  Only rendered for OWNER/ADMIN (see *Permissions*).
- **Filter row** — category chips (All, Job leads, Wins, Q&A) as ghost buttons; the active
  chip is filled `--color-ink` with ground text. Right-aligned: a "Sort" `<select>`
  (38px, auto width) with Newest / Most comments / Most liked.
- **Post cards** — surface, `rounded-[18px]`, `24px 26px`, `shadow-soft`, whole card is a
  link to the post. Header row: 42px avatar (initials on a hashed tint), author 14px/600,
  ` · 4h ago` in sand-700, a category marker (7px dot + 12px/700 label), and for pinned
  posts a right-aligned brand-700 "Pinned" with the lucide `Pin` icon at 14px.
  Title 24px display/800/-0.02em, clamped to 2 lines. Body 16px sand-800, max 70ch,
  clamped to 2 lines. Optional primary action button (`actionButtonText`).
  Footer: `ThumbsUp` 16px + like count, `MessageCircle` 16px + comment count, then
  "new comment 4m ago" 13px sand-700.

Right column, 16px gap:

- **Group card** — surface, `rounded-[18px]`, overflow hidden: a 1084×300 banner image at
  the top (placeholder in the prototype — see *Assets*), then 22px padding with group name
  19px display, `skhooler.com/<slug>` 13px sand-700, description 15px sand-800, a stat row
  (4,182 members / green dot + 137 online / 4 admins) and a secondary block button
  "Group settings".
- **Join requests card** — surface, `rounded-[18px]`, 22px: title "Join requests" 17px
  display, "12 pending · manual approval" 13px, then up to 3 rows of 32px avatar + name +
  "requested 2h ago" with ghost "Decline" and primary "Approve" (both 13px, compact), then
  a ghost "See all requests" linking to the Members → Requests tab. Hidden when
  `joinApproval === 'AUTOMATIC'` or the queue is empty.
- **Next event card** — the one tinted surface in the app: `--color-sage-200` background,
  `--color-sage-900` text, `rounded-[18px]`, 22px. "Next up" label, event title 20px
  display, "Sep 10 · 6:00pm BST · Zoom" 14px, then three RSVP buttons (Going / Maybe /
  Not going — the selected one fills brand with ground text, the others
  `--color-sand-200`), then "84 going · add to your calendar" 13px with the second half a
  link to the `.ics` endpoint.

### 4. Post detail

Back link "← Back to community" (ghost). Card: surface, `rounded-[20px]`, `32px 36px`.
48px avatar, "Tee Addo · Owner · 4h ago", category marker, right-aligned "Pinned".
`h2` title, 17px body paragraphs, an optional data table (`.table` equivalent inside a
sand-100 `rounded-[14px]` well), an optional 16:9 washed video block, and an optional
**poll**: sand-100 well, `rounded-[14px]`, 20px 22px — question 16px/700, meta
"Pick one · closes in 3 days · 612 votes", then one button per option
(`rounded-[10px]`, surface, 11px 15px) with an absolutely-positioned fill bar behind the
label whose width is the option's share, brand-200 for the voted option and sand-200
otherwise; label left, percentage right.
Action row: secondary "Like · 218", "37 comments" sand-700, right-aligned checkbox
"Pinned to the top of the feed" (admin only).

Comments card below (surface, `rounded-[20px]`, `28px 36px`): a reply row (40px avatar,
input "Add a comment…", primary "Reply"), then comments — each `rounded-[14px]`,
`16px 20px`, alternating tinted fills, 32px avatar, author 14px/600, time 13px sand-700,
body 15px max 66ch, then "Like · 41" and "Reply" 13px. Replies are indented 44px
(`parentCommentId`, one level).

### 5. Composer

Kicker "Posting as Tee Addo · owners and admins only". Title input 56px tall, 24px display
font. Body textarea 190px min-height, 17px, `rounded-[16px]`. Attachment row of secondary
buttons: Attach file, Link, Video, Poll, Action button. Two selects: Category, and
"Pin to the top of the feed" (No/Yes). Footer: checkbox "Email this to all 4,182 members"
(`isEmailBroadcast`) and primary "Publish post". Back link "← Cancel".

### 6. Classroom

Header: `h2` "Classroom", meta "3 courses · 61 lessons", primary "New course" (admin).
Grid `repeat(auto-fit, minmax(280px, 1fr))`, gap 20px. Course card: surface,
`rounded-[18px]`, overflow hidden, clickable — 16:9 washed cover, then 22px padding with
an access marker (7px dot + label: "Open to all members" / "VIP tier only" /
"Granted access only"), title 21px display, description 14px sand-800, a draft notice
("Draft — members can't see this yet") when unpublished, then a 10px progress bar
(sand-200 track, brand fill) with "38% complete" and "6 modules · 24 lessons" beneath.
Last cell is a dashed `rounded-[18px]` "+ New course" tile, min-height 280px.

### 7. Lesson

Two columns `300px minmax(0,1fr)`, gap 20px.

Sidebar (surface, `rounded-[18px]`, 22px, self-start): back link "← All courses", course
title 19px display, "6 modules · 24 lessons" 13px, a progress bar, then **modules**, each
an uppercase 11px/800 header (`letter-spacing: .06em`) with a right-aligned "2 of 2"
count, followed by its lessons: 18px status circle (sage = complete, brand = current,
dashed sand-400 outline = not started), title 14px, and an optional right-aligned 11px/700
badge ("Free preview", "Draft"). The current lesson row is brand-100 filled,
`rounded-[12px]`.

Main: 16:9 video block on `--color-video` (#2e2130) with the duration label. Below, a card
(surface, `rounded-[18px]`, `30px 34px`): kicker "Module 2 · Lesson 3", `h3` title, 17px
body max 68ch, then two sand-100 wells side by side (`minmax(240px,1fr)`) — **Chapters**
(timestamp in brand-700 + label rows) and **Resources** (links). Footer row: a
"Mark complete" checkbox, "Resumes at 12:04" 13px sand-700, secondary "Previous",
primary "Next lesson".

### 8. Calendar

Header: `h2` "September 2026", meta "London time · 3 events", right-aligned a segmented
Upcoming / Past / All and primary "Add event".

Month grid card (surface, `rounded-[18px]`, 20px): a 7-column weekday header row
(Mon–Sun, 12px/600 sand-700, 1px sand-300 bottom rule), then 7×5 cells, gap 6px, each
min-height 110px, `rounded-[12px]`, 1px sand-300 border, in-month cells on surface and
out-of-month transparent with sand-500 text. The date sits in a 26px circle — brand fill
with ground text for today, whose cell also takes a brand border. Events inside a cell are
brand-filled blocks, `rounded-[10px]`, `8px 10px`, 12px: bold time then title.

Below the grid, an **event list** (16px gap): each row surface, `rounded-[16px]`,
`18px 24px`, flex — a 58px brand-100 date tile (`rounded-[12px]`, month 11px/800 +
day 20px display), title 18px display with "6:00pm BST · Online link · all members"
13px sand-700 beneath, "84 going" 13px/600, then RSVP buttons (Going / Maybe / Not going,
selected fills brand) and a ghost "Add to calendar" (the `.ics` download).

**Event dialog** (`min(700px,100%)`, surface, 32px, `rounded-[20px]`): title "New event",
Title field, a 3-up row Date / Time / Duration, Description textarea, then Where
(Online link / Physical address / Recorded session) and Repeats (Weekly on Thursday /
Does not repeat), then Access — radios "All members" / "One tier only", the latter
revealing a tier select. Actions: secondary "Cancel", primary "Create event".

### 9. Members

Header: `h2` "Members", meta "4,182 members · 12 requests", right-aligned primary
"Invite people" → Settings → Invites.

Tab chips: All 4,182 / Admins 4 / Moderators 9 / Members 4,169 / Requests 12 / Map.
Active chip fills brand with ground text; the rest sit on surface. The first four filter
by role, the last two switch panel.

**Roster rows** — surface, `rounded-[16px]`, `18px 24px`, min-height 88px,
`shadow-soft`, grid `52px minmax(0,230px) minmax(0,1.2fr) minmax(0,176px) auto`, gap 18px,
items centred:
1. 52px avatar with a **presence badge**: 13px circle, bottom-right, 2.5px surface ring,
   `--color-online` when online, `--color-sand-400` otherwise, `title` = the status string.
2. Name 18px display + role marker (7px dot + 12px/700: Owner brand, Moderator sage,
   Member sand), and beneath it the country flag emoji + code + `@handle` 13px sand-700.
3. Bio 14px sand-800, clamped to 2 lines.
4. Right-aligned tier name and "active 2d ago · joined Aug 27" 13px sand-700.
5. Secondary "Membership" button.

**Requests panel** — one card per request (surface, `rounded-[16px]`, `20px 24px`):
46px avatar, name 18px display, "email · requested 2h ago" 13px, secondary "Decline",
primary "Approve", then a sand-100 well (`rounded-[12px]`, `14px 18px`) with the join
question 12px/700 sand-700 and the applicant's answer 14px.

**Map panel** — grid `minmax(0,1fr) 300px`, gap 16px.
- Map card: title "Where your members are" 19px display + "32 countries · hover a country
  for detail", then the choropleth, 440px tall.
- Top countries card: 6 rows of flag + country + count with an 8px brand share bar, then a
  rule and "Everywhere else · 995 members" (derive: total − listed).

The map is **real geometry, never hand-drawn**. Reference implementation:
`design/members-map.html` — d3 7.9.0 + topojson-client 3.1.0 (pinned, SRI-hashed),
`world-atlas@2.0.2/countries-110m.json`, `d3.geoNaturalEarth1().fitExtent(...)`,
`d3.scaleThreshold().domain([25,75,200,450])` over a 5-step brand ramp, `#ece6dc` for
countries with no members, tooltip on `mousemove` showing country, members, share of
group, online now and joined this month, plus a Fewer→More legend bottom-left.
In Next, render it in a client component with `dynamic(..., { ssr: false })`, fetch the
topology once and memoise it, and redraw on container resize (`ResizeObserver`).

**Membership dialog** (`min(640px,100%)`, surface, 32px): 52px avatar, name 22px display,
"Membership settings", then a `minmax(200px,1fr)` grid of read-only wells — Email, Joined
(+ how they joined), Role (+ change), Tier (+ change), Posts · comments, Lifetime value,
Country (flag + name). Below, "Course access" checkboxes (one per course →
`PRIVATE_GRANT` grants). Actions: secondary "Remove from group", primary "Save".

### 10. Owner dashboard

Header: `h2` "Overview", meta "Last 30 days", right-aligned secondary "Share invite link".

Four identical stat cards (`repeat(auto-fit, minmax(200px,1fr))`, gap 16px; surface,
`rounded-[16px]`, 24px, `shadow-soft`): 38px display number, 14px sand-700 label, 12px/700
delta line. Values: 4,182 Members / +218 this month · $8,410 Monthly revenue / +11.2% ·
64% Engagement / 2,680 active · 91% Retention / 8 members cancelling.

Then `minmax(0,1fr) 340px`, gap 20px:
- **Chart card** (surface, `rounded-[18px]`, 26px): header row — "Signups per week"
  19px display (nowrap), right-aligned readout 13px/700 ("Peak 120 · Aug 24", switching to
  the hovered bar's value in brand-700), and a Day/Week/Month segmented control.
  12 bars, 170px tall, gap 10px, `rounded-full`, `--color-brand-300` normally and full
  brand on hover, with W1–W12 labels 11px/600 beneath. Single hue only.
- **Sources card** (surface, `rounded-[18px]`, 26px): "Signup sources" 19px display, then
  four labelled 12px brand bars (Discover 44%, Member referrals 27%, Direct link 19%,
  Email invite 10%), then a top rule and "Referral payouts due / $412 / 19 members · paid
  on the 1st".

### 11. Settings

Two columns `230px minmax(0,1fr)`, gap 20px. The left rail is a vertical segmented control
(surface, 4px padding, `rounded-[10px]`) with a brand indicator of height
`calc((100% - 8px) / 6)` translated by `calc(index * 100%)`; labels 14px/800 body font:
**General, Pricing & tiers, Categories, Join questions, Notifications, Invites**.

Each panel is a surface card, `rounded-[18px]`, `32px 34px`, `shadow-soft`, with an
`h3` and a right-aligned primary save button.

- **General** — icon (104px brand circle + secondary "Change") and cover (1084×300 washed
  placeholder + "Change") side by side; then Group name, Description (textarea),
  Community URL; then two large radio cards Public / Private (sand-100, `rounded-[14px]`,
  20px); then checkboxes "Approve requests automatically" and "Send a welcome message",
  the latter revealing a welcome-message textarea.
- **Pricing & tiers** — radio cards Free / Paid. Paid reveals Price, a Monthly/Yearly
  segmented control and Free trial (days), plus the note "Checkout is running against the
  test payment endpoint — no live charges yet." Below, "Member tiers": the sentence
  "Tiers are access labels, not prices. Assign a member to a tier, then lock courses and
  events to it.", then one row per tier (sand-100, `rounded-[14px]`, `16px 20px`) with a
  coloured dot + name, "3,914 members · no locked content", and ghost Rename / Delete.
  Header button "+ Add tier".
- **Categories** — "Drag to reorder. The order here is the order of the filters above the
  feed." Rows with a `GripHorizontal` handle, dot + name, post count, Rename / Delete;
  then an "add category" input + secondary button. Save button reads "Save order".
- **Join questions** — "Up to three questions. Answers arrive with the request, so you can
  read before you approve." Three question fields, each with a "Required" checkbox.
- **Notifications** — four checkbox rows on sand-100 wells (`rounded-[14px]`, `18px 20px`):
  new post email, reply email, event reminder email, in-app notifications.
- **Invites** — the share link in a well with a "Copy link" button; then Max uses,
  Expires in (days) and a primary "Create invite code"; then a textarea "Or invite by
  email — up to 50 at a time" with secondary "Send invites"; then "Active codes" rows
  (code, "11 of 25 used · expires Sep 19", ghost "Revoke").

### Notifications panel (overlay)

Fixed, `top: 80px; right: 28px`, width 410px, surface, `rounded-[20px]`, `shadow-lg`,
`animation: rise .18s`. Header "Notifications" 19px display, ghost "Mark all read", close
icon. Rows: 38px avatar, "**Who** did what" 14px, detail line 14px sand-700, time 12px
sand-600; unread rows carry a brand-100 / sage-100 tint. Footer link
"View all notifications".

---

## Interactions & behaviour

| Interaction | Behaviour |
| --- | --- |
| Primary nav | Indicator slides `transform .22s cubic-bezier(.4,0,.2,1)`; label colour cross-fades `.18s`. Post detail and composer keep "Community" active; lesson keeps "Classroom". |
| Post card | Whole card navigates to the post. |
| Feed sort | Client-side reorder of the loaded page (the API has no sort param yet). Newest = server order. |
| Category filter | Refetch with `categoryId`; chips are single-select with "All" as reset. |
| Poll option | Optimistic vote, bar widths animate, re-vote allowed only if the poll has not expired. |
| RSVP | Three-state toggle; the going count updates optimistically. |
| Calendar filter | `filter=upcoming\|past\|all` on the events query. |
| Members tabs | Role filters hit `?role=`; Requests and Map swap the panel. |
| Map hover | Country outline darkens; tooltip follows the cursor, clamped to the container, `opacity .12s`. |
| Settings rail | Same sliding indicator, `/settings/[tab]` keeps it linkable. |
| Dialogs | `rise .18s ease-out` in; close on backdrop click, Escape, and the close button. Trap focus, restore it on close. |
| Buttons | Pill radius. Primary: brand → `brand-600` hover → `brand-700` active. Secondary: 1px divider border, ink 7% hover, 14% active. Ghost: brand text, brand 10% hover. |
| Focus | `outline: 2px solid var(--color-brand); outline-offset: 2px` on `:focus-visible`. Never leave the browser default. |
| Loading | Skeletons matching each card's silhouette on surface fill — the prototype's placeholder counts are a good guide (4 posts, 3 courses, 6 lessons, 5 members, 35 calendar cells). |
| Errors | Inline under the field for forms; a single dismissible banner above the panel for list/mutation failures. |
| Responsive | Below 1100px the two-column layouts stack (sidebar after content). Below 760px the nav becomes a bottom bar — see the `isMobile` variant in the prototype for a 390px reference of Feed / Lesson / Events. |

### Permissions

Read these off the current member's role; the API enforces them anyway.

- `POST /posts` is **owner/admin only** — hide the composer bar and the "Write a post"
  button for members.
- Pin, create course/module/lesson, create/cancel event, grant course access, change
  member role/tier: owner/admin.
- Remove member: moderator and up. Approve/decline requests: moderator and up.
- Group settings, pricing, tiers, categories, join questions, links, invites: **owner**.
- Revenue analytics: owner. Other analytics: owner/admin.

---

## State management

zustand slices (matching the existing store style):

| Store | State |
| --- | --- |
| `useAuthModalStore` *(exists)* | `mode: 'login' \| 'signup' \| null`, `openModal`, `closeModal` |
| `useSessionStore` | `user`, `accessToken`, `refreshToken`, `setSession`, `clear` |
| `useGroupStore` | `group`, `membership` (role, tier), `categories`, `tiers` — hydrated once per slug |
| `useFeedStore` | `filterCategoryId`, `sort: 'new' \| 'comments' \| 'likes'`, `cursor`, `posts` |
| `useNotificationStore` | `open`, `items`, `unreadCount`, `markAllRead` |
| `useUiStore` | `notifOpen`, `eventDialog`, `memberDialog: {open, memberId}`, `membersTab`, `settingsTab` |

Component-local state is enough for: composer draft, RSVP pending state, poll pending
vote, chart hover index, lesson progress checkbox, map hover country.

Data fetching: **mock layer now** (`03-mock-data.js`), one swappable client so the real
endpoints drop in later — see `02-api-contracts.md` for every shape and the exact endpoint
per screen.

---

## Design tokens

Paste `01-tokens.css` into `client/src/app/globals.css`. Summary:

**Colour** — ground `#fdfaf5`, surface `#f5ead8`, ink `#201e1d`.
Brand (burgundy) `#6b2334` with ramp `#f4e6e9 #e8d0d5 #d2a6ae #a5636f #8a4150 #7b2b3d
#551a28 #3f121d #2b0a13`. Sage `#5f7391` with ramp `#ecf0f5 #dae2ec #bdcbdb … #3b4a5e
#2a3646`. Sand neutrals `#f9f4ed #eee7db #dcd3c4 #c0b6a5 #a19786 #82796a #645c50 #474238
#2e2b25`. Support: online `#2f9e63`, alert `#d7263d`, video `#2e2130`.

Three alternative palettes (cobalt, berry, clay) exist in the prototype as
`[data-palette]` blocks — ship burgundy; the others are optional theming.

**Type** — display: Plus Jakarta Sans 800, `-0.02em`; body: Manrope, default weight **600**
(the design is set at semibold, not regular). Sizes: 60 (landing h1) / 38 (stat) / 32 (h2)
/ 24 (post title, h3) / 21 / 19 (card title) / 17 (body large) / 16 / 15 / 14 (UI default)
/ 13 (meta) / 12 (kicker, 700) / 11 (module header, 800, `.06em`, uppercase).

**Radius** — pill `999px` (all buttons, chips, inputs, avatars); panel `20px`;
card `16–18px`; inner well `12–14px`; chip `8–10px`. Nothing above 20px: the earlier
32–36px radii were dialled back deliberately.

**Spacing** — 4 / 8 / 12 / 16 / 18 / 20 / 22 / 24 / 26 / 28 / 32 / 36 / 56.
Card padding 22–24px (sidebar), `32px 34px` (settings panels), `18px 24px` (rows).
Grid gaps: 16px within a column, 20px between columns.

**Elevation** — `soft: 0 1px 2px rgba(46,43,37,.14)`, `md: 0 3px 10px rgba(46,43,37,.16)`,
`lg: 0 12px 32px rgba(46,43,37,.22)`. Cards get `soft`; the sticky landing card `md`;
overlays `lg`.

**Icons** — lucide-react at **stroke-width 2.75** (heavier than the default, deliberately).
Sizes 14 / 16 / 17 / 19 / 20.

---

## Assets

Every image in the prototype is a **placeholder** — no photography was supplied:

| Placeholder | Size / ratio | Where |
| --- | --- | --- |
| Group banner | 1084×300 | Feed sidebar group card, Settings → General cover |
| Landing cover | 16:9 | Landing hero |
| Landing previews | 16:10 ×4 | Under the hero |
| Course cover | 16:9 | Classroom cards |
| Lesson video | 16:9 | Lesson player (on `--color-video`) |
| Post video | 16:9 | Post detail |
| Avatars | 26–104px circles | Everywhere — currently initials on a hashed tint |

Ask the client for real photography and avatar uploads. Until then keep the washed
treatment (`filter: saturate(.85) contrast(.95)`) so images sit into the warm ground.
Flags are emoji (🇬🇧 🇬🇭 🇫🇷) alongside the ISO code so they degrade on platforms
without flag glyphs. Map geometry comes from `world-atlas@2.0.2` (Natural Earth, public
domain) — no asset to store.

---

## Files in this bundle

| File | What it is |
| --- | --- |
| `README.md` | This document — implement from it alone if you like |
| `01-tokens.css` | Paste-ready Tailwind v4 `@theme` block + base layer |
| `02-api-contracts.md` | Every endpoint, request/response shape and role gate, per screen |
| `03-mock-data.js` | Mock fixtures in the real response shapes |
| `04-build-order.md` | Eight phases with acceptance criteria |
| `05-component-contracts.md` | Component list with props |
| `design/Skhooler.dc.html` | The clickable prototype — open this first |
| `design/members-map.html` | The choropleth, standalone and self-contained |
| `design/support.js` | Runtime the prototype needs to open (not for production) |
| `design/_ds/` | The Organic design system stylesheet the prototype links |
