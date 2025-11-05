import { useState } from "react";
import { Field, Input, Stack, Center, Button, Box, Heading } from '@chakra-ui/react';
import { PasswordInput } from "./ui/password-input";
import { Toaster, toaster } from "./ui/toaster";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [invalidUsername, setInvalidUsername] = useState(false);
    const [usernameErrorText, setUsernameErrorText] = useState("");

    const [password, setPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState("");

    const inputStyles = {
        size: "lg",
        variant: "subtle" 
    };

    async function signIn() {
        if (!handleUsername() || !handlePassword()) {
            return;
        }

        const res = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        
        if (res.ok) {
            navigate("/portfolio");
        }
        else if (res.status == 404) {
            setInvalidUsername(true);
            setUsernameErrorText("Incorrect username");
        }
        else if (res.status == 401) {
            setInvalidPassword(true);
            setPasswordErrorText("Incorrect password");
        }
        else if (!res.ok) {
            const data = await res.json();

            toaster.create({
                description: data.message,
                type:"error",
                duration: 6000
            });
        }
    }

    function handleUsername() {
        if (username.length < 5 || username.length > 30) {
            setInvalidUsername(true);
            setUsernameErrorText("Username must be between 5 and 30 characters");
            return false;
        }
        else {
            setInvalidUsername(false);
            return true;
        }
    }

    function handlePassword() {
        if (password.length < 8 || password.length > 40) {
            setInvalidPassword(true);
            setPasswordErrorText("Password must be between 8 and 40 characters");
            return false;
        }
        else {
            setInvalidPassword(false);
            return true;
        }
    }

    return(
        <>
            <TopBar buttonType="register" />
            <Center pt={32}>
                <Box bg="#232733" w="30%" minW="400px" h="500px" rounded="md">
                    <Stack width="80%" pt={10} gap={8} mx="auto">
                        <Heading size="3xl" textAlign="center" color="teal.400" fontWeight="bold">Login</Heading>
                        <Field.Root invalid={invalidUsername}>
                            <Field.Label fontSize="lg">Username</Field.Label>
                            <Input 
                                value={username} onChange={(e) => setUsername(e.target.value)} 
                                {...inputStyles}
                            />
                            <Field.ErrorText fontSize="sm">{usernameErrorText}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={invalidPassword}>
                            <Field.Label fontSize="lg">Password</Field.Label>
                            <PasswordInput 
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                                {...inputStyles}
                            />
                            <Field.ErrorText fontSize="sm">{passwordErrorText}</Field.ErrorText>
                        </Field.Root>
                        <Button size="lg" w="50%" m="auto" variant="surface" onClick={signIn}>
                            Sign In
                        </Button>
                    </Stack>
                </Box>
            </Center>
            <Toaster />
        </>
    );
}