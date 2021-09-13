/**
 * Creates a quaternion from the given euler angle x, y, z using the provided intrinsic order for the conversion.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} x Angle to rotate around X axis in degrees.
 * @param {y} y Angle to rotate around Y axis in degrees.
 * @param {z} z Angle to rotate around Z axis in degrees.
 * @param {'zyx'|'xyz'|'yxz'|'yzx'|'zxy'|'zyx'} order Intrinsic order for conversion, default is zyx.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  let halfToRad = Math.PI / 360;
  x *= halfToRad;
  z *= halfToRad;
  y *= halfToRad;

  let sx = Math.sin(x);
  let cx = Math.cos(x);
  let sy = Math.sin(y);
  let cy = Math.cos(y);
  let sz = Math.sin(z);
  let cz = Math.cos(z);

  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;

  return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize_vector(out) {
  let x = out[0];
  let y = out[1];
  let z = out[2];
  let len = x * x + y * y + z * z;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }
  out[0] *= len;
  out[1] *= len;
  out[2] *= len;
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
  let ax = a[0],
    ay = a[1],
    az = a[2];
  let bx = b[0],
    by = b[1],
    bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
}

getOpposedVertex = (index, a, b, k) => {
  for (let i = 0; i < index.length; i += 3) {
    const p = [index[i], index[i+1], index[i+2]]
    for (let j = 0; j < p.length; j++) {
      if (p[(j+2)%3]!= k && ((p[j] == a && p[(j+1)%3] == b)||(p[(j+1)%3] == a && p[j] == b))) return p[(j+2)%3]
    }
  }
  return -1
}

weightOddVertex = (index, out_vertex, vertex, a, b, c, k, duplicated) => {
  const v = []

  const oppVertex = getOpposedVertex(index, a, b, c)
  if (oppVertex != -1) {
    x = (vertex[a * 3  ] * 3 + vertex[b * 3  ] * 3 + vertex[c * 3  ] + vertex[oppVertex * 3  ])/8
    y = (vertex[a * 3+1] * 3 + vertex[b * 3+1] * 3 + vertex[c * 3+1] + vertex[oppVertex * 3+1])/8
    z = (vertex[a * 3+2] * 3 + vertex[b * 3+2] * 3 + vertex[c * 3+2] + vertex[oppVertex * 3+2])/8
  } else {
    x = (vertex[a * 3  ] + vertex[b * 3  ])/2
    y = (vertex[a * 3+1] + vertex[b * 3+1])/2
    z = (vertex[a * 3+2] + vertex[b * 3+2])/2
  }

  out_vertex[k*3  ] = x
  out_vertex[k*3+1] = y
  out_vertex[k*3+2] = z
}

weightEvenVertex = (index, out_vertex, vertex, a) => {
  let org_x = vertex[a * 3]
  let org_y = vertex[a * 3+1]
  let org_z = vertex[a * 3+2]
  let x = 0
  let y = 0
  let z = 0
  let added = []
  let count = 0

  for (let i = 0; i < index.length; i += 3) {
    const k = [index[i], index[i+1], index[i+2]]

    for (let i = 0; i < k.length; i++) {
      const k0 = k[i]
      const k1 = k[(i+1)%3]
      const k2 = k[(i+2)%3]

      if (k0 == a) {
        if (!added[k1]) {
          added[k1] = 1
          x += vertex[k1 * 3]
          y += vertex[k1 * 3+1]
          z += vertex[k1 * 3+2]
          count++
        }
  
        if (!added[k2]) {
          added[k2] = 1
          x += vertex[k2 * 3]
          y += vertex[k2 * 3+1]
          z += vertex[k2 * 3+2]
          count++
        }
      }
    }
  }

  let beta = 1
	if (count > 3){
		// let center = .375 + (0.25 * Math.cos(2*Math.PI / count))
		// beta = (0.625 - center * center) / count
    beta = 0.375 / count
	} else {
		beta = 0.1875 / count
	}

  out_vertex[a*3  ] = x * beta + org_x * (1 - count * beta)
  out_vertex[a*3+1] = y * beta + org_y * (1 - count * beta)
  out_vertex[a*3+2] = z * beta + org_z * (1 - count * beta)
}

findHalfVertex = (a, b, duplicated, k) => {
  if (b < a) {
    const t = a
    a = b
    b = t
  }

  const idx = a * 100000 + b

  let result = 1
  if (!duplicated[idx]) {
    duplicated[idx] = k
    result = 0
  }

  return [result, duplicated[idx]]
}

subdivide = (out_index, index, out_vertex, vertex, out_colors, colors, iterations) => {

  // if (iterations == 0) {
  //   out_index = [...index]
  //   out_vertex = [...vertex]
  //   out_colors = [...colors]
  //   return
  // }

  for (let it = 0; it < iterations; it++) {
    let k = vertex.length/3

    duplicated = []

    for (let i = 0; i < index.length; i += 3) {
      const k0 = index[i]
      const k1 = index[i+1]
      const k2 = index[i+2]

      let [found0, i0] = findHalfVertex(k0, k1, duplicated, k)
      if (!found0) {
        k++
        weightOddVertex(index, out_vertex, vertex, k0, k1, k2, i0)
      }

      let [found1, i1] = findHalfVertex(k0, k2, duplicated, k)
      if (!found1) {
        k++
        weightOddVertex(index, out_vertex, vertex, k0, k2, k1, i1)
      }

      let [found2, i2] = findHalfVertex(k1, k2, duplicated, k)
      if (!found2) {
        k++
        weightOddVertex(index, out_vertex, vertex, k1, k2, k0, i2)
      }

      weightEvenVertex(index, out_vertex, vertex, k0)
      weightEvenVertex(index, out_vertex, vertex, k1)
      weightEvenVertex(index, out_vertex, vertex, k2)

      out_index.push(k0)
      out_index.push(i0)
      out_index.push(i1)

      out_index.push(i1)
      out_index.push(k2)
      out_index.push(i2)

      out_index.push(i0)
      out_index.push(k1)
      out_index.push(i2)

      out_index.push(i0)
      out_index.push(i1)
      out_index.push(i2)

      if (out_colors) {
        out_colors.push(colors[i/3])
        out_colors.push(colors[i/3])
        out_colors.push(colors[i/3])
        out_colors.push(colors[i/3])
      }
    }

    if (it != iterations - 1) {
      index = [...out_index]
      vertex = [...out_vertex]
      colors = [...out_colors]
    }
  }
}

generateFaceNormals = (index, vertex) => {
  const out = []

  for (let i = 0; i < index.length; i += 3) {
    const k0 = index[i  ]
    const k1 = index[i+1]
    const k2 = index[i+2]

    const e1 = []
    const e2 = []
    const normal = []

    for (let i = 0; i < 3; i++) {
      e1[i] = vertex[k0*3+i] - vertex[k1*3+i]
      e2[i] = vertex[k2*3+i] - vertex[k1*3+i]
    }

    cross(normal, e1, e2)
    normalize_vector(normal)
    
    out[i  ] = normal[0]
    out[i+1] = normal[1]
    out[i+2] = normal[2]
  }

  return out
}

// generateNormals = (index, vertex) => {
//   const out = []

//   for (let i = 0; i < vertex.length/3; i++) out[i] = [0,0,0]

//   for (let i = 0; i < index.length; i += 3) {
//     const k0 = index[i  ]
//     const k1 = index[i+1]
//     const k2 = index[i+2]

//     const e1 = []
//     const e2 = []
//     const normal = []

//     for (let i = 0; i < 3; i++) {
//       e1[i] = vertex[k0*3+i] - vertex[k1*3+i]
//       e2[i] = vertex[k2*3+i] - vertex[k1*3+i]
//     }

//     cross(normal, e1, e2)
//     for (let i = 0; i < 3; i++) {
//       out[k0][i] += normal[i]
//       out[k1][i] += normal[i]
//       out[k2][i] += normal[i]
//     }
//   }
  
//   for (let i = 0; i < vertex.length/3; i++) normalize_vector(out[i])

//   return out
// }