import './styles.css'

import {
  sidebar,
  sidebarContent,
  sidebarInset,
  sidebarProvider,
} from '@/ui/sidebar'

import { runAppShell } from '../shared'

runAppShell({ sidebarProvider, sidebar, sidebarContent, sidebarInset })
