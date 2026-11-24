# Announce

Announce provides describeList and visually-hidden liveRegionAttributes for
view-derived status text. Its optional Model clears imperative announcements
before a delayed, version-checked completion, so repeated text can be announced
without stale delays overwriting newer requests. Render
`prepareAnnouncements(model, h)` from the first view so both live regions are
mounted before any message. The helper keeps the region priorities stable
while moving text to the region for the current announcement.
