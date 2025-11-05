import { useLoaderData } from 'react-router-dom';
import { Stack, Flex, Heading, Image, Spinner, Center } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import BuySellDialogs from './BuySellDialogs';
import StockChart from './StockChart';

export default function StockPage() {
    const { stock, ownedShares, cash } = useLoaderData();

    const { data, isLoading, error } = useQuery({
        queryKey: [`history/${stock.symbol}`],
        queryFn: async () => {

            // Get stock history
            const res = await fetch(`/api/stocks/history?stock=${stock.symbol}`);
            if (!res.ok) {
                throw new Error("Failed to load stock history");
            }

            const json = await res.json();
            // console.log("Stock history fetched");
            return json;
        },
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false
    });

    const chartSpinner = <Center pt={40}>
        <Spinner size="xl" color="teal.400" borderWidth="4px" />    
    </Center>;

    const priceChange = floor2((stock.price / stock.openPrice - 1) * 100);
    const priceChangeSign = priceChange > 0 ? "+" : "";
    const priceChangeColor = priceChange > 0 ? "green.500" : (priceChange < 0 ? "red.500" : "gray.500");

    return(
        <>
            <Flex w="80%" gap={8} align="center" m="auto" bg="hsla(225, 17%, 20%, 1.00)" rounded="md" justifyContent="space-between" p={4} mt={6}>
                <Flex align="center" gap={2}> 
                    <Image w={[12, 16, 20, 24, 24]} p={4} rounded="md" bg="gray.900" src={`https://cdn.jsdelivr.net/gh/davidepalazzo/ticker-logos@main/ticker_icons/${stock.symbol.replace("-","")}.png`} 
                        onError={(e) => {
                            if (e.target.dataset.fallback === "1") {
                                e.target.onerror = null;
                                e.target.src = "https://upload.wikimedia.org/wikipedia/commons/e/e3/Feather-core-trending-up.svg";
                            } else {
                                e.target.dataset.fallback = "1";
                                e.target.src = `https://cdn.jsdelivr.net/gh/nvstly/icons@main/ticker_icons/${stock.symbol.replace("-","")}.png`;
                            }
                        }}
                    />
                    <Stack pl={2} pr={[2, 2, 2, 2, 4]} maxW={[20, 20, 24, 28, 32]}>
                        <Heading size={["md", "lg", "xl", "2xl", "2xl"]}>{stock.symbol}</Heading>
                        <Heading size="sm" fontWeight="normal" textWrap="pretty">{stock.name}</Heading>
                    </Stack>
                    <Stack
                        direction={["column", "column", "column", "column", "row"]}
                        alignItems={["flex-start", "flex-start", "flex-start", "flex-start", "center"]}
                    >
                        <Heading size={["lg", "xl", "2xl", "2xl", "3xl"]}>{stock.price}</Heading>
                        <Heading size={["sm", "md", "lg", "xl", "2xl"]} color={priceChangeColor}>{priceChangeSign}{priceChange}%</Heading>
                    </Stack>
                </Flex>
                <Flex gap={[2, 2, 3, 4, 4]} pr={[4, 4, 4, 4, 10]}>
                    <BuySellDialogs cash={cash} stock={stock} ownedShares={ownedShares} />
                </Flex>
            </Flex>
            
            {data ? <StockChart history={data} /> : chartSpinner}
        </>
    );
}

function floor2(value) {
    return Math.floor(value * 100) / 100;
}