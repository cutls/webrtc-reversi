import { IConfig, IState } from '@/type'
import { Button, Flex, FormControl, FormLabel, Switch, Text } from '@chakra-ui/react'
interface IProps {
    config: IConfig
    setConfig: IState<IConfig>
    start: () => void
}
export default function Footer({ config, setConfig, start }: IProps) {

    return (
        <>
            <Text mt={5} fontSize={22}>設定</Text>
            <Text mt={2} fontWeight="bold">盤面のマス目数</Text>
            <Flex align="center">
                <Button isDisabled={config.rows <= 4} onClick={() => setConfig({ ...config, rows: config.rows - 2 })}>-</Button>
                <Text w={12} textAlign="center">{config.rows}</Text>
                <Button onClick={() => setConfig({ ...config, rows: config.rows + 2 })}>+</Button>
            </Flex>
            <FormControl display="flex" alignItems="center" mt={3}>
                <Switch id="masterAndIsBlack" isChecked={config.masterAndIsBlack} onChange={(e) => setConfig({ ...config, masterAndIsBlack: !!e.target.checked })} />
                <FormLabel htmlFor="masterAndIsBlack" mb={0}>
                    主催者(あなた)が先手
                </FormLabel>
            </FormControl>
            <Text fontSize={12}>先手が黒になります。</Text>
            <FormControl display="flex" alignItems="center" mt={3}>
                <Switch id="masterAndIsBlack" isChecked={config.showPlaceable} onChange={(e) => setConfig({ ...config, masterAndIsBlack: !!e.target.checked })} />
                <FormLabel htmlFor="masterAndIsBlack" mb={0}>
                    石が置ける場所を表示
                </FormLabel>
            </FormControl>
            <Text mt={2} fontWeight="bold">持ち時間</Text>
            <Flex align="center">
                <Button isDisabled={config.haveTime <= 5} onClick={() => setConfig({ ...config, haveTime: Math.ceil(config.haveTime / 5) * 5 - 5 })}>-5秒</Button>
                <Text w={12} textAlign="center">{config.haveTime < 0 ? 'なし' : `${config.haveTime}秒`}</Text>
                <Button onClick={() => setConfig({ ...config, haveTime: Math.ceil(config.haveTime / 5) * 5 + 5 })}>+5秒</Button>
                <Button isDisabled={config.haveTime === -1} onClick={() => setConfig({ ...config, haveTime: -1 })} colorScheme="teal" ml={2}>なし(無制限)</Button>
            </Flex>
            <Button size="lg" colorScheme="blue" onClick={() => start()} mt={10}>開始</Button>
        </>
    )
}
