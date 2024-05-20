import { Flex, Text, Input, Button, InputGroup, InputRightElement } from '@chakra-ui/react'
import { QRCodeCanvas } from 'qrcode.react'
import { useState, useEffect } from 'react'
interface IProps {
    roomUrl: string
}
export default function Initial({ roomUrl }: IProps) {
    const [isShareable, setIsShareable] = useState(false)
    const [showQR, setShowQR] = useState(false)
    useEffect(() => {
        setIsShareable(!!navigator.share)
    }, [])
    return (
        <>
            <Text fontSize={22}>部屋を作る</Text>
            <Text>このURLを他の人に共有してください。</Text>
            <InputGroup size='md'>
                <Input readOnly placeholder="部屋名" value={roomUrl} />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={() => isShareable ? navigator.share({ url: roomUrl, text: '2人対戦専用オセロ' }) : navigator.clipboard.writeText(roomUrl)}>
                        {isShareable ? '共有' : 'コピー'}
                    </Button>
                </InputRightElement>
            </InputGroup>
            <Button mb={1} variant="ghost" onClick={() => setShowQR(!showQR)}>{showQR ? 'QRコードを隠す' : 'QRコードを表示'}</Button>
            {showQR && <QRCodeCanvas value={roomUrl} />}
        </>


    )
}
