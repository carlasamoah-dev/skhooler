# API contracts

Every endpoint the ten screens need, taken from `backend/src/modules/*` at
`carlasamoah-dev/skhooler@main`. All group-scoped routes are mounted under
`/api/groups/:slug/…`. Auth is a bearer access token with `POST /api/auth/refresh`
for rotation.

Middleware gates appear in the route files as `requireMembership()`, `requireModerator`,
`requireAdmin`, `requireOwner` — mirror them in the UI so users never see an action they
cannot perform, but treat the server as the authority.

---

## Auth — `/api/auth`

| Method | Path | Body | Screen |
| --- | --- | --- | --- |
| POST | `/register` | `{ email, password, firstName, lastName }` | Signup |
| POST | `/login` | `{ email, password }` | Login |
| POST | `/refresh` | `{ refreshToken }` | Session bootstrap |
| POST | `/logout` | — (auth) | Top bar |
| POST | `/forgot-password` | `{ email }` | **To build** |
| POST | `/reset-password` | `{ token, password }` | **To build** |
| POST | `/verify-email` | `{ token }` | **To build** |
| POST | `/resend-verification` | `{ email }` | **To build** |
| GET | `/me` | — | Session |
| PATCH | `/me` | profile fields | Profile |

`/register`, `/login`, `/refresh` are rate limited (`authLimiter`); the password and
verification routes use a stricter limiter — surface 429s as "Too many attempts, try again
in a few minutes."

---

## Group — `/api/groups`

| Method | Path | Gate | Screen |
| --- | --- | --- | --- |
| GET | `/:slug/landing` | public (optional auth) | Landing |
| GET | `/:slug` | membership | App shell |
| POST | `/` | auth | (create group — out of scope) |
| PATCH | `/:slug` | owner | Settings → General |
| PATCH | `/:slug/pricing` | owner | Settings → Pricing |
| DELETE | `/:slug` | owner | Settings (danger zone — not designed) |

`updateGroupSchema` (all optional): `name` 2–100, `description` ≤2000,
`rules` ≤5000, `aboutContent` ≤10000, `visibility: 'PUBLIC' | 'PRIVATE'`,
`joinApproval: 'AUTOMATIC' | 'MANUAL'`, `autoWelcomeMessage` ≤1000.

`updatePricingSchema`: `pricingModel: 'FREE' | 'PAID'`, `price` >0 ≤9999.99,
`billingInterval: 'MONTHLY' | 'YEARLY'`, `trialDays` 0–90. **Paid requires price and
interval** — validate client-side too.

> The design's "Free / Paid" radio pair maps 1:1 to `pricingModel`. There is no
> freemium or one-time model in the API.

### Members

| Method | Path | Gate | Notes |
| --- | --- | --- | --- |
| GET | `/:slug/members` | membership | `?cursor&limit(1–100, default 20)&role&search` |
| PATCH | `/:slug/members/:memberId/role` | admin | `{ role: 'ADMIN' \| 'MODERATOR' \| 'MEMBER' }` |
| PATCH | `/:slug/members/:memberId/tier` | admin | `{ tierId: uuid \| null }` |
| DELETE | `/:slug/members/:memberId` | moderator | Remove from group |
| GET | `/:slug/members/:memberId/profile` | membership | Membership dialog |

`role` filter accepts `OWNER | ADMIN | MODERATOR | MEMBER` — the four roster tabs.
**A member's role is never a tier name**: VIP is a tier, not a role.

### Join flow and requests

| Method | Path | Gate |
| --- | --- | --- |
| POST | `/:slug/join` | auth — `{ answers: [{ questionId, answer }] }` |
| POST | `/:slug/leave` | membership |
| GET | `/:slug/requests` | moderator — `?status=PENDING\|APPROVED\|DECLINED&cursor&limit` |
| POST | `/:slug/requests/:requestId/approve` | moderator |
| POST | `/:slug/requests/:requestId/decline` | moderator |

### Invites

| Method | Path | Gate | Body |
| --- | --- | --- | --- |
| POST | `/:slug/invites` | admin | `{ maxUses?, expiresInDays? ≤365 }` |
| GET | `/:slug/invites` | admin | — |
| GET | `/:slug/share-link` | admin | — |
| DELETE | `/:slug/invites/:inviteId` | admin | Revoke |
| POST | `/:slug/invites/email` | admin | `{ emails: [] }` 1–50 |
| POST | `/api/groups/join/:code` | auth | Redeem |

### Categories, tiers, questions, links

| Method | Path | Gate | Body |
| --- | --- | --- | --- |
| GET/POST | `/:slug/categories` | membership / owner | `{ name }` ≤50 |
| PATCH/DELETE | `/:slug/categories/:categoryId` | owner | `{ name }` |
| PATCH | `/:slug/categories/reorder` | owner | `{ orderedIds: [uuid] }` |
| GET/POST | `/:slug/tiers` | membership / owner | `{ name }` ≤50 — **name only, no price** |
| PATCH/DELETE | `/:slug/tiers/:tierId` | owner | `{ name }` |
| GET/PUT | `/:slug/questions` | owner | `{ questions: [{ question ≤500, isRequired }] }` **max 3** |
| GET/POST/PATCH/DELETE | `/:slug/links…` | membership / owner | `{ label ≤100, url ≤2000 }` |

---

## Posts — `/api/groups/:slug/posts`

| Method | Path | Gate | Notes |
| --- | --- | --- | --- |
| GET | `/` | membership | `?cursor&limit(1–50, default 20)&categoryId&search` — **no sort param** |
| POST | `/` | **admin** | Composer is owner/admin only |
| GET | `/:postId` | membership | Post detail |
| PATCH | `/:postId` | membership (author) | Edit |
| DELETE | `/:postId` | membership (author/admin) | |
| POST | `/:postId/pin` | admin | Toggle |
| POST | `/:postId/like` | membership | Toggle |

`createPostSchema`: `title` 2–255, `content` 1–50000, `categoryId?`, `isPinned?`,
`isEmailBroadcast?`, `actionButtonText?` ≤100, `actionButtonUrl?` url ≤2000,
`linkPreview?: { title, description, image, url }`, `videoAssetId?`, `videoPlaybackId?`,
`attachments?: [{ name, url, size, type }]`,
`poll?: { question ≤500, options 2–10, allowMultiple?, expiresInDays? 1–30 }`.

> There is **no per-post visibility or tier lock** — do not offer one.

### Polls and comments

| Method | Path | Body |
| --- | --- | --- |
| GET | `/:postId/poll` | — |
| POST | `/:postId/poll/vote` | `{ optionIds: [uuid] }` (respect `allowMultiple`) |
| GET | `/:postId/comments` | `?cursor&limit(1–100, default 50)` |
| POST | `/:postId/comments` | `{ content 1–10000, parentCommentId?, attachments? }` |
| PATCH | `/:postId/comments/:commentId` | `{ content }` |
| DELETE | `/:postId/comments/:commentId` | — |
| POST | `/:postId/comments/:commentId/like` | Toggle |

One level of nesting is enough — the design indents replies 44px and goes no deeper.

---

## Courses — `/api/groups/:slug/courses`

| Method | Path | Gate |
| --- | --- | --- |
| GET | `/` · `/:courseSlug` | membership |
| POST | `/` · PATCH `/:courseId` · DELETE `/:courseId` · PATCH `/reorder` | admin |
| POST | `/:courseId/modules` · PATCH `/modules/:moduleId` · DELETE · PATCH `/:courseId/modules/reorder` | admin |
| POST | `/modules/:moduleId/lessons` · PATCH `/lessons/:lessonId` · DELETE · PATCH `/modules/:moduleId/lessons/reorder` | admin |
| GET | `/lessons/:lessonId` | membership |
| POST | `/lessons/:lessonId/progress` | membership — `{ isCompleted?, lastPositionSeconds? }` |
| GET | `/:courseId/progress` | membership |
| POST | `/:courseId/access` · DELETE `/:courseId/access/:userId` · GET `/:courseId/access` | admin |

`createCourseSchema`: `title` 2–100, `description?` ≤5000, `coverUrl?`, `isPublished?`,
`accessType: 'OPEN' | 'TIER_LOCKED' | 'PRIVATE_GRANT'`, `requiredTierId?`.
Course card labels map to `accessType`: OPEN → "Open to all members",
TIER_LOCKED → "<tier> tier only", PRIVATE_GRANT → "Granted access only".

`createLessonSchema`: `title` 1–150, `content?`, `videoAssetId?`, `videoPlaybackId?`,
`videoDurationSeconds?`, `attachments?`, `isPublished?`, `isFreePreview?`.
`isFreePreview` → the "Free preview" badge; `!isPublished` → "Draft".

Progress drives both the course-card percentage and the "Resumes at 12:04" line
(`lastPositionSeconds`). There is **no drip/scheduled unlock** — never show
"unlocks in N days".

---

## Events — `/api/groups/:slug/events`

| Method | Path | Gate |
| --- | --- | --- |
| GET | `/` | membership — `?filter=upcoming\|past\|all&startAfter&startBefore&cursor&limit` |
| GET | `/:eventId` · `/:eventId/attendees` · `/:eventId/ics` | membership |
| POST | `/` · PATCH `/:eventId` · POST `/:eventId/cancel` · DELETE `/:eventId` | admin |
| POST | `/:eventId/rsvp` | membership — `{ status: 'GOING' \| 'MAYBE' \| 'NOT_GOING' }` |

`createEventSchema`: `title` 2–150, `description?` ≤10000, `coverUrl?`, `startDate`,
`endDate?`, `timezone` (default UTC), `isAllDay?`,
`locationType: 'ONLINE_LINK' | 'PHYSICAL_ADDRESS' | 'RECORDED_SESSION'`,
`locationUrl?`, `locationAddress?` ≤300,
`accessType: 'ALL_MEMBERS' | 'TIER_LOCKED'`, `requiredTierId?`,
`isRecurring?`, `recurrenceRule?` ≤100. `updateEventSchema` adds `recordingUrl?`
and `isCancelled?`.

The dialog's Where select maps to `locationType`; Access maps to `accessType`;
Repeats maps to `isRecurring` + `recurrenceRule`. Cancelled events should render struck
through with an "Cancelled" marker. `/ics` is the "Add to calendar" download.

---

## Notifications — `/api/notifications`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/` | `?cursor&limit(1–100, default 30)&unreadOnly` |
| GET | `/unread-count` | Drives the bell badge |
| POST | `/mark-read` | `{ notificationIds: [uuid] }` |
| POST | `/mark-all-read` | "Mark all read" |
| DELETE | `/:notificationId` | Swipe/row delete |
| GET/PATCH | `/preferences` | `{ emailNewPost?, emailCommentReply?, emailEventReminder?, inAppAll? }` |

Those four booleans are exactly the four rows in Settings → Notifications.

---

## Analytics — `/api/groups/:slug/analytics`

| Method | Path | Gate | Query |
| --- | --- | --- | --- |
| GET | `/overview` | admin | `?startDate&endDate&interval=day\|week\|month` |
| GET | `/growth` | admin | same — drives the signups chart |
| GET | `/engagement` | admin | same |
| GET | `/courses` | admin | — |
| GET | `/revenue` | **owner** | same |

The Day/Week/Month segmented control is the `interval` param. Dates accept ISO or
`YYYY-MM-DD`.

---

## Billing — `/api/billing`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/dummy/membership-checkout` | **Test endpoint — no live payments yet** |
| POST | `/dummy/platform-checkout` | Same |
| GET | `/subscriptions` | Member billing screen — **not yet designed** |
| GET | `/history` | Payment history — **not yet designed** |
| POST | `/subscriptions/:subscriptionId/cancel` | Cancel |
| GET | `/referrals` | Feeds "Referral payouts due · $412" |
| GET | `/referrals/validate/:code` | Public |

Any paid-join CTA must make clear the checkout is a placeholder until a real provider is
wired.

---

## Search — `/api/groups/:slug/search`

| Method | Path | Gate |
| --- | --- | --- |
| GET | `/` | membership — `?q` |
| GET | `/global` | public |

The top-bar input is wired to nothing in the prototype. Build a results panel or
`/[slug]/search` page — the endpoints exist.

---

## Integrations — `/api/groups/:slug/integrations` (owner)

Webhooks (`POST/GET/PATCH/DELETE /webhooks`, `/webhooks/:id/deliveries`,
`/webhooks/:id/test`) and API keys (`POST/GET/DELETE /keys`). **No screen designed** —
raise it before building; a seventh settings tab is the obvious home.

---

## Gaps to flag back to design

1. **Direct messages do not exist** in the backend — no module, no routes. The prototype
   deliberately has no message UI.
2. **Feed sort** is client-side only until `postsQuerySchema` gains a `sort` param.
3. **No member-helpfulness ranking** endpoint (the earlier leaderboard was removed).
4. Password reset, email verification, billing screens and integrations are supported by
   the API but undesigned.
