const FRAGMENT_SHADER = 0
const VERTEX_SHADER = 1

buildShader = (type, src) => {
  let shader = gl.createShader((type == FRAGMENT_SHADER) ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)

  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  // DEBUG
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log("An error occurred compiling the " + ((type == FRAGMENT_SHADER) ? "fragment" : "vertex") + " shader: " + gl.getShaderInfoLog(shader) + " :" + src)
    return null
  } else { 
    return shader
  }
}

buildShaderProgram = (vertexShader, fragmentShader) => {
  var prg = gl.createProgram()
  gl.attachShader(prg, buildShader(VERTEX_SHADER, vertexShader))
  gl.attachShader(prg, buildShader(FRAGMENT_SHADER, fragmentShader))
  gl.linkProgram(prg)

  // DEBUG
  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    throw "Could not link the shader program!"
  }

  return prg
}

drawObject = (projectionMatrix, cameraMatrix, renderObject, t, ship) => {
  gl.useProgram(renderObject.shaderProgram)

  gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.vertexBufferId)
  gl.enableVertexAttribArray(renderObject.attribLocations.vertexPosition)
  gl.vertexAttribPointer(renderObject.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.colorBufferId)
  gl.enableVertexAttribArray(renderObject.attribLocations.vertexColor)
  gl.vertexAttribPointer(renderObject.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix4fv(renderObject.uniformLocations.projectionMatrix, false, projectionMatrix)
  gl.uniformMatrix4fv(renderObject.uniformLocations.cameraMatrix, false, cameraMatrix)
  gl.uniform1f(renderObject.uniformLocations.factor, renderObject.factor)
  gl.uniformMatrix4fv(renderObject.uniformLocations.modelViewMatrix, false, renderObject.getModelViewMatrix())
  
  renderObject.preRender(t)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderObject.indexBufferId)
  gl.drawElements(gl.TRIANGLES, renderObject.indexBuffer().length, gl.UNSIGNED_SHORT, 0)

  renderObject.postRender(t)
  
  gl.disableVertexAttribArray(renderObject.attribLocations.vertexPosition)
  gl.disableVertexAttribArray(renderObject.attribLocations.vertexColor)
}