import * as util from "../common/utils";
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import userActivity from "user-activity";
import { battery } from "power";
import { display } from "display";

// Get a handle on <text> elements
const myClock = document.getElementById("myClock");
const myDate = document.getElementById("myDate");
const hrLabel = document.getElementById("hrLabel");
const stepsHandle = document.getElementById("stepsLabel");
const myBattery = document.getElementById("myBatteryLabel");

// Create a new instance of the HeartRateSensor object
let hrm = new HeartRateSensor();

// Create a new instance of the BodyPresence indicator
let body = new BodyPresenceSensor();

// define functions
function updateClock() {
  let today = new Date();
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
}

function updateSteps() {
  // Activity Values: adjusted type
  if(display.on) {
    let stepsValue = (userActivity.today.adjusted["steps"] || 0);
    stepsHandle.text = stepsValue;
  }
 }

function updateBattery() {
  // Display battery level
  if(display.on) {
    myBattery.text = battery.chargeLevel + "%";
    if(battery.chargeLevel<=20) {
      myBattery.style.fill = "red";
    } else {
      myBattery.style.fill = "black";
    }
  }
}

// update the HR, only if the watch is being worn!
function updateHR() {
  if(display.on) { // run this only if the user is watching
    body.start()
    body.onreading = function() {
      if(body.present) {
        hrm.start();
      } else {
        hrLabel.text = "---";
      }
      body.stop();
    }
  }
}

// Declare an event handler that will be called every time a new HR value is received.
hrm.onreading = function() {
  hrLabel.text = hrm.heartRate;
  hrm.stop();
}

// Update the clock every second every tick with the current time
clock.granularity = "minutes";
clock.ontick = () => updateClock();

// Update the steps every 5 seconds
setInterval(updateSteps,5000);

// Update the HR every 2 seconds
setInterval(updateHR,2000);

// Update the Battery every minute
setInterval(updateBattery,6000);

// on start
updateClock();
updateSteps();
updateBattery();
updateHR();
