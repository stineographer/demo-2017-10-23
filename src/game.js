const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageWidth = 840
, stageHeight = 840
, buttons = {
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0
}
, cellWidth = 10
, cellHeight = 10

let then = Date.now()

canvas.width = stageWidth
canvas.height = stageHeight

stage.fillRect(0, 0, canvas.width, canvas.height)

let currentField, currentTick = 0, water = [], tentacles = []

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

const Periphery = (incoming_array) => ({
  minX: _.minBy(incoming_array, 'startX').startX,
  maxX: _.maxBy(incoming_array, 'maxX').maxX,

  minY: _.minBy(incoming_array, 'startY').startY,
  maxY: _.maxBy(incoming_array, 'maxY').maxY
})

const TentacleUnit = (x, y, sizeFactor=1, color='yellow') => ({
  startX: x,
  startY: y,
  sizeFactor: sizeFactor,

  maxX: x + sizeFactor,
  maxY: y + sizeFactor,
  color
})

const boundaryCheck = (incomingX, incomingY, incomingPeriphery) => {
  //change this to the periphery of the organism as whole??
    withinXboundary = (incomingX >= incomingPeriphery.minX && incomingX < incomingPeriphery.maxX)
    withinYboundary = (incomingY >= incomingPeriphery.minY && incomingY < incomingPeriphery.maxY)

      console.log("boundaries", withinXboundary, withinYboundary)
  return withinXboundary || withinYboundary
}

const AnemoneBody = (x, y, sizeFactor=2, color='fuchsia') => ({
  startX: x,
  startY: y,
  sizeFactor: sizeFactor,

  maxX: x + sizeFactor,
  maxY: y + sizeFactor,
  color
})

const evasiveAction = (drop, currentPeriphery, currentTentacleUnit, currentAnemoneBody) => {
  if(boundaryCheck(drop.x, drop.y, currentPeriphery) &&
  (currentTentacleUnit.maxY <= drop.y) ||
  (currentTentacleUnit.maxX <= (currentTentacleUnit.maxX - currentAnemoneBody.sizeFactor))){
    //TentacleUnit breach protocol!
    //begin evasive action!
    currentTentacleUnit.startX += currentTentacleUnit.sizeFactor
    currentTentacleUnit.maxX = currentTentacleUnit.startX

  }//end of boundaryCheck!
}

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
              const cellX = (i * (cellWidth)) + currentField.offsetX
              , cellY = (j * (cellHeight)) + currentField.offsetY

              stage.fillRect(cellX, cellY,
                             cellWidth + sizeFactor, cellHeight + sizeFactor)
          }

      }
  }
}

const init = () => {
    currentField = Field(65, 65, 16, 16)

    tentacles.push(TentacleUnit(5, 5))
    tentacles.push(TentacleUnit(4, 4))
    tentacles.push(TentacleUnit(3, 3))
    tentacles.push(TentacleUnit(6, 6))

    tentacles.push(TentacleUnit(9, 6, 1, 'fuchsia'))
    tentacles.push(TentacleUnit(8, 5, 1, 'fuchsia'))
    tentacles.push(TentacleUnit(7, 4, 1, 'fuchsia'))
    tentacles.push(TentacleUnit(6, 3, 1, 'fuchsia'))


    tentacles.push(TentacleUnit(10, 6))
    tentacles.push(TentacleUnit(11, 5))
    tentacles.push(TentacleUnit(12, 4))
    tentacles.push(TentacleUnit(13, 3))

    currentAnemoneBody = AnemoneBody(6, 7, 40)

    water.push(Other(9, 0, -1, 1, 'teal'))
    water.push(Other(0, 0, 1, 1, 'aqua'))
    water.push(Other(10, 0, -1, 1, 'blue'))
}

const update = dt => {

    let dx = 0, dy = 0
    if (btn('Left')) dx = -1
    if (btn('Right')) dx = 1
    if (btn('Up')) dy = -1
    if (btn('Down')) dy = 1

    if (currentTick >= 0.75) {
        for (const drop of water) {
            drop.x += drop.dx
            drop.y += drop.dy

            currentPeriphery = Periphery(tentacles)

            console.log("drop coordinates X: " + drop.x + ", Y:" + drop.y + " periphery ", currentPeriphery)
            console.log("currentPeriphery maxX ", currentPeriphery.maxX)

            for(const unit of tentacles){
              evasiveAction(drop, currentPeriphery, unit, currentAnemoneBody)
            }



            if (drop.x < 0 ||
                drop.x > currentField.width - 1 ||
                drop.y < 0 ||
                drop.y > currentField.height - 1)
                drop.remove = true

        }//end of water
        currentTick = 0
    }


    water = water.filter(e => e.remove === false)

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

    colouringIn(currentAnemoneBody.startX, currentAnemoneBody.startY, currentAnemoneBody.color, currentAnemoneBody.sizeFactor)

    for(const organism of tentacles){
      colouringIn(organism.startX, organism.startY, organism.color, organism.sizeFactor)
    }


    for (const drop of water) {
      //this is what colors in the water
      stage.fillStyle = drop.color

       const cellX = (drop.x * (cellWidth + 2)) + currentField.offsetX
       , cellY = (drop.y * (cellHeight + 2)) + currentField.offsetY

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
