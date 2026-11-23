# File Drop

The parent keeps the Foldkit Schema Model, maps the child messages, and handles `ReceivedFiles` or `RejectedNonFiles`. The model records only hover state and the input ID. File objects travel in Messages and OutMessages so they can be validated or uploaded without adding them to the persistent model.

The view supplies one attribute bundle for the drop zone and one for the file input. File Input owns validation and renders both bundles in Tailwind, StyleX, and Pleat.
