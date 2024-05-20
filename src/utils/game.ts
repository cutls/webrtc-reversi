import { IBoard } from "@/type"

export const reversi = (rows: number, x: number, y: number, dx: number, dy: number, target: 1 | 2, board: IBoard, putMode?: boolean) => { // target: myColor
    if (dx === 0 && dy === 0) return false
    let d = 0
    let puttAble = false
    for (let i = x + dx, j = y + dy; i >= 0 && j >= 0 && i < rows && j < rows; i += dx, j += dy) {
        if (board[i][j] === 0) return false
        if (board[i][j] !== target) d++
        if (board[i][j] === target) {
            if (!putMode && d > 0) return [x, y]
            puttAble = true
            break
        }
    }
    if (puttAble && putMode && d > 0) for (let t = 0; t <= d; t++) board[x + dx * t][y + dy * t] = target
    return false
}

export const isWinner = (rows: number, board: IBoard) => {
    const black = board.flat().filter(v => v === 1).length
    const white = board.flat().filter(v => v === 2).length
    if (black > white) return 1
    if (black < white) return 2
    return 0
}
export const passCheck = (rows: number, board: IBoard, placeableOld: IBoard, target: 1 | 2) => {
    const placeable = structuredClone(placeableOld)
    const a = [-1, 0, 1]
    for (let i = 0; i < rows; i++) for (let j = 0; j < rows; j++) for (let x of a) for (let y of a) if (!board[i][j] && reversi(rows, i, j, x, y, target, board)) placeable[i][j] = 1
    return placeable
}
