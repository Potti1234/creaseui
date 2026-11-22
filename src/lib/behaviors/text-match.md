# TextMatch

`text-match.ts` provides pure fuzzy scoring, match ranges and display segments.
Length-preserving, collator-based folding respects the runtime locale; pass a
locale or a folder explicitly for deterministic language-specific matching.
Unlike ui-sdk, folding unifies Greek final sigma `ς` with `σ`.
Scoring folds and trims both inputs, while display ranges preserve label offsets.
Command ranks through Listbox’s score callback and highlights matched letters.

Command item configs can expose `label` and optional `leadingContent` for an
icon/adornment. Renderers highlight the label automatically; `searchText` can
still extend the searchable text. Legacy rich `content` remains opaque.
