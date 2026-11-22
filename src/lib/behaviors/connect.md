# Connect

Connect tracks a port connection draft; components own ports, policy and saved
edges. Route `RequestedConnection` upward and send `Connected` only after saving
an accepted edge, so rejected requests never announce success. `Canceled` is
emitted only for an existing draft. Pass keys and `canConnect` to update and view;
self-connections are always rejected. `role` and `nearestInDirection` return
`Option`; they and `keyboardTarget` are pure.
The view bundles port attributes and a root Mount (document pointer listeners,
cached drag rectangles, 28px snapping); keyboard measurement and announcements
are Commands. Supply a unique root id and an `announcementId` for a component-owned
assertive live region. The DOM adapter emits client-pixel facts; convert point
facts and measured keyboard rectangles at the component boundary for canvas units.
Direct `Started`/`Targeted` facts already use caller units. Dispose the root Mount
with its canvas; roles, focus presentation and touch-action styling stay in the
component. Mount policy and radius are captured on insertion; remount the canvas
when changing these inputs. Update always revalidates current connection policy.
The renderer-neutral SVG demo is at `/docs/components/connect` on all sites.
Connect is a pure Model because `@foldkit/ui` 0.164.0 has no port-connection
equivalent: its `dragAndDrop` models list/container sorting, not connection edges.
