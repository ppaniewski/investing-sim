import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Heading, Box, Button } from '@chakra-ui/react';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    const linkBack = <Link to="/portfolio">
        <Button colorPalette="teal" size="2xl" mt={12} variant="surface">Go back</Button>
    </Link>;

    if (isRouteErrorResponse(error)) {
        return(
            <Box px={4} py={4}>
                <Heading size="3xl">Error {error.status} {error.statusText}</Heading>
                <Heading size="xl" mt={2}>{error.data || 'Something went wrong.'}</Heading>
                {linkBack}
            </Box>
        );
    }

    return(
        <Box px={4} py={4}>
            <Heading size="3xl">Unexpected Error</Heading>
            <Heading size="xl" mt={2}>{error.message || "Unknown error"}</Heading>
            {linkBack}
        </Box>
    );   
}