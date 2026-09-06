/**
 * The single place the app reads data from. Everything is served from the mock
 * layer for now; swapping these bodies for fetch calls against the endpoints in
 * 02-api-contracts.md is the only change needed later.
 */
import * as mocks from "./mocks";

const LATENCY_MS = 120;

function resolve(value) {
  return new Promise((r) => setTimeout(() => r(structuredClone(value)), LATENCY_MS));
}

/** Everything the app shell needs before it can render a group. */
export function fetchGroupBundle(slug) {
  return resolve({
    group: { ...mocks.group, slug },
    membership: mocks.membership,
    categories: mocks.categories,
    tiers: mocks.tiers,
    user: mocks.session.user,
  });
}

export function fetchNotifications() {
  return resolve(mocks.notifications);
}
