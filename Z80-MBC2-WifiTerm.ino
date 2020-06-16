/**
 * Z80MBC2WifiTerm 
 * 
 * (C) Danny Arnold 2020
 * Portions of this code are 
 * Copyright (c) 2020 bricoleau
 * Copyright (c) 2017-2019, The xterm.js authors (MIT License)
 * Copyright (c) 2014-2017, SourceLair, Private Company (www.sourcelair.com) (MIT License)
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * 
 * License MIT
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * 
 * */

#include <ESP8266WiFi.h>
#include "private.h"
#include "WiFiTerm.h"

ESP8266WebServer server(80);

uint8_t timeout_ms = 1;
String buf = "";
int loc = 0;
bool delsup = false;
void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(D0, OUTPUT);
  pinMode(D1, OUTPUT);
  digitalWrite(D0, HIGH);
  digitalWrite(D1, LOW);
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

    if (buf == "+++ATH0" ){
        reset();
        buf = "";
      }
    else if (buf == "+++ATH1"){
        setUser(false);
        buf = "";
    }
    else if (buf == "+++ATH2"){
        setUser(true);
        buf = "";
    }else Serial.print(buf);
    
  }
  size_t qty = WIFITERM_TX_BUF_SIZE;
  while (Serial.available() && qty--)
  {
    char c = Serial.read();
    term.print(c);
    if (!Serial.available()){
      delay(timeout_ms); //wait for next char
    }
  }
}
void reset(){
  digitalWrite(D0, LOW);
  delay(50);
  digitalWrite(D0, HIGH);   
}
void setUser(bool usr){
  if (usr) digitalWrite(D1, HIGH);
  else digitalWrite(D1, LOW);
}