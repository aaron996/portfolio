export type LogisticsWaypointId = "inbound" | "sorting" | "fleet" | "control" | "dispatch";

export interface LogisticsWaypoint {
  id: LogisticsWaypointId;
  index: number;
  sectionId: string;
  scrollRange: [number, number]; // [startProgress, endProgress]
  cameraPos: [number, number, number];
  targetLookAt: [number, number, number];
}

export const LOGISTICS_WAYPOINTS: LogisticsWaypoint[] = [
  {
    id: "inbound",
    index: 1,
    sectionId: "hero",
    scrollRange: [0, 0.16],
    cameraPos: [0, 2.0, 7.5],
    targetLookAt: [0, 1.2, 0],
  },
  {
    id: "sorting",
    index: 2,
    sectionId: "cases",
    scrollRange: [0.16, 0.46],
    cameraPos: [0, 1.6, 8.4],
    targetLookAt: [0, 1.5, 0],
  },
  {
    id: "fleet",
    index: 3,
    sectionId: "other-works",
    scrollRange: [0.46, 0.68],
    cameraPos: [0, 16.0, -14.0],
    targetLookAt: [0, 0, -14.0],
  },
  {
    id: "control",
    index: 4,
    sectionId: "pipeline",
    scrollRange: [0.68, 0.86],
    cameraPos: [0, 22.0, -60.0],
    targetLookAt: [0, 2.0, -70.0],
  },
  {
    id: "dispatch",
    index: 5,
    sectionId: "contact",
    scrollRange: [0.86, 1.0],
    cameraPos: [1.8, 2.4, -108],
    targetLookAt: [0, 0.9, -114],
  },
];
