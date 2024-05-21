import { Box, Button, Flex, Input, InputGroup, InputLeftElement, Spinner, Text, useToast } from '@chakra-ui/react'
import { QRCodeCanvas } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { IoQrCodeOutline, IoShareOutline, IoCopyOutline } from 'react-icons/io5'
interface IProps {
	roomUrl: string
}
export default function Initial({ roomUrl }: IProps) {
	const toast = useToast()
	const [isShareable, setIsShareable] = useState(false)
	const [showQR, setShowQR] = useState(false)
	useEffect(() => {
		setIsShareable(!!navigator.share)
	}, [])
	const shareAndCopy = () => {
		isShareable ? navigator.share({ url: roomUrl, text: '2人対戦専用オセロ' }) : navigator.clipboard.writeText(roomUrl)
		if (!isShareable) toast({
			title: 'コピーしました',
			description: 'コピーしたURLを共有してください',
			status: 'success',
			duration: 3000,
			isClosable: true,
		})
	}
	return (
		<>
			<Text fontSize={22}>部屋を作る</Text>
			<Text>このURLを他の人に共有してください。</Text>
			<Flex flexWrap="wrap" justifyContent="right" mb={1}>
				<InputGroup mb={1}>
					{!roomUrl && <InputLeftElement pointerEvents='none'>
						<Spinner size="sm" color="gray" />
					</InputLeftElement>}
					<Input readOnly placeholder="しばらくお待ちください。" value={roomUrl} />
				</InputGroup>
				<Button variant="outline" size="md" isDisabled={!roomUrl} onClick={() => setShowQR(!showQR)} aria-label={showQR ? 'QRコードを隠す' : 'QRコードを表示'} leftIcon={<IoQrCodeOutline />}>
					{showQR ? 'QRコードを隠す' : 'QRコードを表示'}
				</Button>

				<Button variant="outline" size="md" ml={1} isDisabled={!roomUrl} onClick={() => shareAndCopy()} leftIcon={isShareable ? <IoShareOutline /> : <IoCopyOutline />}>
					{isShareable ? '共有' : 'コピー'}
				</Button>
			</Flex>
			{showQR && <Flex justify="right"><QRCodeCanvas value={roomUrl} /></Flex>}
			<Box h={1} />
		</>
	)
}
