# Anchored Popup

Use the shared behavior for a popup that stays in the caller's DOM tree. The parent owns the Schema Model and sends the behavior's Messages through `update(model, message, config)`. Forward the returned Commands and handle its OutMessages when the parent needs to react to open or close.

Spread `triggerAttributes` onto a native button. While `model.isOpen` is true, put `panelAttributes` on the panel and supply the appropriate role and accessible name. Use `closeAttributes` for explicit dismiss controls. Keep the trigger and panel IDs stable and unique within their DOM root. Positioning uses the shared native Position behavior. Escape and outside press take part in the shared Layer dismissal order.

The config selects the desired placement, optional initial focus, dismissal policy, and whether explicit close restores trigger focus. Prefer another adapter when a consumer needs a portal, modal focus trapping, or an animated exit.
