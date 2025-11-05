import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { Box } from '@chakra-ui/react';

export default function Layout() {
    const sideBarWidth = [40, 48, 52, 60, 64];

    return(
        <>
            <TopBar buttonType="logout" />
            <SideBar w={sideBarWidth} />
            <Box pt={24} pl={sideBarWidth}>
                <Outlet />
            </Box>
        </>
    );
}