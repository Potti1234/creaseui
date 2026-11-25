# Third-party notices

Crease UI contains adapted code, styles, or generated data from the following projects.
Their licenses apply to the corresponding material; Crease UI's own source is
MIT licensed.

| Project                | Use                                                               | License    |
| ---------------------- | ----------------------------------------------------------------- | ---------- |
| shadcn/ui              | Visual, token, and component reference                            | MIT        |
| Foldkit and Foldkit UI | Application and primitive architecture                            | MIT        |
| Lucide                 | Generated icon adapter data                                       | ISC        |
| Hugeicons              | Generated icon adapter data                                       | MIT        |
| Tabler Icons           | Generated icon adapter data                                       | MIT        |
| Phosphor Icons         | Generated icon adapter data                                       | MIT        |
| Remix Icon             | Generated icon adapter data                                       | Apache-2.0 |
| Apache ECharts         | Chart rendering                                                   | Apache-2.0 |
| Vercel ui-sdk          | Native ScrollPicker behavior port from @ui-sdk/core 0.1.0-beta.13 | Apache-2.0 |
| Vercel UI SDK          | Tree collection and checked-state algorithms                      | Apache-2.0 |
| Vercel UI SDK          | StickToBottom viewport algorithm                                  | Apache-2.0 |

The adapted TreeCollection module is distributed with the
[UI SDK license](src/lib/behaviors/tree-collection.LICENSE.txt).
The adapted StickToBottom, Cell Range and Resize modules are distributed with the
[UI SDK license](src/lib/behaviors/ui-sdk-LICENSE.txt).

Exact source packages for icon adapters are recorded in
[`docs/create-presets.md`](docs/create-presets.md). Upstream repositories and
pinned comparison revisions are recorded in [`docs/provenance.md`](docs/provenance.md).

The ScrollPicker port adapts `@ui-sdk/core` 0.1.0-beta.13,
Copyright 2026 Vercel, Inc. Its Apache-2.0 license is reproduced in
[`docs/ui-sdk-LICENSE.txt`](docs/ui-sdk-LICENSE.txt).
