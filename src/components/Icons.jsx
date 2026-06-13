import React from 'react'

// Lightweight Lucide-style stroke icons (no dependency). 1.75px stroke,
// currentColor, sized by the `size` prop.
function Svg({ size = 18, children, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const Icon = {
  dashboard: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
  ),
  planning: (p) => (
    <Svg {...p}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </Svg>
  ),
  purchase: (p) => (
    <Svg {...p}>
      <path d="M5 7h13l-1.2 7.2a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.7L5 4H3" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="16" cy="20" r="1" />
    </Svg>
  ),
  stores: (p) => (
    <Svg {...p}>
      <path d="M3 9l9-5 9 5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M3 9h18M9 19v-6h6v6" />
    </Svg>
  ),
  quality: (p) => (
    <Svg {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </Svg>
  ),
  alert: (p) => (
    <Svg {...p}>
      <path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  ),
  plus: (p) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  close: (p) => (
    <Svg {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  ),
  play: (p) => (
    <Svg {...p}>
      <path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  pause: (p) => (
    <Svg {...p}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  forward: (p) => (
    <Svg {...p}>
      <path d="M4 5l8 7-8 7zM13 5l8 7-8 7z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  reset: (p) => (
    <Svg {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  ),
  logout: (p) => (
    <Svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  ),
  download: (p) => (
    <Svg {...p}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </Svg>
  ),
  chevronRight: (p) => (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  arrowLeft: (p) => (
    <Svg {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  ),
  check: (p) => (
    <Svg {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  ),
  lock: (p) => (
    <Svg {...p}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  ),
  user: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Svg>
  ),
  bolt: (p) => (
    <Svg {...p}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </Svg>
  ),
}
