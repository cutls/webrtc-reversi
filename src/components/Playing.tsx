import { IBoard, IConfig, IState } from '@/type'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Badge, Box, Button, Container, Flex, Heading, Link, SimpleGrid, Table, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useWindowSize } from '../hooks/useWindowSize'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { reversi as check } from '@/utils/game'
interface IProps {
    config: IConfig
    board: IBoard
    placeable: IBoard
    place: (x: number, y: number) => void
    turn: 1 | 2
    iAmBlack: boolean
}
interface IBoardProps {
    i: number
    j: number
}
export default function Footer({ config, board, placeable, turn, place, iAmBlack }: IProps) {
    const { rows, showPlaceable } = config
    const isMyTurn = (turn === 1 && iAmBlack) || (turn === 2 && !iAmBlack)
    const [width] = useWindowSize()
    const screenWidth = width > 600 ? 600 : width - 20
    // ax + b(x-1) = screenWidth
    const aWidth = (screenWidth - (rows + 1) * 5) / rows
    const Board = () => {
        const elms: ReactElement[] = []
        Array.from({ length: rows }).map((_, j) => (
            Array.from({ length: rows }).map((_, i) => {
                if (!board[i] || !placeable[i]) return null
                const current = board[i][j]
                const able = !!placeable[i][j]
                const elm = <Flex key={`${i}-${j}`} h={`${aWidth}px`} w={`${aWidth}px`} bg="#36754a" justifyContent="center" alignItems="center">
                    {current > 0 && <Box h={`${aWidth * 0.8}px`} w={`${aWidth * 0.8}px`} bg={current === 1 ? '#000' : '#fff'} borderRadius={`${aWidth * 0.4}px`} />}
                    {able && <Box onTouchStart={() => place(i, j)} onClick={() => place(i, j)} h={`${aWidth * 0.8}px`} w={`${aWidth * 0.8}px`} bg={turn === 1 ? '#000' : '#fff'} opacity={showPlaceable ? 0.3 : 0} borderRadius={`${aWidth * 0.4}px`} />}
                </Flex>
                elms.push(elm)
            })
        ))
        return <>{elms}</>
    }
    return (
        <>
            <Text>{turn === 1 ? '黒' : '白'}のターン(黒: {board.flat().filter(v => v === 1).length} / 白: {board.flat().filter(v => v === 2).length})</Text>
            <SimpleGrid justifyContent="center" alignContent="center" columns={rows} spacingX="5px" spacingY="5px" width={`${screenWidth}px`} height={`${screenWidth}px`} bg="#000" padding={3}>
                <Board />
            </SimpleGrid>
            <Text>{isMyTurn ? 'あなたのターン' : '相手のターン'}(あなたは{iAmBlack ? '黒' : '白'}です)</Text>
        </>
    )
}
