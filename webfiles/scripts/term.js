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

let DEBUG = false;
var term = new Terminal();
var ws;
var ESP_ip;
let fscreen = false;
let connected = false;
let isCtl = false;
let currow = 0;
function wsInit() {

    ws = new WebSocket("ws://" + ESP_ip + ":81");
    ws.onopen = function (event) {
        connected = true;
        resetOutput();
        online();
    }
    ws.onmessage = function (event) {
        if (typeof(event.data) == "string") {
            receiveTxt(event.data);
        } else { 
            receivePong();
        }
    }
    ws.onclose = function (event) {
        connected = false;
        offline();
        setTimeout(wsInit, 1000);
    }
}
let waitingForPong = 0;
function receivePong() {
    waitingForPong = 0;
    online();
}
function handlePingPong() {
    if (connected) {
        if (waitingForPong++ > 2) {
            offline();
        }
        ws.send("");
    }
    setTimeout(handlePingPong, 1000);
}
let isOnline = false;
function toggleImmediate(){
    if (document.fullscreenElement) { 
        document.exitFullscreen();
        document.getElementById("header").style.display= "block";
        document.getElementById("status").innerHTML="Immediate Mode"; 
        document.querySelectorAll(".line-buttons").forEach(a=>a.style.display = "none");
        resize();
        focusInput();
        fscreen = false; 
      } else { 
        document.documentElement.requestFullscreen();
        document.getElementById("header").style.display= "none";
        document.getElementById("terminal").style.display= "block";
        document.getElementById("status").innerHTML="Line Mode";
        document.querySelectorAll(".line-buttons").forEach(a=>a.style.display = "block");
        resize(); 
        fscreen = true;
      } 
}
function online() {
    if (!isOnline) {
        isOnline = true;
        document.title="Z80-MBC2: Online";
        document.getElementById("overlay").style.display ="none";
        document.getElementById("status").innerHTML="Online";
    }
} 
function offline() {
    if (isOnline) {
        isOnline = false;
        document.title="Z80-MBC2: Offline";
        document.getElementById("overlay").style.display ="block";
        document.getElementById("status").innerHTML="Offline";
    }
} 
function focusInput(){
    document.getElementById("terminal").focus();
}
function ctrlkey(key){
        if (key.length > 1) return null;
        eval("esc = \"\\x" + (key.toUpperCase().charCodeAt(0) -64).toString(16).padStart(2, '0')+"\"");
        return esc;
} 
function inputButtonSetup() {
    document.getElementById("terminal").addEventListener("focusout", function(event) {
        if (!fscreen){
            event.preventDefault(); 
            focusInput();
        }   
     });
    document.getElementById("termbody").addEventListener("keydown", function(event) {
        
        if(event.ctrlKey){ 
            event.preventDefault(); 
            event.stopPropagation();
            if(event.key !="Control"){ 
                
                ws.send(ctrlkey(event.key));
            }
        }
        else {
                if(fscreen){
                    if (event.key == "Enter"){
                        ws.send(document.getElementById("txtIn").value+"\r");
                        document.getElementById("txtIn").value = "";
                    }
                }
                else{
                      
                    sendKey(event.key);                   
                }
        }
     });
     document.getElementById("escape").addEventListener("click", function(event) {
        event.preventDefault();
        sendKey("Escape");
        focusInput();
     });
     document.getElementById("tab").addEventListener("click", function(event) {
        event.preventDefault();
        sendKey("Tab");
        focusInput();
     }); 
     document.getElementById("ctrl").addEventListener("click", function(event) {
        event.preventDefault();
        ws.send(ctrlkey(document.getElementById("txtIn").value[0]));
        document.getElementById("txtIn").value="";
        focusInput();
     });
     document.getElementById("about").addEventListener("click", function(event) {
        event.preventDefault();
        alert("Z80-MBC Web Terminal V1.0 \nhttps://github/DADcom/Z80MBC2WifiTerm \n(C) Danny Arnold 2020 \nabout.me/dannyarnoldcom \nmashup of xterm.js and WifiTerm \nhttps://github.com/xtermjs/xterm.js \nhttps://github.com/bricoleau/WiFiTerm under MIT licence")
        focusInput();
     });
     document.getElementById("terminal").addEventListener("click", function(event) {
        if (fscreen){
            toggleImmediate();
            event.preventDefault(); 
            focusInput();
        }   
     });
     document.getElementById("reset").addEventListener("click", function(event) {
        event.preventDefault();
        ws.send("+++ATH0");
        focusInput();
     });
     document.getElementById("user").addEventListener("click", function(event) {
        event.preventDefault();
        alert("TBA User");
        focusInput();
     });
     document.getElementById("input").addEventListener("click", function(event) {
        event.preventDefault();
        
        if(!fscreen){
            toggleImmediate(); 
        }
        document.getElementById("txtIn").focus();
     });
}
function getESPlocation() {
    var loc = location.host;
    if (loc == "") loc = prompt("Enter ESP ip address","192.168.1.80");
    return loc;
}
function resetOutput() {
   term.clear();
}
function receiveTxt(txt) {
let line ="";
if(DEBUG){
        let logline = "";
        let logchas = "";
            for (x=0;x < txt.length; x++){
                logline += (x % 15 == 0) ? "\t" + logchas + "\n" : "";
                if (x % 15 == 0) logchas = "";
                switch(txt[x]){           
                    case '\n' :
                    case '\r' :
                    default: 
                        line += txt[x];
                        logchas += (txt.charCodeAt(x) > 32 && txt.charCodeAt(x) <= 128) ? txt[x] : ".";     
                }
                logline += txt.charCodeAt(x).toString(16).padStart(2, '0').toUpperCase()+ " ";
            }
            console.log(logline + "\t" + logchas);
}
    term.write(txt);
}

function sendKey(key) {
    if (DEBUG) console.log(key);
    if (isOnline) {
        switch (key){
            case "Escape" :
                ws.send("\x1B");
                break;
            case "ArrowLeft" :
                ws.send("\x1B");
                break;
            case "ArrowRight" :
                ws.send("\x1B");
                break;
            case "Backspace" :
                ws.send("\b");
                break;
            case "Tab" :
                ws.send("\t");
                break;
            case "Enter" :
                ws.send("\r");
                break;
            default :
                if (key.length > 1) break;
                ws.send(key);
        }  
    }
}
function resize() {
    var inputHeight =0;
    var terminalHeight=document.getElementById("terminal").clientHeight;
    var headerHeight=document.getElementById("header").clientHeight;
}
window.onresize = resize;

function setup() {
    term.setOption("cursorStyle","underline");
    term.attachCustomKeyEventHandler(function (event){
        return false;
    });
    term.open(document.getElementById('terminal'));
    term.clear();
    ESP_ip = getESPlocation();
    inputButtonSetup();
    wsInit();
    resize();
    handlePingPong();   
}
window.addEventListener("DOMContentLoaded", (event) => {setup();});
