import '@/styles/globals.css'
import { TimerProvider } from '@/utils/timer'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
	return (
		<TimerProvider>
			<ChakraProvider>
				<Component {...pageProps} />
			</ChakraProvider>
		</TimerProvider>
	)
}
