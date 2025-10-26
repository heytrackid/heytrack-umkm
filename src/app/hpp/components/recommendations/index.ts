// Main component
export { default as HPPRecommendationsPanel } from './HPPRecommendationsPanel'

// Hooks
export { useRecommendationsData } from './useRecommendationsData'
export { useExpandedState } from './useExpandedState'

// Components
export { LoadingState, ErrorState, EmptyState } from './RecommendationStates'
export { RecommendationItem } from './RecommendationItem'
export { PotentialSavingsSummary } from './PotentialSavingsSummary'

// Config
export { getPriorityConfig, getTypeConfig } from './recommendationConfig'
