import type React from 'react'
import { type ReactNode, createContext, useState } from 'react'

export interface TimerContextType {
	timer: number
	setTimer: (sec: number) => void
	cancelTimer: () => void
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined)

export interface TimerProviderProps {
	children: ReactNode
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
	const [lastTime, setLastTime] = useState(-1)
	const [timerNum, setTimerNum] = useState(-1)
	let timer: NodeJS.Timeout | null = null
	const setTimer = (sec: number) => {
		const useSec = sec * 1000
		if (timerNum > 0) {
			clearInterval(timerNum)
		}
		setLastTime(sec)
		let internal = useSec
		timer = setInterval(() => {
			internal = internal - 1000
			setLastTime(internal / 1000)
			if (internal < 0 && timer) {
				clearInterval(timer)
			}
		}, 1000)
		setTimerNum(timer as any)
	}
	const cancelTimer = () => {
		const maxId: any = setTimeout(() => {}, 0)
		for (let i = 0; i < maxId; i += 1) {
			clearTimeout(i)
		}
	}
	const cancelATimer = () => {
		if (timerNum > 0) {
			clearInterval(timerNum)
		}
	}

	return <TimerContext.Provider value={{ timer: lastTime, setTimer, cancelTimer }}>{children}</TimerContext.Provider>
}
