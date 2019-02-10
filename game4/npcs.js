"use strict";








createItem("Xsansi",
  NPC(true),
  { 
    isAtLoc:function(loc) {
      return true;
    },
    regex:/^(ai|xsan|computer)$/,
    display:DSPY_SCENERY,
    bioProbes:16,
    geoProbes:16,
    seederPods:6,
    satellites:6,
    shipStatus:"All systems nominal.",
    examine:"Xsansi, or eXtra-Solar Advanced Navigation and Systems Intelligence, is a type IV artificial intelligence, with a \"Real People\" personality sub-system. Though her hardware is in the server room, forward of the bottom deck, she is present throughout the ship.",

    askoptions:[
      {regex:/mission/, response:function() {
        msg("'Remind me of the mission, Xsansi,' you say.");
        msg("'The ship's mission is to survey five planets orbiting stars in the Ophiuchus and Serpens constellations. At each planet, a satellite is to be launched to collect data from the surface. At your discretion, bio-probes and geo-probes can be dropped to the surface to collect data. Note that there is no capability for probes to return to the ship or for the ship to land on a planet.'");
        msg("'Your bonus,' she continues, 'depends on the value of the data you collect. Bio-data from planets with advanced life is highly valued, as is geo-data from metal rich planets. Evidence of intelligent life offers further bonuses.'");
        msg("'Note that $25k will be deducted from you bonus should a crew member die,' she adds. 'Note that no bonus will be awarded in he event of your own death.'");
      }},
      
      {regex:/crew|team/, response:function() {
        msg("'Tell me about the crew, Xsansi,' you say.");
        msg("'" + w.Ostap.crewStatus());
        msg("'" + w.Aada.crewStatus());
        msg("'" + w.Ha_yoon.crewStatus());
        msg("'" + w.Kyle.crewStatus() + "'");
      }},
      
      {regex:/status|ship/, response:function() {
        msg("'What is the ship's status, Xsansi?' you ask.");
        msg("'The ship's current status is: " + w.Xsansi.shipStatus + " We currently have: " + w.Xsansi.bioProbes + " bio-probes; " + w.Xsansi.geoProbes + " geo-probes; " + w.Xsansi.seederPods + " seeder pods; and " + w.Xsansi.satellites + " satellites.'");
      }},
    ],
  }
);

createItem("Xsansi_mission",
  TOPIC(true),
  { 
    loc:"Xsansi", 
    alias:"What is the mission?",
    hideAfter:false,
    script:function() {
      msg("'Remind me of the mission, Xsansi,' you say.");
      msg("'The ship's mission is to survey five planets orbiting stars in the Ophiuchus and Serpens constellations. At each planet, a satellite is to be launched to collect data from the surface. At your discretion, bio-probes and geo-probes can be dropped to the surface to collect data. Note that there is no capability for probes to return to the ship or for the ship to land on a planet.'");
      msg("'Your bonus,' she continues, 'depends on the value of the data you collect. Bio-data from planets with advanced life is highly valued, as is geo-data from metal rich planets. Evidence of intelligent life offers further bonuses.'");
      msg("'Note that $25k will be deducted from you bonus should a crew member die,' she adds. 'Note that no bonus will be awarded in he event of your own death.'");
    },
  }
);

createItem("Xsansi_crew",
  TOPIC(true),
  {
    loc:"Xsansi",
    alias:"Tell me about the crew",
    hideAfter:false,
    script:function() {
      msg("'Tell me about the crew, Xsansi,' you say.");
      msg("'" + w.Ostap.crewStatus());
      msg("'" + w.Aada.crewStatus());
      msg("'" + w.Ha_yoon.crewStatus());
      msg("'" + w.Kyle.crewStatus() + "'");
    },
  }
);

createItem("Xsansi_status",
  TOPIC(true),
  {
    loc:"Xsansi",
    alias:"What is our status?",
    hideAfter:false,
    script:function() {
      msg("'What is the ship's status, Xsansi?' you ask.");
      msg("'The ship's current status is: " + w.Xsansi.shipStatus + " We currently have: " + w.Xsansi.bioProbes + " bio-probes; " + w.Xsansi.geoProbes + " geo-probes; " + w.Xsansi.seederPods + " seeder pods; and " + w.Xsansi.satellites + " satellites.'");
    },
  }
);

createItem("Xsansi_itinery",
  TOPIC(true),
  {
    loc:"Xsansi",
    alias:"What is the itinery?",
    hideAfter:false,
    script:function() {
      msg("'Remind me of the itinery, Xsansi,' you say.");
      for (let i = w.Xsansi.currentPlanet; i < PLANETS.length; i++) {
        let s = "'Item " + (i + 1) + ": " + PLANETS[i].starDesc;
        if (i + 2 === PLANETS.length) s += "'";
        msg(s);
      }
    },
  }
);

createItem("Xsansi_current_planet",
  TOPIC(true),
  {
    loc:"Xsansi",
    alias:"Tell me about this planet",
    hideAfter:false,
    script:function() {
      msg("'Tell me about this planet, Xsansi,' you say.");
      const planet = PLANETS[w.Xsansi.currentPlanet];
      let s = "'We are currently in orbit around the planet " + planet.starName + planet.planet +"' she says. '";
      s += planet.planetDesc + " " + planet.atmosphere + " ";
      s += planet.lights + " " + planet.radio + "'";
      msg(s);
    },
  }
);



createItem("Kyle",
  NPC(false),
  { 
    loc:"flightdeck",
    status:"okay",
    examine:"Kyle is the computer expert, but also a good cook, and has volunteered for the role of chef. An Australian, he is slim, and below average height, with very short blonde hair, and green eyes.",
    crewStatus:function() {
      let s = "Crew member Kyle's designation is: coms. His current status is: ";
      s += this.status + ". His current location is: " + w[this.loc].byname({article:DEFINITE}) + ".";
      return s;
    },
    notes:"Kyle (M) is from Australia (born Newcastle but raised in Sydney), 32, a gay nerd. Expert in computing and cooking. Kyle handles the satellite and understanding radio transmissions. Joined up so he can see the future - it is a kind of time travel; hopes to upload himself to become immortal. Terminally ill.",
  }
);


createItem("Ostap",
  NPC(false),
  { 
    loc:"canteen",
    status:"okay",
    examine:"Ostap is a big guy; not fat, but broad and tall. He keeps his dark hair in a ponytail. He is a biologist from the Ukraine.",
    crewStatus:function() {
      let s = "Crew member Ostap's designation is: biologist. His current status is: ";
      s += this.status + ". His current location is: " + w[this.loc].byname({article:DEFINITE}) + ".";
      return s;
    },
    notes:"Ostap (M) is from the Ukraine (Nastasiv, nr Ternopil), 30, a gentle giant who thinks he has psychic powers; he is lactose intolerant. Biologist. Ostap handles the bio-probes probes. Starts hitting on Aada, but she isnot interested. Later cuples up with Ha-yoon",
  }
);

createItem("Ostap_probe_analysis",
  TOPIC(true),
  {
    loc:"Ostap",
    alias:"How does a bio-probe work?",
    hideAfter:false,
    script:function() {
      msg("'How does a bio-probe work?,' you ask Ostap.");
      msg("'I control from the lab, find a good sample. First we look at the morphology, with a simple camera. Then pick up a sample, take a slice to look at the microscopic structure - we look for cells, what is inside the cell. If we get enough cells, we can tell it to extract chemical from one type of sub-structure, then we analysis the chemicals by mass spectroscopy and the infra-red spectroscopy. We hope we find something in the library, if not, the results can be taken to Earth.'");
      msg("'Okay, cool.'");
    },
  }
);



createItem("Aada",
  NPC(true),
  { 
    loc:"girls_cabin",
    status:"okay",
    examine:"Aada is a Finnish woman with features so ideal you suspect genetic engineering. Tall, with a perfect figure, she keeps her blonde hair short. She is a bit vague about her background, but has some military experience.",
    crewStatus:function() {
      let s = "Crew member Adaa's designation is: geologist. Her current status is: ";
      s += this.status + ". Her current location is: " + w[this.loc].byname({article:DEFINITE}) + ".";
      return s;
    },
    notes:"Aada (F) is from Finland (Oulu), 35, father genetically engineered her, planning to create a dynasty. Her older sister (effectively a lone) rebelled, so the father kept a very tight rein on this one (ef Miranda's sister). Drinks vodka a lot. Signed on as geologist, but not really her speciality - the corp was desperate and so was she. Aada handles the geo-probes.",
  }
);

createItem("Aada_probe_analysis",
  TOPIC(true),
  {
    loc:"Aada",
    alias:"How does a geo-probe work?",
    hideAfter:false,
    script:function() {
      msg("'How does a geo-probe work?,' you ask Aada.");
      msg("'Simple. Once deplyed on the planet, I send it to an interesting rock, and it extends an arm that takes a sample.'");
      msg("'Okay, but I was wondering what sort of analysis it does. Is it infra-red, or X-ray diffraction or what?'");
      msg("'Er, yeah, I expect so.'");
    },
  }
);


createItem("Ha_yoon",
  NPC(true),
  { 
    alias:"Ha-yoon",
    loc:"engineering3",
    status:"okay",
    examine:"Ha-yoon is a well-respected Korean engineer, making her possibly the most important member of the crew for ensuring the ship gets back to Earth. She is the shortest of the crew, but perhaps the loudest. She has long, raven=black hair, that falls to her waist, and dark eyes.",
    crewStatus:function() {
      let s = "Crew member Ha-yoon's designation is: engineer. Her current status is: ";
      s += this.status + ". Her current location is: " + w[this.loc].byname({article:DEFINITE}) + ".";
      return s;
    },
    notes:"Ha-yoon (F) is from Korean (Seoul), 28, and is on the run, after killing a couple of guys. She hopes that after all the time in space her crimes will be forgotten. Engineer.",
  }
);



const NPCS = [w.Ostap, w.Aada, w.Kyle, w.Ha_yoon];

createAnalysisTopics(w.Aada, "geology");
createAnalysisTopics(w.Ostap, "biology");
for (let i = 0; i < NPCS.length; i++) {
  createHowAreYouTopics(NPCS[i]);
}
  