//Gateway Serial <-> WiFiTerm
//with embedded baudrate selector#

/*
 *  Todo :
 *  
 *  reset button
 *  user button
 *  VT100 support -
 *  editor control ( cursor, delete, back space, ansi escape sequences, insert, home, end, zoom + - , colour text) 
 *  status line ( term cap? )
 *  
 */

#include <ESP8266WiFi.h>
#include "private.h"
#include "WiFiTerm.h"

ESP8266WebServer server(80);

const uint32_t baud_rates[] = {
  300,
  1200,
  2400,
  4800,
  9600,
  19200,
  38400,
  57600,
  74880,
  115200,
  230400
};
const uint8_t nb_baud_rates = sizeof(baud_rates) / sizeof(uint32_t);

uint8_t  baud_rate_selection = 0;
uint32_t baud_rate = 0;
uint8_t timeout_ms = 1;
String buf = "";
int loc = 0;
bool delsup = false;
void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(D0, OUTPUT);
  digitalWrite(D0, HIGH);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(250);
    digitalWrite(LED_BUILTIN, LOW);
    delay(250);
    digitalWrite(LED_BUILTIN, HIGH);
  }

  server.begin();
  term.begin(server);
  Serial.begin(115200);
  term.print("Z80-MBC2 Connected..");
  term.println();
  reset();
}

void loop()
{
  server.handleClient();
  term.handleClient();
  if (term.available())
  {
    buf = term.readString();
    if(buf == "+++ATH0") reset();
    
    Serial.print(buf); 
  }
  size_t qty = WIFITERM_TX_BUF_SIZE;
  while (Serial.available() && qty--)
  {
    char c = Serial.read();
    int code = int(c);
    term.print(c);
    if (!Serial.available()){
      delay(timeout_ms); //wait for next char
    }
  }
}
void reset(){
  digitalWrite(D0, LOW);
  delay(2250);
  digitalWrite(D0, HIGH);   
}
