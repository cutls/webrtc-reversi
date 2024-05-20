import { Link, type LinkProps, Spinner } from '@chakra-ui/react'
import { useState } from 'react'
export default function LongButton({ children, ...attrs }: LinkProps) {
    const [loading, setLoading] = useState(false)
    return (
        <Link {...attrs} onClick={() => setLoading(true)}>{children}{loading && <Spinner size="sm" />}</Link>
    )
}
