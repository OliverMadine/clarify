import { useState, useEffect } from "react";
import { Card, CardContent, CardActionArea, Typography, ToggleButtonGroup, ToggleButton, Button, Box } from "@mui/material";
import Pusher from "pusher-js";

import "./App.css";
import { StyleSettings } from "./common/Settings"
import { Preset, DEFAULT_PRESET } from "./common/domain";
import { getAllPresets } from "./styleDB";
import { updatePage } from "./pageStyle";
import Style from "./style";
import { sendPresetToExtension } from "./scripts";

// this hack is required because env variables are not visible from the frontend
const url = window.location.href;
const STAGING = url.includes("staging");
const PRODUCTION = !url.includes("staging") && !url.includes("localhost");

// TODO: Fetch env vars from the server (they are public so should not be security problem for now)
var PUSHER_KEY = PRODUCTION ? "6dbf0a6609c4bb0901fb" : "f3244147a7aa2248499d";
const PUSHER_CLUSTER = "eu";
const PUSHER_CHANNEL = "clarify";
const SUBMIT_EVENT = "submit";

export const ROOT_DEMO_PAGE = "root-demo-page";

function App() {
  const [preset, setPreset] = useState<Preset>(DEFAULT_PRESET);
  const [styleChanged, setStyleChanged] = useState<boolean>(true);
  const [dbPresets, setDbPresets] = useState<Style[]>([]);

  // Binding to update styles in real time
  useEffect(() => {
    if (PRODUCTION || STAGING) {
      // subscribe to pusher only in production (to be isolated when runnig locally)
      const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER })
      /* Pull from database */
      getAllPresets().then(setDbPresets);
      pusher.subscribe(PUSHER_CHANNEL).bind(SUBMIT_EVENT, () => getAllPresets().then(setDbPresets));
      return (() => pusher.unsubscribe(PUSHER_CHANNEL));
    } else {
      getAllPresets().then(setDbPresets);
    }
  }, []);

  useEffect(() => {
    updatePage({ styleChanged: styleChanged, presets: [preset] }, preset);
  }, [preset, styleChanged]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1> Clarify </h1>
          <h2> Making the web accessible for everyone with custom styles and layouts. </h2>
        </div>
      </header>
      {Demo(preset, setPreset, styleChanged, setStyleChanged)}
      <div className="popular-cards-header">
        <h2>Popular Presets</h2>
        <div className="popular-cards">
          {/* onClick on the card, update the dbPreset variable, this will re-render this component */}
          {dbPresets.sort((s1: Style, s2: Style) => { return s2.gId - s1.gId; }).map(style => {
            return (<div className="card">{BgCard(style.bgColor, style.font, style.gId, preset, setPreset)}</div>);
          })}
        </div>
      </div>
    </div>
  );
}

function DemoPage() {
  return (
    <div id={ROOT_DEMO_PAGE}>
      <div className="demo-page">
        <h1> This is a demo. Try out the features! </h1>
        <div className="demo-labelled-img">
          <p className="demo-lorem"> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
          <img src="logo.png" />
        </div>
        <div className="demo-list-link">
          <div className="demo-list">
            <p>Here is a list: </p>
            <ul>
              <li key={1}>I have</li>
              <li key={2}>Got to be</li>
              <li key={3}>Honest</li>
            </ul>
          </div>
          <div className="demo-link">
            <p>Here is a link: </p>
            <a href="https://www.imperial.ac.uk/">www.imperial.ac.uk</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Demo(preset: Preset, setPreset: (_: Preset) => void, styleChanged: boolean, setStyleChanged: (_: boolean) => void) {
  const [expanded, setExpanded] = useState<string | false>(false);

  return (
    <div className="demo-header">
      <h2>Demo</h2>
      <p className="demo-description"> 
        Welcome to the demo of <b>Clarify</b>! Clarify is a Chrome extension that <b>enhances web surfing</b> by letting you
        customise the appearance of the web pages, save your favourite configurations and share them with the community. 
        <br></br> <br></br>
        What you can do in this demo:
        <ul>
          <li> <b>See the improvements with your eyes</b>: select ORIGINAL to see the web page before applying the changes, CLARIFY to see it after</li>
          <li> <b>Tailor it to perfection</b>: customise the configuration by opening the menu of the single features and activate the toggle to try out! </li>
          <li> <b>Bring it with you</b>: download the preset to have it always with you!</li>
          <li> <b>Enjoy the great community</b>: load a popular preset by clicking on the cards below! </li> 
        </ul> 
      </p>
      <div className="demo">
        <div className="demo-menu">
          <div className="demo-toggle">
            <ToggleButtonGroup
              value={styleChanged ? "clarify" : "original"}
              exclusive
              onChange={(_, x) => setStyleChanged(x === "clarify")}
            >
              <ToggleButton value="original">Original</ToggleButton>
              <ToggleButton value="clarify">Clarify</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="demo-download">
            <Button
              variant="outlined"
              onClick={() => sendPresetToExtension(preset)}
            >
              Download this preset
            </Button>
          </div>
          {StyleSettings(preset, setPreset, expanded, setExpanded)}
        </div>
        {DemoPage()}
      </div>
    </div>
  );
}

function BgCard(bgColor: string, font: string, freq: number, preset: Preset, setPreset: (_: Preset) => void) {
  return (
    <Card>
      <CardActionArea style={{ backgroundColor: bgColor }} onClick={e => setPreset({ ...preset, bgColor: bgColor, font: font })}>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" >
            Recommended by {freq} users
            {/* recommend this background color and font */}
          </Typography>
          <Typography variant="body1" style={{ fontFamily: font }}>
            {font}<br />
            Click to apply!
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default App;
