import { useState } from "react";
import { Field, Input, Stack, Center, Button, Box, Heading } from '@chakra-ui/react';
import { PasswordInput } from "./ui/password-input";
import { Toaster, toaster } from "./ui/toaster";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [invalidUsername, setInvalidUsername] = useState(false);
    const [usernameErrorText, setUsernameErrorText] = useState("");
    const usernameHelperField = <Field.HelperText fontSize="sm">Minimum 5 characters</Field.HelperText>;
    const usernameErrorField = <Field.ErrorText fontSize="sm">{usernameErrorText}</Field.ErrorText>;

    const [password, setPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState("");
    const passwordHelperField = <Field.HelperText fontSize="sm">Minimum 8 characters</Field.HelperText>;
    const passwordErrorField = <Field.ErrorText fontSize="sm">{passwordErrorText}</Field.ErrorText>;

    const [repPassword, setRepPassword] = useState("");
    const [invalidRepPass, setInvalidRepPass] = useState(false);
    const [repPassErrorText, setRepPassErrorText] = useState("");

    const inputStyles = {
        size: "lg",
        variant: "subtle" 
    };

    async function signUp() {
        if (!handleUsername() || !handlePassword()) {
            return;
        }

        const res = await fetch("/api/users/register", {
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
            navigate("/login");
        }
        else {
            const data = await res.json();

            toaster.create({
                description: data.message,
                type:"error",
                duration: 6000
            });
        }
    }

    function handleUsername() {
        if (username.length < 5) {
            setInvalidUsername(true);
            setUsernameErrorText("Username must be at least 5 characters long!");
            return false;
        }
        else if (username.length > 30) {
            setInvalidUsername(true);
            setUsernameErrorText("Username must not be longer than 30 characters!");
            return false;
        }
        else {
            setInvalidUsername(false);
            return true;
        }
    }

    function handlePassword() {
        if (password.length < 8) {
            setInvalidPassword(true);
            setInvalidRepPass(false);
            setPasswordErrorText("Password must be at least 8 characters long!");
            return false;
        }
        else if (password.length > 64) {
            setInvalidPassword(true);
            setInvalidRepPass(false);
            setPasswordErrorText("Password must not be longer than 40 characters!");
            return false;
        }
        else if (password !== repPassword) {
            setInvalidRepPass(true);
            setInvalidPassword(false);
            setRepPassErrorText("Passwords don't match!");
            return false;
        }
        else {
            setInvalidPassword(false);
            setInvalidRepPass(false);
            return true;
        }
    }

    return(
        <>
            <TopBar buttonType="login" />
            <Center pt={32}>
                <Box bg="#232733" w="30%" minW="400px" h="565px" rounded="md">
                    <Stack width="80%" pt={10} gap={8} mx="auto">
                        <Heading size="3xl" textAlign="center" color="teal.400" fontWeight="bold">Register</Heading>
                        <Field.Root invalid={invalidUsername}>
                            <Field.Label fontSize="lg">Username</Field.Label>
                            <Input 
                                value={username} onChange={(e) => setUsername(e.target.value)} 
                                {...inputStyles}
                            />
                            {invalidUsername ? usernameErrorField : usernameHelperField}
                        </Field.Root>
                        <Field.Root invalid={invalidPassword}>
                            <Field.Label fontSize="lg">Password</Field.Label>
                            <PasswordInput 
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                                {...inputStyles}
                            />
                            {invalidPassword ? passwordErrorField : passwordHelperField}
                        </Field.Root>
                        <Field.Root invalid={invalidRepPass}>
                            <Field.Label fontSize="lg">Confirm Password</Field.Label>
                            <PasswordInput 
                                value={repPassword} onChange={(e) => setRepPassword(e.target.value)} 
                                {...inputStyles}
                            />
                            <Field.ErrorText fontSize="sm">{repPassErrorText}</Field.ErrorText>
                        </Field.Root>
                        <Button size="lg" w="50%" m="auto" variant="surface" onClick={signUp}>
                            Sign Up
                        </Button>
                    </Stack>
                </Box>
                
            </Center>
            <Toaster />
        </>
    );
}