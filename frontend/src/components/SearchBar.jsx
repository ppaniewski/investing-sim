import { Input, Stack, Heading, Flex, InputGroup } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import { AppDataContext } from "./AppDataProvider";
import { Link, useLocation } from "react-router-dom";

export default function SearchBar() {
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const stocks = useContext(AppDataContext);
    
    const location = useLocation();

    useEffect(() => {
        setSearchValue("");
        setIsFocused(false);
    }, [location]);
    
    let count = 0;
    const filteredStocks = stocks.filter(stock => {
        // Limit results to 10 stocks
        if (count >= 6) {
            return false;
        }

        // Skip all stocks if search is empty
        if (searchValue === "") {
            return false;
        }

        // Include stock if its symbol or name starts with the search value
        if (stock.symbol.toLowerCase().startsWith(searchValue.toLowerCase()) || 
            stock.name.toLowerCase().startsWith(searchValue.toLowerCase())) {
            count++;
            return true;
        }

        return false;
    });

    const searchStockList = filteredStocks.map(stock => 
        <Link to={`../stocks/${stock.symbol}`} key={stock.symbol}>
            <Flex key={stock.symbol}
                gap={2} bg="gray.800" alignItems="center" 
                p={4} borderRadius={2} _hover={{ bg: "gray.900" }}
                boxShadow="0px 0px 4px #000000ff"
            >
                <Heading size="md">{stock.symbol}</Heading>
                <Heading size="md">|</Heading>
                <Heading size="sm">{stock.name}</Heading>
            </Flex>
        </Link>
    );

    return(
        <Stack gap={0} alignItems="center" w="100%">
            <InputGroup startElement={<FaSearch />} w="80%">
                <Input 
                    value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search" variant="subtle"
                    size="xl" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                    bg="gray.900" _focus={{ outline: "none" }} borderWidth={0} 
                />
            </InputGroup>
            <Stack w="78.5%" gap={0}>
                {isFocused? searchStockList : searchStockList}
            </Stack>
        </Stack>
    );
}