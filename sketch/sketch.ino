#include <ESP8266WiFi.h>
#include <ArduinoOTA.h>
#include <WiFiUdp.h>
#include <FastLED.h>
#define SYNCHROTRON_PORT 2077

// Configuration:
// Define the number of leds and pin for each strip
// To add / remove strips also change the the addLeds calls in setup()
#define STRIP1_LENGTH 54
#define STRIP1_PIN 4
#define STRIP2_LENGTH 38
#define STRIP2_PIN 1
#define TOTAL_LENGTH STRIP1_LENGTH + STRIP2_LENGTH // total number of leds

const char *ssid = "**********"; // wifi ssid
const char *pass = "**********";         // wifi password
const char *name = "superFunLight";        // this is the unique name of the light set in the server config

WiFiUDP udp;
uint8_t packet[512];
CRGB leds[TOTAL_LENGTH];
unsigned long elapsed = 0;

void flash(uint8_t hue, uint8_t sat, uint8_t maxbri, unsigned int length)
{
    uint8_t i = 0;
    while (i < maxbri)
    {
        for (int j = 0; j < length; j++)
            leds[j] = CHSV(hue, sat, i);
        FastLED.show();
        delay(2);
        i++;
    }
    while (i > 0)
    {
        for (int j = 0; j < length; j++)
            leds[j] = CHSV(hue, sat, i);
        FastLED.show();
        delay(2);
        i--;
    }
}

void setup()
{
    FastLED.addLeds<NEOPIXEL, STRIP1_PIN>(leds, 0, STRIP1_LENGTH);
    FastLED.addLeds<NEOPIXEL, STRIP2_PIN>(leds, STRIP1_LENGTH, STRIP2_LENGTH);
    // Add more strips here
    FastLED.clear();

    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED)
        flash(139, 205, 255, 1);

    ArduinoOTA.setHostname(name);
    ArduinoOTA.onStart([]() {
        FastLED.clear();
    });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        double bar = ((double)progress / (double)total) * TOTAL_LENGTH;
        double complete, last;
        last = modf(bar, &complete);
        int i = 0;
        while (i < complete)
        {
            leds[i] = CHSV(139, 205, 100);
            i++;
        }
        leds[i] = CHSV(139, 205, int(last * 100));
        FastLED.show();
    });
    ArduinoOTA.onEnd([]() {
        flash(139, 205, 150, TOTAL_LENGTH);
    });
    ArduinoOTA.onError([](ota_error_t error) {
        flash(0, 255, 150, TOTAL_LENGTH);
    });
    ArduinoOTA.begin();

    broadcast();
    udp.begin(SYNCHROTRON_PORT);
}

void loop()
{
    ArduinoOTA.handle();
    if (millis() - elapsed > 5 * 60 * 1000)
    {
        broadcast();
        elapsed = millis();
    }

    int packetSize = udp.parsePacket();
    if (packetSize)
        handlePacket();
    delay(10);
}

void broadcast()
{
    IPAddress broadcastAddress = WiFi.gatewayIP();
    broadcastAddress[3] = 255;
    udp.beginPacket(broadcastAddress, SYNCHROTRON_PORT);
    udp.write(name);
    udp.endPacket();
}

void handlePacket()
{
    int len = udp.read(packet, 511);
    for (uint8_t i = 0; i < TOTAL_LENGTH; i++)
    {
        leds[i].r = packet[i * 3 + 0];
        leds[i].g = packet[i * 3 + 1];
        leds[i].b = packet[i * 3 + 2];
    }
    FastLED.show();
}
