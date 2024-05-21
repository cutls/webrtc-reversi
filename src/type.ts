export interface IConfig {
	rows: number
	masterAndIsBlack: boolean
	showPlaceable: boolean
	haveTime: number
}
export const initailConfig: IConfig = {
	rows: 8,
	masterAndIsBlack: true,
	showPlaceable: true,
	haveTime: -1,
}
export type IMode = 'initial' | 'connected' | 'playing' | 'finished'
export type IBoard = number[][]
export const fullZeroBoard = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
]
export const getZeroBoard = (rows: number) => {
	const boardCustomed = []
	for (let i = 0; i < rows; i++) boardCustomed.push(Array(rows).fill(0))
	return boardCustomed
}
export const initBoard = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 1, 2, 0, 0, 0],
	[0, 0, 0, 2, 1, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
]
//export const initBoard = [[1,0,0,0,0,0,0,0],[1,1,1,1,0,0,0,0],[1,2,1,1,2,1,0,0],[0,1,2,1,1,0,0,0],[2,1,2,1,1,0,0,0],[0,2,1,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
export type IState<T> = (value: React.SetStateAction<T>) => void
export interface IRTCData {
	board: IBoard
	turn: 1 | 2
}
