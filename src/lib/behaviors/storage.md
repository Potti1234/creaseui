# Storage

Storage descriptors are Schema data: choose local, session or cookie and an id.
Run get, set, remove and available inside Effects or Commands. Failures return
Option.none() or false, never prevent an in-memory preference change. get returns
Option<string>; set and remove return boolean success (cookies are read back
to verify writes). Cookie defaults
are one year, path /, SameSite=Lax and Secure on HTTPS. The changes stream owns
cross-document storage listeners (including clear); cookies have no change stream.
script returns an Option<string> containing a validated data-* attribute pre-paint
script for web storage, or Option.none() for cookies.
