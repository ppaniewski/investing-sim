import { Heading, Stack, Center } from '@chakra-ui/react';
import formatNumber from '@/helpers/formatNumber';

export default function PortfolioHeader({ stockValue, cash }) {
    const headingStyles = {
        size: ["md", "lg", "xl", "2xl", "3xl"],
        fontWeight: "bold",
        color: "teal.400"
    };

    const smallHeadingStyles = {
        size: ["sm", "sm", "md", "lg"]
    };

    return(
        <Center 
            gap={[2, 2, 2, 4, 8]} pr={0} py={2} mx="auto" mt={4} w="70%" userSelect="none" 
            bg="hsla(225, 17%, 20%, 1.00)" roundedTop="lg"
            borderBottom="solid 2px hsla(223, 13%, 12%, 0.7)"
        >
            <Stack gap={0}>
                <Center>
                    <Heading {...headingStyles}>${formatNumber(round2(stockValue))}</Heading>
                </Center>
                <Center>
                    <Heading {...smallHeadingStyles}>Stocks</Heading>
                </Center>
            </Stack>
            <Center>
                <Heading size={["md", "lg", "xl", "3xl", "3xl"]}>+</Heading>
            </Center>
            <Stack gap={0}>
                <Center>
                    <Heading {...headingStyles}>${formatNumber(round2(cash))}</Heading>
                </Center>
                <Center>
                    <Heading {...smallHeadingStyles}>Cash</Heading>
                </Center>
            </Stack>
            <Center>
                <Heading size={["md", "lg", "xl", "3xl", "4xl"]}>=</Heading>
            </Center>    
            <Stack gap={0}>
                <Center>
                    <Heading {...headingStyles}>${formatNumber(round2(stockValue + cash))}</Heading>
                </Center>
                <Center>
                    <Heading {...smallHeadingStyles}>Total</Heading>
                </Center>
            </Stack>
        </Center>
    );
}

function round2(value) {
    return Math.round(value * 100) / 100;
}