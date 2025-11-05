import { Box, Stack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function SideBar({ w }) {
    const navigate = useNavigate();

    return(
        <Box pos="fixed" zIndex={9} pt={28} bg="hsla(225, 17%, 18%, 1.00)" w={w} h="100%">
            <Stack alignItems="center" gap={4}>
                <Button w="80%" 
                    onClick={() => navigate("/portfolio")} 
                    variant="subtle" fontSize="md"
                >
                    Portfolio
                </Button>
                <SearchBar />
            </Stack>
        </Box>
    )
}