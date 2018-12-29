const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageWidth = 640
, stageHeight = 640
, buttons = {
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0
}
, cellWidth = 15
, cellHeight = 15

let then = Date.now()

canvas.width = stageWidth
canvas.height = stageHeight

//setting background colour
stage.fillColor = 'black'
stage.fillRect(0, 0, canvas.width, canvas.height)

let currentAmoeba, currentField, currentTick = 0, enemies = []

const btn = name => name in buttons && buttons[name]

const clamp = (min, max, v) =>
      v <= min ? min : v >= max ? max : v

const grid = (width, height, fill=0) => {
  //this grid is used to create lines in the Field
    const arr = []
    for (let j = 0; j < height; j++) {
        arr.push(Array(width).fill(fill))
    }
    return arr
}

const Field = (width, height, offsetX=0, offsetY=0) => ({
    level: 0,
    lines: grid(width, height),
    width, height,
    offsetX,
    offsetY
})

const Amoeba = (x, y, sizeFactor=1, color='yellow') => ({
  startX: x,
  startY: y,
  sizeFactor: sizeFactor,
  centreX: x*sizeFactor,
  centreY: y*sizeFactor,
  maxX: x*sizeFactor,
  maxY: y*sizeFactor,
  color
})

const amoebaBoundaryCheck = (incomingX, incomingY) => {
  withinXboundary = (incomingX >= currentAmoeba.startX && incomingX <= currentAmoeba.maxX)
  withinYboundary = (incomingY >= currentAmoeba.startY && incomingY <= currentAmoeba.maxY)
      console.log("boundaries", withinXboundary, withinYboundary)
  return withinXboundary && withinYboundary
}

const Anemone = (x, y, sizeFactor=2, color='fuchsia') => ({
  startX: x,
  startY: y,
  sizeFactor: sizeFactor,
  centreX: x*sizeFactor,
  centreY: y*sizeFactor,
  maxX: x*sizeFactor*2,
  maxY: y*sizeFactor*2,
  color
})

const Other = (x, y, dx, dy, color='pink') => ({
    x, y, dx, dy, color, remove: false
})

const colouringIn = (startX, startY, color, sizeFactor) => {
  for (let j = 0; j < currentField.height; j++) {

      for (let i = 0; i < currentField.width; i++) {
        //when i and j reach starting coordinates
        if (i === startX && j === startY) {
          //this is what draws the object
              stage.fillStyle = color
              // cellX and cellY are the starting points
              //where colour will be filled in
              const cellX = (i * (cellWidth + 2)) + currentField.offsetX
              , cellY = (j * (cellHeight + 2)) + currentField.offsetY

              console.log("colouring")
              stage.fillRect(cellX + 0, cellY + 0,
                             cellWidth + sizeFactor, cellHeight + sizeFactor)
          }

      }
  }
}

const init = () => {
    currentField = Field(32, 32, 16, 16)

    currentAmoeba = Amoeba(8, 8)
    currentAnemone = Anemone(9, 9, 60)

    enemies.push(Other(0, 0, 1, 1, 'aqua'))
    enemies.push(Other(10, 0, -1, 1, 'blue'))
}

const update = dt => {

    let dx = 0, dy = 0
    if (btn('Left')) dx = -1
    if (btn('Right')) dx = 1
    if (btn('Up')) dy = -1
    if (btn('Down')) dy = 1

    if (currentTick >= 0.75) {
        for (const enemy of enemies) {
            enemy.x += enemy.dx
            enemy.y += enemy.dy

            // Amoeba boundary check!
            if(amoebaBoundaryCheck(enemy.x, enemy.y)){
              //Amoeba breach protocol!
              //begin evasive action!
              currentAmoeba.startX += currentAmoeba.sizeFactor
              currentAmoeba.startY -= currentAmoeba.sizeFactor
              currentAmoeba.maxX = currentAmoeba.startX*currentAmoeba.sizeFactor
              currentAmoeba.maxY = currentAmoeba.startY*currentAmoeba.sizeFactor
            }

            if (enemy.x < 0 ||
                enemy.x > currentField.width - 1 ||
                enemy.y < 0 ||
                enemy.y > currentField.height - 1)
                enemy.remove = true

                console.log("Amoeba start coordinates", currentAmoeba.startX, currentAmoeba.startY)
                console.log("Amoeba max coordinates", currentAmoeba.maxX, currentAmoeba.maxY)
                console.log("enemy coordinates", enemy.x, enemy.y)
        }
        currentTick = 0
    }


    enemies = enemies.filter(e => e.remove === false)

    currentTick += dt
}

const render = () => {

    stage.fillStyle = 'blue' //sets colour for background
    stage.fillRect(0, 0, stageWidth, stageHeight)

    //creates grid on top of background
    for (let j = 0; j < currentField.height; j++) {

        for (let i = 0; i < currentField.width; i++) {
            stage.fillStyle = '#333'
            stage.fillRect((i * (cellWidth + 2)) + currentField.offsetX,
                           (j * (cellHeight + 2)) + currentField.offsetY,
                           cellWidth, cellHeight)
        }
    }

    colouringIn(currentAmoeba.startX, currentAmoeba.startY, currentAmoeba.color, currentAmoeba.sizeFactor)
    colouringIn(currentAnemone.startX, currentAnemone.startY, currentAnemone.color, currentAnemone.sizeFactor)

    for (const enemy of enemies) {
      //this is what colors in the enemies
      stage.fillStyle = enemy.color

       const cellX = (enemy.x * (cellWidth + 2)) + currentField.offsetX
       , cellY = (enemy.y * (cellHeight + 2)) + currentField.offsetY

       stage.fillRect(cellX + 14, cellY + 14,
                      cellWidth - 1, cellHeight - 1)
   }
}//end of render

const loop = () => {
    const now = Date.now()
    , dt = now - then
    update(dt / 1000)
    render()
    then = now
    window.requestAnimationFrame(loop)
}

init()

window.requestAnimationFrame(loop)
