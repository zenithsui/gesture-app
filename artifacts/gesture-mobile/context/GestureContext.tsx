import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface GestureSettings {
  pointerSize: number;
  pointerSpeed: number;
  smoothing: number;
  clickSens: number;
  sound: boolean;
  haptics: boolean;
  mirrorCam: boolean;
  showFps: boolean;
  darkPointer: boolean;
  handedness: "auto" | "left" | "right";
  wakeWord: boolean;
}

const DEFAULTS: GestureSettings = {
  pointerSize: 24,
  pointerSpeed: 1.0,
  smoothing: 0.3,
  clickSens: 0.08,
  sound: true,
  haptics: true,
  mirrorCam: true,
  showFps: true,
  darkPointer: false,
  handedness: "auto",
  wakeWord: false,
};

const STORAGE_KEY = "gesture_settings_v1";

interface GestureContextValue {
  settings: GestureSettings;
  updateSetting: <K extends keyof GestureSettings>(
    key: K,
    value: GestureSettings[K]
  ) => void;
}

const GestureContext = createContext<GestureContextValue>({
  settings: DEFAULTS,
  updateSetting: () => {},
});

export function GestureProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GestureSettings>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<GestureSettings>;
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    });
  }, []);

  const updateSetting = useCallback(
    <K extends keyof GestureSettings>(key: K, value: GestureSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <GestureContext.Provider value={{ settings, updateSetting }}>
      {children}
    </GestureContext.Provider>
  );
}

export function useGesture() {
  return useContext(GestureContext);
}
