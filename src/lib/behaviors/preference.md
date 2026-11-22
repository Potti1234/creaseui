# Preference

Bind allowed strings with Preference.create<Value>({ values, defaultValue,
attribute, storage }). init and decode accept Option<string> from storage, falling back to the
default. RequestedValue persists only actual changes; RestoredValue and
ReceivedStoredValue report restore/storage-sync without writing back. Updates
return ChangedValue OutMessages. attributes exposes a pure data-attribute bundle;
compose changes into the parent's subscriptions and lift command messages.
