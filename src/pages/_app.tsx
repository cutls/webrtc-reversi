import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { TimerProvider } from '@/utils/timer'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <TimerProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </TimerProvider>
  )
}
