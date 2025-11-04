/*
 * ESP32 WiFi Configuration via BLE
 * 
 * This firmware example demonstrates how to receive WiFi credentials
 * through Bluetooth Low Energy and connect to the specified network.
 * 
 * Hardware: ESP32 development board
 * 
 * Features:
 * - BLE advertising for device discovery
 * - WiFi configuration service
 * - Automatic WiFi connection after configuration
 * - Status LED indicators
 * 
 * Author: Keiros Service Team
 * Version: 1.0.0
 */

#include <WiFi.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

// BLE Service and Characteristic UUIDs
#define SERVICE_UUID        "4FAFC201-1FB5-459E-8FCC-C5C9C331914B"
#define CHARACTERISTIC_UUID "BEB5483E-36E1-4688-B7F5-EA07361B26A8"

// Device configuration
#define DEVICE_NAME "Keiros-ESP32"
#define LED_PIN 2  // Built-in LED pin

// Global variables
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
String receivedData = "";
bool wifiConfigured = false;

// LED status indicators
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

// BLE Server Callbacks
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
      blinkLED(2, 200); // Double blink on connect
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected");
      blinkLED(1, 500); // Single blink on disconnect
    }
};

// BLE Characteristic Callbacks
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();
      
      if (rxValue.length() > 0) {
        Serial.println("Received data:");
        for (int i = 0; i < rxValue.length(); i++) {
          Serial.print(rxValue[i]);
          receivedData += rxValue[i];
        }
        Serial.println();
        
        // Try to parse JSON when we have complete data
        if (receivedData.indexOf('}') != -1) {
          processWiFiConfig();
        }
      }
    }
};

void processWiFiConfig() {
  Serial.println("Processing WiFi configuration...");
  
  // Decode base64 data
  String decodedData = base64Decode(receivedData);
  Serial.println("Decoded data: " + decodedData);
  
  // Parse JSON
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, decodedData);
  
  if (error) {
    Serial.println("JSON parsing failed: " + String(error.c_str()));
    receivedData = "";
    return;
  }
  
  String ssid = doc["ssid"];
  String password = doc["password"];
  
  if (ssid.length() > 0 && password.length() >= 8) {
    Serial.println("Connecting to WiFi: " + ssid);
    WiFi.begin(ssid.c_str(), password.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
      blinkLED(1, 100); // Blink while connecting
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.println("WiFi connected successfully!");
      Serial.println("IP address: " + WiFi.localIP().toString());
      wifiConfigured = true;
      blinkLED(5, 200); // Success pattern
    } else {
      Serial.println();
      Serial.println("WiFi connection failed!");
      blinkLED(10, 100); // Error pattern
    }
  } else {
    Serial.println("Invalid WiFi credentials");
  }
  
  receivedData = "";
}

// Simple base64 decoder
String base64Decode(String input) {
  String output = "";
  int inputLen = input.length();
  
  for (int i = 0; i < inputLen; i += 4) {
    int a = base64CharToInt(input.charAt(i));
    int b = base64CharToInt(input.charAt(i + 1));
    int c = base64CharToInt(input.charAt(i + 2));
    int d = base64CharToInt(input.charAt(i + 3));
    
    int combined = (a << 18) | (b << 12) | (c << 6) | d;
    
    output += char((combined >> 16) & 0xFF);
    if (c != 64) output += char((combined >> 8) & 0xFF);
    if (d != 64) output += char(combined & 0xFF);
  }
  
  return output;
}

int base64CharToInt(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= 'a' && c <= 'z') return c - 'a' + 26;
  if (c >= '0' && c <= '9') return c - '0' + 52;
  if (c == '+') return 62;
  if (c == '/') return 63;
  if (c == '=') return 64;
  return 0;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Keiros ESP32 WiFi Configuration Service");
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize BLE
  BLEDevice::init(DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE
                    );

  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue("ESP32 WiFi Config Ready");

  pService->start();
  
  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE service started. Device is discoverable.");
  Serial.println("Device name: " + String(DEVICE_NAME));
  Serial.println("Service UUID: " + String(SERVICE_UUID));
  Serial.println("Characteristic UUID: " + String(CHARACTERISTIC_UUID));
  
  // Initial LED pattern
  blinkLED(3, 300);
}

void loop() {
  // Handle BLE disconnection
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // Restart advertising
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
  }
  
  // Handle BLE connection
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  // Status LED based on connection state
  if (deviceConnected) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  
  // Print WiFi status every 30 seconds
  static unsigned long lastStatusPrint = 0;
  if (millis() - lastStatusPrint > 30000) {
    if (wifiConfigured && WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi Status: Connected to " + WiFi.SSID());
      Serial.println("IP Address: " + WiFi.localIP().toString());
    } else {
      Serial.println("WiFi Status: Not connected");
    }
    lastStatusPrint = millis();
  }
  
  delay(100);
}
