import { Button, CloseButton, Dialog, Portal, NumberInput, Field, Center, InputGroup, SegmentGroup, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { toaster, Toaster } from './ui/toaster';
import formatNumber from '@/helpers/formatNumber';

export default function BuySellDialogs({ cash, stock, ownedShares }) {
    const [inputType, setInputType] = useState("Amount");
    const [inputValue, setInputValue] = useState(500 <= cash ? "500" : String(cash));
    const [maxBuyValue, setmaxBuyValue] = useState(cash);
    const [maxSellValue, setMaxSellValue] = useState(floor2(ownedShares * stock.price));
    const [isBuy, setIsBuy] = useState();

    const { revalidate } = useRevalidator();

    const buyButton = <Button onClick={() => setTimeout(handleTransaction, 30)} variant="solid" size="xl" colorPalette="green" w={32}>Buy</Button>;
    const sellButton = <Button onClick={() => setTimeout(handleTransaction, 30)} variant="solid" size="xl" colorPalette="red" w={32}>Sell</Button>;

    function handleTypeChange(newType) {
        setInputType(newType);
        const value = Number(inputValue.replace(",", ""));

        // Convert value from shares to amount
        if (newType === "Amount") {
            setmaxBuyValue(cash);
            setMaxSellValue(floor2(ownedShares * stock.price));

            let newValue = Math.round(value * stock.price * 100) / 100
            setInputValue(String(newValue));
        }
        // Convert value from amount to shares
        else if (newType === "Shares") { 
            setmaxBuyValue(Math.floor(cash / stock.price * 100) / 100);
            setMaxSellValue(ownedShares);

            let newValue = Math.round(value / stock.price * 100) / 100;
            setInputValue(String(newValue));
        }
    }

    async function handleTransaction() {
        const value = Number(inputValue.replace(",", ""));
        if (value <= 0) {
            toaster.create({
                description: "Value must be greater than 0",
                type: "error"
            });
            return;
        }

        const shares = inputType === "Shares" ? value : undefined;
        if (shares && !isBuy && shares > ownedShares) {
            toaster.create({
                description: "Not enough shares owned",
                type: "error"
            });
            return;
        }

        const amount = inputType === "Amount" ? value : undefined;
        if (amount && isBuy && amount > cash) {
            toaster.create({
                description: "Value is greater than owned cash",
                type: "error"
            });
            return;
        }

        const res = await fetch(`/api/portfolio/${isBuy? "buy" : "sell"}/${stock.symbol}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shares,
                amount
            })
        });
        const data = await res.json();
        
        if (!res.ok) {
            console.log(`Transaction failed: ${res.status} ${data.message}`);
            toaster.create({
                description: data.message,
                type: "error"
            })
            return;
        }
    
        toaster.create({
            description: "Successfully completed transaction",
            type: "success",
            duration: 6000
        });
        revalidate();
    }

    return(
        <>
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Button 
                        variant="solid" h={16} fontSize={["md", "md", "lg", "lg", "xl"]} width={[10, 14, 24, 28, 32]} 
                        onClick={() => setIsBuy(true)} colorPalette="green"
                    >
                        Buy
                    </Button>
                </Dialog.Trigger>
                <Dialog.Trigger asChild>
                    <Button 
                        variant="solid" h={16} fontSize={["md", "md", "lg", "lg", "xl"]} width={[10, 14, 24, 28, 32]} 
                        onClick={() => setIsBuy(false)} colorPalette="red"
                    >
                        Sell
                    </Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <SegmentGroup.Root value={isBuy ? "Buy" : "Sell"}
                                    onValueChange={(e) => setIsBuy(e.value === "Buy" ? true : false)}
                                    size="lg" m="auto"
                                >
                                    <SegmentGroup.Indicator w="50%" />
                                    <SegmentGroup.Items items={["Buy", "Sell"]} />
                                </SegmentGroup.Root>
                            </Dialog.Header>
                            <Dialog.Body w="60%" m="auto" textAlign="center">
                                <Stack>
                                    <Text fontSize="lg" fontWeight={500}>
                                        Owned shares: {ownedShares}
                                    </Text> 
                                    <Text fontSize="lg" fontWeight={500}>
                                        Value: ${formatNumber(floor2(ownedShares * stock.price))}
                                    </Text>
                                    <Text fontSize="lg" fontWeight={500}>
                                        Cash: ${formatNumber(floor2(cash))}
                                    </Text>
                                    <Field.Root mt={6}>
                                        <NumberInput.Root 
                                            value={inputValue} 
                                            onValueChange={(e) => setInputValue(e.value)} 
                                            min={0.01} max={isBuy ? maxBuyValue : maxSellValue}
                                            formatOptions={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }} 
                                            alignSelf="center" w="100%" size="lg"
                                        >
                                            <NumberInput.Control />
                                            <InputGroup startElement={inputType === "Amount" ? "$" : ""}>
                                                <NumberInput.Input />
                                            </InputGroup>
                                        </NumberInput.Root>
                                    </Field.Root>
                                    <SegmentGroup.Root value={inputType} 
                                        onValueChange={(e) => handleTypeChange(e.value)} 
                                        alignSelf="flex-end" size="sm"
                                    >
                                        <SegmentGroup.Indicator w="50%" />
                                        <SegmentGroup.Items items={["Amount", "Shares"]} />
                                    </SegmentGroup.Root>
                                </Stack>
                            </Dialog.Body>
                            <Center>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        {isBuy ? buyButton : sellButton}
                                    </Dialog.ActionTrigger>
                                </Dialog.Footer>
                            </Center>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
            <Toaster />
        </>
        
    );
}

function floor2(value) {
    return Math.floor(value * 100) / 100;
}