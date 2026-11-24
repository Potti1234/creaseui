# Gesture

Call `projectDistance(speed, rate)` with a release velocity in distance per
millisecond and a per-millisecond decay between zero and one. Add the result
to the release position to pick a candidate destination.

`solveSpring(responseSeconds, damping, displacement, velocity)` gives
position and velocity at elapsed milliseconds. Add the position to the
destination and use velocity with a position threshold to finish motion.
The caller controls the animation frames and reduced-motion policy.

`sectorOf(dx, dy, count, options)` returns the closest wedge clockwise from
up, or `-1` within the dead zone. Set `start` in turns to rotate the wedges.
