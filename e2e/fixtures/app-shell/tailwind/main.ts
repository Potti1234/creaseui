import './styles.css'

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
} from '@/ui/sidebar'

import { avatarFallback } from '@/ui/avatar'

import { runAppShell } from '../shared'

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
