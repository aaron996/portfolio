export const JOURNEY_READING_LINE_RATIO = 0.24;
export const JOURNEY_READING_LINE_MIN_PX = 112;

export function getJourneyReadingLineOffset(viewportHeight: number) {
  return Math.max(JOURNEY_READING_LINE_MIN_PX, viewportHeight * JOURNEY_READING_LINE_RATIO);
}
