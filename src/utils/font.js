const segments = [
  new Path2D("M1,1 2,0 8,0 9,1 8,2 2,2z"),
  new Path2D("M9,1 10,2 10,8 9,9 8,8 8,2z"),
  new Path2D("M9,9 10,10 10,16 9,17 8,16 8,10z"),
  new Path2D("M9,17 8,18 2,18 1,17 2,16 8,16z"),
  new Path2D("M1,17 0,16 0,10 1,9 2,10 2,16z"),
  new Path2D("M1,9 0,8 0,2 1,1 2,2 2,8z"),
  new Path2D("M1,9 2,8 8,8 9,9 8,10 2,10z")
]

const chars = [
  //0123456789:;<=>?@
  63, 6, 91, 79, 102, 109, 125, 7, 127, 111,
  73, 0, 0, 0, 0, 0, 0,
  //abcdefghij 
  119, 124, 88, 94, 121, 113, 61, 116, 4, 30,
  
  //klmnopqrstu
  117, 56, 55, 84, 92, 115, 103, 80, 109, 120, 28,

  //vwxyz
  62, 126, 118, 110, 91
]

drawText = (c, str, x, y, charWidth, align = 0, alpha = 1) => {
  c.save()
  let scale = charWidth / 12
  let offset = -align * charWidth * str.length * .5

  c.translate(x + offset, y - 20 *scale/2)
  for(let i = 0; i < str.length; i++) {
    let ch = chars[str.charCodeAt(i) - 48]

    c.save()
    c.scale(scale, scale)

    let mask = 1
    for (let j = 0; j < 7; j++) {
      c.globalAlpha = (ch & mask) ? alpha:.1*alpha
      c.fill(segments[j])
      mask *= 2
    }
    c.restore()
    c.translate(12 * scale,0)
  }
  c.restore()
}