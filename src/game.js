const MOUSE_FACTOR = .2
const FRAME_TIME = 20
const STATE_MENU = 0
const STATE_SHOP = 1
const STATE_GAME = 2
const STATE_OPTIONS = 3
const STATE_HELP = 4
const MAX_ENGINE_POWER = 2
const SHIP_FIRE_TTL = 10

// const shopOptions = ["UPGRADES", "ENGINE", "SHIELDS", "LASER", ": BACK"]
// const highlightOptions = [46,53, 6,20, 58,63, 0,0]
// const shopAngles = [3.5, 0, -2, 0]

let canvas3D = document.getElementsByTagName`canvas`[0]
let gl = canvas3D.getContext`webgl`

let canvas2D = document.getElementsByTagName`canvas`[1]
let c = canvas2D.getContext`2d`

let moveR = moveL = moveF = moveB = powerUP = powerDOWN = rollL = rollR = firePress = fire =0
let lastX = lastY = 0
let clicked = 0
let lastT = -1
let objectId = 0
let gameState = STATE_MENU

let objectList = []
let deleteQueue = []
let waveTime = 0
let wave = 1
let remaining = 0
let inputEnabled = true

let ship = {
  x: 0,
  y: 0,
  z: 0,
  speed: 0,
  rotation_quat: [0,0,0,0],
  direction: [0,0,0,0],
  directionMatrix: create(),
  shields_power: 0,
  engine_power: 0,
  _engine_power: 0,
  engine_power_t: 0,
  pitch : 0,
  _pitch: 0,
  pitch_t: 0,
  yaw: 0,
  _yaw: 0,
  yaw_t: 0,
  roll: 0,
  _roll: 0,
  roll_t: 0,
  up: [0,0,0,0],
  hor: [0,0,0,0],
  fire_ttl:0,
  fuel:999,
  lost:false
}

const projectionMatrix = create()
const cameraMatrix = create()
const laserMatrix = create()
const pyrMatrix = create()

window.addEventListener('keydown', e => {
  if(e.keyCode == 39 || e.keyCode == 68) moveR = 1
  if(e.keyCode == 37 || e.keyCode == 65) moveL = 1
  if(e.keyCode == 38 || e.keyCode == 87) moveF = 1
  if(e.keyCode == 40 || e.keyCode == 83) moveB = 1
  if (e.keyCode == 81) powerUP = 1
  if (e.keyCode == 69) powerDOWN = 1
  if (e.keyCode == 90) rollL = 1
  if (e.keyCode == 88) rollR = 1
  if (e.keyCode == 32) firePress = 1
  if (e.keyCode == 82 && ship.lost) {
    wave = 1
    generateWave(objectList)
  }
})

window.addEventListener('keyup', e => {
  if(e.keyCode == 39 || e.keyCode == 68) moveR = 0
  if(e.keyCode == 37 || e.keyCode == 65) moveL = 0
  if(e.keyCode == 38 || e.keyCode == 87) moveF = 0
  if(e.keyCode == 40 || e.keyCode == 83) moveB = 0
  if (e.keyCode == 81) powerUP = 0 
  if (e.keyCode == 69) powerDOWN = 0
  if (e.keyCode == 90) rollL = 0
  if (e.keyCode == 88) rollR = 0
  if (e.keyCode == 32) firePress = 0
})

window.addEventListener('mousedown', e => {
  lastX = e.clientX
  lastY = e.clientY
  clicked = 1
})

window.addEventListener('mouseup', e => {
  clicked = 0
})

window.addEventListener('mousemove', e => {
  // let dx = (e.clientX - lastX) * MOUSE_FACTOR
  // let dy = (e.clientY - lastY) * MOUSE_FACTOR

  // if (dragging) {
  //   moveR = (dx > 0)? 1 : 0
  //   moveL = (dx < 0)? 1 : 0

  //   moveF = (dy > 0)? 1 : 0
  //   moveB = (dy < 0)? 1 : 0
  // }
  
  lastX = e.clientX
  lastY = e.clientY
})

getID = _ => objectId++

init3D = _ => {
  const fieldOfView = 45 * Math.PI / 180
  const aspect = canvas3D.width / canvas3D.height
  const zNear = 0.1
  const zFar = 8000.0

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
}

resetShipState = _ => {
  ship = {
    x: 0,
    y: 0,
    z: 0,
    speed: 0,
    rotation_quat: [0,0,0,0],
    direction: [0,0,0,0],
    directionMatrix: create(),
    shields_power: 0,
    engine_power: 0,
    _engine_power: 0,
    engine_power_t: 0,
    pitch : 0,
    _pitch: 0,
    pitch_t: 0,
    yaw: 0,
    _yaw: 0,
    yaw_t: 0,
    roll: 0,
    _roll: 0,
    roll_t: 0,
    up: [0,0,0,0],
    hor: [0,0,0,0],
    fire_ttl:0,
    fuel:999,
    lost:false
  }
}

processInput = _ => {
  if (moveR == 1) ship.yaw_t -= 1
  if (moveL == 1) ship.yaw_t += 1
  if (moveF == 1) ship.pitch_t -= 1
  if (moveB == 1) ship.pitch_t += 1

  if (powerUP == 1) ship.engine_power_t += .15
  if (powerDOWN == 1) ship.engine_power_t -= .15

  if (ship.shields_power > 1) ship.shields_power = 1
  if (ship.shields_power < 0) ship.shields_power = 0
  if (ship.engine_power_t > MAX_ENGINE_POWER) ship.engine_power_t = MAX_ENGINE_POWER
  if (ship.engine_power_t < 0) ship.engine_power_t = 0

  if (rollL) ship.roll_t -= 1
  if (rollR) ship.roll_t += 1
  fire = firePress
}

shipLogicTick = t => {
  const SHIP_POWER = 4

  if (ship.fuel <= 0) {
    ship.engine_power = 0
    ship._engine_power = 0
    ship.engine_power_t = 0
  }

  ship._engine_power += (ship.engine_power_t - ship._engine_power) / 16
  ship.speed += (ship._engine_power - ship.speed) / 16 //missing interpolation
  ship.fuel -= ship._engine_power*.25
  
  ship.x += ship.direction[0] * SHIP_POWER * ship.speed // missing interpolation
  ship.y += ship.direction[1] * SHIP_POWER * ship.speed // missing interpolation
  ship.z += ship.direction[2] * SHIP_POWER * ship.speed // missing interpolation

  ship._pitch += (ship.pitch_t - ship._pitch) / 16
  ship._yaw += (ship.yaw_t - ship._yaw) / 16
  ship._roll += (ship.roll_t - ship._roll) / 16

  if (ship.fire_ttl > 0) ship.fire_ttl--
}

generateWave = (objectList) => {
  inputEnabled = false

  objectList.length = 0
  objectList[background.id] = background
  background.factor = 1

  resetShipState()

  // let nShips = 0  //(Math.random() * 100)|0 + 25
  
  // for (let i = 0; i < nShips; i++) {
  //   let renderObj = new Ship(getID())
  //   renderObj.init()
  //   renderObj.setPosition([Math.random() *1500 -750,Math.random()*1500-750,-2000-00*Math.random()])
  //   objectList[renderObj.id] = renderObj
  // }

  const blackHole = new BlackHole(getID(), 40, 200)
  blackHole.init()
  blackHole.setPosition([0, 0, -1000])
  objectList[blackHole.id] = blackHole

  let nPlanets = wave+(Math.random() * wave*2)|0
  if (wave == 1) nPlanets = 1

  for (let i = 0; i < nPlanets; i++) {
    let planetRadius = 50 + Math.random() * 150
    let x = Math.random() * 2000 - 1000
    let y = Math.random() * 2000 - 1000
    let z = Math.random() * 1000 - 500

    if (wave == 1) {
      x = 0
      y = 0
      z = -500
      planetRadius = 40
    }

    let planet = new Sphere(getID(), 20, 20, planetRadius, [Math.random(),Math.random(),Math.random(),1] ,false,[.001,.02,.01])
    planet.init()
    planet.setPosition([x, y, z])
    planet.objective = true
    objectList[planet.id] = planet

    let planetCloud = new Sphere(getID(), 20, 20, planetRadius*1.05, [
      Math.random()*.3+.7,
      Math.random()*.3+.7,
      Math.random()*.3+.7,1], true, [.3,.2,.5])
    planetCloud.init()
    planetCloud.setPosition([x, y, z])
    objectList[planetCloud.id] = planetCloud
    planet.related.push(planetCloud)

    if (Math.random() >= 0.5) {
      let ringRadius = Math.random() * planetRadius*1.5 + planetRadius*1.2
      let planetRing = new Circle(getID(), 40, ringRadius, [
        Math.random()*.4+.6,
        Math.random()*.4+.6,
        Math.random()*.4+.6,1])
      planetRing.init()
      planetRing.setPosition([x, y, z])
      planetRing._rotation = Math.random() * Math.PI
      objectList[planetRing.id] = planetRing
      planet.related.push(planetRing)
    }
  }

  waveTime = -1
  remaining = nPlanets
  ship.fuel = 999
}

shipLogicStep = factor => {
  ship.engine_power = ship._engine_power + factor * (ship.engine_power_t - ship._engine_power) / 16

  ship.roll = ship._roll + factor * (ship.roll_t - ship._roll) / 16
  ship.pitch = ship._pitch + factor * (ship.pitch_t - ship._pitch) / 16
  ship.yaw = ship._yaw + factor * (ship.yaw_t - ship._yaw) / 16

  fromEuler(ship.rotation_quat, ship.pitch, ship.yaw, ship.roll)
  fromRotationTranslation(ship.directionMatrix, ship.rotation_quat, [ship.x, ship.y, ship.z])
  invert(cameraMatrix, ship.directionMatrix)

  transformMat4(ship.direction, [0,0,-1,0], ship.directionMatrix)
  transformMat4(ship.up, [0,1,0,0], ship.directionMatrix)
  transformMat4(ship.hor, [1,0,0,0], ship.directionMatrix)

  background.ship_position = [ship.x, ship.y, ship.z]

  if (fire && ship.fire_ttl == 0 && ship.fuel > 0) {
    ship.fuel--
    shipFireLaser([0,-.5,0])
  }
}

shipFireLaser = displ => {
  let laser = new Laser(getID())
  laser.init()
  copy(laser.rotation_quat, ship.rotation_quat)
  copy(laser.direction, ship.direction)
  laser.setPosition([
    ship.x + displ[0] * ship.hor[0] + displ[1] * ship.up[0] + displ[2] * ship.direction[0],
    ship.y + displ[0] * ship.hor[1] + displ[1] * ship.up[1] + displ[2] * ship.direction[1], 
    ship.z + displ[0] * ship.hor[2] + displ[1] * ship.up[2] + displ[2] * ship.direction[2]])

  objectList[laser.id] = laser
  ship.fire_ttl = SHIP_FIRE_TTL
}

easeOut = (x, y, t) => {
  if (t < 0) t = 0
  if (t > 1.0) t = 1.0
  const _t = 1.0 - (1.0 - t) * (1.0 - t)
  return x * (1 - _t) + y * _t
}

easeInOut_t = t => {
  if (t < 0) t = 0
  if (t > 1.0) t = 1.0
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

easeInOut = (x, y ,t) => {
  const _t = easeInOut_t(t)
  return x * (1 - _t) + y * _t
}

getPaddingNumber = a => (a < 10 ? "O" : "") + a

let background = new Background(getID(), 20, 20, 500)
background.init()

render = t => {
  let width = window.innerWidth
  let height = window.innerHeight
  canvas3D.width = width
  canvas3D.height = height
  canvas2D.width = width
  canvas2D.height = height
  gl.viewport(0, 0, width, height)

  init3D()
  fire = 0
  if (inputEnabled) processInput()

  switch (gameState) {
    case STATE_MENU:
      while (t - lastT >= FRAME_TIME) {
        menuLogicTick(t)
        lastT += FRAME_TIME
      }

      menuLogicStep((t - lastT) / FRAME_TIME)
      renderMenu(c, width, height, ["MENU", "PLAY", "HELP"], ship, i => {
        clicked = false

        if (i == 1) {
          wave = 1
          generateWave(objectList)
          gameState = STATE_GAME
        }

        if (i == 2) gameState = STATE_HELP
      })

      break;
      
    case STATE_HELP:
      while (t - lastT >= FRAME_TIME) {
        menuLogicTick(t)
        lastT += FRAME_TIME
      }

      menuLogicStep((t - lastT) / FRAME_TIME)
      renderMenu(c, width, height, ["HELP", "BACK"], ship, i => {
        clicked = false
        if (i == 1) gameState = STATE_MENU
      })

      
      c.globalAlpha = .8
      c.fillStyle = '#fff'
      c.strokeStyle = '#000'
      const helpCharSize = width/50
      c.fillRect(width/10+width/5, height/4 - helpCharSize * 2, width, helpCharSize * 16)
      c.strokeRect(width/10+width/5, height/4 - helpCharSize * 2, width, helpCharSize * 16)

      c.fillStyle = '#000'
      drawText(c, "MISSION ::", width/10+width/5 +helpCharSize, height/4 + helpCharSize * -1.25, helpCharSize/2)
      drawText(c, "IN EACH GALAXY SEARCH FOR ALL PLANETS", width/10+width/5 +helpCharSize, height/4 + helpCharSize * 0, helpCharSize/2)
      drawText(c, "AND PUSH THEM THROUGH THE BLACK HOLE", width/10+width/5 +helpCharSize, height/4 + helpCharSize * 1, helpCharSize/2)
      drawText(c, "YOU HAVE LIMITED FUEL :: DO NOT GET LOST IN SPACE", width/10+width/5 +helpCharSize, height/4 + helpCharSize * 2, helpCharSize/2)


      drawText(c, "ARROWS :: MOVE", width/10+width/5 +helpCharSize, height/4 + helpCharSize * 4, helpCharSize)
      drawText(c, "WASD   :: MOVE", width/10+width/5 +helpCharSize, height/4 + helpCharSize * 6, helpCharSize)
      drawText(c, "Q      :: ENGINE POWER UP", width/10+width/5+helpCharSize, height/4 + helpCharSize * 8, helpCharSize)
      drawText(c, "E      :: ENGINE POWER DOWN", width/10+width/5+helpCharSize, height/4 + helpCharSize * 10, helpCharSize)
      drawText(c, "SPACE  :: FIRE PLANET PUSHER", width/10+width/5+helpCharSize, height/4 + helpCharSize * 12, helpCharSize)

      break

    case STATE_GAME:
      if (waveTime == -1) waveTime = t

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.CULL_FACE)

      while (t - lastT >= FRAME_TIME) {
        shipLogicTick(t)
        for (const [id, obj] of Object.entries(objectList)) {
          obj.logicTick(t, ship, objectList)
        }

        lastT += FRAME_TIME
      }

      for (const [id, obj] of Object.entries(objectList)) {
        if (obj.ttl <= 0) deleteQueue.push(id)
      }

      deleteQueue.forEach(id => {
        if (objectList[id].objective) remaining--
        delete objectList[id]
      })
      deleteQueue.length = 0

      const timeFactor = (t - lastT) / FRAME_TIME
      shipLogicStep(timeFactor)
      for (const [id, obj] of Object.entries(objectList)) {
        obj.logicStep(timeFactor)
      }

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      for (const [id, obj] of Object.entries(objectList)) {
        drawObject(projectionMatrix, cameraMatrix, obj, t, ship)
      }

      renderHUD(c, width, height, ship, objectList)

      let kt = (t - waveTime - 1500)/1000
      let alpha = easeInOut(0, 1, kt)
      let xdispl = easeInOut(-width, width/2, kt)
      for (const [id, obj] of Object.entries(objectList)) if (id != 0) obj.factor = 0
      hudAlpha = 0

      if (alpha == 1) {
        kt = (t - waveTime - 4500)/2500
        alpha = easeInOut(1, 0, kt)
        xdispl = easeInOut(width/2, width*2, kt)

        background.factor = alpha
        hudAlpha = 1-alpha
        for (const [id, obj] of Object.entries(objectList)) if (id != 0) obj.factor = 1 - alpha
        inputEnabled = alpha < 0.5
      }

      let charSize = width/12
      c.fillStyle = '#000'
      const waveText = "GALAXY " + getPaddingNumber(wave)
      drawText(c, waveText, xdispl+charSize/16, height/2+charSize/16, charSize, 1, alpha)
      c.fillStyle = '#fff'
      drawText(c, waveText, xdispl, height/2, charSize, 1, alpha)

      charSize = width/120
      c.lineWidth = 4.0
      c.strokeStyle = '#fff'
      c.beginPath()
      c.moveTo(xdispl - width/2, height/2 + width/10)
      c.lineTo(xdispl + width/2, height/2 + width/10)
      c.stroke()

      const enginePower = getPaddingNumber((ship.engine_power*50)|0)
      const fuelDisplay = getPaddingNumber((ship.fuel/10)|0)
      const remDisplay = getPaddingNumber(remaining)
      drawText(c, "GLXY " + getPaddingNumber(wave), width, width/120, charSize, 2)
      drawText(c, "LEFT " + remDisplay, width, width/120+charSize*2, charSize, 2)
      drawText(c, "ENGN " + enginePower, width, width/120+charSize*4, charSize, 2)
      drawText(c, "FUEL " + fuelDisplay, width, width/120+charSize*6, charSize, 2)

      if (remaining == 0) {
        wave++
        generateWave(objectList)
      }

      if (ship.fuel <= 0 && remaining > 0) {
        ship.lost = true
        hudAlpha = 0
        let charSize = width/16
        c.fillStyle = '#000'
        drawText(c, "LOST IN SPACE", width/2+charSize/16, height/2+charSize/16, charSize, 1)
        drawText(c, "R TO RESTART", width/2+charSize/48, height/2 + charSize*3+charSize/48, charSize/3, 1)
        c.fillStyle = '#fff'
        drawText(c, "LOST IN SPACE", width/2, height/2, charSize, 1)
        drawText(c, "R TO RESTART", width/2, height/2 + charSize*3, charSize/3, 1)

        c.lineWidth = 4.0
        c.strokeStyle = '#fff'
        c.beginPath()
        c.moveTo(xdispl - width/2, height/2 + width/10)
        c.lineTo(xdispl + width/2, height/2 + width/10)
        c.stroke()
      }
      break
  }

  requestAnimationFrame(render)
}

requestAnimationFrame(render)