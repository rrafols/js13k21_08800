class BlackHole extends Circle {
  constructor(id, slices, scale, color) {
    super(id, slices, scale, [1.0, 0.0, 0.0, 1.0])
  }

  preRender = t => {
    gl.disable(gl.CULL_FACE)
    gl.uniform4fv(this.uniformLocations.col, this.color)
    gl.uniform1f(this.uniformLocations.t, t * 0.00001)
    gl.depthMask(false)
  }

  postRender = t => {
    gl.enable(gl.CULL_FACE)
    gl.depthMask(true)
  }
  
  logicTick = (t, ship, objectList) => {
    for (const [id, obj] of Object.entries(objectList)) {
      if (id != this.id) {
        if (obj.collisions) {
          const bb = obj.boundingBox()
          if (this.position[0] >= bb[0] && this.position[0] <= bb[3] &&
              this.position[1] >= bb[1] && this.position[1] <= bb[4] &&
              this.position[2] >= bb[2] && this.position[2] <= bb[5]) {
                obj.scaleTarget(0)
          }
        }
      }
    }
  }

  fragmentShader = _ => {
    return `
      precision mediump float;
      varying lowp vec4 vPos;

      uniform float t;
      uniform vec4 col;
      uniform float factor;
  
      void main(void) {
        float s = sin(sqrt(vPos.x*vPos.x + vPos.y*vPos.y + vPos.z*vPos.z)*0.25 + t*500.0);
        if(s > 0.5) {
          gl_FragColor = vec4(col.rgb,.7*factor);
        } else {
          gl_FragColor = vec4(col.rgb,.1*factor);
        }
      }
      `
  }
}