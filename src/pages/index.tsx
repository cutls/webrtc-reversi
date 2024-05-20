'use client'
import Config from '@/components/Config'
import Initial from '@/components/Initial'
import Playing from '@/components/Playing'
import { IBoard, IConfig, IMode, IState, fullZeroBoard, getZeroBoard, initBoard, initailConfig } from '@/type'
import { isWinner, passCheck, reversi } from '@/utils/game'
import { TimerContext } from '@/utils/timer'
import { create, join } from '@/utils/webrtc'
import { Alert, Box, AlertIcon, Container, Flex, Input, Progress, Text, Button } from '@chakra-ui/react'
import { clear } from 'console'
import Head from 'next/head'
import { useSearchParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

export default function Home() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [channel, setChannel] = useState<RTCDataChannel | null>(null)
  const [isMaster, setIsMaster] = useState(true)
  const [inConnect, setInConnect] = useState(false)
  const [roomUrl, setRoomUrl] = useState('')
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
  const timer = useContext(TimerContext)
  const onClose = () => {
    setInConnect(false)
    alert('接続が切れました。再読み込みしてください。こちら(ホスト側)が再読み込みした後に、相手(ゲスト側)が再読み込みすると再接続できます。')
  }
  const messageProcessor = (message: any) => {
    const { type } = message
    if (type === 'start' || type === 'startMe') {
      setInConnect(true)
      setState('connected')
    }
    if (type === 'close') onClose()
    if (type === 'discarded') setState('connected')
    if (type === 'update') {
      const { data } = message
      console.log('update', data)
      setBoard(data.board)
      setTurn(data.turn)
      timer?.cancelTimer()
    }
  }
  const init = async () => {
    console.log('create', id)
    try {
      const [uuid, channel] = await create(messageProcessor)
      setChannel(channel)
      setRoomUrl(`${location.origin}/room?id=${uuid}`)
    } catch (e) {
      alert('接続失敗しました')
      console.error(e)
    }
  }
  const pass = (force?: boolean) => {
    timer?.cancelTimer()
    if (haveTime > 0) setTimeout(() => timer?.setTimer(haveTime), 100)
    if (!isMyTurn) {
      setPlaceable(getZeroBoard(config.rows))
      if (force) {
        if (channel && channel.readyState === 'open') {
          localStorage.setItem('last', JSON.stringify({ board, turn: turn === 1 ? 2 : 1 }))
          setTurn(turn === 1 ? 2 : 1)
          channel.send(JSON.stringify({ type: 'update', data: { board, turn: turn === 1 ? 2 : 1 } }))
        } else {
          onClose()
        }
      }
      return
    }
    const newPlaceable = passCheck(config.rows, board, getZeroBoard(config.rows), turn)
    setPlaceable(newPlaceable)
    const isPlaceable = newPlaceable.flat().filter(v => v === 1).length > 0
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
      setState('connected')
      channel?.send(JSON.stringify({ type: 'discarded' }))
      setConfig(initailConfig)
      setBoard(initBoard)
      setTurn(1)
      return
    }
    if (!force && typeof window !== 'undefined') alert('打つ手がありません。パスします。')
    if (channel && channel.readyState === 'open') {
      localStorage.setItem('last', JSON.stringify({ board, turn: turn === 1 ? 2 : 1 }))
      setTurn(turn === 1 ? 2 : 1)
      channel.send(JSON.stringify({ type: 'update', data: { board, turn: turn === 1 ? 2 : 1 } }))
    } else {
      onClose()
    }
  }
  useEffect(() => { init() }, [id])
  useEffect(() => pass(), [turn])
  useEffect(() => {
    //console.log(timer?.timer)
    if (timer?.timer === 0) pass(true)
    channel?.send(JSON.stringify({ type: 'timer', data: { timer } }))
  }, [timer])

  const place = (x: number, y: number) => {
    console.log('place', x, y, turn)
    localStorage.setItem('board', JSON.stringify(board))
    localStorage.setItem('turn', turn.toString())
    const newOne = structuredClone(board)
    newOne[x][y] = turn
    const a = [-1, 0, 1]
    for (let dx of a) for (let dy of a) reversi(config.rows, x, y, dx, dy, turn, newOne, true)
    setBoard(newOne)
    setTurn(turn === 1 ? 2 : 1)
    timer?.cancelTimer()
    if (channel && channel.readyState === 'open') {
      localStorage.setItem('last', JSON.stringify({ board, turn: turn === 1 ? 2 : 1 }))
      channel.send(JSON.stringify({ type: 'update', data: { board: newOne, turn: turn === 1 ? 2 : 1 } }))
    } else {
      onClose()
    }
  }
  const start = () => {
    if (channel && channel.readyState === 'open') {
      const rows = config.rows
      const boardCustomed = getZeroBoard(rows)
      const newTurn = 1
      boardCustomed[rows / 2 - 1][rows / 2 - 1] = 1
      boardCustomed[rows / 2][rows / 2] = 1
      boardCustomed[rows / 2 - 1][rows / 2] = 2
      boardCustomed[rows / 2][rows / 2 - 1] = 2
      const newPlaceable = config.masterAndIsBlack ? passCheck(rows, boardCustomed, getZeroBoard(config.rows), 1) : getZeroBoard(config.rows)
      setBoard(boardCustomed)
      setPlaceable(newPlaceable)
      setState('playing')
      channel.send(JSON.stringify({ type: 'gameStart', data: { config, board: boardCustomed, turn: newTurn } }))
    } else {
      onClose()
    }
  }
  const discard = () => {
    channel?.send(JSON.stringify({ type: 'discarded' }))
    setState('connected')
  }
  return (
    <>
      <Head>
        <title>2人対戦専用オセロ</title>
        <meta name="description" content="2人対戦専用オセロ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Container p={2}>
        {state === 'initial' && <Initial roomUrl={roomUrl} />}
        <Alert status={inConnect ? 'success' : 'warning'}>
          <AlertIcon />
          {inConnect ? '接続中' : '接続していません'}
        </Alert>
        {config.haveTime > 0 && state === 'playing' && <Flex mt={5}>
          <Text>あと<Text as="span" style={{ fontVariantNumeric: 'tabular-nums' }}>{(timer?.timer && timer?.timer > 0) ? Math.floor(timer?.timer) : '-'}</Text>秒</Text>
          <Box w={200} ml={2} pt={1}>
            <Progress value={(timer?.timer && timer?.timer > 0 ? timer?.timer : 0) / config.haveTime * 100} />
          </Box>

        </Flex>}

        {state === 'connected' && <Config config={config} setConfig={setConfig} start={start} />}
        {state === 'playing' && <Playing config={config} board={board} placeable={placeable} place={place} turn={turn} iAmBlack={iAmBlack} />}
        {state === 'playing' && <Button onClick={() => discard()}>終了</Button>}

      </Container>
    </>
  )
}
