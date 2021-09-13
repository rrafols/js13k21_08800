class RenderObject {
  constructor(id) {
    this.attribLocations = {}
    this.uniformLocations = {}
    this.id = id
    this.ttl = 1
    this._position = [0,0,0]
    this.position = [0,0,0]
    this.position_t = [0,0,0]
    this.collisions = false
    this.objective = false
    this.related = []
    this.scale_t = 1.0
    this._scale = 1.0
    this.scale = 1.0
    this.modelViewMatrix = create()
    this.factor = 1.0
  }

  setPosition = (p) => {
    this.position[0] = this._position[0] = this.position_t[0] = p[0]
    this.position[1] = this._position[1] = this.position_t[1] = p[1]
    this.position[2] = this._position[2] = this.position_t[2] = p[2]
  }

  move = (str, direction) => {
    this.position_t[0] += direction[0] * str
    this.position_t[1] += direction[1] * str
    this.position_t[2] += direction[2] * str

    this.related.forEach(o => o.move(str, direction))
  }

  init = _ => {
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
    fromTranslation(this.modelViewMatrix, this.position)
    return this.modelViewMatrix
  }

  colorBuffer = _ => []
  indexBuffer = _ => []
  vertexBuffer = _ => []

  logicTick = (t, ship, objectList) => {
    
  }

  preRender = t => {

  }

  postRender = t => {
    
  }

  logicStep = factor => {

  }

  boundingBox = _ => {
    return [0,0,0, 0,0,0]
  }

  vertexShader = _ => {
      return `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uCameraMatrix;
        varying lowp vec4 vColor;

        void main(void) {
          gl_Position = uProjectionMatrix * uCameraMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }
    `
  }

  fragmentShader = _ => {
    return `
      precision mediump float;
      varying lowp vec4 vColor;
      uniform float factor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `
  }
}