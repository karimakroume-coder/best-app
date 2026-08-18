// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/spatial-map-world-best
// -----------------------------------------------------------------------------

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
