import React, { useEffect, useMemo, useState } from "react";

const NUM_LEDS = 120;
const LOOP_TIME_SEC = 18 * 60;
const NUM_TRAINS = 5;
const TRAIN_NAMES = [
  "C.K. Holliday",
  "E.P. Ripley",
  "Ernest Marsh",
  "Fred Gurley",
  "Ward Kimball",
];

const STATIONS = [
  { name: "Main Street, U.S.A.", pos: 0.0 },
  { name: "New Orleans Square", pos: 0.35 },
  { name: "Mickey's Toontown", pos: 0.5 },
  { name: "Tomorrowland", pos: 0.7},
];

function wrap01(v) {
  let x = v % 1;
  if (x < 0) x += 1;
  return x;
}

function timeToStation(trainPos, stationPos) {
  return wrap01(stationPos - trainPos) * LOOP_TIME_SEC;
}

function formatEta(seconds) {
  if (seconds < 20) return "Arriving";
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min`;
}

function buildLedBrightness(trains) {
  const values = new Array(NUM_LEDS).fill(0);

  for (const train of trains) {
    const ledPos = train.position * NUM_LEDS;
    const head = Math.floor(ledPos);
    const frac = ledPos - head;

    values[head] += 1.0 * (1 - frac);
    values[(head + 1) % NUM_LEDS] += 1.0 * frac;

    const trainLength = 5;
    for (let i = 1; i < trainLength; i++) {
      const idx = (head - i + NUM_LEDS) % NUM_LEDS;
      const falloff = Math.max(0, 1.0 - i * 0.2);
      values[idx] += 0.65 * falloff;
    }
  }

  for (const station of STATIONS) {
    const idx = Math.floor(station.pos * NUM_LEDS) % NUM_LEDS;
    values[idx] = Math.max(values[idx], 0.18);
  }

  return values.map((v) => Math.min(1, v));
}

export default function DisneylandRailroadLedSimulator() {
  const [running, setRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(120);
  const [loopMinutes, setLoopMinutes] = useState(18);
  const [timeSec, setTimeSec] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let raf;

    const tick = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      if (running) {
        setTimeSec((t) => t + delta * speedMultiplier);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speedMultiplier]);

  const loopTimeSec = loopMinutes * 60;

  const trains = useMemo(() => {
    return TRAIN_NAMES.map((name, i) => ({
      name,
      position: wrap01(i / NUM_TRAINS + timeSec / loopTimeSec),
    }));
  }, [timeSec, loopTimeSec]);

  const leds = useMemo(() => buildLedBrightness(trains), [trains]);

  const nextArrivals = useMemo(() => {
    return STATIONS.map((station) => {
      const ranked = trains
        .map((train) => ({
          train: train.name,
          eta: timeToStation(train.position, station.pos),
        }))
        .sort((a, b) => a.eta - b.eta);
      return {
        station: station.name,
        next: ranked[0],
        second: ranked[1],
      };
    });
  }, [trains]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Disneyland Railroad LED Simulator</h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              Preview the Arduino logic without hardware. Bright white pixels represent locomotives, with dimmer trailing carriage lights.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className="rounded-2xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? "Pause" : "Resume"}
            </button>
            <button
              className="rounded-2xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
              onClick={() => setTimeSec(0)}
            >
              Reset
            </button>
            <label className="rounded-2xl px-4 py-2 bg-neutral-900 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400">Speed</span>
              <select
                className="bg-transparent outline-none"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              >
                <option value={1}>1x</option>
                <option value={20}>20x</option>
                <option value={30}>30x</option>
                <option value={60}>60x</option>
                <option value={120}>120x</option>
                <option value={300}>300x</option>
                <option value={600}>600x</option>
              </select>
            </label>
            <label className="rounded-2xl px-4 py-2 bg-neutral-900 border border-neutral-800 flex flex-col">
              <span className="text-xs text-neutral-400">Loop time</span>
              <select
                className="bg-transparent outline-none"
                value={loopMinutes}
                onChange={(e) => setLoopMinutes(Number(e.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={18}>18 min</option>
                <option value={20}>20 min</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
            <div className="aspect-square max-w-[640px] mx-auto rounded-full border border-neutral-800 bg-neutral-950/80 flex items-center justify-center relative">
              <div className="absolute inset-10 rounded-full border border-neutral-800" />

              {leds.map((b, i) => {
                const angle = (i / NUM_LEDS) * Math.PI * 2 - Math.PI / 2;
                const radius = 42;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                const size = 8;
                const opacity = 0.08 + b * 0.92;
                const blur = 2 + b * 10;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      transform: "translate(-50%, -50%)",
                      background: `rgba(255,255,255,${opacity})`,
                      boxShadow: `0 0 ${blur}px rgba(255,255,255,${opacity})`,
                    }}
                    title={`LED ${i}`}
                  />
                );
              })}

              {STATIONS.map((station) => {
                const angle = station.pos * Math.PI * 2 - Math.PI / 2;
                const radius = 54;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                return (
                  <div
                    key={station.name}
                    className="absolute text-center"
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="text-[10px] md:text-xs font-medium text-neutral-300 bg-neutral-950/80 px-2 py-1 rounded-xl border border-neutral-800 whitespace-nowrap">
                      {station.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
              <h2 className="text-lg font-semibold">Train positions</h2>
              <div className="mt-4 space-y-3">
                {trains.map((train, idx) => (
                  <div key={train.name} className="rounded-2xl bg-neutral-950/70 border border-neutral-800 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{train.name}</span>
                      <span className="text-sm text-neutral-400">{(train.position * 100).toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${train.position * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
              <h2 className="text-lg font-semibold">Station board</h2>
              <div className="mt-4 space-y-3">
                {nextArrivals.map((row) => (
                  <div key={row.station} className="rounded-2xl bg-neutral-950/70 border border-neutral-800 p-3">
                    <div className="font-medium">{row.station}</div>
                    <div className="mt-2 text-sm text-neutral-300">
                      Next: <span className="text-white">{row.next.train}</span> - {formatEta(row.next.eta)}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      Then: {row.second.train} - {formatEta(row.second.eta)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
