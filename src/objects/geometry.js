let ship_vertex_opt = []
let ship_vertex_opt2 = []
let ship_indices_opt = []
let ship_indices_opt2 = []
const ship_vertex = []
const ship_indices = []
const ship_vertex_colors = []
const ship_normals = []
let ship_face_colors = []

// const ship_vertexStr = "GI0IM0KI0HJ3IK3IJ3EHIMHIGI1GHHKHHJI1GIHJIHIPIFEMLEMEFbMFb?CM?DbSCMSDb=IM=IbUIMUIb@LM@LbRLMRLbFIbLIbEFdLFdFHdKHdEFfLFfFHfKHfAKM@JMQKMRJM"
const ship_vertexStr = "GI0IM0KI0HJ3IK3JJ3EHIMHIHI1HIHJIHJI1HJHJJHIPIEEMMEMEFbMFb?CM?DbSCMSDb=IM=IbUIMUIb@LM@LbRLMRLbFIbLIbEFdMFdFHdLHdEFfMFfFHfLHfAKM@KMQKMRKM"
const ship_indicesStr = "*-/*/,*.-*.++/.+,/-./*03*32*25*5,,14,45236547347376014043267275,18,8+*08*8+09:0:19;<9<::<@:@?9>;9=>?@D?DC=>B=BAABFAFECDHCHG1:<1<809;0;88<J8;I;<J;JI8IJKOQKQMLPRLRNMNRMRQKLPKPOEFSSTFEFTESTGHUUVHGHVGUV"

for (let i = 0; i < ship_vertexStr.length; i++) ship_vertex_opt2.push(ship_vertexStr.charCodeAt(i) - 73)
for (let i = 0; i < ship_indicesStr.length; i++) ship_indices_opt2.push(ship_indicesStr.charCodeAt(i) - 42)

const YELLOW = [.2, .2, .3, 1]
const DARK_YELLOW = [.1, .1, .1, 1]
const RED = [.6, .6, .7, 1]
const COCKPIT = [.5, .5, .8, .8]
const DARK_RED = [.4, .4, .5, 1]

const ship_face_colors2 = [
  YELLOW,YELLOW,YELLOW,YELLOW,YELLOW,YELLOW,
  RED,
  RED, RED, RED, RED, RED, RED,
  DARK_RED, DARK_RED, DARK_RED, DARK_RED,
  RED, RED,
  YELLOW, YELLOW,
  RED, RED, RED, RED,
  COCKPIT, COCKPIT,
  RED, RED, RED, RED, RED, RED,
  DARK_RED, DARK_RED, DARK_RED, DARK_RED,
  // LIGHT_RED, LIGHT_RED, LIGHT_RED, LIGHT_RED,
  RED, RED, RED, RED,
  DARK_YELLOW,
  YELLOW,
  DARK_YELLOW,
  YELLOW,
  YELLOW, YELLOW,
  
  YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW,
  [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], 
  [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], 
  [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], 
  [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], 
]

// getShipColor = idx => {
//   // if (idx < 6) return YELLOW
//   // else if (idx < 12) return RED
//   // else if (idx < 16) return DARK_RED
//   // else if (idx < 18) return RED
//   // else if (idx < 20) return YELLOW
//   // else if (idx < 24) return RED
//   // else if (idx < 26) return [.5, .5, .8, .1]
//   // else if (idx < 32) return RED
//   // else if (idx < 36) return DARK_RED
//   // else if (idx < 40) return LIGHT_RED
//   else if (idx < 41) return DARK_YELLOW
//   else if (idx < 42) return YELLOW
//   else if (idx < 43) return DARK_YELLOW
//   else if (idx < 44) return YELLOW
//   else if (idx < 46) return [.4, .1, 0, 1]
//   else if (idx < 54) return YELLOW
//   else return [0, 0, 0, 1]
// }


//cube
// ship_vertex_opt2  = [-10,-10,10, 10,-10,10, -10,10,10, 10,10,10, -10,-10,-10, 10,-10,-10, -10,10,-10, 10,10,-10]
// ship_indices_opt2 = [0,1,2, 2,3,1, 4,5,6, 6,7,5, 0,4,5, 0,5,1, 2,6,7, 2,7,3, 0,4,6, 0,6,2, 1,5,7, 1,3,7]

//asteroid
// ship_vertex_opt2  = [-10,-20,-5, -10,10,-5, 10,10,-5, 10,0,-5, 0,0,-5, 0,-20,-5, -10,-20,5, 0,-20,5, 0,0,5, 10,10,5, -10,10,5, 10,0,5]
// ship_indices_opt2 = [0,5,4, 0,4,1, 1,4,2, 2,4,3,  0,10,1, 0,10,6,  7,6,8, 6,8,10, 10,8,9, 8,11,9,  10,9,2, 10,2,1, 3,11,9, 3,9,2, 4,8,11, 4,11,3, 5,7,8, 5,8,4, 0,6,7, 0,7,5]

// test 2d shape
// ship_vertex_opt2  = [-10,0,0, 10,0,0, 0,20,0, 0,-20,0]
// ship_indices_opt2 = [0,1,2, 0,3,1]

// ship_vertex_opt2  = [-10,0,0, 10,0,0, 0,20,0, 0,-20,0]
// ship_indices_opt2 = [0,1,2, 0,3,1]

// wing issue
// ship_vertex_opt2 = [
//   -2, 0, -5,
//   0, 4, -5,
//   2, 0, -5,

//     -.5, 1, -2,
//       0, 2, -2,
//     .5,  1, -2,
  
//     -4, -.5, 20, //6
//      4, -.5, 20,
     
//     -1.6, 0, -4,
//     -2, -.25, 19,
//      2, -.25, 19,
//      1.6, 0, -4,
  
//     -1.2, .5, 19, //12
//      1.2, .5, 19,
  
//      0, 7, 20,
  
//      -4, -4, 24,
//      4, -4, 24,
  
//      -4, -3, 45,
//      4, -3, 45,
  
//      -10, -6, 24, //19
//      -10, -5, 45,
//       10, -6, 24,
//       10, -5, 45,
  
//      -12,  0, 24, //23
//      -12,  0, 45, 
//       12,  0, 24,
//       12,  0, 45,
  
//      -9, 3, 24, //27
//      -9, 3, 45, 
//       9, 3, 24,
//       9, 3, 45,
  
//      -3, 0, 45, //31
//       3, 0, 45,
  
//      -3.5, -2.5, 47, //33
//       3.5, -2.5, 47,
//      -2.5, -.5, 47,
//       2.5, -.5, 47,
  
//      -3.5, -2.5, 49, //37
//       3.5, -2.5, 49,
//      -2.5, -.5, 49,
//       2.5, -.5, 49,
  
//       -8,  2, 24, //41
//       -9,  1.5, 24,
//       8,  2, 24,
//       9,  1.5, 24,
//   ]

// ship_indices_opt2 = [
  // 16, 18, 22,
  // 16, 22, 21,

  // 15, 20, 17,
  // 15, 19, 20,

  // 21, 22, 26,
  // 21, 26, 25,
  // 19, 20, 24,
  // 19, 24, 23,

  // 23, 24, 28,
  // 23, 28, 27,
  // 25, 26, 30,
  // 25, 30, 29,

//   0, 3, 5,
//   0, 5, 2,
//   0, 4, 3,
//   0, 4, 1,
//   1, 5, 4,
//   1, 2, 5, //5

//   3,4,5,
// ]

// ship_vertex_opt = ship_vertex_opt2
// ship_indices_opt = ship_indices_opt2

// subdivide(ship_indices_opt, ship_indices_opt2, ship_vertex_opt, ship_vertex_opt2, ship_face_colors, ship_face_colors2, 1)

// subdivide(ship_indices_opt2, ship_indices_opt, ship_vertex_opt2, ship_vertex_opt, ship_face_colors2, ship_face_colors)
// subdivide(ship_indices_opt, ship_indices_opt2, ship_vertex_opt, ship_vertex_opt2, ship_face_colors, ship_face_colors2)
ship_indices_opt = ship_indices_opt2
ship_vertex_opt = ship_vertex_opt2
ship_face_colors = [...ship_face_colors2]

const ship_normals_opt = generateFaceNormals(ship_indices_opt, ship_vertex_opt)

for (let i = 0; i < ship_indices_opt.length; i++) {
  let k = ship_indices_opt[i] * 3

  ship_indices.push(i)

  ship_vertex.push(ship_vertex_opt[k  ])
  ship_vertex.push(ship_vertex_opt[k+1])
  ship_vertex.push(ship_vertex_opt[k+2])
  
  // ship_vertex_colors.push(...getShipColor((i/3)|0))
  // console.log(ship_face_colors[(i/3)|0], (i/3)|0, ship_face_colors.length, ship_indices_opt.length/3)
  ship_vertex_colors.push(...ship_face_colors[(i/3)|0])

  ship_normals.push(ship_normals_opt[k])
  ship_normals.push(ship_normals_opt[k+1])
  ship_normals.push(ship_normals_opt[k+2])
}

// const vertexTmp = [
//   -2, 0, -5,
//    0, 4, -5,
//    2, 0, -5,

//   -1, 1, -2,
//     0, 2, -2,
//    1,  1, -2,

//   -4, -1, 20, //6
//    4, -1, 20,
   
//   -1, 0, -4,
//   -1, 0, 19,
//    1, 0, 19,
//    1, 0, -4,

//   -1, 1, 19, //12
//    1, 1, 19,

//    0, 7, 20,

//    -4, -4, 24,
//    4, -4, 24,

//    -4, -3, 45,
//    4, -3, 45,

//    -10, -6, 24, //19
//    -10, -5, 45,
//     10, -6, 24,
//     10, -5, 45,

//    -12,  0, 24, //23
//    -12,  0, 45, 
//     12,  0, 24,
//     12,  0, 45,

//    -9, 3, 24, //27
//    -9, 3, 45, 
//     9, 3, 24,
//     9, 3, 45,

//    -3, 0, 45, //31
//     3, 0, 45,

//    -4, -3, 47, //33
//     4, -3, 47,
//    -3, -1, 47,
//     3, -1, 47,

//    -4, -3, 49, //37
//     4, -3, 49,
//    -3, -1, 49,
//     3, -1, 49,

//     -8,  2, 24, //41
//     -9,  2, 24,
//     8,  2, 24,
//     9,  2, 24,
// ]

// for (let i = 0; i < vertexTmp.length; i += 3) {
//   vertexTmp[i+2] -= 20
// }

// console.log(vertexTmp)

// let min = 1000
// let max = 0
// for (let i = 0; i < vertexTmp.length; i++) {
//   if (vertexTmp[i] < min) min = vertexTmp[i]
//   if (vertexTmp[i] > max) max = vertexTmp[i]
// }

// console.log(min, max, (max-min))

// let str2 = ""
// for (let i = 0; i < vertexTmp.length; i++) {
//   str2 += String.fromCharCode(vertexTmp[i] + 48 + 25)
// }

// console.log('p="'+str2+'"')

// const indicesTmp = [
//   // front triangles
//   0, 3, 5,
//   0, 5, 2,
//   0, 4, 3,
//   0, 4, 1,
//   1, 5, 4,
//   1, 2, 5, //5
//   3, 4, 5,

//   // top cover
//   0, 6, 9,
//   0, 9, 8,
//   0, 8, 11,
//   0, 11, 2,
//   2, 7, 10,
//   2, 10, 11,
//   8, 9, 12,
//   11, 10, 13,
//   9, 10, 13,
//   9, 13, 12,
//   6, 7, 10,
//   6, 10, 9,

//   8, 12, 13,
//   8, 13, 11,  //19

//   //lateral covers
//   2, 7, 14,
//   2, 14, 1,
//   0, 6, 14,
//   0, 14, 1,

//   //cockpit
//   6, 15, 16,
//   6, 16, 7,   //25

//   //roof
//   15, 17, 18,
//   15, 18, 16,

//   //wings
//   16, 18, 22,
//   16, 22, 21,

//   15, 20, 17,
//   15, 19, 20,

//   21, 22, 26,
//   21, 26, 25,
//   19, 20, 24,
//   19, 24, 23,

//   23, 24, 28,
//   23, 28, 27,
//   25, 26, 30,
//   25, 30, 29,

//   //back
//   7, 16, 18,
//   7, 18, 14,

//   6, 15, 17,
//   6, 17, 14,

//   14, 18, 32,
//   14, 17, 31,

//   17, 18, 32,
//   17, 32, 31,
//   14, 31, 32,

//   //engine
//   33, 37, 39, //46
//   33, 39, 35,

//   34, 38, 40,
//   34, 40, 36,

//   35, 36, 40,
//   35, 40, 39,

//   33, 34, 38,
//   33, 38, 37, //53

//   //weapons
//   27, 28, 41, //54
//   41, 42, 28,
//   27, 28, 42,
//   27, 41, 42,

//   29, 30, 43,
//   43, 44, 30,
//   29, 30, 44,
//   29, 43, 44, //61
// ]

// let str2 = ""
// for (let i = 0; i < indicesTmp.length; i++) {
//   str2 += String.fromCharCode(indicesTmp[i] + 42)
// }

// console.log('p="'+str2+'"')
