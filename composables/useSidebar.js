// Shared open/closed state for the mobile navigation drawer.
// On desktop (>880px) the sidebar is always visible and this state is ignored;
// below 880px the sidebar is off-canvas and this toggles it in and out.
export function useSidebar() {
  const open = useState('sidebar-open', () => false)
  const toggle = () => { open.value = !open.value }
  const close = () => { open.value = false }
  return { open, toggle, close }
}
