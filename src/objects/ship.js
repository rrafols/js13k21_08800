const TTL_FIRE = 250

class Ship extends RenderObject {
  constructor(id) {
      super(id)
      this.fireTTL = TTL_FIRE*0.8 + TTL_FIRE*0.2 * Math.random()
      this.direction = [0,0,0]
      this.rotationMatrix = create()
      this.tmp_rot = create()
  }

  init = _ => {
    this.vertex = new Float32Array(ship_vertex)
    this.colors = new Float32Array(ship_vertex_colors)
    this.indices = new Uint16Array(ship_indices)
    this.normals = new Float32Array(ship_normals)

    this.position = [
      (Math.random() - .5) * 900,
      (Math.random() - .5) * 900,
      (Math.random() - .5) * 1500
    ]

    this.shaderProgram = buildShaderProgram(this.vertexShader(), this.fragmentShader())
    this.attribLocations.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
    this.attribLocations.vertexColor = gl.getAttribLocation(this.shaderProgram, 'aVertexColor')
    this.attribLocations.normalBuffer = gl.getAttribLocation(this.shaderProgram, 'aNormalBuffer')
    this.uniformLocations.projectionMatrix = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix')
    this.uniformLocations.modelViewMatrix = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix')
    this.uniformLocations.cameraMatrix = gl.getUniformLocation(this.shaderProgram, 'uCameraMatrix')

    this.vertexBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferId)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer(), gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)

    this.colorBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferId)
    gl.bufferData(gl.ARRAY_BUFFER, this.colorBuffer(), gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)

    this.normalBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferId)
    gl.bufferData(gl.ARRAY_BUFFER, this.normalBuffer(), gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.attribLocations.normalBuffer, 3, gl.FLOAT, true, 0, 0)

    this.indexBufferId = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferId)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer(), gl.STATIC_DRAW)
  }

  preRender = t => {
    gl.disable(gl.CULL_FACE)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferId)
    gl.enableVertexAttribArray(this.attribLocations.normalBuffer)
    gl.vertexAttribPointer(this.attribLocations.normalBuffer, 3, gl.FLOAT, true, 0, 0)
  }

  postRender = t => {
    gl.enable(gl.CULL_FACE)
    gl.disableVertexAttribArray(this.attribLocations.normalBuffer)
  }

  getModelViewMatrix = _ => {
    const modelViewMatrix = create()
    translate(modelViewMatrix, modelViewMatrix, this.position)
    multiply(modelViewMatrix, modelViewMatrix, this.rotationMatrix)
    return modelViewMatrix
  }

  logicTick = (t, ship, objectList) => {
    this.direction[0] = ship.x - this._position[0]
    this.direction[1] = ship.y - this._position[1]
    this.direction[2] = ship.z - this._position[2]
    normalize_vector(this.direction)

    this._position[0] += 2 * this.direction[0]
    this._position[1] += 2 * this.direction[1]
    this._position[2] += 2 * this.direction[2]

    targetTo(this.rotationMatrix, this._position, [ship.x, ship.y, ship.z], [0,-1,0])

    // if(this.id == 1) {
    //   console.log(this._position, [ship.x,ship.y,ship.z])
    // }

    if (--this.fireTTL <= 0) {
      let laser = new Laser(getID())
      laser.init()
      laser.direction = [...this.direction]
      laser.directionMatrix = [...this.rotationMatrix]
      laser.setPosition([this.position[0], this.position[1], this.position[2]])
      objectList[laser.id] = laser
      this.fireTTL = TTL_FIRE
    }
  }

  logicStep = factor => {
    for (let i = 0; i < 3; i++) this.position[i] = this._position[i] + .75 * this.direction[i] * factor
  }

  colorBuffer = _ => this.colors
  indexBuffer = _ => this.indices
  vertexBuffer = _ => this.vertex
  normalBuffer = _ => this.normals

  vertexShader = _ => {
    return `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec3 aNormalBuffer;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uCameraMatrix;
      varying lowp vec4 vColor;
      varying lowp vec3 vNormal;
      varying vec4 vPos;

      void main(void) {
        vPos = aVertexPosition;
        gl_Position = uProjectionMatrix * uCameraMatrix * uModelViewMatrix * vPos;
        vColor = aVertexColor;
        vNormal = vec3(uModelViewMatrix * vec4(aNormalBuffer, 0.0));
      }
  `
  }

  fragmentShader = _ => {
    return `
      precision mediump float;

      varying lowp vec4 vPos;
      varying lowp vec4 vColor;
      varying lowp vec3 vNormal;
      uniform float factor;

      void main(void) {
        vec3 light = vec3(0.0, -1000.0, -1000.0);        
        vec3 dir = normalize(light - vPos.xyz);
        vec3 eye = normalize(-vPos.xyz);
        vec3 reflection = normalize(-reflect(light, vNormal));

        float f = abs(dot(dir, vNormal));
        if (f > 0.67) f = 1.0;
        else if (f > 0.33) f = 0.8;
        else f = 0.6;

        float specular = 128.0 * pow(abs(dot(reflection, eye)), 512.0);
        if (specular > 0.05 && specular < 0.95) specular = -1.0;

        gl_FragColor = vec4(vColor.rgb * f + specular, vColor.a);
      }
    `
  }
}