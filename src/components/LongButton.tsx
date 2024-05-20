import { Button } from '@chakra-ui/react'
import { useState } from 'react'
export default function LongButton({ ...attrs }) {
    const [loading, setLoading] = useState(false)
    return (
        <Button {...attrs} isLoading={loading} onClick={() => setLoading(true)} />
    )
}
