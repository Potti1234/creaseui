import {
  sidebar,
  sidebarContent,
  sidebarInset,
  sidebarProvider,
} from '@/pleat/sidebar'

import { runAppShell } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()

runAppShell({ sidebarProvider, sidebar, sidebarContent, sidebarInset })
