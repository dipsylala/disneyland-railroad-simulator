#include <FastLED.h>

#define NUM_LEDS 120
#define DATA_PIN 6

CRGB leds[NUM_LEDS];

// ---- CONFIG ----
const float LOOP_TIME_SEC = 18 * 60.0;   // 18 minutes – travel time only, excluding dwell
const float DWELL_SEC     = 60.0;         // seconds each train pauses at a station (0 = no dwell)
const int   NUM_TRAINS    = 5;
const int   NUM_STATIONS  = 4;

// Station positions in LED index (0 – NUM_LEDS-1).
// Adjust to match the physical spacing on your strip.
const int STATIONS[] = {
  0,   // Main Street
  42,  // New Orleans
  60,  // Toontown
  84   // Tomorrowland
};

const char* STATION_NAMES[] = {
  "Main Street",
  "New Orleans",
  "Toontown",
  "Tomorrowland"
};

// ---- TRAIN STRUCT ----
struct Train {
  float position;     // 0.0 - 1.0
  const char* name;
};

Train trains[NUM_TRAINS];

// Train names
const char* TRAIN_NAMES[NUM_TRAINS] = {
  "C.K. Holliday",
  "E.P. Ripley",
  "Ernest Marsh",
  "Fred Gurley",
  "Ward Kimball"
};

// ---- TIMING ----
unsigned long lastUpdate = 0;
float elapsedSec = 0.0;  // total simulated seconds since start

// ---- POSITION LOGIC ----
// Maps elapsed time to a 0.0-1.0 track position, pausing at each station.
// All trains share the same total cycle length so spacing is preserved.
float computeTrainPosition(float timeSec, int trainIndex) {
  float totalCycleSec = LOOP_TIME_SEC + NUM_STATIONS * DWELL_SEC;
  float offsetSec = ((float)trainIndex / NUM_TRAINS) * totalCycleSec;
  float t = fmod(timeSec + offsetSec, totalCycleSec);
  if (t < 0) t += totalCycleSec;

  for (int i = 0; i < NUM_STATIONS; i++) {
    int fromLed = STATIONS[i];
    int toLed   = STATIONS[(i + 1) % NUM_STATIONS];
    int ledDist = (toLed - fromLed + NUM_LEDS) % NUM_LEDS;
    float segTravel = ((float)ledDist / NUM_LEDS) * LOOP_TIME_SEC;

    if (t < segTravel) {
      return fmod((fromLed + (t / segTravel) * ledDist) / NUM_LEDS, 1.0);
    }
    t -= segTravel;

    if (t < DWELL_SEC) {
      return fmod((float)toLed / NUM_LEDS, 1.0);
    }
    t -= DWELL_SEC;
  }

  return 0.0;
}

// ---- SETUP ----
void setup() {
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(80);

  elapsedSec = 0.0;
  lastUpdate = millis();
}

// ---- UPDATE LOGIC ----
void updateTrains() {
  unsigned long now = millis();
  float deltaSec = (now - lastUpdate) / 1000.0;
  lastUpdate = now;

  elapsedSec += deltaSec;

  for (int i = 0; i < NUM_TRAINS; i++) {
    trains[i].position = computeTrainPosition(elapsedSec, i);
    trains[i].name = TRAIN_NAMES[i];
  }
}

// ---- DRAW TRAIN (directional) ----
void drawTrain(float pos) {
  float ledPos = pos * NUM_LEDS;
  int head = (int)ledPos;
  float frac = ledPos - head;

  // ---- Locomotive (bright) ----
  leds[head] += CRGB(255 * (1 - frac), 255 * (1 - frac), 255 * (1 - frac));
  leds[(head + 1) % NUM_LEDS] += CRGB(255 * frac, 255 * frac, 255 * frac);

  // ---- Carriages (trailing, dimmer) ----
  const int trainLength = 5;

  for (int i = 1; i <= trainLength; i++) {
    int idx = (head - i + NUM_LEDS) % NUM_LEDS;

    float falloff = 1.0 - (i * 0.2);
    if (falloff < 0) falloff = 0;

    float brightness = 180 * falloff;

    leds[idx] += CRGB(brightness, brightness, brightness);
  }
}

// ---- RENDER ----
void render() {
  fill_solid(leds, NUM_LEDS, CRGB::Black);

  // ---- Draw stations (dim markers) ----
  for (int s = 0; s < 4; s++) {
    leds[STATIONS[s]] = CRGB(40, 40, 40);
  }

  // ---- Draw trains ----
  for (int t = 0; t < NUM_TRAINS; t++) {
    drawTrain(trains[t].position);
  }

  FastLED.show();
}

// ---- LOOP ----
void loop() {
  updateTrains();
  render();
}