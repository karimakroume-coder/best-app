export interface Video {
  id: string
  rank: number
  title: string
  creator: string
  thumbnailUrl: string
  videoUrl: string
  bestScore: number
  isRisingFast: boolean
  fireflagCount: number
  flexCount: number
  shareCount: number
  aiDescription: string
  category: Category
  publishedAt: string
  velocity: number
  retention: number
  geoSpread: number
  eliteBonus: boolean
}

export type Category =
  | 'global'
  | 'music'
  | 'gaming'
  | 'sports'
  | 'science'
  | 'art'
  | 'comedy'

export type ZoomLevel = '1x1' | '3x3' | '5x5' | 'WORLD_BEST'

export interface SpatialMapProps {
  /** The currently displayed video (single-card view) */
  currentVideo: Video
  /** Adjacent ranked videos for swipe navigation */
  nearbyVideos: Video[]
  /** Current zoom level */
  zoomLevel: ZoomLevel
  /** Callback when user swipes to navigate to another video */
  onNavigateToVideo: (videoId: string) => void
  /** Callback when user taps video to play/pause */
  onTogglePlayPause: () => void
  /** Callback when user pinches to change zoom level */
  onZoomChange: (level: ZoomLevel) => void
  /** Callback when user taps the Mandala to open action bar */
  onMandalaTap: () => void
  /** Callback when user holds Mandala to dismiss UI */
  onMandalaHold: () => void
  /** Whether the action bar (bloom state) is currently visible */
  isActionbarVisible: boolean
}
