# History

Feed accepted change records from Observe into History. Use the serializable
model to seek, undo, redo, and revert records by source. The parent applies
returned changes through its own update and retains ownership of its controls.

For a reversible preview, call `stageChanges(model, suggestions, access)`.
The parent supplies a reader and writer and increments a control's revision
on every accepted write. Keep the returned stage in the parent model.
Accept the preview by recording the chosen change and clearing the stage,
or call `rollbackStage` to restore the preceding values and clear it.
Rollback preserves values whose revisions advanced after staging.

The behavior demo on the [Get Started page](/docs/getting-started) previews a
region in a real Input and lets you keep or discard it.
