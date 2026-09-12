/* ---------------------------------------------------------------------------
   Mock data — shapes match the zod schemas in backend/src/modules/*.
   Drop at client/src/lib/mocks/index.js and import from a single fetch client
   so the real endpoints can replace it without touching components.

   Every id is a uuid so the shapes are swap-compatible with the API.
   --------------------------------------------------------------------------- */

export const session = {
  user: {
    id: "6f1c1c8a-2f5e-4a4b-9b4c-7d9b0a2f1e31",
    email: "tee@remotejobshq.com",
    firstName: "Tee",
    lastName: "Addo",
    avatarUrl: null,
    isEmailVerified: true,
  },
  accessToken: "mock.access.token",
  refreshToken: "mock.refresh.token",
};

export const group = {
  id: "b21f0f92-3a17-4c65-9a3c-1f2c9d5b7e10",
  slug: "remote-jobs-hq",
  name: "Remote Jobs HQ",
  description:
    "Hand-checked remote job leads every weekday, a full application course, and a room of people who have already made the jump.",
  iconUrl: null,
  coverUrl: null,
  visibility: "PUBLIC",
  joinApproval: "MANUAL",
  autoWelcomeMessage:
    "You're in. Leads drop every weekday at 8am — start with Module 1 and post an intro when you're ready.",
  pricingModel: "PAID",
  price: 19,
  billingInterval: "MONTHLY",
  trialDays: 14,
  ownerName: "Tee Addo",
  createdAt: "2026-02-14T09:00:00.000Z",
  stats: { memberCount: 4182, onlineCount: 137, adminCount: 4, lessonCount: 61 },
};

/* current viewer's membership — drives every permission check */
export const membership = {
  id: "9a7b6c5d-4e3f-2a1b-8c9d-0e1f2a3b4c5d",
  role: "OWNER", // OWNER | ADMIN | MODERATOR | MEMBER
  tier: null,
  joinedAt: "2026-02-14T09:00:00.000Z",
};

export const categories = [
  { id: "c1a1e9d0-0001-4000-8000-000000000001", name: "Job leads", postCount: 1204, position: 0 },
  { id: "c1a1e9d0-0002-4000-8000-000000000002", name: "Wins", postCount: 418, position: 1 },
  { id: "c1a1e9d0-0003-4000-8000-000000000003", name: "Q&A", postCount: 962, position: 2 },
  { id: "c1a1e9d0-0004-4000-8000-000000000004", name: "General", postCount: 233, position: 3 },
];

/* tiers carry a NAME ONLY — price lives on the group */
export const tiers = [
  { id: "71e0aa10-0001-4000-8000-000000000001", name: "Standard", memberCount: 3914, lockedContent: "no locked content" },
  { id: "71e0aa10-0002-4000-8000-000000000002", name: "VIP", memberCount: 251, lockedContent: "2 courses, 1 event series" },
  { id: "71e0aa10-0003-4000-8000-000000000003", name: "Coaching", memberCount: 17, lockedContent: "1 course" },
];

export const joinQuestions = [
  { id: "44b2c110-0001-4000-8000-000000000001", question: "What kind of role are you looking for?", isRequired: true, position: 0 },
  { id: "44b2c110-0002-4000-8000-000000000002", question: "Where are you based, and which hours can you work?", isRequired: true, position: 1 },
];

/* --------------------------------- posts --------------------------------- */

export const posts = {
  items: [
    {
      id: "aa000000-0001-4000-8000-000000000001",
      title: "14 verified remote roles — week of Sep 1",
      content:
        "Every listing below was opened, checked against the company careers page, and dated this morning. Anything older than seven days gets cut.",
      author: { id: "6f1c1c8a-2f5e-4a4b-9b4c-7d9b0a2f1e31", firstName: "Tee", lastName: "Addo", avatarUrl: null, role: "OWNER" },
      category: { id: "c1a1e9d0-0001-4000-8000-000000000001", name: "Job leads" },
      isPinned: true,
      isEmailBroadcast: true,
      actionButtonText: "Open this week's board",
      actionButtonUrl: "https://example.com/board",
      videoPlaybackId: "mock-playback-1",
      attachments: [],
      likeCount: 1148,
      commentCount: 379,
      hasLiked: false,
      lastCommentAt: "2026-09-05T18:56:00.000Z",
      createdAt: "2026-09-05T15:00:00.000Z",
      poll: {
        id: "bb000000-0001-4000-8000-000000000001",
        question: "Which region should next week's board lead with?",
        allowMultiple: false,
        expiresAt: "2026-09-08T15:00:00.000Z",
        totalVotes: 612,
        votedOptionIds: [],
        options: [
          { id: "cc000000-0001-4000-8000-000000000001", label: "EMEA-friendly roles", voteCount: 278 },
          { id: "cc000000-0002-4000-8000-000000000002", label: "US hours", voteCount: 198 },
          { id: "cc000000-0003-4000-8000-000000000003", label: "Anywhere, any timezone", voteCount: 136 },
        ],
      },
    },
    {
      id: "aa000000-0002-4000-8000-000000000002",
      title: "Offer signed — Customer Success, fully remote, EMEA",
      content:
        "Fourth application using the module 2 template. They quoted my opening line back to me in the interview. Salary came in 12% over the posting.",
      author: { id: "7a2d2d9b-3f6f-4b5c-8c5d-8e0c1b3f2f42", firstName: "Joshua", lastName: "Gyasi", avatarUrl: null, role: "MEMBER" },
      category: { id: "c1a1e9d0-0002-4000-8000-000000000002", name: "Wins" },
      isPinned: false,
      likeCount: 1062,
      commentCount: 461,
      hasLiked: true,
      lastCommentAt: "2026-09-05T18:49:00.000Z",
      createdAt: "2026-09-04T11:20:00.000Z",
      poll: null,
    },
    {
      id: "aa000000-0003-4000-8000-000000000003",
      title: "How do you answer the timezone question without killing the offer?",
      content:
        "The role says US hours preferred. I'm GMT+1. Do I raise it in the first call, or wait until they're invested?",
      author: { id: "8b3e3eac-4a70-4c6d-9d6e-9f1d2c4a3a53", firstName: "Amara", lastName: "Boateng", avatarUrl: null, role: "MODERATOR" },
      category: { id: "c1a1e9d0-0003-4000-8000-000000000003", name: "Q&A" },
      isPinned: false,
      likeCount: 74,
      commentCount: 41,
      hasLiked: false,
      lastCommentAt: "2026-09-05T17:10:00.000Z",
      createdAt: "2026-09-03T08:05:00.000Z",
      poll: null,
    },
    {
      id: "aa000000-0004-4000-8000-000000000004",
      title: "Three agencies hiring EAs — apply before Friday",
      content:
        "All three replied to me within 48 hours last month, so the inbox is real. Direct contacts in the comments.",
      author: { id: "9c4f4fbd-5b81-4d7e-8e7f-0a2e3d5b4b64", firstName: "Nancy", lastName: "Brunel", avatarUrl: null, role: "MEMBER" },
      category: { id: "c1a1e9d0-0001-4000-8000-000000000001", name: "Job leads" },
      isPinned: false,
      likeCount: 572,
      commentCount: 227,
      hasLiked: false,
      lastCommentAt: "2026-09-04T19:00:00.000Z",
      createdAt: "2026-09-02T07:40:00.000Z",
      poll: null,
    },
  ],
  nextCursor: null,
};

export const comments = {
  items: [
    {
      id: "dd000000-0001-4000-8000-000000000001",
      postId: "aa000000-0001-4000-8000-000000000001",
      parentCommentId: null,
      content: "Applied to the Customer Success one within an hour of this going up. Got a reply the same afternoon.",
      author: { id: "7a2d2d9b-3f6f-4b5c-8c5d-8e0c1b3f2f42", firstName: "Joshua", lastName: "Gyasi", avatarUrl: null },
      likeCount: 41,
      hasLiked: false,
      createdAt: "2026-09-05T16:00:00.000Z",
    },
    {
      id: "dd000000-0002-4000-8000-000000000002",
      postId: "aa000000-0001-4000-8000-000000000001",
      parentCommentId: "dd000000-0001-4000-8000-000000000001",
      content: "That's the whole point of dating them. Speed beats polish on a fresh posting.",
      author: { id: "6f1c1c8a-2f5e-4a4b-9b4c-7d9b0a2f1e31", firstName: "Tee", lastName: "Addo", avatarUrl: null },
      likeCount: 62,
      hasLiked: true,
      createdAt: "2026-09-05T17:00:00.000Z",
    },
    {
      id: "dd000000-0003-4000-8000-000000000003",
      postId: "aa000000-0001-4000-8000-000000000001",
      parentCommentId: null,
      content: "Is the fintech analyst role open to non-EU applicants? The posting says global but the form asks for a work permit.",
      author: { id: "8b3e3eac-4a70-4c6d-9d6e-9f1d2c4a3a53", firstName: "Amara", lastName: "Boateng", avatarUrl: null },
      likeCount: 12,
      hasLiked: false,
      createdAt: "2026-09-05T17:05:00.000Z",
    },
    {
      id: "dd000000-0004-4000-8000-000000000004",
      postId: "aa000000-0001-4000-8000-000000000001",
      parentCommentId: "dd000000-0003-4000-8000-000000000003",
      content: "It is — I asked. They sponsor through a contractor-of-record, so the permit question is boilerplate.",
      author: { id: "9c4f4fbd-5b81-4d7e-8e7f-0a2e3d5b4b64", firstName: "Nancy", lastName: "Brunel", avatarUrl: null },
      likeCount: 19,
      hasLiked: false,
      createdAt: "2026-09-05T18:00:00.000Z",
    },
  ],
  nextCursor: null,
};
/* -------------------------------- courses -------------------------------- */
// Course mock data has been deleted as requested, the real API is now used for all course endpoints.


/* -------------------------------- events --------------------------------- */

export const events = {
  items: [
    {
      id: "20000000-0001-4000-8000-000000000001",
      title: "Application review",
      description: "Bring one application. We read it live and rewrite the opening together.",
      startDate: "2026-09-10T17:00:00.000Z",
      endDate: "2026-09-10T18:00:00.000Z",
      timezone: "Europe/London",
      isAllDay: false,
      locationType: "ONLINE_LINK",
      locationUrl: "https://zoom.example.com/j/123",
      accessType: "ALL_MEMBERS",
      requiredTierId: null,
      isRecurring: true,
      recurrenceRule: "FREQ=WEEKLY;BYDAY=TH",
      isCancelled: false,
      recordingUrl: null,
      attendeeCount: 84,
      myRsvp: null, // GOING | MAYBE | NOT_GOING | null
    },
    {
      id: "20000000-0002-4000-8000-000000000002",
      title: "Lead drop AMA",
      description: "Ask anything about this week's postings.",
      startDate: "2026-09-16T12:00:00.000Z",
      timezone: "Europe/London",
      locationType: "ONLINE_LINK",
      accessType: "TIER_LOCKED",
      requiredTierId: "71e0aa10-0002-4000-8000-000000000002",
      isRecurring: false,
      isCancelled: false,
      attendeeCount: 41,
      myRsvp: "GOING",
    },
    {
      id: "20000000-0003-4000-8000-000000000003",
      title: "Application review",
      startDate: "2026-09-17T17:00:00.000Z",
      timezone: "Europe/London",
      locationType: "ONLINE_LINK",
      accessType: "ALL_MEMBERS",
      isRecurring: true,
      recurrenceRule: "FREQ=WEEKLY;BYDAY=TH",
      isCancelled: false,
      attendeeCount: 12,
      myRsvp: null,
    },
  ],
  nextCursor: null,
};

/* -------------------------------- members -------------------------------- */

export const members = {
  items: [
    {
      id: "30000000-0001-4000-8000-000000000001",
      user: { id: "40000000-0001-4000-8000-000000000001", firstName: "Britney", lastName: "Spears", handle: "britney-spears", email: "britney@example.com", avatarUrl: null, country: "United Kingdom", countryCode: "GB" },
      role: "MEMBER",
      tier: { id: "71e0aa10-0002-4000-8000-000000000002", name: "VIP" },
      bio: "Career changer, two interviews booked.",
      isOnline: false,
      lastActiveAt: "2026-09-03T10:00:00.000Z",
      joinedAt: "2026-08-27T10:00:00.000Z",
      joinedVia: "email invite",
      postCount: 3,
      commentCount: 14,
      lifetimeValue: 114,
    },
    {
      id: "30000000-0002-4000-8000-000000000002",
      user: { id: "7a2d2d9b-3f6f-4b5c-8c5d-8e0c1b3f2f42", firstName: "Joshua", lastName: "Gyasi", handle: "joshua-gyasi", email: "joshua.gyasi@example.com", avatarUrl: null, country: "Ghana", countryCode: "GH" },
      role: "MEMBER",
      tier: { id: "71e0aa10-0001-4000-8000-000000000001", name: "Standard" },
      bio: "Signed a remote offer in August.",
      isOnline: false,
      lastActiveAt: "2026-08-30T10:00:00.000Z",
      joinedAt: "2026-08-11T10:00:00.000Z",
      joinedVia: "Discover",
      postCount: 6,
      commentCount: 38,
      lifetimeValue: 0,
    },
    {
      id: "30000000-0003-4000-8000-000000000003",
      user: { id: "8b3e3eac-4a70-4c6d-9d6e-9f1d2c4a3a53", firstName: "Amara", lastName: "Boateng", handle: "amara-b", email: "amara@example.com", avatarUrl: null, country: "Ghana", countryCode: "GH" },
      role: "MODERATOR",
      tier: { id: "71e0aa10-0002-4000-8000-000000000002", name: "VIP" },
      bio: "Ex-recruiter. Runs the Thursday call.",
      isOnline: true,
      lastActiveAt: "2026-09-05T19:00:00.000Z",
      joinedAt: "2026-03-02T10:00:00.000Z",
      joinedVia: "referral",
      postCount: 21,
      commentCount: 196,
      lifetimeValue: 247,
    },
    {
      id: "30000000-0004-4000-8000-000000000004",
      user: { id: "6f1c1c8a-2f5e-4a4b-9b4c-7d9b0a2f1e31", firstName: "Tee", lastName: "Addo", handle: "tee-addo", email: "tee@remotejobshq.com", avatarUrl: null, country: "United Kingdom", countryCode: "GB" },
      role: "OWNER",
      tier: null,
      bio: "Reads every posting before it lands.",
      isOnline: true,
      lastActiveAt: "2026-09-05T19:05:00.000Z",
      joinedAt: "2026-02-14T09:00:00.000Z",
      joinedVia: "founder",
      postCount: 142,
      commentCount: 311,
      lifetimeValue: null,
    },
    {
      id: "30000000-0005-4000-8000-000000000005",
      user: { id: "9c4f4fbd-5b81-4d7e-8e7f-0a2e3d5b4b64", firstName: "Nancy", lastName: "Brunel", handle: "nancy-brunel", email: "nancy.brunel@example.com", avatarUrl: null, country: "France", countryCode: "FR" },
      role: "MEMBER",
      tier: { id: "71e0aa10-0001-4000-8000-000000000001", name: "Standard" },
      bio: "Freelance EA, wants one anchor client.",
      isOnline: false,
      lastActiveAt: "2026-09-04T10:00:00.000Z",
      joinedAt: "2026-07-30T10:00:00.000Z",
      joinedVia: "direct link",
      postCount: 4,
      commentCount: 27,
      lifetimeValue: 19,
    },
  ],
  nextCursor: null,
  counts: { all: 4182, admins: 4, moderators: 9, members: 4169, pendingRequests: 12 },
};

/* joinRequests — removed. All join request data now comes from the real backend
   via GET /groups/:slug/requests. */


/* country distribution for the members map — country names must match
   world-atlas `properties.name` exactly ("United States of America"). */
export const memberGeography = {
  total: 4182,
  countries: {
    "United Kingdom": 1132,
    Ghana: 604,
    Nigeria: 511,
    "United States of America": 430,
    India: 300,
    Kenya: 210,
    "South Africa": 168,
    Germany: 122,
    France: 110,
    Canada: 96,
    Philippines: 84,
    Brazil: 72,
    Spain: 58,
    Poland: 48,
    Netherlands: 40,
    Portugal: 34,
    Egypt: 28,
    Pakistan: 24,
    Australia: 20,
    Ireland: 17,
    Mexico: 14,
    Indonesia: 11,
    Argentina: 9,
    Italy: 8,
    Romania: 6,
    Morocco: 6,
    Sweden: 5,
    Vietnam: 4,
    Turkey: 3,
    Singapore: 2,
    Japan: 2,
    Colombia: 2,
    "New Zealand": 2,
  },
};

/* ----------------------------- notifications ----------------------------- */

export const notifications = {
  items: [
    { id: "60000000-0001-4000-8000-000000000001", type: "COMMENT_REPLY", actor: { firstName: "Joshua", lastName: "Gyasi", avatarUrl: null }, text: "replied to your post", detail: "Applied to the Customer Success one within an hour…", isRead: false, createdAt: "2026-09-05T17:00:00.000Z" },
    { id: "60000000-0002-4000-8000-000000000002", type: "COMMENT_REPLY", actor: { firstName: "Amara", lastName: "Boateng", avatarUrl: null }, text: "replied to a post you follow", detail: "It is — I asked. They sponsor through a contractor…", isRead: false, createdAt: "2026-09-05T16:00:00.000Z" },
    { id: "60000000-0003-4000-8000-000000000003", type: "JOIN_REQUEST", actor: null, text: "Three people want to join", detail: "Kofi Mensah, Lena Ruiz, Sam Okafor", isRead: false, createdAt: "2026-09-05T11:00:00.000Z" },
    { id: "60000000-0004-4000-8000-000000000004", type: "POST_PINNED", actor: { firstName: "Tee", lastName: "Addo", avatarUrl: null }, text: "pinned your post", detail: "Offer signed — Customer Success, fully remote", isRead: true, createdAt: "2026-09-04T11:00:00.000Z" },
    { id: "60000000-0005-4000-8000-000000000005", type: "REFERRAL_CONVERTED", actor: null, text: "Referral converted — $9 earned", detail: "Nancy Brunel upgraded to VIP", isRead: true, createdAt: "2026-09-03T11:00:00.000Z" },
  ],
  unreadCount: 3,
  nextCursor: null,
};

export const notificationPreferences = {
  emailNewPost: true,
  emailCommentReply: true,
  emailEventReminder: true,
  inAppAll: true,
};

/* ------------------------------- analytics ------------------------------- */

export const analyticsOverview = {
  memberCount: 4182,
  memberDelta: 218,
  monthlyRevenue: 8410,
  revenueDeltaPercent: 11.2,
  engagementPercent: 64,
  activeMembers: 2680,
  retentionPercent: 91,
  cancellingCount: 8,
};

export const analyticsGrowth = {
  interval: "week",
  points: [
    { label: "Jun 15", value: 41 }, { label: "Jun 22", value: 63 }, { label: "Jun 29", value: 49 },
    { label: "Jul 6", value: 82 },  { label: "Jul 13", value: 72 }, { label: "Jul 20", value: 95 },
    { label: "Jul 27", value: 87 }, { label: "Aug 3", value: 106 }, { label: "Aug 10", value: 115 },
    { label: "Aug 17", value: 101 }, { label: "Aug 24", value: 120 }, { label: "Aug 31", value: 110 },
  ],
};

export const analyticsSources = [
  { label: "Discover", percent: 44 },
  { label: "Member referrals", percent: 27 },
  { label: "Direct link", percent: 19 },
  { label: "Email invite", percent: 10 },
];

export const referralStats = { payoutDue: 412, referrerCount: 19, payoutDay: "the 1st" };

/* invites — removed. Share links and email invites are now served by the real backend
   via GET /groups/:slug/share-link and POST /groups/:slug/invites/email. */

