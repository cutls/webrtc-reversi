import React, { useLayoutEffect, useState } from 'react'

export const useWindowSize = (): number[] => {
  const [size, setSize] = useState([300, 300])
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight])
    }

    window.addEventListener('resize', updateSize)
    updateSize()

    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

