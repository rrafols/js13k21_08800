class Sphere extends RenderObject {  
  constructor(id, slices, stacks, radius, color, alphaCloud = false, displacement = [0,0,0]) {
    super(id)

    this.attribLocations = {}
    this.uniformLocations = {}
    this.id = id
    this.ttl = 1
    this.slices = slices
    this.stacks = stacks
    this.radius = radius
    this.color = color
    this.alphaCloud = alphaCloud
    this.displacement = displacement
    this.fixed = false
    this.fixed_position = [0,0,0]
    this.collisions = !alphaCloud
  }

  init = _ => {
    const vertexArray = []
    const indicesArray = []
    const faceColors = []

    vertexArray.push(0)
    vertexArray.push(1)
    vertexArray.push(0)

    for (let i = 0; i < this.stacks - 1; i++) {
      const phi = Math.PI * (i + 1) / this.stacks

      for (let j = 0; j < this.slices; j++) {
        const theta = 2 * Math.PI * j / this.slices

        vertexArray.push(Math.sin(phi) * Math.cos(theta) * this.radius)
        vertexArray.push(Math.cos(phi) * this.radius)
        vertexArray.push(Math.sin(phi) * Math.sin(theta) * this.radius)
      }
    }
    vertexArray.push(0)
    vertexArray.push(-1)
    vertexArray.push(0)

    for (let i = 0; i < this.slices; i++) {
      let i0 = i + 1
      let i1 = (i + 2) % this.slices //+ 1
      indicesArray.push(0, i0, i1)

      i0 = i + this.slices * (this.stacks - 2)
      i1 = (i + 1) % this.slices + this.slices * (this.stacks - 2)
      indicesArray.push((vertexArray.length-3)/3, i0, i1)

      for (let k = 0; k < 3; k++) faceColors.push(...this.color)
    }

    for (let j = 0; j < this.stacks - 2; j++) {
      const j0 = j * this.slices + 1
      const j1 = (j + 1) * this.slices + 1

      for (let i = 0; i < this.slices; i++) {
        indicesArray.push(j0 + i)
        indicesArray.push(j0 + (i + 1) % this.slices)
        indicesArray.push(j1 + (i + 1) % this.slices)

        
        indicesArray.push(j1 + (i + 1) % this.slices)
        indicesArray.push(j1 + i)
        indicesArray.push(j0 + i)
        
        for (let k = 0; k < 6; k++) faceColors.push(...this.color)
      }
    }

    this.vertex = new Float32Array(vertexArray)
    this.indices = new Uint16Array(indicesArray)
    this.colors = new Float32Array(faceColors)

    this.position = [0,0,0]

    this.shaderProgram = buildShaderProgram(this.vertexShader(), this.fragmentShader())
    this.attribLocations.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
    this.attribLocations.vertexColor = gl.getAttribLocation(this.shaderProgram, 'aVertexColor')
    this.uniformLocations.projectionMatrix = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix')
    this.uniformLocations.modelViewMatrix = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix')
    this.uniformLocations.cameraMatrix = gl.getUniformLocation(this.shaderProgram, 'uCameraMatrix')
    this.uniformLocations.col = gl.getUniformLocation(this.shaderProgram, 'col')
    this.uniformLocations.alphaCloud = gl.getUniformLocation(this.shaderProgram, 'alphaCloud')
    this.uniformLocations.t = gl.getUniformLocation(this.shaderProgram, 't')
    this.uniformLocations.displacement = gl.getUniformLocation(this.shaderProgram, 'displacement')
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
    scale(this.modelViewMatrix, this.modelViewMatrix, [this.scale, this.scale, this.scale])
    
    return this.modelViewMatrix
  }

  colorBuffer = _ => this.colors
  indexBuffer = _ => this.indices
  vertexBuffer = _ => this.vertex

  logicTick = (t, ship, objectList) => {
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
    for (let i = 0; i < 3; i++) this.position[i] = this._position[i] + factor * (this.position_t[i] - this._position[i]) / 16
    this.scale = this._scale + factor * (this.scale_t - this._scale) / 16
    if (this.scale < 0.1) this.ttl = 0
  }

  scaleTarget = f => {
    this.scale_t = f
    this.related.forEach(o => o.scaleTarget(f))
  }

  boundingBox = _ => {
    return [
      this.position[0] - this.radius,
      this.position[1] - this.radius,
      this.position[2] - this.radius,

      this.position[0] + this.radius,
      this.position[1] + this.radius,
      this.position[2] + this.radius
    ]
  }

  preRender = t => {
    gl.uniform4fv(this.uniformLocations.col, this.color)
    gl.uniform1i(this.uniformLocations.alphaCloud, this.alphaCloud)
    gl.uniform1f(this.uniformLocations.t, t * 0.00001)
    gl.uniform3fv(this.uniformLocations.displacement, this.displacement)
    if (this.alphaCloud) gl.disable(gl.CULL_FACE)
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

  // https://www.shadertoy.com/view/4sfGzS
  fragmentShader = _ => {
    return `
    precision mediump float;
    varying lowp vec4 vPos;

    uniform vec4 col;
    uniform vec3 displacement;
    uniform int alphaCloud;
    uniform float t;
    uniform float factor;

    float occ = 1.0;

    float hash(vec3 p)  // replace this by something better
    {
        p  = fract( p*0.3183099+.1 );
        p *= 17.0;
        return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
    }
    
    float noise( in vec3 x )
    {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
      
        return mix(mix(mix( hash(i+vec3(0,0,0)), 
                            hash(i+vec3(1,0,0)),f.x),
                       mix( hash(i+vec3(0,1,0)), 
                            hash(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix( hash(i+vec3(0,0,1)), 
                            hash(i+vec3(1,0,1)),f.x),
                       mix( hash(i+vec3(0,1,1)), 
                            hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    
    void main(void) {
      vec3 pos = vPos.xyz * 0.01 + t * displacement;
      vec4 shade = vec4(0.9);
      float f = 0.0;
      
      vec3 q = 8.0*pos;
      f  = 0.5000*noise( q ); q = q*2.01;
      f += 0.2500*noise( q ); q = q*2.02;
      f += 0.1250*noise( q ); q = q*2.03;
      f += 0.0625*noise( q ); q = q*2.01;
      
      f *= occ;

      if (alphaCloud == 1) {
        if (f > 0.7) f = 1.0;
        else if (f > 0.5) f = 0.6;
        else f = 0.0;

        gl_FragColor = vec4(col.xyz, f * factor);
      } else {
        f = sqrt(f*1.5);
        

        if (f > 0.67) f = 1.0;
        else if (f > 0.2) f = 0.5;
        else f = 0.0;
        
        gl_FragColor = vec4(f * col.xyz, factor);
      }
    }
    `
  }
}