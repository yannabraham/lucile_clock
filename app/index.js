import * as util from "../common/utils";
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import userActivity from "user-activity";
import { battery } from "power";

// Update the clock every second
clock.granularity = "seconds";

// Get a handle on <text> elements
const myClock = document.getElementById("myClock");
const myDate = document.getElementById("myDate");
const hrLabel = document.getElementById("hrLabel");
const stepsHandle = document.getElementById("stepsLabel");
const myBattery = document.getElementById("myBatteryLabel");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
    hours = util.zeroPad(hours);
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myClock.text = `${hours}:${mins}`;
  
  // show date
  let day = today.getDate();
  let month = today.getMonth();
  day = util.zeroPad(day);
  month = util.zeroPad(month+1);
  myDate.text= `${day}/${month}`;
  
  // Activity Values: adjusted type
  let stepsValue = (userActivity.today.adjusted["steps"] || 0);
  //let stepsValue = 99999; // for testing field length
  stepsHandle.text = stepsValue;
  
  // Display battery level
  myBattery.text = battery.chargeLevel + "%";
  if(battery.chargeLevel<=20) {
    myBattery.style.fill = "red";
  } else {
    myBattery.style.fill = "black";
  }
}

// Create a new instance of the HeartRateSensor object
let hrm = new HeartRateSensor();

// Declare an event handler that will be called every time a new HR value is received.
hrm.onreading = function() {
  // Peek the current sensor values
  // console.log("Current heart rate: " + hrm.heartRate);
  hrLabel.text = hrm.heartRate;
}

// Create a new instance of the BodyPresence indicator
let body = new BodyPresenceSensor();

body.onreading = function() {
  if (!body.present) {
    hrm.stop();
    hrLabel.text = "---";
  } else {
    hrm.start();
  }
}

body.start();
