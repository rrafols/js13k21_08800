const LASER_SPEED = 20
const LASER_TTL = 250

class Laser extends RenderObject {  
  constructor(id) {
    super(id)

    this.attribLocations = {}
    this.uniformLocations = {}
    this.id = id
    this.direction = [0,0,1,0]
    this.ttl = LASER_TTL
    this.rotation_quat = [0,0,0,0]
    this.directionMatrix = create()
    this.modelViewMatrix = create()
  }

  init = _ => {
    this.vertex = new Float32Array([
        // Front face
        -.1, -.1,  20,
        .1, -.1,  20,
        .1,  .1,  20,
      -.1,  .1,  20,
  
      // Back face
      -.1, -.1, -20,
      -.1,  .1, -20,
        .1,  .1, -20,
        .1, -.1, -20,
  
      // Top face
      -.1,  .1, -20,
      -.1,  .1,  20,
        .1,  .1, 20,
        .1,  .1, -20,
  
      // Bottom face
      -.1, -.1, -20,
        .1, -.1, -20,
        .1, -.1,  20,
      -.1, -.1,  20,
  
      // Right face
        .1, -.1, -20,
        .1,  .1, -20,
        .1,  .1,  20,
        .1, -.1,  20,
  
      // Left face
      -.1, -.1, -20,
      -.1, -.1,  20,
      -.1,  .1,  20,
      -.1,  .1, -20
    ])

    const faceColors = [
      [.2,  .0,  1,  1],
      [.2,  .0,  1,  1],
      [.2,  .0,  1,  1],
      [.2,  .0,  1,  1],
      [.2,  .0,  1,  1],
      [.2,  .0,  1,  1]
    ]

    let colorsArray = []
    for (let j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j]
      colorsArray = colorsArray.concat(c, c, c, c)
    }

    this.colors = new Float32Array(colorsArray)

    this.indices = new Uint16Array([
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ])

    this.position = [0,0,0]

    this.shaderProgram = buildShaderProgram(this.vertexShader(), this.fragmentShader())
    this.attribLocations.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
    this.attribLocations.vertexColor = gl.getAttribLocation(this.shaderProgram, 'aVertexColor')
    this.uniformLocations.projectionMatrix = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix')
    this.uniformLocations.modelViewMatrix = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix')
    this.uniformLocations.cameraMatrix = gl.getUniformLocation(this.shaderProgram, 'uCameraMatrix')
    this.uniformLocations.factor = gl.getUniformLocation(this.shaderProgram, 'factor')

    this.vertexBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferId)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer(), gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)

    this.colorBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferId)
    gl.bufferData(gl.ARRAY_BUFFER, this.colorBuffer(), gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)

    this.indexBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferId)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer(), gl.STATIC_DRAW)
  }

  getModelViewMatrix = _ => {
    fromRotationTranslation(this.modelViewMatrix, this.rotation_quat, this.position)
    return this.modelViewMatrix
  }

  colorBuffer = _ => this.colors
  indexBuffer = _ => this.indices
  vertexBuffer = _ => this.vertex

  logicTick = (t, ship, objectList) => {
    for (let i = 0; i < 3; i++) this._position[i] += LASER_SPEED * this.direction[i]

    for (const [id, obj] of Object.entries(objectList)) {
      if (id != this.id) {
        if (obj.collisions) {
          const bb = obj.boundingBox()
          if (this.position[0] >= bb[0] && this.position[0] <= bb[3] &&
              this.position[1] >= bb[1] && this.position[1] <= bb[4] &&
              this.position[2] >= bb[2] && this.position[2] <= bb[5]) {
                obj.move(250, this.direction)
                this.ttl = 0
          }
        }
      }
    }

    this.ttl--
  }

  logicStep = factor => {
    for (let i = 0; i < 3; i++) this.position[i] = this._position[i] + factor * (LASER_SPEED * this.direction[i])
  }
}