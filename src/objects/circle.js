class Circle extends RenderObject {
  constructor(id, slices, scale, color) {
    super(id)

    this.slices = slices
    this.scale = scale
    this.fixed = false
    this.color = color
    this.fixed_position = [0,0,0]
    this.position = [0,0,0]
    this.rotation = 0
    this._rotation = 0
  }

init = _ => {
  const vertexArray = [0,0,0]
  const indicesArray = []
  const faceColors = []

  for (let i = 0; i <= this.slices; i++) {
    vertexArray.push(this.scale*Math.sin((i/this.slices) * Math.PI*2))
    vertexArray.push(this.scale*Math.cos((i/this.slices) * Math.PI*2))
    vertexArray.push(0)
  }

  for (let i = 0; i <= this.slices; i++) {
    indicesArray.push(0)
    indicesArray.push(i)
    indicesArray.push(i+1)

    faceColors.push(...[1,1,1,1])
    faceColors.push(...[1,1,1,1])
    faceColors.push(...[1,1,1,1])
  }

  this.vertex = new Float32Array(vertexArray)
  this.indices = new Uint16Array(indicesArray)
  this.colors = new Float32Array(faceColors)

  this.shaderProgram = buildShaderProgram(this.vertexShader(), this.fragmentShader())
  this.attribLocations.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
  this.attribLocations.vertexColor = gl.getAttribLocation(this.shaderProgram, 'aVertexColor')
  this.uniformLocations.projectionMatrix = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix')
  this.uniformLocations.modelViewMatrix = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix')
  this.uniformLocations.cameraMatrix = gl.getUniformLocation(this.shaderProgram, 'uCameraMatrix')
  this.uniformLocations.col = gl.getUniformLocation(this.shaderProgram, 'col')
  this.uniformLocations.t = gl.getUniformLocation(this.shaderProgram, 't')
  this.uniformLocations.factor = gl.getUniformLocation(this.shaderProgram, 'factor')

  this.vertexBufferId = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferId)
  gl.bufferData(gl.ARRAY_BUFFER, this.vertex, gl.STATIC_DRAW)
  gl.vertexAttribPointer(this.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)

  this.colorBufferId = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferId)
  gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW)
  gl.vertexAttribPointer(this.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)

  this.indexBufferId = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferId)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
 }

  getModelViewMatrix = _ => {
    fromTranslation(this.modelViewMatrix, this.fixed ? this.fixed_position : this.position)
    rotate(this.modelViewMatrix, this.modelViewMatrix, this.rotation * .7, [1, 1, 1])
    scale(this.modelViewMatrix, this.modelViewMatrix, [this.scale, this.scale, this.scale])
    return this.modelViewMatrix
  }

  colorBuffer = _ => this.colors
  indexBuffer = _ => this.indices
  vertexBuffer = _ => this.vertex

  logicTick = (t, ship, objectList) => {
    this._rotation += .0003

    if (this.fixed) {
        this.fixed_position[0] = ship.x + this.position[0]
        this.fixed_position[1] = ship.y + this.position[1]
        this.fixed_position[2] = ship.z + this.position[2]
    }

    this._position[0] += (this.position_t[0] - this._position[0]) / 16
    this._position[1] += (this.position_t[1] - this._position[1]) / 16
    this._position[2] += (this.position_t[2] - this._position[2]) / 16

    this._scale += (this.scale_t - this._scale) / 16
  }

  logicStep = factor => {
    this.rotation = this._rotation + .0003 * factor
    for (let i = 0; i < 3; i++) this.position[i] = this._position[i] + factor * (this.position_t[i] - this._position[i]) / 16
    this.scale = this._scale + factor * (this.scale_t - this._scale) / 16
    if (this.scale < 0.1) this.ttl = 0
  }

  scaleTarget = f => {
    this.scale_t = f
    this.related.forEach(o => o.scaleTarget(f))
  }

  preRender = t => {
    gl.disable(gl.CULL_FACE)
    gl.uniform4fv(this.uniformLocations.col, this.color)
    gl.uniform1f(this.uniformLocations.t, t * 0.00001)
  }

  postRender = t => {
    gl.enable(gl.CULL_FACE)
  }

  vertexShader = _ => {
    return `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uCameraMatrix;
      varying lowp vec4 vColor;
      varying vec4 vPos;

      void main(void) {
        vPos = aVertexPosition;
        gl_Position = uProjectionMatrix * uCameraMatrix * uModelViewMatrix * vPos;
        vColor = aVertexColor;
      }
    `
  }

  fragmentShader = _ => {
    return `
      precision mediump float;
      varying lowp vec4 vPos;

      uniform vec4 col;
      uniform float t;
      uniform float factor;
  
      void main(void) {
        float s = sin(sqrt(vPos.x*vPos.x + vPos.y*vPos.y + vPos.z*vPos.z)*0.25);
        if(s > 0.5) {
          gl_FragColor = vec4(col.rgb,.7*factor);
        } else {
          gl_FragColor = vec4(col.rgb,.1*factor);
        }
      }
      `
  }
}