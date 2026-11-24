# Animation

Animation coordinates the phases around CSS entry and exit. The child Model
tracks visibility, transition phase, and a generation number so a completion
from an earlier transition cannot settle a newer one.

## Compose a transition

Initialize with the animated element's ID. Send Showed or Hid from the
owning update and run the returned Commands. On StartedLeaveAnimating, use
defaultLeaveCommand to detect the transition end. Keep the content present
until TransitionedOut when the surface needs to animate before unmounting.

```ts
import * as Animation from '@/lib/behaviors/animation'

const animation = Animation.init({ id: 'panel' })
const entering = Animation.update(animation, Animation.Message.Showed())
```

Use [Motion](motion.md) when a view should assemble the attributes and
lifecycle for you.
