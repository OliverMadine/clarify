import { useState, useEffect } from "react";
import { useChromeStorageSync } from 'use-chrome-storage';

import Main from "./Main";
import Settings from "./Settings";
import "./App.css";
import { updatePage } from "./pageStyle";

export const TITLE = "Clarify.";

export interface UserSettings {
  styleChanged: boolean,
  bgChanged: boolean;
  fontChanged: boolean;
  bgColor: string;
  font: string;
  fontSizeIncrease: number;
  fontSpacingIncrease: number;
}

function App() {
  const [page, setPage] = useState("main");
  const [settings, setSettings] = useChromeStorageSync(
    "settings", {
    styleChanged: true,
    bgChanged: false,
    fontChanged: false,
    bgColor: "#ffffff", /* white */
    font: "Arial",
    fontSizeIncrease: 0,
    fontSpacingIncrease: 0,
  });

  /* Load settings from chrome sync */
  useChromeStorageSync("settings", setSettings);

  /* Refresh page on any settings change */
  useEffect(() => { updatePage(settings) }, [settings]);

  /* Todo: better method for page navigation */
  function selectPage() {
    switch (page) {
      case "settings":
        return Settings(settings, setSettings, setPage);
      default:
        return Main(settings, setSettings, setPage);
    }
  }

  return (
    <div className="App">
      {selectPage()}
    </div>
  )
}

export default App;
