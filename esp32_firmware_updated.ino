/*
 * ESP32 WiFi Configuration via Classic Bluetooth
 * 
 * Updated firmware to work with Keiros Service App
 * 
 * Hardware: ESP32 development board
 * 
 * Features:
 * - Classic Bluetooth Serial communication
 * - WiFi configuration via Bluetooth commands
 * - GPS data logging and Firebase upload
 * - Flash storage for offline data
 * - Device status and flash read commands
 * 
 * Author: Keiros Service Team
 * Version: 2.0.0
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <LoRa.h>
#include <SPI.h>
#include <SPIMemory.h>
#include <BluetoothSerial.h>

// ========== WiFi Credentials (will be updated via Bluetooth) ==========
String WIFI_SSID = "XXX 2.4G";
String WIFI_PASSWORD = "$teven@29";

// ========== Firebase ==========
#define DATABASE_URL    "https://device-f7a4c-default-rtdb.firebaseio.com/"
#define DATABASE_SECRET "6JgFCSzix7HrqlSVZPrrX6gYr8WG2cvHm9fLeKMx"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ========== GPS ==========
TinyGPSPlus gps;
HardwareSerial SerialGPS(1);  // UART1 (RX=16, TX=17)

// ========== LoRa Pins ==========
#define LORA_SCK   18
#define LORA_MISO  19
#define LORA_MOSI  23
#define LORA_CS    5
#define LORA_RST   27
#define LORA_DIO0  14

// ========== Flash CS ==========
#define FLASH_CS   4
SPIFlash flash(FLASH_CS);

// ========== Bluetooth ==========
BluetoothSerial SerialBT;   // Bluetooth object

// ========== Device Info ==========
String deviceID = "ESP1";
String macAddress = "";

// ========== Timers ==========
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 2000;
unsigned long lastFlashWrite = 0;
const unsigned long flashInterval = 10000;

// ========== Flash Buffers ==========
uint32_t flashAddr = 0;
String   flashBuffer = "";
String   flashStatus = "NOT_READY";

// ========== WiFi Configuration ==========
bool wifiConfigured = false;
unsigned long lastWifiAttempt = 0;
const unsigned long wifiRetryInterval = 30000; // 30 seconds

// ========== Helpers ==========
static String twoDigits(uint8_t v) {
  if (v < 10) return "0" + String(v);
  return String(v);
}

void connectToWiFi() {
  if (WIFI_SSID.length() > 0 && WIFI_PASSWORD.length() >= 8) {
    Serial.println("Connecting to WiFi: " + WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
    
    unsigned long t0 = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - t0) < 20000) {
      delay(500);
      Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println(" WiFi Connected!");
      wifiConfigured = true;
      macAddress = WiFi.macAddress();
    } else {
      Serial.println(" WiFi Connection Failed!");
      wifiConfigured = false;
    }
  }
}

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);
  Serial.println("\n=== ESP32 GPS + LoRa + Firebase + Flash + Bluetooth ===");

  // ---------- Initial WiFi Connection ----------
  connectToWiFi();

  // ---------- Firebase ----------
  if (wifiConfigured) {
    config.database_url = DATABASE_URL;
    config.signer.tokens.legacy_token = DATABASE_SECRET;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    Serial.println("Firebase initialized");
  } else {
    Serial.println("Firebase not initialized - WiFi not connected");
  }

  // ---------- LoRa ----------
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI);
  LoRa.setPins(LORA_CS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa initialization failed! Check wiring.");
    while (1) { delay(1000); }
  } else {
    Serial.println("LoRa initialized");
  }

  // ---------- Flash ----------
  if (flash.begin()) {
    Serial.println("Flash initialized");
    flashStatus = "READY";
  } else {
    Serial.println("Flash init failed! Check wiring and CS pin.");
    flashStatus = "ERROR";
  }

  // ---------- Bluetooth ----------
  if (!SerialBT.begin("ESP32_GPS_BT")) {  // Device name
    Serial.println("Bluetooth init failed");
  } else {
    Serial.println("Bluetooth ready. Pair device name: ESP32_GPS_BT");
    Serial.println("Available commands: STATUS, FLASH_READ, WIFI_CONFIG:ssid:password");
  }
}

void loop() {
  // ========== GPS Reading ==========
  while (SerialGPS.available() > 0) {
    if (gps.encode(SerialGPS.read())) {
      if (gps.location.isUpdated()) {
        if (millis() - lastUpdate > updateInterval) {
          lastUpdate = millis();

          double lat = gps.location.lat();
          double lng = gps.location.lng();
          double alt = gps.altitude.meters();
          double course = gps.course.deg();

          // Build timestamp (UTC from GPS)
          String timeStamp =
            String(gps.date.year()) + "-" +
            twoDigits(gps.date.month()) + "-" +
            twoDigits(gps.date.day()) + " " +
            twoDigits(gps.time.hour()) + ":" +
            twoDigits(gps.time.minute()) + ":" +
            twoDigits(gps.time.second());

          // ---- Debug & Bluetooth Output ----
          String msg = String("GPS Update\n") +
                       "Lat: " + String(lat, 6) + "\n" +
                       "Lng: " + String(lng, 6) + "\n" +
                       "Alt: " + String(alt) + " m\n" +
                       "Dir: " + String(course) + " deg\n" +
                       "Time: " + timeStamp + "\n" +
                       "Flash: " + flashStatus + "\n";
          Serial.println(msg);

          if (SerialBT.hasClient()) {
            SerialBT.println(msg);
          }

          // ---- Firebase JSON (only if WiFi connected) ----
          if (wifiConfigured && WiFi.status() == WL_CONNECTED) {
            FirebaseJson json;
            json.set("device_id", deviceID);
            json.set("mac_id", macAddress);
            json.set("timestamp", timeStamp);
            json.set("latitude", lat);
            json.set("longitude", lng);
            json.set("altitude", alt);
            json.set("direction_deg", course);
            json.set("flash_status", flashStatus);

            String livePath = "/gps_live/" + deviceID;
            if (Firebase.setJSON(fbdo, livePath.c_str(), json)) {
              Serial.println("Live GPS updated");
            } else {
              Serial.println("Live update failed: " + fbdo.errorReason());
            }

            String storagePath = "/gps_storage/" + deviceID;
            if (Firebase.pushJSON(fbdo, storagePath.c_str(), json)) {
              Serial.println("Stored GPS data");
            } else {
              Serial.println("Store failed: " + fbdo.errorReason());
            }
          } else {
            Serial.println("WiFi not connected; skipping Firebase push");
          }

          // ---- Buffer to Flash ----
          flashBuffer += timeStamp + "," + String(lat, 6) + "," + String(lng, 6) + "," +
                         String(alt) + "," + String(course) + "\n";
        }
      }
    }
  }

  // ========== Flash Write ==========
  if ((millis() - lastFlashWrite > flashInterval) && (flashBuffer.length() > 0)) {
    lastFlashWrite = millis();
    const int len = flashBuffer.length() + 1;
    char *data = new (std::nothrow) char[len];
    if (data) {
      flashBuffer.toCharArray(data, len);
      if (flash.writeCharArray(flashAddr, data, len)) {
        Serial.println("Data batch written to Flash");
        flashAddr += len;
        flashBuffer = "";
        flashStatus = "READY";
      } else {
        Serial.println("Flash write failed");
        flashStatus = "ERROR";
      }
      delete[] data;
    } else {
      Serial.println("Allocation failed for flash write buffer");
    }
  }

  // ========== Bluetooth Commands ==========
  if (SerialBT.available()) {
    String command = SerialBT.readStringUntil('\n');
    command.trim();
    Serial.println("BT Command: " + command);

    if (command.equalsIgnoreCase("STATUS")) {
      String status = "Device ID: " + deviceID + "\n" +
                      "MAC: " + macAddress + "\n" +
                      "WiFi SSID: " + WIFI_SSID + "\n" +
                      "WiFi: " + String((WiFi.status() == WL_CONNECTED) ? "Connected" : "Disconnected") + "\n" +
                      "Flash: " + flashStatus + "\n" +
                      "GPS: " + String(gps.location.isValid() ? "Valid" : "Invalid") + "\n";
      SerialBT.println(status);
    }
    else if (command.equalsIgnoreCase("FLASH_READ")) {
      SerialBT.println("Reading first 200 bytes of Flash:");
      char buf[201];
      memset(buf, 0, sizeof(buf));
      flash.readCharArray(0, buf, 200);
      buf[200] = '\0';
      SerialBT.println(buf);
    }
    else if (command.startsWith("WIFI_CONFIG:")) {
      // Parse WiFi configuration command
      int firstColon = command.indexOf(':');
      int secondColon = command.indexOf(':', firstColon + 1);
      
      if (firstColon != -1 && secondColon != -1) {
        String newSSID = command.substring(firstColon + 1, secondColon);
        String newPassword = command.substring(secondColon + 1);
        
        if (newSSID.length() > 0 && newPassword.length() >= 8) {
          WIFI_SSID = newSSID;
          WIFI_PASSWORD = newPassword;
          
          SerialBT.println("WiFi credentials updated. Reconnecting...");
          Serial.println("New WiFi SSID: " + WIFI_SSID);
          
          // Disconnect current WiFi and reconnect with new credentials
          WiFi.disconnect();
          delay(1000);
          connectToWiFi();
          
          if (wifiConfigured) {
            SerialBT.println("WiFi reconnected successfully!");
            
            // Reinitialize Firebase if needed
            if (!Firebase.ready()) {
              config.database_url = DATABASE_URL;
              config.signer.tokens.legacy_token = DATABASE_SECRET;
              Firebase.begin(&config, &auth);
              Firebase.reconnectWiFi(true);
              SerialBT.println("Firebase reinitialized");
            }
          } else {
            SerialBT.println("WiFi reconnection failed!");
          }
        } else {
          SerialBT.println("Invalid WiFi credentials. SSID must be non-empty and password must be at least 8 characters.");
        }
      } else {
        SerialBT.println("Invalid WIFI_CONFIG format. Use: WIFI_CONFIG:ssid:password");
      }
    }
    else {
      SerialBT.println("Unknown Command. Available commands:");
      SerialBT.println("STATUS - Get device status");
      SerialBT.println("FLASH_READ - Read flash data");
      SerialBT.println("WIFI_CONFIG:ssid:password - Configure WiFi");
    }
  }

  // ========== WiFi Reconnection Attempt ==========
  if (!wifiConfigured && (millis() - lastWifiAttempt > wifiRetryInterval)) {
    lastWifiAttempt = millis();
    Serial.println("Attempting WiFi reconnection...");
    connectToWiFi();
  }
}
