import {
  sidebar,
  sidebarContent,
  sidebarInset,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarMenuSubButton,
  sidebarMenuSubItem,
  sidebarProvider,
} from '@/stylex/sidebar'

import { avatarFallback } from '@/stylex/avatar'

import { runAppShell } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()

runAppShell({
  sidebarProvider,
  sidebar,
  sidebarContent,
  sidebarInset,
  sidebarMenu,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarMenuSubItem,
  sidebarMenuSubButton,
  sidebarMenuBadge,
  avatarFallback,
})
