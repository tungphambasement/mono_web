"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import DraggableTerminal from "./components/DraggableTerminal";

const PhysicsOverlay = dynamic(() => import("./components/PhysicsOverlay"), { ssr: false });

export default function Home() {
  const [physicsVisible, setPhysicsVisible] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      <DraggableTerminal
        externalCommands={{
          "physics.play": {
            description: "launch physics simulation",
            output: <span className="text-zinc-400">Launching physics simulation…</span>,
            action: () => setPhysicsVisible(true),
          },
        }}
      />

      {physicsVisible && (
        <div className="relative h-100 overflow-hidden mt-auto">
          <PhysicsOverlay />
        </div>
      )}
    </div>
  );
}
