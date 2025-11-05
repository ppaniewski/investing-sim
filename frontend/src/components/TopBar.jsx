import { Heading, Flex, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ buttonType }) {
    const navigate = useNavigate();

    const buttonStyles = {
        variant: "subtle",
        size: "xl",
        w: 32
    };

    const logoutButton = <Button onClick={logout} {...buttonStyles}>Logout</Button>;
    const registerButton = <Button onClick={() => navigate("/register")} {...buttonStyles}>Register</Button>
    const loginButton = <Button onClick={() => navigate("/login")} {...buttonStyles}>Login</Button>

    let button = null;
    if (buttonType === "logout") {
        button = logoutButton;
    }
    else if (buttonType === "register") {
        button = registerButton;
    }
    else if (buttonType === "login") {
        button = loginButton;
    }

    async function logout() {
        const res = await fetch("/api/users/logout", {
            method: "POST"
        });

        if (res.ok) {
            navigate("/login");
        }
    }

    return(
        <>
            <Flex 
                pos="fixed" zIndex={10} h={20} py={4} px={10} bg="hsla(223, 17%, 16%, 1.00)" 
                w="100%" justifyContent="space-between" alignItems="center"
                boxShadow="0px 0px 1.5px hsla(0, 0%, 1%, 1.00)"
            >
                    <Heading size="2xl" color="teal.400" fontWeight="extrabold">
                        Investing Sim
                    </Heading>
                    {button}
            </Flex>
        </>
    );
}