# Shortcuts

Shortcuts provides pure platform-aware ARIA, display, matching, typing-target
and newest-enabled-binding resolution helpers. ListenShortcuts owns a document
keydown listener for its Mount lifetime and emits PressedShortcut messages.
Layer priority and named scopes are intentionally left to the host application;
item keys metadata does not register application actions automatically.
