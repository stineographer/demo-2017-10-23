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
, cellWidth = 16
, cellHeight = 16

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

const Amoeba = (x, y, sizeFactor=2, color='yellow') => ({
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

const init = () => {
    currentField = Field(32, 32, 16, 16)

    currentAmoeba = Amoeba(8, 8)

    enemies.push(Other(0, 0, 1, 1, 'hotpink'))
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
            if(enemy.x >= currentAmoeba.startX && enemy.y >= currentAmoeba.startY){
              //Amoeba breach protocol!
              currentAmoeba.color='red'
              //begin evasive action!
              currentAmoeba.startX += currentAmoeba.sizeFactor
              currentAmoeba.startY -= currentAmoeba.sizeFactor
            }

            if (enemy.x < 0 ||
                enemy.x > currentField.width - 1 ||
                enemy.y < 0 ||
                enemy.y > currentField.height - 1)
                enemy.remove = true
        }
        currentTick = 0
    }

    console.log("Amoeba start coordinates", currentAmoeba.startX, currentAmoeba.startY)
    enemies = enemies.filter(e => e.remove === false)

    currentTick += dt
}

const render = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageWidth, stageHeight)

    for (let j = 0; j < currentField.height; j++) {

        for (let i = 0; i < currentField.width; i++) {
            stage.fillStyle = '#333'
            stage.fillRect((i * (cellWidth + 2)) + currentField.offsetX,
                           (j * (cellHeight + 2)) + currentField.offsetY,
                           cellWidth, cellHeight)
        }
    }

    for (let j = 0; j < currentField.height; j++) {

        for (let i = 0; i < currentField.width; i++) {
          //when i and j reach Amoeba's starting coordinates
          if (i === currentAmoeba.startX && j === currentAmoeba.startY) {
            //this is what draws the Amoeba
                stage.fillStyle = currentAmoeba.color
                // cellX and cellY are the starting points
                //where colour will be filled in for Amoeba
                const cellX = (i * (cellWidth + 2)) + currentField.offsetX
                , cellY = (j * (cellHeight + 2)) + currentField.offsetY

                stage.fillRect(cellX + 0, cellY + 0,
                               cellWidth + currentAmoeba.centreX*currentAmoeba.sizeFactor,
                               cellHeight + currentAmoeba.centreY*currentAmoeba.sizeFactor)
            }

        }
    }

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
