#include <WiFi.h>
#include <HTTPClient.h>         // Library untuk koneksi HTTP
#include <ArduinoJson.h>        // Library untuk memformat data JSON
#include <Wire.h>
#include <LiquidCrystal_I2C.h>  // Library untuk LCD I2C
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>               // Library untuk Waktu (NTP)

// --- KONFIGURASI PENGGUNA ---
const char* ssid = "SensorTanah";
const char* password = "12345678";

// URL Firebase Anda
String firebaseLatestUrl = "https://pti-soil-tracker-default-rtdb.asia-southeast1.firebasedatabase.app/sensors/latest.json"; 

// --- KONFIGURASI WAKTU (NTP) ---
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 25200;  // GMT+7 (WIB)
const int   daylightOffset_sec = 0;

// --- KONFIGURASI PIN ---
const int soilPin = 32; // Pin ADC untuk sensor Kelembapan Tanah
const int phPin = 34;   // Pin ADC untuk sensor pH
const int oneWirePin = 13; // Pin untuk DS18B20

// --- KONFIGURASI SENSOR ---
OneWire wiring(oneWirePin);
DallasTemperature sensor(&wiring);
LiquidCrystal_I2C lcd(0x27, 16, 2); 

// --- KALIBRASI SENSOR (HASIL UKUR FISIK) ---
const int NILAI_KERING = 4095; 
const int NILAI_BASAH = 1800;   

// --- HASIL KALIBRASI PH 3 TITIK (DATA REAL) ---
// Sifat Sensor: INVERSE (Makin Asam = Makin Tinggi ADC)
// pH 4.01 (Asam)   = ADC 1700
// pH 6.86 (Netral) = ADC 1380
// pH 9.18 (Basa)   = ADC 830
const int ADC_PH_NETRAL = 1380; // pH 6.86
const int ADC_PH_ASAM   = 1700; // pH 4.01
const int ADC_PH_BASA   = 930;  // pH 9.18
// ------------------------------------

HTTPClient http;
unsigned long intervalBacaSensor = 2000;
unsigned long waktuBacaTerakhir = 0;

void kirimDataLatest(String jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return;
  http.begin(firebaseLatestUrl);
  http.addHeader("Content-Type", "application/json");
  http.PUT(jsonPayload);
  http.end();
}

void setup() {
  Serial.begin(115200);
  sensor.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); 
  lcd.print("PTI Soil Tracker");
  lcd.setCursor(0, 1);
  lcd.print("Menghubungkan...");
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  // Sinkronisasi Waktu
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    Serial.println("Waktu tersinkronisasi!");
  }
  lcd.clear();
}

void loop() {
  unsigned long waktuSekarang = millis();

  if (waktuSekarang - waktuBacaTerakhir >= intervalBacaSensor) {
    waktuBacaTerakhir = waktuSekarang;

    // 1. Baca Suhu
    sensor.requestTemperatures();
    float data_suhu = sensor.getTempCByIndex(0);

    // 2. Baca Kelembapan
    int nilaiSensorLembab = analogRead(soilPin);
    int persentaseLembab = map(nilaiSensorLembab, NILAI_KERING, NILAI_BASAH, 0, 100);
    persentaseLembab = constrain(persentaseLembab, 0, 100);

    // 3. Baca pH (Metode 3 Titik - INVERSE LOGIC)
    int nilaiSensorPH = analogRead(phPin);
    float nilaiPH;

    // Logika: Karena pH 4 (1700) > pH 7 (1380), maka jika ADC > 1380 berarti ASAM
    if (nilaiSensorPH > ADC_PH_NETRAL) {
        // --- RENTANG ASAM (ADC 1380 s/d 1700) ---
        // Kita hitung posisi nilaiSensorPH di antara titik Netral dan Asam
        // Rumus Interpolasi Linear:
        // pH = pH1 + (ADC - ADC1) * (pH2 - pH1) / (ADC2 - ADC1)
        float slope = (4.01 - 6.86) / (float)(ADC_PH_ASAM - ADC_PH_NETRAL);
        nilaiPH = 6.86 + ( (float)(nilaiSensorPH - ADC_PH_NETRAL) * slope );
        
        Serial.print("Mode: ASAM (ADC "); Serial.print(nilaiSensorPH);
    } else {
        // --- RENTANG BASA (ADC 1380 s/d 830) ---
        // ADC lebih kecil dari Netral, berarti BASA
        float slope = (9.18 - 6.86) / (float)(ADC_PH_BASA - ADC_PH_NETRAL);
        nilaiPH = 6.86 + ( (float)(nilaiSensorPH - ADC_PH_NETRAL) * slope );
        
        Serial.print("Mode: BASA (ADC "); Serial.print(nilaiSensorPH);
    }
    Serial.print(") -> pH: "); Serial.println(nilaiPH);

    nilaiPH = constrain(nilaiPH, 0.0, 14.0);

    // 4. Cek Error Suhu
    if (data_suhu == -127.00 || data_suhu == 85.00) {
      data_suhu = 0.0;
      Serial.println("Error Sensor Suhu!");
    }

    // 5. Tampilkan LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("T:"); lcd.print(data_suhu, 1); lcd.print("C ");
    lcd.print("pH:"); lcd.print(nilaiPH, 1);
    lcd.setCursor(0, 1);
    lcd.print("Lembab:"); lcd.print(persentaseLembab); lcd.print("%");

    // 6. Format Waktu
    struct tm timeinfo;
    char timestampBuffer[20];
    if(!getLocalTime(&timeinfo)){
        strcpy(timestampBuffer, "00/00/0000 00:00:00");
    } else {
        strftime(timestampBuffer, sizeof(timestampBuffer), "%d/%m/%Y %H:%M:%S", &timeinfo);
    }

    // 7. Kirim ke Firebase
    StaticJsonDocument<256> doc;
    doc["kelembaban"] = persentaseLembab;
    doc["ph"] = nilaiPH;
    doc["suhu"] = data_suhu;
    doc["timestamp"] = timestampBuffer;

    String jsonBuffer;
    serializeJson(doc, jsonBuffer);
    kirimDataLatest(jsonBuffer);
    
    Serial.println("Data Terkirim: " + jsonBuffer);
  }
}