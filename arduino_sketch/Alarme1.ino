/*
 Name:    Alarme.ino
 Created: 8/27/2015 11:03:19 PM
 Author:  Luiz
*/

//Server Info
#define HOST "SERVER IP OR DNS"
#define PORT 3001 //OR ANOTHER PORT 

// APN data
#define APN       "your APN here" // replace your GPRS APN
#define LOGIN     "your APN login"    // replace with your GPRS login
#define PASSWORD  "your APN password" // replace with your GPRS password

//LIBRARIES
#include <SoftwareSerial.h>
#include <SIM900.h>
#include "inetGSM.h"

//Global variables
boolean started = false;
InetGSM inet;
char eventoStatus = '0';

//SIM900 IMEI
char IMEI[16] = "000000000000000"; //GSM IMEI NUMBER

//Global Constants
const int led = 12;
const int button = 4;

void setup()
{
  //Serial connection.
  Serial.begin(9600);
  Serial.println("GSM Shield testing.");

  pinMode(button, INPUT);
  pinMode(led, OUTPUT);

  if (gsm.begin(9600)) {
    Serial.println("\nstatus=READY");
    if (inet.attachGPRS(APN, LOGIN, PASSWORD)) {
      Serial.println("status=ATTACHED");
      if (inet.connectTCP(HOST, PORT)) {
        started = true;
      }
    } else {
      Serial.println("status=ERROR");
    }
  }
}

void loop()
{
  if (started) {
    disparaAlarme();
    IMEI[15] = eventoStatus;
    submit(IMEI);
  }
};

void submit(char* message)
{
  gsm.SimpleWriteln("AT+CIPSEND=16");
  delay(500);
  gsm.SimpleWriteln(message);
  gsm.SimpleWriteln((char)26);
  char state;
  int i = 0;
  for (i = 0; i < 15; i++) {
    state = (char)gsm.read();
    if ((state == '1') || (state == '2')) {
      break;
    }
  }
  acendeLed(state);
}

void disparaAlarme()
{
  int stateButton = digitalRead(button);
  if (stateButton == HIGH) {
    eventoStatus = '1';
  } else {
    eventoStatus = '0';
  }
}

void acendeLed(char state) {
  switch (state) {
    case '1': {
        Serial.println("Alarme Ativado");
        digitalWrite(led, HIGH);
        break;
      }
    case '2': {
        Serial.println("Alarme Desativado");
        digitalWrite(led, LOW);
        break;
      }
  }
}

