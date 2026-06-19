import { useState } from "react";
import Onboarding from "@/pages/Onboarding";
import GestureControl from "@/pages/GestureControl";
import Dictionary from "@/pages/Dictionary";
import Settings from "@/pages/Settings";
import Tutorial from "@/pages/Tutorial";
import IOSTabBar from "@/components/IOSTabBar";

type AppScreen = "onboarding" | "app";
type TabScreen = "gesture" | "tutorial" | "dictionary" | "settings";

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("onboarding");
  const [tab, setTab] = useState<TabScreen>("gesture");

  if (appScreen === "onboarding") {
    return (
      <div className="w-screen h-screen overflow-hidden" style={{ maxWidth: 430, margin: "0 auto", background: "#0a0a0c" }}>
        <Onboarding onStart={() => setAppScreen("app")} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col"
      style={{ maxWidth: 430, margin: "0 auto", background: "#050507" }}>
      <div className="flex-1 overflow-hidden relative">
        <GestureControl active={tab === "gesture"} />
        <Tutorial active={tab === "tutorial"} />
        <Dictionary active={tab === "dictionary"} />
        <Settings active={tab === "settings"} />
      </div>
      <IOSTabBar active={tab} onChange={setTab} />
    </div>
  );
}
