export type LogisticsWaypointId = "inbound" | "sorting" | "fleet" | "control" | "dispatch";

export interface LogisticsWaypoint {
  id: LogisticsWaypointId;
  index: number;
  sectionId: string;
  cameraPos: [number, number, number];
  targetLookAt: [number, number, number];
}

export const LOGISTICS_WAYPOINTS: LogisticsWaypoint[] = [
  {
    id: "inbound",
    index: 1,
    sectionId: "hero",
    cameraPos: [0, 3.4, 8.5],
    targetLookAt: [-2, 1.2, 0],
  },
  {
    id: "sorting",
    index: 2,
    sectionId: "cases",
    cameraPos: [4, 5.2, 9],
    targetLookAt: [-1.2, 1.5, 0],
  },
  {
    id: "fleet",
    index: 3,
    sectionId: "other-works",
    cameraPos: [8, 12, 11],
    targetLookAt: [0, 1.3, 1],
  },
  {
    id: "control",
    index: 4,
    sectionId: "pipeline",
    cameraPos: [0, 22.0, -60.0],
    targetLookAt: [0, 2.0, -70.0],
  },
  {
    id: "dispatch",
    index: 5,
    sectionId: "contact",
    cameraPos: [1.8, 2.4, -108],
    targetLookAt: [0, 0.9, -114],
  },
];
