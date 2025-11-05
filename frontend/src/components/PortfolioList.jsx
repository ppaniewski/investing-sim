import { Center, Stack, Flex, Heading, Image, Icon, Grid, Text, For } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { VscTriangleDown, VscTriangleUp } from 'react-icons/vsc';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import formatNumber from '@/helpers/formatNumber';
import SortTag from './SortTag';

export default function PortfolioList({ stocks, ...chakraProps }) {
    const [sortMetric, setSortMetric] = useState("Value");
    const [sortAscending, setSortAscending] = useState(false);

    const triangle = sortAscending ? <TbTriangleFilled /> : <TbTriangleInvertedFilled />;
    const icon = <Icon size="xs">
        {triangle}
    </Icon>;

    const headingStyles = {
        size: ["sm", "sm", "md", "lg", "xl"]
    };

    const listColumns = {
        templateColumns: "16% 20% 16% 20% 22%",
        gap: "1.5%"
    };

    // Sort stocks based on selected metric
    const sortedStocks = getSortedStocks(stocks, sortMetric, sortAscending);

    const stockRenderList = sortedStocks.map(stock => {
        return (
            <Link to={`/stocks/${stock.symbol}`} key={stock.symbol}>
                <Flex py={4} pl={[2, 2, 2, 4, 4]} pr={[4, 4, 4, 6, 6]} rounded="lg" bg="hsla(240, 6%, 10%, 1.00)" align="center" gap={0} _hover={{ bg: "hsla(240, 2%, 5%, 1.00)" }}>

                    {/* Stock image and symbol */}
                    <Flex align="center" gap={6} w="25%"> 
                        <Image w={[6, 8, 10, 12, 14]} rounded="md" src={`https://cdn.jsdelivr.net/gh/nvstly/icons@main/ticker_icons/${stock.symbol.replace("-","")}.png`} 
                            onError={(e) => {
                                if (e.target.dataset.fallback === "1") {
                                    e.target.onerror = null;
                                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/e/e3/Feather-core-trending-up.svg";
                                } else {
                                    e.target.dataset.fallback = "1";
                                    e.target.src = `https://cdn.jsdelivr.net/gh/davidepalazzo/ticker-logos@main/ticker_icons/${stock.symbol.replace("-","")}.png`;
                                }
                            }}
                        />
                        <Stack w="75%">
                            <Heading {...headingStyles}>{stock.symbol}</Heading>
                            <Text fontSize={[12, 12, 12, 14, 14]} fontWeight="normal">{stock.name}</Text>
                        </Stack>
                    </Flex>

                    {/* Stock info */}
                    <Grid w="75%" textAlign="right" {...listColumns}>
                        <Heading {...headingStyles}>${stock.price}</Heading>
                        <Heading {...headingStyles}>${formatNumber(floor2(stock.price * stock.shares))}</Heading>
                        <Heading {...headingStyles}>{stock.shares}</Heading>
                        <Heading
                            {...headingStyles}
                            color = {stock.profit > 0 ? "green.400" : (stock.profit < 0 ? "red.500" : "")}
                        >
                            {stock.profit > 0 ? "+" : (stock.profit < 0 ? "-" : "")}${formatNumber(stock.profit).replace("-", "")}</Heading>
                        <Heading size={["xs", "xs", "sm", "md", "lg"]}>${formatNumber(Math.floor(stock.volume * stock.price))}</Heading>
                    </Grid>
                </Flex>
            </Link> 
        );
    });

    return(
        <>
            <Center {...chakraProps}>
                <Stack w="85%" gap={3} p={4} bg="hsla(225, 17%, 20%, 1.00)" rounded="xl">

                    {/* Sorting headers */}
                    <Flex pl={4} pr={6} gap={0}>
                        <Flex w="25%" textAlign="left">
                            <SortTag name="Symbol" sortMetrics={[sortMetric, setSortMetric]} setSortAscending={setSortAscending} icon={icon} />
                        </Flex>
                        <Grid w="75%" textAlign="right" {...listColumns}>
                            <For each={["Price", "Value", "Shares", "P/L", "Volume"]}>
                                {(item, index) => <SortTag name={item} key={index} sortMetrics={[sortMetric, setSortMetric]} setSortAscending={setSortAscending} icon={icon} />}
                            </For>
                        </Grid>
                    </Flex>
                    
                    {stockRenderList}
                </Stack>
            </Center>
        </>
    );
}

const getSortedStocks = (stocks, sortMetric, sortAscending) => {
    return stocks.sort((a, b) => {
        let valueA, valueB;
        if (sortMetric === "Symbol") {
            valueA = a.symbol;
            valueB = b.symbol;

            if (!sortAscending) {
                return valueA.localeCompare(valueB);
            }
            else {
                return valueB.localeCompare(valueA);
            }
        }
        else if (sortMetric === "Price") {
            valueA = a.price;
            valueB = b.price;
        }
        else if (sortMetric === "Value") {
            valueA = floor2(a.price * a.shares);
            valueB = floor2(b.price * b.shares);
        }
        else if (sortMetric === "Shares") {
            valueA = a.shares;
            valueB = b.shares;
        }
        else if (sortMetric === "P/L") {
            valueA = a.profit;
            valueB = b.profit;
        }
        else if (sortMetric === "Volume") {
            valueA = floor2(a.volume * a.price);
            valueB = floor2(b.volume * b.price);
        }

        if (sortAscending) {
            return valueA - valueB;
        }
        else {
            return valueB - valueA;
        }
    }); 
};

const floor2 = (value) => Math.floor(value * 100) / 100;