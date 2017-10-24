const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, sw = 480
, sh = 640
, buttons = {
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0
}
, cellW = 16
, cellH = 16

let then = Date.now()

canvas.width = sw
canvas.height = sh

stage.fillColor = 'black'
stage.fillRect(0, 0, canvas.width, canvas.height)

let currentTetra, currentField, currentTick = 0, enemies = []

document.addEventListener('keydown', ev => {
    if (ev.key === 'a') {
        if (!buttons.Left) buttons.Left = 1
    } else if (ev.key === 'd') {
        if (!buttons.Right) buttons.Right = 1
    } else if (ev.key === 's') {
        if (!buttons.Down) buttons.Down = 1
    } else if (ev.key === 'w') {
        if (!buttons.Up) buttons.Up = 1
    }
})

document.addEventListener('keyup', ev => {
    if (ev.key === 'a') {
        if (buttons.Left) buttons.Left = 0
    } else if (ev.key === 'd') {
        if (buttons.Right) buttons.Right = 0
    } else if (ev.key === 's') {
        if (buttons.Down) buttons.Down = 0
    } else if (ev.key === 'w') {
        if (buttons.Up) buttons.Up = 0
    }
})

const btn = name => name in buttons && buttons[name]

const clamp = (min, max, v) =>
      v <= min ? min : v >= max ? max : v

const grid = (w, h, fill=0) => {
    const arr = []
    for (let j = 0; j < h; j++) {
        arr.push(Array(w).fill(fill))
    }
    return arr
}

const Field = (w, h, offsetX=0, offsetY=0) => ({
    level: 0,
    lines: grid(w, h),
    w, h,
    offsetX,
    offsetY
})

const Tetra = (x, y, color='yellow') => ({
    x, y, color
})

const Enemy = (x, y, dx, dy, color='pink') => ({
    x, y, dx, dy, color, remove: false
})

const init = () => {
    currentField = Field(18, 28, 30)
    currentTetra = Tetra(3, 3)
    enemies.push(Enemy(0, 0, 1, 1, 'hotpink'))
    enemies.push(Enemy(10, 0, -1, 1, 'blue'))
}

const update = dt => {
    let dx = 0, dy = 0
    if (btn('Left')) dx = -1
    if (btn('Right')) dx = 1
    if (btn('Up')) dy = -1
    if (btn('Down')) dy = 1
    currentTetra.x = clamp(0, currentField.w - 1, currentTetra.x + dx)
    currentTetra.y = clamp(0, currentField.h - 1, currentTetra.y + dy)
    if (currentTick >= 0.75) {
        for (const enemy of enemies) {
            enemy.x += enemy.dx
            enemy.y += enemy.dy
            if (enemy.x < 0 ||
                enemy.x > currentField.w - 1 ||
                enemy.y < 0 ||
                enemy.y > currentField.h - 1)
                enemy.remove = true
        }
        currentTick = 0
    }
    console.log(enemies)
    enemies = enemies.filter(e => e.remove === false)
    currentTick += dt
}

const render = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, sw, sh)
    for (let j = 0; j < currentField.h; j++) {
        for (let i = 0; i < currentField.w; i++) {
            stage.fillStyle = '#333'
            stage.fillRect((i * (cellW + 2)) + currentField.offsetX,
                           (j * (cellH + 2)) + currentField.offsetY,
                           cellW, cellH)
        }
    }
    for (let j = 0; j < currentField.h; j++) {
        for (let i = 0; i < currentField.w; i++) {
            if (i === currentTetra.x && j === currentTetra.y) {
                stage.fillStyle = currentTetra.color
                const cellX = (i * (cellW + 2)) + currentField.offsetX
                , cellY = (j * (cellH + 2)) + currentField.offsetY
                stage.fillRect(cellX + 2, cellY + 2,
                               cellW - 4, cellH - 4)
            }
        }
    }
    for (const enemy of enemies) {
        const cellX = (enemy.x * (cellW + 2)) + currentField.offsetX
        , cellY = (enemy.y * (cellH + 2)) + currentField.offsetY
        stage.fillStyle = enemy.color
        stage.fillRect(cellX + 2, cellY + 2,
                       cellW - 4, cellH - 4)
    }
}

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
