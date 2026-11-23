# Dependency patches

- `foldkit+0.164.0.patch` backports [Foldkit #1702](https://github.com/foldkit/foldkit/pull/1702) and [#1774](https://github.com/foldkit/foldkit/pull/1774). It keeps stale renders from overwriting native edits and lets rendering continue under sustained Message traffic. Remove this patch when upgrading to Foldkit 0.171.0 or later.
