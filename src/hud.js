const SEGMENTS = 8
let hudAlpha = 1

renderHUD = (c, width, height, ship, objectList) => {
  const DARK_COLOR = '#faac00'
  const DARK_COLOR_2 = '#9a4c00'
  const LIGHT_COLOR = '#2ec0e8'
  const LIGHT_COLOR_2 = '#006088'
  const mp = width/100

  c.save()
  c.globalAlpha = .8 * hudAlpha

  c.strokeStyle = LIGHT_COLOR
  c.beginPath()
  c.arc(width/2, height/2, width/35, 0, Math.PI * 2)

  c.moveTo(width/2 - mp * 1.5, height/2 - mp * 1.5)
  c.lineTo(width/2 - mp * 4, height/2 - mp * 4)
  c.moveTo(width/2 + mp * 1.5, height/2 - mp * 1.5)
  c.lineTo(width/2 + mp * 4, height/2 - mp * 4)
  c.moveTo(width/2 - mp * 1.5, height/2 + mp * 1.5)
  c.lineTo(width/2 - mp * 4, height/2 + mp * 4)
  c.moveTo(width/2 + mp * 1.5, height/2 + mp * 1.5)
  c.lineTo(width/2 + mp * 4, height/2 + mp * 4)

  c.moveTo(width/2, height/2 - mp * 2)
  c.lineTo(width/2, height/2 - mp * 5)
  c.moveTo(width/2, height/2 + mp * 2)
  c.lineTo(width/2, height/2 + mp * 5)
  c.moveTo(width/2 - mp * 2, height/2)
  c.lineTo(width/2 - mp * 5, height/2)
  c.moveTo(width/2 + mp * 2, height/2)
  c.lineTo(width/2 + mp * 5, height/2)
  c.stroke()
  
  c.lineWidth = 2
  c.strokeStyle = DARK_COLOR
  
  for (let i = 0; i < 4; i++) {
    c.save() 
    c.translate(width/2, height/2)
    c.rotate(Math.PI * i / 2)
    c.translate(-width/2, -height/2)

    c.beginPath()
    c.moveTo(width/2 - mp/2, height/2 - mp)
    c.lineTo(width/2, height/2 - mp * 1.5)
    c.lineTo(width/2 + mp/2, height/2 - mp)
    c.stroke()
    c.restore()
  }
  
  c.beginPath()
  c.rect(0,0,width,height)
  c.moveTo(width/2 + width/30, height/2)
  c.arc(width/2, height/2, width/32, 0, Math.PI * 2)
  c.clip("evenodd")

  for (let i = 0; i < SEGMENTS; i++) {
    let start = i * (Math.PI) / SEGMENTS

    c.fillStyle = ((i/(SEGMENTS - 2)) <= ship.engine_power/2)? DARK_COLOR : DARK_COLOR_2
    c.beginPath()
    c.moveTo(width/2, height/2+ 5)
    c.arc(width/2, height/2+5, width/(25 + (SEGMENTS - i)*.4), start, start + (Math.PI) / (SEGMENTS + 2))
    c.fill()

    c.fillStyle = ((i/(SEGMENTS - 1)) < ship.fuel/1000)? LIGHT_COLOR : LIGHT_COLOR_2
    c.beginPath()
    c.moveTo(width/2, height/2 - 5)
    c.arc(width/2, height/2-5, width/(25 + (SEGMENTS - i)*.4), start + Math.PI, start + Math.PI + (Math.PI) / (SEGMENTS + 2))
    c.fill()
  }

  c.restore()

  // c.fillStyle = '#fff'
  // c.font = "20px Terminal"
  // c.fillText("pitch: " + (ship.pitch / Math.PI), 0, 20)
  // c.fillText("yaw: " + (ship.yaw / Math.PI), 0, 40)
  // c.fillText(" roll: " + (ship.roll / Math.PI), 0, 60)
  // c.fillText(" ship.pos: [" + ship.x + ", " +ship.y + ", " + ship.z + "]", 0, 80)
  // c.fillText(" ship.dir: [" + ship.direction[0] + ", " +ship.direction[1] + ", " + ship.direction[2] + "]", 0, 100)
  // c.fillText(" objects: [" + Object.entries(objectList).length + "]", 0, 120)
}