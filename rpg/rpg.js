"use strict";

settings.armourScaling = 10
settings.maxNumberOfRings = 2


// Authors can overide as desired
settings.attackOutputLevel = 10
settings.output = function(reportTexts) {
  for (let el of reportTexts) {
    if (el.level <= settings.attackOutputLevel) {
      if (el.level === 1) {
        msg(el.t)
      }
      else  if (el.level === 2) {
        metamsg(el.t)
      }
      else {
        msgPre(el.t)
      }
    }
  }
}








class Effect {
  constructor(name, data, extra = {}) {
    this.name = name
    for (let key in data) this[key] = data[key]
    if (!this.alias) this.alias = name
    for (const name of rpg.copyToEffect) {
      if (extra[name]) this[name] = extra[name]
    }
    if (rpg.findEffect(this.name)) throw new Error("Effect name collision: " + this.name)
    rpg.effectsList.push(this)
  }
  
  apply(attack, target, duration) {
    if (this.start) attack.msg(this.start(target), 1)
    if (duration) target['countdown_' + this.name] = duration
    if (!target.activeEffects.includes(this.name)) target.activeEffects.push(this.name)
  }  

  terminate(target) {
    array.remove(target.activeEffects, this.name)
    delete target['countdown_' + this.name]
    let s
    if (this.finish) s = this.finish(target)
    if (this.suppressFinishMsg) return ''
    if (!s) s = lang.defaultEffectExpires
    return processText(s, {effect:this, target:target})
  }
}



function spawn(name, loc, options = {}) {
  if (!name.endsWith('_prototype')) name += '_prototype'
  if (!loc) loc = player.loc
  const proto = w[name]
  if (!proto) return errormsg("Failed to find a prototype for " + name)
  const count = options.count ? options.count : 1
  let o
  for (let i = 0; i < count; i++) {
    o = cloneObject(proto, loc)
    if (options.package) options.package(o)
    if (o.mutate) o.mutate(options)
    if (options.target) {
      o.hostile = true
      o.target = options.target
    }
  }
  return o
}





const rpg = {
  list:[],
  effectsList:[],
  copyToEffect:['element','visage'],
  add:function(skill) {
    //this.list.push(skill)
  },
  
  find:function(skillName) {
    skillName = skillName.toLowerCase()
    return this.list.find(el => skillName === el.name.toLowerCase() || (el.regex && skillName.match(el.regex))) 
  },
  
  findSkill:function(skillName, suppressErrorMsg) {
    const skill = this.list.find(el => skillName === el.name)
    if (!skill && !suppressErrorMsg) return errormsg("Failed to find skill/spell: '" + skillName + "'")
    return skill
  },
  

  findEffect:function(name) {
    return this.effectsList.find(el => name === el.name)
  },

  defaultSkillTestUseable:function(char) {
    if (!this.doesNotRequireManipulate && !char.testManipulate()) return false
    return true 
  },
  defaultSkillAfterUse:function(attack, count) { },

  defaultSpellTestUseable:function(char) {
    if (!this.doesNotRequireTalk && !char.testTalk()) return false
    return true 
  },
  defaultSpellAfterUse:function(attack, count) { },

  broadcast:function(group, message, source, other) {
    for (const key in w) {
      const o = w[key]
      if (o.signalGroups && o.signalGroups.includes(group)) {
        rpg.broadcastCommunication(o, message, source, other)
      }
    }
  },
  broadcastAll:function(message, source, other) {
    log(source.name)
    for (const key in w) {
      const o = w[key]
      if (o.signalGroups && source.signalGroups && array.intersection(o.signalGroups, source.signalGroups).length) {
        log(o.name)
        rpg.broadcastCommunication(o, message, source, other)
      }
    }
  },
  broadcastCommunication:function(npc, message, source, other) {
    const name = 'signalResponse_' + message
    if (npc[name]) {
      npc[name].bind(npc)(source, other)
    }
    else if (rpg[name]) {
      rpg[name].bind(npc)(source, other)
    }
    else {
      log('WARNING: No response for ' + message)
    }
  },  
  
  signalResponse_test:function(source) { msg("{nv:npc:receive:true} a message from {show:source}.", {npc:this, source:source})},
  signalResponse_alert:function() { this.alert = true },
  signalResponse_wake:function() { this.asleep = false },
  signalResponse_attack:function(source, target) {
    this.hostile = true
    this.target = target ? target.name : player.name
  },





  // These are only suitable for attacks the player (and allies) uses; do not use for foes, they will target each other!

  // Get a list of foes in the current room.
  // A foe is any NPC whose allegiance is NOT friend
  getFoes:function(target) { return rpg.handleGetting(target, function(o) { return o.allegiance !== 'friend' }, true) },
  getFoesBut:function(target) { return rpg.handleGetting(target, function(o) { return o.allegiance !== 'friend' }, false) },

  // Get a list of hostiles in the current room.
  // May not work without a parameter to isHostile.
  getHostiles:function(target) { return rpg.handleGetting(target, function(o) { return o.isHostile() }, true) },
  getHostilesBut:function(target) { return rpg.handleGetting(target, function(o) { return o.isHostile() }, false) },

  // Get a list of NPCs in the current room
  getAll:function(target) { return rpg.handleGetting(target, function() { return true }, true) },
  getAllBut:function(target) { return rpg.handleGetting(target, function() { return true }, false) },


  handleGetting:function(target, fn, includeTarget) {
    const l = scopeHereListed().filter(function(el) {
      return el.npc && fn(el) && el !== target;
    })
    if (target !== undefined && includeTarget) l.unshift(target)
    return l
  },


  pursueToAttack:function(target) {
    const exit = w[this.loc].findExit(target.loc)
    if (!exit) return false  // not in adjacent room, so give up
    // may want to check NPC can use that exit
    
    //log("Move " + npc.name + " to " + dest)
    this.movingMsg(exit) 
    this.moveChar(exit)
    //this.delayAttack = true
    return true
  },

  isSpellAvailable:function(char, spell) {
    for (const key in w) {
      const o = w[key]
      if (!o.spellsAvailableToLearn) continue
      if (!o.spellsCanBeLearnt()) continue
      if (o.spellsAvailableToLearn.includes(spell.name)) {
        return o
      }
    }
    return falsemsg(lang.noSourceForSpell, {spell:spell})
  },


  teleport:function(char, loc) {
    const oldLocation = w[char.loc]
    char.loc = loc
      
    if (char === player) {
      world.update()
      world.enterRoom(new Exit(loc, {origin:oldLocation, dir:'teleport', msg:lang.teleport}))
    }
  },

  destroy:function(obj) {
    if (obj.clonePrototype) {
      delete w[obj.name]
    }
    else {
      delete obj.loc
    }
  },
  
  hasEffect:function(obj, effect) {
    if (!obj.activeEffects) return false
    if (typeof effect !== 'string') effect = effect.name
    return obj.activeEffects.includes(effect)
  },


  elements:{
    list:[
      {name:'fire', opposed:'frost'},
      {name:'frost', opposed:'fire'},

      {name:'storm', opposed:'earthmight'},
      {name:'earthmight', opposed:'storm'},

      {name:'shadow', opposed:'rainbow'},
      {name:'rainbow', opposed:'shadow'},

//      {name:'divine', opposed:'necrotic'},
//      {name:'necrotic', opposed:'divine'},

      {name:'chaos', opposed:'law'},
      {name:'law', opposed:'chaos'},

      {name:'life', opposed:'corruption'},
      {name:'corruption', opposed:'life'},
    ],
    
    opposed:function(s) {
      if (!s) errormsg("elements.opposed was sent something that evaluates to false (type is " + (typeof s) + ")")
      for (let el of this.list) {
        if (el.name === s) return el.opposed
      }
      errormsg("elements.opposed was sent an unrecognised element: " + s)
      return null
    },
  },
}




io.modulesToInit.push(rpg)
io.modulesToUpdate.push(rpg)

rpg.init = function() {
  for (const key in w) {
    const o = w[key]
    if (o.rpgCharacter && o.weapon) {
      const weapon = w[o.weapon]
      if (!weapon) {
        log("WARNING: weapon " + o.weapon + " not found for " + o.name)
        continue
      }
      if (weapon.name.endsWith('_prototype')) {
        const clone = spawn(weapon.name, o.name, o.weaponData)
        delete o.weaponData
        o.weapon = clone.name
      }
      else {
        if (weapon.loc && weapon.loc !== o.name) {
          log("WARNING: weapon " + weapon.name + " seems to have 'loc' set to " + weapon.loc + ", but is assigned to " + o.name)
          continue
        }
        weapon.loc = o.name
      }
    }
    if (o.rpgCharacter && o.shield) {
      const shield = w[o.shield]
      if (!shield) {
        log("WARNING: shield " + o.shield + " not found for " + o.name)
        continue
      }
      if (shield.name.endsWith('_prototype')) {
        const clone = spawn(shield.name, o.name, o.shieldData)
        delete o.shieldData
        o.shield = clone.name
      }
      else {
        if (shield.loc && shield.loc !== o.name) {
          log("WARNING: shield " + shield.name + " seems to have 'loc' set to " + shield.loc + ", but is assigned to " + o.name)
          continue
        }
        shield.loc = o.name
      }
    }
  }
}

rpg.update = function() {
  for (const key in w) {
    const obj = w[key]
    
    

    // handle limited duration active effects
    if (obj.activeEffects) {
      for (let name of obj.activeEffects) {
        if (obj['countdown_' + name]) {
          obj['countdown_' + name]--
          if (obj['countdown_' + name] <= 0) {
            msg(rpg.findEffect(name).terminate(obj))
          }
        }
      }
    }

    // handle limited duration summoned creatures
    if (obj.summonedCountdown) {
      obj.summonedCountdown--
      if (obj.summonedCountdown <= 0) {
        if (obj.isHere()) msg("{nv:item:disappear:true}.", {item:obj})
        rpg.destroy(obj)
      }
    }
  }

  // Determine lighting and fog/smoke in room
  currentLocation.rpgLighting = game.dark ? rpg.DARK : rpg.LIGHT
  if (!currentLocation.rpgFog) currentLocation.rpgFog = 0
  let targetFog = currentLocation.defaultFog ? currentLocation.defaultFog : 0
  if (currentLocation.activeEffects) {
    for (const effectName of currentLocation.activeEffects) {
      const effect = rpg.findEffect(effectName)
      if (effect.fogEffect) targetFog *= effect.fogEffect
      if (effect.lightEffect) {
        if (effect.lightEffect === rpg.UTTERLIGHT) currentLocation.rpgLighting = rpg.UTTERLIGHT
        if (effect.lightEffect === rpg.UTTERDARK && currentLocation.rpgLighting !== rpg.UTTERLIGHT) currentLocation.rpgLighting = rpg.UTTERDARK
        if (effect.lightEffect === rpg.LIGHT && currentLocation.rpgLighting !== rpg.UTTERLIGHT && currentLocation.rpgLighting !== rpg.UTTERDARK) currentLocation.rpgLighting = rpg.DARK
        if (effect.lightEffect === rpg.LIGHT && currentLocation.rpgLighting !== rpg.UTTERLIGHT && currentLocation.rpgLighting !== rpg.UTTERDARK && currentLocation.rpgLighting !== rpg.LIGHT) currentLocation.rpgLighting = rpg.DARK
      }
    }
    game.dark = (currentLocation.rpgLighting === rpg.UTTERDARK || currentLocation.rpgLighting === rpg.DARK) // !!! This could have bad consequences!
  }
  if (targetFog > currentLocation.rpgFog) currentLocation.rpgFog++
  if (targetFog < currentLocation.rpgFog) currentLocation.rpgFog--
}










util.defaultExitUse = function(char, exit) {
  if (!exit) exit = this
  if (char.testMove && !char.testMove(exit)) return false
  const guards = exit.isGuarded()
  if (guards) {
    for (const guard of guards) {
      if (guard.guardingComment) msg(guard.guardingComment, {char:char, exit:this})
      if (guard.guardingReaction) guard.guardingReaction(char, this)
    }
    return false
  }
  
  if (exit.isLocked()) {
    return falsemsg(exit.lockedmsg ? exit.lockedmsg : lang.locked_exit, {char:char, exit:exit})
  }
  if (exit.testExit && !exit.testExit(char, exit)) return false
  for (const el of char.getCarrying()) {
    if (el.testCarry && !el.testCarry({char:char, item:el, exit:exit})) return false
  }
  return this.simpleUse ? this.simpleUse(char) : util.defaultSimpleExitUse(char, exit)
}


util.defaultExitIsGuarded = function() {
  const guards = []
  const list = this.origin[this.dir + '_guardedBy']
  //log(this)
  if (!list) return false
  for (const s of list) {
    const guard = w[s]
    if (guard.isGuarding && guard.isGuarding(this)) guards.push(guard)
  }
  this.guardedBy = guards.map(el => el.name)
  if (guards.length === 0) return false
  return guards
}



//@DOC
// Just the same as falsemsg, but the message goes to the console, not the screen
//     if (notAllowed) return falselog("That is not allowed.")
util.returnAndLog = function(val, s) {
  log(s)
  return val
}
