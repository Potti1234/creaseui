# ColorScheme

ColorScheme composes Preference for system, light and dark, defaulting to system.
Its Schema model also tracks the OS scheme (unknown resolves to light). Compose
changes to follow live OS and storage changes. Apply owns the documentElement
dark class and style.colorScheme; updates apply only resolved changes. Initialize
from Storage.get and the OS inside an Effect, never by reading DOM from update.

For server initialization, pass the request's `Sec-CH-Prefers-Color-Scheme`
value through `colorSchemeOf`. Pass the result as the initial system scheme
when constructing the Model.
