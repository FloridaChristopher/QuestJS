"use strict";

const TITLE = "Planet Survey";
const AUTHOR = "The Pixie"
const VERSION = "1.1";
const THANKS = ["Kyle", "Lara"];

// UI options
const PANES = 'Left';  //Can be set to Left, Right or None.
// Setting PANES to None will more than double the speed of your game!
const COMPASS = true;
const DIVIDER = "div4.png";

const STATUS_PANE = "Status";  // Set to false to turn off
const STATUS_WIDTH_LEFT = 120; // How wide the columns are in the status pane
const STATUS_WIDTH_RIGHT = 40;

const USE_DROPDOWN_FOR_CONV = true;

const FAILS_COUNT_AS_TURNS = true;
const LOOK_COUNTS_AS_TURN = false;

const TEXT_INPUT = true;
const CURSOR = ">";
const CMD_ECHO = true;               // echo commands to the screen

const LANG_FILENAME = "lang-en.js";  // set to the language file of your choice
const DEBUG = true;                  // set to false when releasing

const PARSER_DEBUG = false;      // If true, will report the data the parser outputs
const SPLIT_LINES_ON = "<br>";   // Strings sent to msg will be broken into separate lines

const SAVE_DISABLED = false;

const SECONDS_PER_TURN = 60;
const DATE_TIME_LOCALE = 'en-GB';
const DATE_TIME_START = new Date('April 14, 2387 09:43:00');
const DATE_TIME_OPTIONS = {
  year:"numeric",
  month:"short",
  day:"2-digit",
  hour:"2-digit",
  minute:"2-digit",
};


let EXITS = [
  {name:'northwest', abbrev:'NW'}, 
  {name:'forward', abbrev:'F'}, 
  {name:'northeast', abbrev:'NE'}, 
  {name:'in', abbrev:'In', alt:'enter|i'}, 
  {name:'up', abbrev:'U'},
  
  {name:'port', abbrev:'P'}, 
  {name:'Look', abbrev:'Lk', nocmd:true}, 
  {name:'starboard', abbrev:'S'}, 
  {name:'out', abbrev:'Out', alt:'exit|o'}, 
  {name:'down', abbrev:'Dn', alt:'d'}, 

  {name:'southwest', abbrev:'SW'}, 
  {name:'aft', abbrev:'A'}, 
  {name:'southeast', abbrev:'SE'}, 
  {name:'Wait', abbrev:'Z', nocmd:true}, 
  {name:'Help', abbrev:'?', nocmd:true}, 
];

const ROOM_TEMPLATE = [
  "%",
  "{objectsHere:You can see {objects} here.}",
]




const STATUS = [
  function() { return "<td colspan=\"2\">" + getDateTime() + "</td>"; },
  function() { return "<td>Bonus:</td><td>$" + game.player.bonus + "k</td>"; },
  function() { return '<td colspan="2">' + game.player.status + "</td>"; },
  function() { return '<td colspan="2">' + game.player.shipStatus + "</td>"; },
];


// Change the name values to alter how items are displayed
// You can add (or remove) inventories too
const INVENTORIES = [
  {name:'Items Held', alt:'itemsHeld', test:isHeldNotWorn, getLoc:function() { return game.player.name; } },
  {name:'Items Here', alt:'itemsHere', test:isHere, getLoc:function() { return game.player.loc; } },
];




function intro() {
  msg("{i:The \"Joseph Banks\" left Earth orbit in 2319, on a centuries-long mission to survey five relatively close star systems. The crew were put in stasis for the long journey between the stars.}");
  msg("&nbsp;");
  msg("'Good morning,' says a female voice. {i:Who the hell?} you wonder for a few minutes, before realising you are in a stasis pod. You sit up. 'We have arrived at " + PLANETS[0].starName + ",' the voice continues, 'our first destination, without incident.' It is Xsansi, the ship AI, who has been piloting the ship for the last twenty years or whatever. 'You may be suffering from disorientation, nausea, headache and muscle fatigue. If symptoms persist, you should seek medical advice.'");
};

const ooc_intro = "<p>You are on a mission to survey planets around five stars, the captain of a crew of five (including yourself). There is also a computer system, Xsansi (you can also use \"AI\" or \"computer\"), that you can talk to anywhere on the ship. </p><p>Your objective is to maximise your bonus. Collecting data will give a bonus, but geo-data about planets suitable for mining and bio-data about planets suitable for colonisation will give higher bonuses. Evidence of alien intelligence will be especially rewarding!</p><p>You have just arrived at your first destination after years in a \"stasis\" pod in suspended animation. ASK AI ABOUT MISSION or CREW might be a good place to start, once you have created your character. Later you want to try OSTAP, LAUNCH PROBE or ASK AADA ABOUT PLANET.";



// This function will be called at the start of the game, so can be used
// to introduce your game.
function setup() {
  game.player.bonus = 0;
  game.player.status = "You are feeling fine";
  game.player.shipStatus = "The ship is fine";

  //parser.parse("spoken");
  //  parser.parse("l");
   
  //showStartDiag();
 
  console.log(getDateTime());
  
  //for(let key in w) {
  //  debugmsg(key);
  //}
  arrival(0);  
  
}


















const DISABLED = true;
const professions = [
  {name:"Engineer", bonus:"mech"},
  {name:"Scientist", bonus:"science"},
  {name:"Medical officer", bonus:"medicine"},
  {name:"Soldier", bonus:"combat"},
  {name:"Computer specialist", bonus:"computers"},
  {name:"Dancer", bonus:"agility"},
  {name:"Advertising exec", bonus:"deceit"},
  {name:"Urban poet", bonus:"deceit"},
];

const backgrounds = [
  {name:"Bored dilettante", bonus:"mech"},
  {name:"Wannabe explorer", bonus:"science"},
  {name:"Fame-seeker", bonus:"medicine"},
  {name:"Debtor", bonus:"combat"},
  {name:"Criminal escaping justice", bonus:"computers"},
];


$(function() {
  if (DISABLED) {
    //const p = getPlayer();
    const p = {};
    p.job = professions[0];
    p.isFemale = true;
    p.fullname = "Shaala";
    return; 
  }
  const diag = $("#dialog");
  diag.prop("title", "Who are you?");
  let s = ooc_intro;
  s += '<p>Name: <input id="namefield" type="text" value="Zoxx" /></p>';
  s += '<p>Male: <input type="radio" id="male" name="sex" value="male">&nbsp;&nbsp;&nbsp;&nbsp;';
  s += 'Female<input type="radio" id="female" name="sex" value="female" checked></p>';
  s += '<p>Profession: <select id="job">'
  for (let i = 0; i < professions.length; i++) {
    s += '<option value="' + professions[i].name + '">' + professions[i].name + '</option>';
  }
  s += '</select></p>';
  s += '<p>Background: <select id="background">'
  for (let i = 0; i < backgrounds.length; i++) {
    s += '<option value="' + backgrounds[i].name + '">' + backgrounds[i].name + '</option>';
  }
  s += '</select></p>';
  
  diag.html(s);
  diag.dialog({
    modal:true,
    dialogClass: "no-close",
    width: 560,
    height: 550,
    buttons: [
      {
        text: "OK",
        click: function() {
          $(this).dialog("close");
          let p = game.player;
          const job = $("#job").val();
          p.job = professions.find(function(el) { return el.name === job; });
          p.background = backgrounds.find(function(el) { return el.name === background; });
          p.isFemale = $("#female").is(':checked');
          p.alias = $("#namefield").val();
          if (TEXT_INPUT) { $('#textbox').focus(); }
        }
      }
    ]
  });
  setTimeout(function() { 
    $('#namefield').focus();
  }, 10);
});

