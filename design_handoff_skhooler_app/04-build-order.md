# Build order

Eight phases. Each is independently reviewable and leaves the app running. Acceptance
criteria are written so they can be checked in a browser without reading the code.

Fidelity rule for every phase: the design is the reference, idiomatic Next/Tailwind wins
where they conflict. Token values and copy are not negotiable.

---

## Phase 1 — Theme and app shell

**Do**

1. Replace the `@theme` block in `client/src/app/globals.css` with `01-tokens.css`.
2. Load Plus Jakarta Sans (700, 800) and Manrope (400–700) via `next/font/google` in
   `app/layout.js`, exposing `--font-display` and `--font-sans`; drop the hard-coded
   `bg-zinc-50 text-zinc-900` for `bg-ground text-ink`.
3. Add the route group `app/(app)/[slug]/` with `layout.jsx` rendering the app shell:
   top bar (group mark, name, search, bell + badge, avatar) and the 6-tab segmented nav.
4. Build `components/ui/`: `Button`, `IconButton`, `Input`, `Textarea`, `Select`,
   `Checkbox`, `Radio`, `SegmentedControl`, `Card`, `Dialog`, `Avatar`, `StatusDot`,
   `Tag`, `ProgressBar`, `EmptyState`, `Skeleton`. See `05-component-contracts.md`.
5. `useGroupStore` + `useUiStore`; mock loader for `group`, `membership`, `categories`.

**Accept**

- Every colour on screen comes from a token; no zinc/blue remains anywhere.
- The nav indicator slides between all six tabs and the active label is ground-coloured.
- `Tab` moves through the shell and every stop shows a 2px brand focus ring.
- Body text renders Manrope 600; headings render Plus Jakarta Sans 800 at −0.02em.
- No radius above 20px outside pills and avatars.

## Phase 2 — Auth

**Do**

1. Restyle `AuthModal.jsx` to the dialog design; keep the `useAuthModalStore` contract.
2. Build `/login` and `/signup` pages sharing one `AuthForm` (react-hook-form).
3. Build `/forgot-password`, `/reset-password/[token]`, `/verify-email/[token]` — these
   are undesigned; reuse the dialog's field styling on a centred column.
4. `useSessionStore` with token refresh; redirect unauthenticated app routes to `/login`.

**Accept**

- Validation errors show inline under the field, in `--color-alert`, without layout shift.
- Submitting the mock login lands on `/[slug]` with the session in the store.
- Escape and backdrop click close the modal and restore focus to the trigger.
- 429 responses show the rate-limit message, not a generic error.

## Phase 3 — Community feed, post detail, composer

**Do**

1. Feed page: composer bar (owner/admin only), category chips, sort select, post cards,
   and the three sidebar cards (group + banner, join requests, next event).
2. Post detail with body, optional table, optional video, optional poll, like, pin toggle
   and threaded comments (one level).
3. Composer page with title, body, attachment row, category, pin select and the email
   broadcast checkbox.
4. `useFeedStore`; cursor pagination (`nextCursor`) with an intersection-observer sentinel.

**Accept**

- A member account sees **no** composer bar and no "Write a post" button.
- Category chips refetch with `categoryId`; the sort select reorders the loaded page.
- Voting in the poll updates the bars optimistically and shows the new percentages.
- Comment replies indent 44px; a reply to a reply is not offered.
- The whole post card is clickable and keyboard-focusable as one target.

## Phase 4 — Classroom and lesson

**Do**

1. Classroom grid with access labels, draft notice, progress bars, "+ New course" tile.
2. Lesson page: module-grouped sidebar (status circles, Free preview / Draft badges),
   video well, chapters, resources, mark-complete, prev/next.
3. Progress writes: `POST /courses/lessons/:lessonId/progress`.

**Accept**

- Lessons render grouped under their module with an "n of m" count per module.
- The current lesson row is brand-100 filled; completed lessons show a sage circle;
  unstarted show a dashed outline.
- Marking complete updates both the module count and the course-card percentage.
- No "unlocks in N days" copy appears anywhere.

## Phase 5 — Calendar and events

**Do**

1. Month grid (7×5, today marked), Upcoming/Past/All filter, event list with RSVP and
   "Add to calendar" (`/ics`).
2. Event dialog: create and edit, with location type, recurrence, access and tier lock.
3. Cancel event (admin) and the cancelled presentation.

**Accept**

- RSVP is three-state and the going count updates optimistically, reverting on failure.
- "Add to calendar" downloads the `.ics` for that event.
- Creating a weekly recurring event shows it on every matching cell in the month.
- Tier-locked events show the tier name and are not RSVP-able by members without it.

## Phase 6 — Members, requests and map

**Do**

1. Roster rows with avatar presence badge, role marker, flag + country code, tier and
   activity, plus the five role/status tabs.
2. Requests panel with join answers and approve/decline.
3. Map panel: port `design/members-map.html` into a client component
   (`dynamic(..., { ssr: false })`), plus the Top countries card with the derived
   "Everywhere else" figure.
4. Membership dialog: role and tier changes, course access grants, remove from group.

**Accept**

- Presence badges sit at an identical position on every row (they are anchored to the
  avatar, not to the text).
- Role tabs filter via `?role=`; roles are only Owner/Admin/Moderator/Member — no tier
  ever appears as a role.
- The map draws real Natural Earth geometry, fills 32 countries from the brand ramp, and
  the tooltip follows the cursor with country, members, share, online and monthly joins.
- The Top countries figures plus "Everywhere else" equal the stated total exactly.
- Approving a request removes the card and increments the member count.

## Phase 7 — Owner dashboard

**Do**

1. Four stat cards from `/analytics/overview`.
2. Signups chart from `/analytics/growth` with the Day/Week/Month interval control and a
   hover readout; single-hue bars.
3. Signup sources and the referral payout block from `/billing/referrals`.

**Accept**

- Changing the interval refetches with `interval=` and relabels the axis.
- Hovering a bar fills it in brand and swaps the readout to that period's value.
- Revenue figures are hidden for admins who are not the owner.

## Phase 8 — Settings

**Do**

Six tabs at `/settings/[tab]`: General, Pricing & tiers, Categories, Join questions,
Notifications, Invites. All owner-gated.

**Accept**

- Pricing offers exactly Free and Paid; Paid reveals price, interval and trial days, and
  refuses to save Paid without price and interval.
- Tiers are name-only, with the "access labels, not prices" explanation on screen.
- Categories reorder by drag and persist via `PATCH /categories/reorder`.
- Join questions cap at three, each with a Required toggle.
- The four notification toggles map to `emailNewPost`, `emailCommentReply`,
  `emailEventReminder`, `inAppAll`.
- Invites: share link copy, code creation with max uses and expiry, bulk email up to 50,
  and revoke.
- Deep-linking `/settings/invites` opens that tab with the rail indicator in place.

---

## Cross-cutting, do these throughout

- **Permissions**: one `useCan()` helper reading `membership.role`; never render an action
  the role cannot perform.
- **Loading**: skeletons shaped like the real cards (see the prototype's placeholder counts).
- **Errors**: field-level for forms, one dismissible banner per panel for lists/mutations.
- **Empty states**: every list needs one — no posts yet, no courses, no events this month,
  no pending requests, no invite codes.
- **A11y**: dialogs trap focus and restore it; the nav is a `role="tablist"`; icon-only
  buttons carry `aria-label`; the presence badge's status is in a `title` and an
  `aria-label`; never rely on the status dot's colour alone.
- **Responsive**: two-column layouts stack under 1100px; under 760px the nav becomes a
  bottom bar (the prototype's `isMobile` variant shows Feed / Lesson / Events at 390px).
- **No `scrollIntoView`** in the app shell; use scroll containers.

## Out of scope, raise before building

Direct messages (no backend at all), member billing screens, integrations (webhooks and
API keys), search results, and a server-side `sort` param for the feed.
