# Component contracts

Suggested tree under `client/src/components/`. Props are the minimum each component needs;
add `className` everywhere and merge with `tailwind-merge` (already a dependency).
`cva` is available for variants — the Button is the obvious candidate.

```
components/
  ui/            primitives — no domain knowledge
  shell/         top bar, nav, notifications
  feed/          posts, composer, comments, poll
  classroom/     course + lesson
  calendar/      month grid, event list, event dialog
  members/       roster, requests, map, membership dialog
  dashboard/     stats, chart, sources
  settings/      six panels
```

---

## ui/

| Component | Props |
| --- | --- |
| `Button` | `variant: 'primary' \| 'secondary' \| 'ghost'`, `size: 'sm' \| 'md'`, `block?`, `icon?: LucideIcon`, `disabled?`, `loading?`, `...button` |
| `IconButton` | `icon: LucideIcon`, `label: string` (→ `aria-label`), `variant?`, `size?: 36 \| 44`, `badge?: number` |
| `Input` | `label?`, `error?`, `hint?`, `leadingIcon?`, `...input` — 46px, pill, sand-100 fill |
| `Textarea` | `label?`, `error?`, `rows?`, `...textarea` — `rounded-inner` |
| `Select` | `label?`, `options: {value,label}[]`, `value`, `onChange`, `size?: 'sm' \| 'md'` |
| `Checkbox` | `label: ReactNode`, `checked`, `onChange`, `wrapped?` (sand-100 well style) |
| `RadioCard` | `label`, `description?`, `checked`, `onChange`, `name` — the large Public/Private and Free/Paid cards |
| `SegmentedControl` | `options: {value,label}[]`, `value`, `onChange`, `orientation?: 'horizontal' \| 'vertical'`, `columns?: number` — owns the sliding brand indicator |
| `Card` | `as?`, `padding?: 18 \| 22 \| 24 \| 32`, `radius?: 'card' \| 'panel' \| 'overlay'`, `elevation?: 'soft' \| 'md' \| 'lg' \| 'none'`, `tint?: 'surface' \| 'sage' \| 'brand'` |
| `Dialog` | `open`, `onClose`, `title`, `width?: number`, `children`, `actions?: ReactNode` — focus trap, Escape, backdrop click, `.rise` |
| `Avatar` | `name: string`, `src?`, `size: 26\|30\|32\|38\|40\|42\|46\|52\|104`, `presence?: 'online' \| 'offline'` — initials on a tint hashed from the name; presence renders the corner badge |
| `AvatarStack` | *not used* — the fake reader stacks were deliberately removed |
| `StatusDot` | `tone: 'brand' \| 'sage' \| 'neutral' \| 'online'`, `label: string` — 7px dot + 12px/700 label. **Only for categorical meaning** (category, role, tier, access). Never decorative. |
| `Tag` | `tone: 'brand' \| 'sage' \| 'neutral' \| 'outline'`, `children` |
| `ProgressBar` | `percent: number`, `height?: 8 \| 10 \| 12`, `track?: string`, `fill?: string` |
| `MetaText` | `children` — 13px sand-700, the app's default secondary line |
| `Kicker` | `children` — 12px/700 sand-700 |
| `EmptyState` | `title`, `body?`, `action?: ReactNode`, `icon?: LucideIcon` |
| `Skeleton` | `variant: 'card' \| 'row' \| 'text' \| 'circle'`, `count?` |

---

## shell/

| Component | Props |
| --- | --- |
| `AppShell` | `slug`, `children` — top bar + nav + content column, max-width 1180px |
| `TopBar` | `group`, `user`, `unreadCount`, `onSearch`, `onToggleNotifications` |
| `PrimaryNav` | `slug`, `active: 'feed'\|'class'\|'cal'\|'members'\|'dash'\|'settings'` — post/composer map to `feed`, lesson maps to `class` |
| `SearchField` | `value`, `onChange`, `placeholder` — 44px, 420px max |
| `NotificationPanel` | `open`, `items`, `onMarkAllRead`, `onClose` — fixed `top:80 right:28`, 410px |
| `NotificationRow` | `item: Notification` |

---

## feed/

| Component | Props |
| --- | --- |
| `ComposerBar` | `user`, `onWrite` — render only when `can('post:create')` |
| `CategoryFilter` | `categories`, `activeId \| null`, `onChange` |
| `SortSelect` | `value: 'new'\|'comments'\|'likes'`, `onChange` |
| `PostCard` | `post: Post`, `href` — header, title (2-line clamp), body (2-line clamp), optional action button, footer counts |
| `PostHeader` | `author`, `createdAt`, `category`, `isPinned` |
| `PostBody` | `content`, `attachments?`, `videoPlaybackId?`, `linkPreview?` |
| `Poll` | `poll: Poll`, `onVote(optionIds)` — bar-behind-label rows, respects `allowMultiple` and `expiresAt` |
| `CommentThread` | `comments: Comment[]`, `onReply`, `onLike` — groups by `parentCommentId`, one level |
| `CommentComposer` | `user`, `onSubmit`, `placeholder = 'Add a comment…'` |
| `PostComposer` | `categories`, `memberCount`, `onSubmit(createPostPayload)` |
| `GroupCard` | `group` — includes the 1084×300 banner slot |
| `JoinRequestsCard` | `requests`, `total`, `onApprove`, `onDecline`, `onSeeAll` |
| `NextEventCard` | `event`, `onRsvp` — the single sage-tinted surface |

---

## classroom/

| Component | Props |
| --- | --- |
| `CourseGrid` | `courses`, `canCreate`, `onCreate` |
| `CourseCard` | `course: Course`, `href` — access label from `accessType`, draft notice from `!isPublished` |
| `LessonSidebar` | `course`, `modules`, `activeLessonId` |
| `ModuleGroup` | `module`, `activeLessonId` — uppercase header + "n of m" |
| `LessonRow` | `lesson`, `state: 'complete'\|'current'\|'todo'`, `badge?: 'Free preview'\|'Draft'` |
| `LessonPlayer` | `playbackId`, `durationSeconds`, `lastPositionSeconds`, `onProgress` |
| `ChapterList` | `chapters: {at,label}[]`, `onSeek` |
| `ResourceList` | `attachments` |
| `LessonFooter` | `isCompleted`, `onToggleComplete`, `resumeLabel`, `onPrev`, `onNext` |

---

## calendar/

| Component | Props |
| --- | --- |
| `MonthGrid` | `month: Date`, `events`, `onSelectEvent` — 7×5, today marked |
| `DayCell` | `date`, `inMonth`, `isToday`, `events` |
| `EventFilter` | `value: 'upcoming'\|'past'\|'all'`, `onChange` |
| `EventList` | `events`, `onRsvp`, `onDownloadIcs` |
| `EventRow` | `event`, `myRsvp`, `onRsvp`, `onDownloadIcs` — date tile + meta + RSVP group |
| `RsvpGroup` | `value: 'GOING'\|'MAYBE'\|'NOT_GOING'\|null`, `onChange`, `size?` |
| `EventDialog` | `open`, `event?` (edit mode), `tiers`, `onSubmit`, `onClose` |

---

## members/

| Component | Props |
| --- | --- |
| `MemberTabs` | `value: 'all'\|'admins'\|'mods'\|'members'\|'pending'\|'map'`, `counts`, `onChange` |
| `MemberRow` | `member: Member`, `onOpenMembership` — 5-column grid, presence on the avatar |
| `MemberRoster` | `members`, `onOpenMembership`, `loading` |
| `JoinRequestCard` | `request`, `onApprove`, `onDecline` — shows every answer |
| `MemberMap` | `geography: {total, countries}` — **client-only**, `dynamic(..., {ssr:false})` |
| `TopCountriesCard` | `geography` — derives "Everywhere else" from total minus listed |
| `MembershipDialog` | `open`, `member`, `tiers`, `courses`, `onChangeRole`, `onChangeTier`, `onToggleCourseAccess`, `onRemove`, `onClose` |

`MemberMap` implementation notes (port from `design/members-map.html`):

- d3 7.9.0 + topojson-client 3.1.0 as npm deps (or the pinned SRI script tags if you keep
  them out of the bundle).
- `world-atlas@2.0.2/countries-110m.json`, `topojson.feature(topo, topo.objects.countries)`,
  filter out Antarctica.
- `d3.geoNaturalEarth1().fitExtent([[8,14],[w-8,h-26]], featureCollection)`.
- `d3.scaleThreshold().domain([25,75,200,450]).range(['#f4e6e9','#e8d0d5','#d2a6ae','#a5636f','#6b2334'])`,
  `#ece6dc` for no data, 0.6px surface-coloured strokes, 1.2px ink stroke on hover.
- Tooltip: ink background, ground text, `rounded-chip`, clamped inside the container.
- Redraw on `ResizeObserver`; fetch and memoise the topology once per session.

---

## dashboard/

| Component | Props |
| --- | --- |
| `StatCard` | `value: string`, `label: string`, `delta?: string` — all four identical, no filled variant |
| `SignupsChart` | `points: {label,value}[]`, `interval`, `onIntervalChange` — single-hue bars, hover readout |
| `SourcesCard` | `sources: {label,percent}[]`, `referral: {payoutDue, referrerCount, payoutDay}` |

---

## settings/

| Component | Props |
| --- | --- |
| `SettingsRail` | `tab`, `slug` — vertical `SegmentedControl`, 6 items |
| `GeneralPanel` | `group`, `onSave` — icon, cover, name, description, URL, visibility, approval, welcome |
| `PricingPanel` | `group`, `tiers`, `onSavePricing`, `onAddTier`, `onRenameTier`, `onDeleteTier` |
| `CategoriesPanel` | `categories`, `onAdd`, `onRename`, `onDelete`, `onReorder` |
| `JoinQuestionsPanel` | `questions`, `onSave` — max 3 |
| `NotificationsPanel` | `preferences`, `onSave` — the four API booleans |
| `InvitesPanel` | `shareLink`, `invites`, `onCreate`, `onEmailInvite`, `onRevoke` |

---

## Helpers

| Helper | Purpose |
| --- | --- |
| `useCan()` | `can('post:create' \| 'post:pin' \| 'member:remove' \| 'group:settings' \| 'analytics:revenue' \| …)` from `membership.role` |
| `initials(name)` | Two-letter initials for `Avatar` |
| `avatarTint(name)` | Deterministic tint pair — hash the name, index into `[brand-200/800, sage-200/900, sage-300/900, sand-300/900]` |
| `formatCount(n)` | 1148 → "1.1k" for post likes |
| `relativeTime(iso)` | "4h ago", "2d ago" |
| `flagEmoji(countryCode)` | ISO-2 → regional-indicator emoji; always render the code next to it |
| `formatDuration(s)` | 1122 → "18:42" |
