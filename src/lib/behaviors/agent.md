# Observe, History and Agent

Components describe agent-visible state as data owned by the application.
Observe selects Commit changes by default, or Live steps when requested.
The component supplies the Commit's previous value from before the interaction.
History records Observe changes and emits Apply with values to restore.
The app maps those values to its own Messages; History never mutates controls.
Agent plans and validates steps against the current component descriptions.
RunStep asks the app to execute; RequestApproval asks a person to approve.
Report completion or failure back to Agent to advance or finish the run.
Use agentChange for source 'agent', and explicit secret flags for redaction.

Foldkit DevTools remains the better tool for development-time agent inspection.
Its MCP bridge offers Schema-typed Message dispatch and model time travel with
keyframes, and stays as is. It is dev-only and model-level, not the in-app,
user-facing agent and history these modules port: per-control undo by source,
confirmation and redaction.
