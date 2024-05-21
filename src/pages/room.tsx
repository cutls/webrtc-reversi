'use client'
import Initial from '@/components/Initial'
import Playing from '@/components/Playing'
import { type IBoard, type IConfig, type IMode, IState, fullZeroBoard, getZeroBoard, initBoard, initailConfig } from '@/type'
import { isWinner, passCheck, reversi } from '@/utils/game'
import { create, join } from '@/utils/webrtc'
import { Alert, Box, AlertIcon, Container, Flex, Input, Progress, Text } from '@chakra-ui/react'
import Head from 'next/head'
import { useSearchParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

export default function Home() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [channel, setChannel] = useState<RTCDataChannel | null>(null)
    const [isMaster, setIsMaster] = useState(false)
    const [inConnect, setInConnect] = useState(false)
    const [timer, setTimer] = useState(-1)
    const [roomUrl, setRoomUrl] = useState('myRoomUrl')
    const [state, setState] = useState<IMode>('initial')
    const [config, setConfig] = useState<IConfig>(initailConfig)
    const [lastTime, setLastTime] = useState(-1)
    // 開始時、configに合わせて初期化
    const [board, setBoard] = useState<IBoard>(initBoard)
    const [placeable, setPlaceable] = useState<IBoard>(fullZeroBoard)
    const [turn, setTurn] = useState<1 | 2>(1) // 1: black, 2: white
    const iAmBlack = (isMaster && config.masterAndIsBlack) || (!isMaster && !config.masterAndIsBlack)
    const isMyTurn = (turn === 1 && iAmBlack) || (turn === 2 && !iAmBlack)
    const haveTime = config.haveTime
    const onClose = () => {
        setInConnect(false)
        alert('接続が切れました。再読み込みしてください。相手(ホスト側)が再読み込みした後に、こちら(ゲスト側)が再読み込みすると再接続できます。')
    }
    const messageProcessor = (message: any) => {
        const { type } = message
        if (type === 'start' || type === 'startMe') {
            setInConnect(true)
            setState('connected')
        }
        if (type === 'close') onClose()
        if (type === 'update') {
            const { data } = message
            console.log('update', data)
            setBoard(data.board)
            setTurn(data.turn)
        }
        if (type === 'gameStart') {
            setState('playing')
            const { data } = message
            const newPlaceable = !config.masterAndIsBlack ? passCheck(data.config.rows, data.board, getZeroBoard(data.config.rows), 2) : getZeroBoard(data.config.rows)
            setPlaceable(newPlaceable)
            setBoard(data.board)
            setTurn(data.turn)
            setConfig(data.config)
        }
        if (type === 'discarded') setState('connected')
        if (type === 'timer') setTimer(message.data.timer.timer)
    }
    const init = async () => {
        if (id) {
            try {
                const channel = await join(id, messageProcessor)
                setChannel(channel)
            } catch (e) {
                alert('参加に失敗しました')
                console.error(e)
            }
        }
    }
    const pass = (force?: boolean) => {
        if (!isMyTurn) {
            setPlaceable(getZeroBoard(config.rows))
            return
        }
        const newPlaceable = passCheck(config.rows, board, getZeroBoard(config.rows), turn)
        setPlaceable(newPlaceable)
        const isPlaceable = newPlaceable.flat().filter(v => v === 1).length > 0
        console.log(isMyTurn, force, isPlaceable, 'isPlaceable')
        if (!force && isPlaceable) return
        const nextPass = passCheck(config.rows, board, placeable, turn === 1 ? 2 : 1)
        const nextAlsoPass = nextPass.flat().filter(v => v === 1).length > 0
        if (!nextAlsoPass) {
            const winner = isWinner(config.rows, board)
            const youWon = (iAmBlack && winner === 1) || (!iAmBlack && winner === 2)
            if (winner === 0) {
                if (typeof window !== 'undefined') window.alert('引き分けです。')
            } else {
                if (typeof window !== 'undefined') alert(youWon ? 'あなたの勝ちです。' : 'あなたの負けです。')
            }
            channel?.send(JSON.stringify({ type: 'discarded' }))
            setState('connected')
            setConfig(initailConfig)
            setBoard(initBoard)
            setTurn(1)
            return
        }
        if (!force && typeof window !== 'undefined') alert('打つ手がありません。パスします。')
        if (!channel) alert('Error')
        if (channel && channel.readyState === 'open') {
            channel.send(JSON.stringify({ type: 'update', data: { board, turn: turn === 1 ? 2 : 1 } }))
            setTurn(turn === 1 ? 2 : 1)
        } else {
            onClose()
        }
    }
    useEffect(() => { init() }, [id])
    useEffect(() => pass(), [turn])

    const place = (x: number, y: number) => {
        console.log('place', x, y, turn)
        localStorage.setItem('board', JSON.stringify(board))
        localStorage.setItem('turn', turn.toString())
        const newOne = structuredClone(board)
        newOne[x][y] = turn
        const a = [-1, 0, 1]
        for (const dx of a) for (const dy of a) reversi(config.rows, x, y, dx, dy, turn, newOne, true)
        setBoard(newOne)
        setTurn(turn === 1 ? 2 : 1)
        console.log(channel)
        if (channel && channel.readyState === 'open') {
            channel.send(JSON.stringify({ type: 'update', data: { board: newOne, turn: turn === 1 ? 2 : 1 } }))
        } else {
            onClose()
        }
    }
    return (
        <>
            <Head>
                <title>2人対戦専用オセロ</title>
                <meta name="description" content="2人対戦専用オセロ" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Container p={2}>
                <Alert status={inConnect ? 'success' : 'warning'}>
                    <AlertIcon />
                    {inConnect ? '接続中' : '接続していません'}
                </Alert>
                {state === 'playing' && config.haveTime > 0 && <Flex mt={5}>
                    <Text>あと<Text as="span" style={{ fontVariantNumeric: 'tabular-nums' }}>{(timer && timer > 0) ? Math.floor(timer) : '-'}</Text>秒</Text>
                    <Box w={200} ml={2} pt={1}>
                        <Progress value={(timer && timer > 0 ? timer : 0) / config.haveTime * 100} isAnimated />
                    </Box>

                 </Flex>}
                {state === 'connected' && <Text>相手と接続しました。相手がゲームを開始するまでしばらくお待ちください。</Text>}
                {state === 'playing' && <Playing config={config} board={board} placeable={placeable} place={place} turn={turn} iAmBlack={iAmBlack} />}
            </Container>
        </>
    )
}
