# Disneyland Railroad LED Simulator

This project has two parts:

1. **`arduino.ino`** — the production Arduino sketch that runs on hardware, driving a 120-LED WS2812 strip arranged around a circular track display using [FastLED](https://fastled.io/).
2. **`disneyland_railroad_simulator.jsx`** — a browser-based React mockup that mirrors the `.ino` logic exactly, so the LED behaviour can be previewed and iterated on without needing the physical hardware.

## What it does

The `.ino` sketch (and its JSX mirror) simulate 120 LEDs arranged in a circle representing the railroad loop. Five trains (the real named locomotives) travel around the track in real time. Each train renders as a bright white head LED with dimmer trailing carriage lights. Station markers are always faintly lit.

The JSX simulator adds a station arrival board showing the next two trains due at each of the four stations, with ETAs updating live.

**Trains modelled:**

- C.K. Holliday
- E.P. Ripley
- Ernest Marsh
- Fred Gurley
- Ward Kimball

**Stations modelled:**

- Main Street, U.S.A.
- New Orleans Square
- Mickey's Toontown
- Tomorrowland

## Arduino hardware

**Requirements:**

- Arduino (Uno or compatible)
- 120-LED WS2812 strip connected to pin 6
- [FastLED library](https://fastled.io/) installed in the Arduino IDE

Open `arduino.ino` in the Arduino IDE and upload to the board. Brightness is set to 80/255 by default — adjust `FastLED.setBrightness()` in `setup()` to taste.

## Browser simulator

Used to preview and iterate on the LED logic without hardware.

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Controls

| Control | Description |
| --- | --- |
| Pause / Resume | Freezes or continues the simulation |
| Reset | Returns all trains to their starting positions |
| Speed | Multiplier over real time (30x – 600x) |
| Loop time | Adjustable total circuit duration (15, 18, or 20 minutes) |

## Project structure

```text
arduino.ino                         Arduino sketch (production hardware)
disneyland_railroad_simulator.jsx   React component mirroring the .ino logic
src/
  main.jsx                          React root mount
  index.css                         Tailwind directives
index.html                          HTML entry point
vite.config.js                      Vite build config
tailwind.config.js                  Tailwind content config
postcss.config.js                   PostCSS pipeline
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serves the production build locally
```

## Tech stack (simulator)

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [FastLED](https://fastled.io/) (Arduino sketch)
