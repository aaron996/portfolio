"use client";

import dynamic from "next/dynamic";

const SensorBot = dynamic(() => import("./SensorBot").then((module) => module.SensorBot), {
  ssr: false,
});

export function SensorBotCanvas() {
  return <SensorBot />;
}
