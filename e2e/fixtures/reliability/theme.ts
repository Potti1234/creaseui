import themeSource from '@/theme.css?raw'

// StyleX/Pleat consumers install only the theme variables: no Tailwind.
export const installThemeVariables = () => {
  const theme = document.createElement('style')
  theme.textContent = [
    ...themeSource.matchAll(/(?:^|\n)(:root|\.dark)\s*\{[^}]+\}/gu),
  ]
    .map(match => match[0])
    .join('\n')
  document.head.append(theme)
}
