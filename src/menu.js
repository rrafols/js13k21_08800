const FOV = 2048
const ZOFF = 75
const TITLE = ":08800"

let backgroundGradientV = null
let backgroundGradientH = null
let menuAlpha = _menuAlpha = 0
let menuAlpha_t = 1
let angle = 0
let movement = 0
let rot = 0
let _rot = 0
let rot_t = 0

const tmpArray = []
const rotatedVertex = []

menuLogicTick = t => {
  _menuAlpha += (menuAlpha_t - _menuAlpha) / 16
  movement = t * 0.0005 //25//.2 * Math.sin(t*0.0005)

  _rot += (rot_t - _rot) / 16
}

menuLogicStep = factor => {
  menuAlpha = _menuAlpha + factor * (menuAlpha_t - _menuAlpha) / 16
  rot = _rot + factor * (rot_t - _rot) / 16
}

rotateY = (out, vertex, a) => {
  const ca = Math.cos(a)
  const sa = Math.sin(a)

  for (let i = 0; i < vertex.length; i+= 3) {
    out[i    ] = vertex[i    ] * ca + vertex[i + 2] * sa
    out[i + 1] = vertex[i + 1]
    out[i + 2] = vertex[i    ] * sa - vertex[i + 2] * ca
  }
}

rotateX = (out, vertex, a) => {
  const ca = Math.cos(a)
  const sa = Math.sin(a)

  for (let i = 0; i < vertex.length; i+= 3) {
    out[i    ] = vertex[i    ]
    out[i + 1] = vertex[i + 1] * ca + vertex[i + 2] * sa
    out[i + 2] = vertex[i + 1] * sa - vertex[i + 2] * ca
  }
}

drawWire = (index, vertex, xoff, yoff, zoff, strokeCol = '#000') => {
  for (let i = 0; i < index.length; i += 3) {
    let k0 = index[i    ] * 3 
    let k1 = index[i + 1] * 3
    let k2 = index[i + 2] * 3

    let x0 = FOV * vertex[k0    ] / (zoff + vertex[k0 + 2]) + xoff 
    let y0 = FOV * vertex[k0 + 1] / (zoff + vertex[k0 + 2]) + yoff
    let x1 = FOV * vertex[k1    ] / (zoff + vertex[k1 + 2]) + xoff
    let y1 = FOV * vertex[k1 + 1] / (zoff + vertex[k1 + 2]) + yoff
    let x2 = FOV * vertex[k2    ] / (zoff + vertex[k2 + 2]) + xoff
    let y2 = FOV * vertex[k2 + 1] / (zoff + vertex[k2 + 2]) + yoff
    
    c.strokeStyle = strokeCol
    // if (highlight != -1 && highlightOptions) {
    //   if (i/3 >= highlightOptions[highlight * 2] && i/3 <= highlightOptions[highlight * 2 + 1]){
    //     c.strokeStyle = highlightCol
    //     c.fillStyle = highlightCol
    //   }
    // }

    c.beginPath()
    c.moveTo(x0, y0)
    c.lineTo(x1, y1)
    c.lineTo(x2, y2)
    c.lineTo(x0, y0)
    c.stroke()
    c.fill()
  }

  c.fillStyle = '#f008'
  for (let i = 0; i < vertex.length; i += 3) {
    let x = FOV * vertex[i    ] / (zoff + vertex[i + 2]) + xoff
    let y = FOV * vertex[i + 1] / (zoff + vertex[i + 2]) + yoff

    c.fillRect(x - 4, y - 4, 8, 8)
  }
}

renderMenu = (c, width, height, menuOptions, ship, callback) => {
  const mouseXOffs = -(lastX - width/2) / 20
  const mouseYOffs = -(lastY - height/2) / 20

  if (!backgroundGradientV) {
    backgroundGradientV = c.createLinearGradient(0, 0, 0, height)
    backgroundGradientV.addColorStop(0, '#db7500')
    backgroundGradientV.addColorStop(1, '#fbe5e0')

    backgroundGradientH = c.createLinearGradient(0, 0, width,0)
    backgroundGradientH.addColorStop(0, '#111')
    backgroundGradientH.addColorStop(1, '#002')
  }

  c.save()
  c.fillStyle = backgroundGradientV
  c.fillRect(0, 0, width, height)
  c.globalCompositeOperation = 'lighter'
  c.fillStyle = backgroundGradientH
  c.fillRect(0, 0, width, height)
  c.restore()
  
  c.save()
  c.globalAlpha = menuAlpha
  c.lineWidth = 2
  let highlight = -1
  let y = height/8
  let charWidth = width / 50

  for (let i = 0; i < menuOptions.length; i++) {
    if (i != 0) {
      c.strokeStyle = '#000'
      c.strokeRect(width/10 + height/128, y + height/128, width/6, height/10)
      c.strokeStyle = '#fff'
      c.strokeRect(width/10, y, width/6, height/10)

      if (lastX >= width/10 && lastX <= width/10 + width/6 && lastY >= y && lastY <= y + height/10) {
        c.fillStyle = '#fff'
        c.fillRect(width/10, y, width/6, height/10)

        if (clicked) callback(i)
      }
    } else {
      c.strokeStyle = '#000'
      c.strokeRect(width/10 + height/128 + height/10, y + height/128, width/6, 1)
      c.strokeStyle = '#fff'
      c.strokeRect(0, y + height/10, width/4, 1)
    }

    c.fillStyle = '#000'
    drawText(c, menuOptions[i], width/10 + width/12, y + height/20, charWidth, 1)
    y += height /8
  }

  // if (gameState != STATE_SHOP) highlight = -1
  // if (highlight == -1) rot_t = 0

  c.fillStyle = '#f80'
  drawText(c, TITLE, width/2 - charWidth * 10 + mouseXOffs*2, height/2+mouseYOffs*.5, charWidth*15, 0, .2)
  c.fillStyle = '#000'
  drawText(c, TITLE, width, charWidth, charWidth, 2)
  c.fillStyle = '#fff'
  drawText(c, TITLE, -charWidth * 10 + mouseXOffs*.5, height - charWidth*2+mouseYOffs, charWidth*10, 0,.4)
  c.restore()

  rotateX(tmpArray, ship_vertex, -0.2)
  rotateY(rotatedVertex, tmpArray, rot + movement)

  // const normals = []
  // const tmp = []
  // for (let i = 0; i < ship_indices.length; i += 3) {
  //   const k0 = ship_indices[i]*3
  //   const k1 = ship_indices[i+1]*3
  //   const k2 = ship_indices[i+2]*3

  //   const x = (ship_vertex[k0  ] + ship_vertex[k1  ] + ship_vertex[k2  ])/3
  //   const y = (ship_vertex[k0+1] + ship_vertex[k1+1] + ship_vertex[k2+1])/3
  //   const z = (ship_vertex[k0+2] + ship_vertex[k1+2] + ship_vertex[k2+2])/3

  //   normals.push(x)
  //   normals.push(y)
  //   normals.push(z)
  //   normals.push(x + ship_normals_opt[i] * 5)
  //   normals.push(y + ship_normals_opt[i+1] * 5)
  //   normals.push(z + ship_normals_opt[i+2] * 5)
  // }

  // rotateX(tmp, normals, -0.2)
  // rotateY(normals, tmp, rot + movement)

  let xoff = 2 * width / 3
  let yoff = 1.75 * height / 3

  c.globalAlpha = .5
  c.lineWidth = 4
  drawWire(ship_indices, rotatedVertex, xoff + mouseXOffs * 2, yoff + mouseYOffs * 2, ZOFF * .9, '#fff8')
  drawWire(ship_indices, rotatedVertex, xoff + mouseXOffs, yoff + mouseYOffs, ZOFF)
}