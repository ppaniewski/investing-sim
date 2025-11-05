import { useLoaderData } from 'react-router-dom';
import { Box, Heading } from '@chakra-ui/react';
import PortfolioHeader from './PortfolioHeader';
import PortfolioList from './PortfolioList';
import PortfolioChart from './PortfolioChart';

export default function Portfolio() {
    const { stocks, stockValue, cash, snapshots } = useLoaderData();

    const stockPlaceholder = <Box w="70%" roundedBottom="md" bg="hsla(225, 17%, 20%, 1.00)" mx="auto">
        <Heading textAlign="center" py={4} px={4} size={["md", "md", "lg", "lg", "xl"]}>You don't own any stocks. Use the search bar on the left to search for stocks</Heading>
    </Box>;

    return(
        <>
            <PortfolioHeader stockValue={stockValue} cash={cash} />
            {stocks.length > 0 ? <PortfolioList stocks={stocks} pb={8} /> : stockPlaceholder}
            <PortfolioChart snapshots={snapshots} />
        </>
    );
}