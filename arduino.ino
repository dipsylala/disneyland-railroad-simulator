#include <FastLED.h>

#define NUM_LEDS 120
#define DATA_PIN 6

CRGB leds[NUM_LEDS];

// ---- CONFIG ----
const float LOOP_TIME_SEC = 18 * 60.0;   // 18 minutes
const int NUM_TRAINS = 5;

// Station positions (0.0 - 1.0)
const float STATIONS[] = {
  0.00,  // Main Street
  0.35,  // New Orleans
  0.50,  // Toontown
  0.7    // Tomorrowland
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

// ---- SETUP ----
void setup() {
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(80);

  // Even spacing of trains
  for (int i = 0; i < NUM_TRAINS; i++) {
    trains[i].position = (float)i / NUM_TRAINS;
    trains[i].name = TRAIN_NAMES[i];
  }

  lastUpdate = millis();
}

// ---- UPDATE LOGIC ----
void updateTrains() {
  unsigned long now = millis();
  float deltaSec = (now - lastUpdate) / 1000.0;

  float speed = 1.0 / LOOP_TIME_SEC;

  for (int i = 0; i < NUM_TRAINS; i++) {
    trains[i].position += deltaSec * speed;

    if (trains[i].position >= 1.0) {
      trains[i].position -= 1.0;
    }
  }

  lastUpdate = now;
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

  for (int i = 1; i < trainLength; i++) {
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
    int idx = (int)(STATIONS[s] * NUM_LEDS);
    leds[idx] = CRGB(40, 40, 40);
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