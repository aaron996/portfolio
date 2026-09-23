import { LOGISTICS_WAYPOINTS, type LogisticsWaypointId } from "./LogisticsTypes";
import { getJourneyReadingLineOffset } from "./LogisticsJourneyMath";
export { getTransferPhase, getTransferPose, getTruckPose, TRANSFER_GEOMETRY, TRANSFER_TIMELINE, type TransferPhase, type TransferPose } from "./LogisticsChoreography";
export { getJourneyReadingLineOffset, JOURNEY_READING_LINE_MIN_PX, JOURNEY_READING_LINE_RATIO } from "./LogisticsJourneyMath";

export interface LogisticsJourneyState {
  activeChapterId: LogisticsWaypointId;
  chapterProgress: number;
  pageProgress: number;
}

export interface LogisticsJourneyStore {
  current: LogisticsJourneyState;
  update: (next: LogisticsJourneyState) => void;
  subscribe: (listener: () => void) => () => void;
}

const initialState: LogisticsJourneyState = { activeChapterId: "inbound", chapterProgress: 0, pageProgress: 0 };

export function createLogisticsJourneyStore(): LogisticsJourneyStore {
  const listeners = new Set<() => void>();
  const store: LogisticsJourneyStore = {
    current: initialState,
    update(next) {
      const previous = store.current;
      store.current = next;
      if (previous.activeChapterId !== next.activeChapterId || Math.abs(previous.chapterProgress - next.chapterProgress) > 0.002 || Math.abs(previous.pageProgress - next.pageProgress) > 0.002) {
        listeners.forEach((listener) => listener());
      }
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
  return store;
}

export interface ChapterBound { id: LogisticsWaypointId; top: number; bottom: number; }

/** Reading line remains below fixed navigation and keeps short sections selectable. */
export function deriveJourneyState(bounds: ChapterBound[], scrollY: number, viewportHeight: number, documentHeight: number): LogisticsJourneyState {
  const readingLineOffset = getJourneyReadingLineOffset(viewportHeight);
  const readingLine = scrollY + readingLineOffset;
  const pageProgress = Math.max(0, Math.min(1, scrollY / Math.max(1, documentHeight - viewportHeight)));
  const activeIndex = bounds.reduce((selected, bound, index) => readingLine >= bound.top ? index : selected, 0);
  const current = bounds[activeIndex] ?? { id: "inbound" as const, top: 0, bottom: viewportHeight };
  const next = bounds[activeIndex + 1];
  const chapterEnd = next?.top ?? Math.max(current.bottom, documentHeight - viewportHeight + readingLineOffset);
  const chapterProgress = Math.max(0, Math.min(1, (readingLine - current.top) / Math.max(1, chapterEnd - current.top)));
  return { activeChapterId: current.id, chapterProgress, pageProgress };
}

export function measureChapterBounds(): ChapterBound[] {
  return LOGISTICS_WAYPOINTS.map(({ id, sectionId }) => {
    const element = document.getElementById(sectionId);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { id, top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
  }).filter((bound): bound is ChapterBound => bound !== null);
}
