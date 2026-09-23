import assert from "node:assert/strict";
import test from "node:test";
import { getTransferPose, getTruckPose, TRANSFER_GEOMETRY, TRANSFER_TIMELINE } from "../components/portfolio/3d/LogisticsChoreography.ts";
import { getJourneyReadingLineOffset } from "../components/portfolio/3d/LogisticsJourneyMath.ts";

const state = (activeChapterId, chapterProgress) => ({ activeChapterId, chapterProgress });
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-6, `${message}: ${actual} != ${expected}`);

test("chapter reading line stays near the visible section heading", () => {
  close(getJourneyReadingLineOffset(712), 170.88, "desktop trigger");
  close(getJourneyReadingLineOffset(844), 202.56, "mobile trigger");
  close(getJourneyReadingLineOffset(320), 112, "short viewport header clearance");
});

test("placed container sits lengthwise on the trailer deck", () => {
  const pose = getTransferPose(state("sorting", TRANSFER_TIMELINE.placeEnd));
  close(pose.container.y - TRANSFER_GEOMETRY.containerHeight / 2, TRANSFER_GEOMETRY.trailerDeckY, "container bottom meets deck");
  close(pose.container.yaw, Math.PI / 2, "container long X axis rotates onto trailer Z axis");
  assert.ok(TRANSFER_GEOMETRY.containerWidth <= TRANSFER_GEOMETRY.trailerWidth, "rotated container fits trailer width");
});

test("spreader shares the container anchor until placement completes", () => {
  const placeMidpoint = (TRANSFER_TIMELINE.liftEnd + TRANSFER_TIMELINE.placeEnd) / 2;
  for (const progress of [0, TRANSFER_TIMELINE.liftEnd, placeMidpoint, TRANSFER_TIMELINE.placeEnd - 1e-9]) {
    const pose = getTransferPose(state("sorting", progress));
    close(pose.spreader.x, pose.container.x, "shared x");
    close(pose.spreader.z, pose.container.z, "shared z");
    close(pose.spreader.yaw, pose.container.yaw, "shared yaw");
    close(pose.spreader.y + TRANSFER_GEOMETRY.spreaderFrameOffsetY, pose.container.y + TRANSFER_GEOMETRY.containerHeight / 2, "spreader remains on container top");
  }
});

test("phase boundaries are continuous", () => {
  const beforePlace = getTransferPose(state("sorting", TRANSFER_TIMELINE.liftEnd - 1e-9)).container;
  const atPlace = getTransferPose(state("sorting", TRANSFER_TIMELINE.liftEnd)).container;
  const beforeRelease = getTransferPose(state("sorting", TRANSFER_TIMELINE.placeEnd - 1e-9)).container;
  const atRelease = getTransferPose(state("sorting", TRANSFER_TIMELINE.placeEnd)).container;
  for (const key of ["x", "y", "z", "yaw"]) {
    assert.ok(Math.abs(beforePlace[key] - atPlace[key]) < 1e-6, `lift/place ${key}`);
    assert.ok(Math.abs(beforeRelease[key] - atRelease[key]) < 1e-6, `place/release ${key}`);
  }
  const beforeDepart = getTransferPose(state("sorting", 1));
  const atDepart = getTransferPose(state("fleet", 0));
  assert.deepEqual(atDepart.container, beforeDepart.container);
  assert.deepEqual(atDepart.spreader, beforeDepart.spreader);
});

test("truck curve preserves position and tangent direction at its join", () => {
  const before = getTruckPose(0.48 - 1e-9);
  const at = getTruckPose(0.48);
  assert.ok(Math.hypot(before.x - at.x, before.z - at.z) < 1e-6, "route position remains continuous");
  assert.ok(Math.abs(before.yaw - at.yaw) < 1e-6, "route yaw remains continuous");
});

test("reverse and direct jumps produce the same complete pose", () => {
  const target = state("fleet", 0.62);
  const direct = getTransferPose(target);
  getTransferPose(state("fleet", 1));
  getTransferPose(state("inbound", 0));
  const revisited = getTransferPose(target);
  assert.deepEqual(revisited, direct);
  assert.notEqual(direct.container.yaw, 0, "departed container follows truck yaw");
});
