class Background extends Sphere {  
  constructor(id, slices, stacks, scale) {
    super(id, slices, stacks, scale, [0,0,0])
    this.ship_position = [0,0,0]
    this.collisions = false
  }

  getModelViewMatrix = _ => {
    const modelViewMatrix = create()
    translate(modelViewMatrix, modelViewMatrix, this.ship_position)
    return modelViewMatrix
  }

  preRender = t => {
    // gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.depthMask(false)
    gl.uniform1f(this.uniformLocations.t, t * 0.001)
  }

  postRender = t => {
    // gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.depthMask(true)
  }

  fragmentShader = _ => {
    return `
      #define TAU 6.28318
      #define PI 3.141592

      precision mediump float;

      const float rotation_speed = 0.3;
      varying lowp vec4 vPos;
      uniform float t;
      uniform float factor;
      
      vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031,.11369,.13787));
        p3 += dot(p3, p3.yxz+19.19);
        return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
      }

      float simplexNoise(vec3 p) {
        const float K1 = 0.333333333;
        const float K2 = 0.166666667;

        vec3 i = floor(p + (p.x + p.y + p.z) * K1);
        vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
        
        vec3 e = step(vec3(0.0), d0 - d0.yzx);
        vec3 i1 = e * (1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy * (1.0 - e);
        
        vec3 d1 = d0 - (i1 - 1.0 * K2);
        vec3 d2 = d0 - (i2 - 2.0 * K2);
        vec3 d3 = d0 - (1.0 - 3.0 * K2);
        
        vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
        vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
        
        return dot(vec4(31.316), n);
      }

      float fBm3(vec3 p) {
        float f = 0.0;
        float scale = 5.0;
        p = mod(p, scale);
        float amp = 0.75;

	      for (int i = 0; i < 5; i++) {
          f += simplexNoise(p * scale) * amp;
          amp *= 0.5;
		      scale *= 2.0;
        }
        
	      return min(f, 1.0);
      }

      vec3 hyperspace(vec2 uv, vec3 hypcol) {
        vec3 col = vec3(0.0);
        vec2 p = uv * 0.05;
        
        vec3 v = vec3(p, 1.0);
        float v_xy = length(v.xy);
        float z = v.z / v_xy;
    
        float focal_depth = 0.15;
        vec2 polar;
    
        float p_len = length(v.xy);
    
        polar.y = z * focal_depth + t;
    
        float a = atan(v.y, v.x);
        a = 0.5 + 0.5 * a / (1.0 * PI);
        a -= t * rotation_speed;
        
        float x = fract(a);
        if (x >= 0.5) x = 1.0 - x;
        polar.x = x;
        
        float val = 0.45 + 0.55 * fBm3(vec3(vec2(2.0, 0.5) * polar, 0.15 * t));
        val = clamp(val, 0.0, 1.0);
        col.rgb = hypcol * vec3(val);
        
        vec3 white = 0.35 * vec3(smoothstep(0.55, 1.0, val));
        col.rgb += white;
        col.rgb = clamp(col.rgb, 0.0, 1.0);
    
        float disk_col = exp(-(p_len - 0.025) * 4.0);
        col.rgb += clamp(vec3(disk_col), 0.0, 1.0);
    
        return col;
      }

      vec3 stars(vec2 uv) {
        vec3 col = vec3(0);
        vec2 gv = fract(uv)-.5;
        vec2 id = floor(uv);
        
        for(int y = -1; y<= 1; y++) {
          for(int x = -1; x<= 1; x++) {
              vec2 offs = vec2(x, y);
              vec2 p = id + offs;

              p = fract(p*vec2(123.34, 456.21));
              p += dot(p, p+45.32);
              float n = fract(p.x*p.y);

              float size = fract(n*345.32);

              float d = length(gv - offs - vec2(n-.5, fract(n*34.)-.5));
              float star = .01/d;
              star *= smoothstep(1., .1, d);

              vec3 color = sin(vec3(.3, .1, .9)*fract(n*2345.2))*.5+.5;
              col += star * (sin(t*2. + n*6.2813)*.2+.8) * size * color;
          }
        }

        return col;
      }

      void main(){
          vec2 uv = vPos.xy * .08;
          vec2 uv2 = -vPos.xy * .1;
          vec3 hypcol1 = vec3(0.2, 0.4, 0.9);
          vec3 hypcol2 = vec3(0.5, 0.5, 0.5);
          vec3 col = stars(uv) * (1.0 - factor) + (hyperspace(uv, hypcol1)*0.7 + hyperspace(uv2, hypcol2)*0.3)* factor;

          gl_FragColor = vec4(col,1.0);
      }
    `
  }
}
// Heavily based on
// https://www.shadertoy.com/view/wtd3zM