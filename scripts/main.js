'use strict'

const config = {
  difficulty: 0
}
const canvasElement = document.getElementById('canvas')
const canvas = canvasElement.getContext("2d")
const squaresPerRow = 10 * (config.difficulty + 1)
const squareHeight = canvasElement.height / squaresPerRow
const squareWidth = canvasElement.width / squaresPerRow
const squareCount = canvasElement.height / squareHeight * canvasElement.width / squareWidth
const flagImg = new Image()
const mineImg = new Image()

let xPos = null
let yPos = null
let squares = [[]]
let mineSquares = []
let openSquares = 0

class Square {
  constructor(posX, posY, height, width) {
    this.posX = posX
    this.posY = posY
    this.height = height
    this.width = width
    this.state = 0
    this.mine = false
    this.open = false
  }

  static STATE_NONE = 0x0000
  static STATE_HOVERED = 0x0001
  static STATE_CLICKED = 0x0002
  static STATE_OPEN = 0x0004
  static STATE_FLAG = 0x0008

  getMineNum() {
    let count = 0
    let i = this.posY === 0 ? 0 : -1, j = this.posX === 0 ? 0 : -1
    let maxX = this.posX + this.width === canvasElement.width ? 1 : 2
    let maxY = this.posY + this.height === canvasElement.height ? 1 : 2
    for (; i < maxY; i++) {
      j = this.posX === 0 ? 0 : -1
      for (; j < maxX; j++) {
        let square = getSquare(this.posX + j * squareWidth, this.posY + i * squareHeight)
        if (!square || !square.mine)
          continue
        ++count
      }
    }
    return count
  }

  draw() {
    let brightW = this.width * 0.1
    let brightH = this.height * 0.1

    canvas.fillStyle = '#cccccc'
    canvas.fillRect(this.posX, this.posY, this.width, this.height)

    canvas.fillStyle = '#efefef'
    canvas.fillRect(this.posX, this.posY, this.width, brightH)
    canvas.fillRect(this.posX, this.posY, brightW, this.height)

    canvas.fillStyle = '#0000001a'
    canvas.fillRect(this.posX, this.posY + this.height - brightH, this.width, brightH)
    canvas.fillRect(this.posX + this.width - brightW, this.posY, brightW, this.height - brightH)

    if (this.state & Square.STATE_HOVERED) {
      canvas.fillStyle = '#d8d8d8'
      canvas.fillRect(this.posX + brightW, this.posY + brightH, this.height - 2 * brightH, this.width - 2 * brightH)
    }

    if (this.state & Square.STATE_CLICKED) {
      canvas.fillStyle = '#cccccc'
      canvas.fillRect(this.posX + brightW, this.posY + brightH, this.height - brightH, this.width - brightW)
    }

    if ((this.state & Square.STATE_CLICKED) && (this.state & Square.STATE_OPEN) && this.mine) {
      canvas.fillStyle = '#f03030'
      canvas.fillRect(this.posX, this.posY, this.width, this.height)
    }

    if (this.state & Square.STATE_OPEN) {
      if (this.state & Square.STATE_FLAG)
        this.state &= ~Square.STATE_FLAG

      if (this.mine) {
        canvas.fillStyle = '#f03030'
        canvas.fillRect(this.posX, this.posY, this.width, this.height)
        canvas.drawImage(mineImg,
          this.posX + (this.width - mineImg.width) / 2,
          this.posY + (this.height - mineImg.height) / 2)
      }
      else {
        canvas.fillStyle = '#cccccc'
        canvas.fillRect(this.posX, this.posY, this.width, this.height)
        canvas.strokeStyle = '#000000'
        canvas.lineWidth = 0.1
        canvas.strokeRect(this.posX, this.posY, this.width, this.height)

        let num = this.getMineNum()
        if (num === 0) {
          let i = this.posY === 0 ? 0 : -1, j = this.posX === 0 ? 0 : -1
          let maxX = this.posX + this.width === canvasElement.width ? 1 : 2
          let maxY = this.posY + this.height === canvasElement.height ? 1 : 2
          for (; i < maxY; i++) {
            j = this.posX === 0 ? 0 : -1
            for (; j < maxX; j++) {
              let square = getSquare(this.posX + j * squareWidth, this.posY + i * squareHeight)
              if (!square)
                continue
              if (square.state !== (square.state |= Square.STATE_OPEN)) {
                openSquares++
                square.draw()
              }
            }
          }
        }
        else {
          switch (num) {
            case 1:
              canvas.fillStyle = "#0000ff"
              break

            case 2:
              canvas.fillStyle = "#22ff22"
              break

            case 3:
              canvas.fillStyle = "#ff0000"
              break

            case 4:
              canvas.fillStyle = "#000088"
              break

            case 5:
              canvas.fillStyle = "#880000"
              break

            case 6:
              canvas.fillStyle = "#008800"
              break

            case 7:
              canvas.fillStyle = "#880088"
              break

            case 8:
              canvas.fillStyle = "#000000"
              break
          }
          canvas.font = String(squareHeight - 0.1 * squareHeight) + "px Arial"
          canvas.textAlign = "center"
          canvas.textBaseline = "middle"
          canvas.fillText(num, this.posX + this.width / 2, this.posY + this.height / 2)
        }
      }
    }

    if (this.state & Square.STATE_FLAG) {
      canvas.drawImage(flagImg,
        this.posX + (this.width - flagImg.width) / 2,
        this.posY + (this.height - flagImg.height) / 2
      )
    }
  }
}

function init() {
  canvasElement.removeEventListener('mousedown', init)
  squares = [[]]
  mineSquares = []
  openSquares = 0
  let row = 0, col = 0
  for (; row < squaresPerRow; row++) {
    col = 0
    for (; col < squaresPerRow; col++) {
      if (!squares[row])
        squares.push([])
      squares[row][col] = new Square(squareWidth * col, squareHeight * row, squareHeight, squareWidth)
      squares[row][col].draw()
    }
  }
  let mines = squaresPerRow
  while (mines > 0) {
    let x = Math.floor(Math.random() * canvasElement.width)
    let y = Math.floor(Math.random() * canvasElement.height)
    let square = getSquare(x, y)
    if (!square.mine) {
      square.mine = true
      mineSquares.push({ x: square.posX, y: square.posY })
      --mines
    }
  }

  canvasElement.addEventListener('mousemove', canvasMouseMove)
  canvasElement.addEventListener('mouseleave', canvasMouseLeave)
  canvasElement.addEventListener('mousedown', canvasMouseDown)
  canvasElement.addEventListener('mouseup', canvasMouseUp)
  canvasElement.addEventListener('contextmenu', e => e.preventDefault())
}

function getSquare(x, y) {
  let row = Math.floor(y / squareHeight)
  let col = Math.floor(x / squareWidth)
  let square = squares[row][col]
  return square
}

function end(didLose) {
  let text = 'GG!'
  if (didLose) {
    for (let i = 0; i < mineSquares.length; i++) {
      let square = getSquare(mineSquares[i].x, mineSquares[i].y)
      square.state |= Square.STATE_OPEN
      square.draw()
    }
    text = 'Game over!'
  }
  canvas.fillStyle = '#0000001a'
  canvas.fillRect(0, 0, canvasElement.width, canvasElement.height)

  canvas.textAlign = 'center'
  canvas.textBaseline = 'middle'
  canvas.font = `bold ${canvasElement.height * 0.15}px Arial`
  canvas.fillStyle = '#fff'
  canvas.strokeStyle = '#000'
  canvas.lineWidth = canvasElement.height * 0.15 * 0.03
  canvas.fillText(text, canvasElement.width / 2, canvasElement.height / 2)
  canvas.strokeText(text, canvasElement.width / 2, canvasElement.height / 2)

  canvasElement.removeEventListener('mousemove', canvasMouseMove)
  canvasElement.removeEventListener('mouseleave', canvasMouseLeave)
  canvasElement.removeEventListener('mousedown', canvasMouseDown)
  canvasElement.removeEventListener('mouseup', canvasMouseUp)
  canvasElement.addEventListener('mousedown', init)
}

function canvasMouseMove(e) {
  if (e.buttons != 0)
    return;
  let square = getSquare(e.offsetX, e.offsetY)
  let prevSquare = (xPos > 0 && yPos > 0) ? getSquare(xPos, yPos) : null

  if (prevSquare && square.posX === prevSquare.posX && square.posY === prevSquare.posY)
    return

  if (!(square.state & Square.STATE_OPEN) && square.state !== (square.state |= Square.STATE_HOVERED)) {
    square.draw()
  }

  if (prevSquare && prevSquare.state !== (prevSquare.state &= ~Square.STATE_HOVERED)) {
    prevSquare.draw()
  }
  xPos = e.offsetX
  yPos = e.offsetY
}

function canvasMouseLeave(e) {
  let prevSquare = getSquare(xPos, yPos)
  if (prevSquare.state & Square.STATE_OPEN)
    return
  if (prevSquare.state !== (prevSquare.state &= ~(Square.STATE_HOVERED | Square.STATE_CLICKED))) {
    prevSquare.draw()
  }
  xPos = null
  yPos = null
}

function canvasMouseDown(e) {
  let square = getSquare(e.offsetX, e.offsetY)
  if (square.state & Square.STATE_OPEN)
    return
  square.state |= Square.STATE_CLICKED
  square.draw()
  xPos = square.posX
  yPos = square.posY
}

function canvasMouseUp(e) {
  let square = getSquare(xPos, yPos)
  let square2 = getSquare(e.offsetX, e.offsetY)
  if (square.posX === square2.posX && square2.posY === square.posY) {
    if (square.state & Square.STATE_OPEN) return
    if (e.button === 2) {
      square.state & Square.STATE_FLAG ? square.state &= ~Square.STATE_FLAG : square.state |= Square.STATE_FLAG
    }
    else if (!(square.state & Square.STATE_FLAG)) {
      if (square.mine) {
        end(true)
        return
      }
      else {
        square.state |= Square.STATE_OPEN
        openSquares++
      }
    }
  }
  square.state &= ~Square.STATE_CLICKED
  square.draw()
  if (openSquares >= squareCount - mineSquares.length)
    end(false)
}

canvasElement.style.userSelect = 'none'

window.addEventListener('DOMContentLoaded', e => {
  let flagLoaded = false
  let mineLoaded = false
  flagImg.src = 'assets/flag.png'
  mineImg.src = 'assets/mine.png'

  flagImg.addEventListener('load', () => {
    flagLoaded = true
    if (mineLoaded) {
      init()
    }
  })
  mineImg.addEventListener('load', () => {
    mineLoaded = true
    if (flagLoaded) {
      init()
    }
  })
})
