// src/pages/ResetPasswordConfirm.js
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Text
} from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axiosInstance from "@/api/axios";

const ResetPasswordConfirm = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axiosInstance.post("/auth/users/reset_password_confirm/", {
                uid,
                token,
                new_password: newPassword,
                re_new_password: newPassword
            });

            toast({
                title: "Mot de passe mis à jour",
                description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            navigate("/login");
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Le lien a expiré ou est invalide.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!uid || !token) {
        return (
            <Container maxW="container.md" py={10}>
                <Heading mb={4}>Lien invalide</Heading>
                <Text>Le lien de réinitialisation est incomplet ou a expiré.</Text>
                <Button mt={4} as={RouterLink} to="/forgot-password" colorScheme="blue">
                    Demander un nouveau lien
                </Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.md" py={10}>
            <Heading mb={6}>Nouveau mot de passe</Heading>
            <Box as="form" onSubmit={handleSubmit}>
                <FormControl mb={4}>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <InputGroup>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                        <InputRightElement>
                            <IconButton
                                aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
                                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                onClick={() => setShowPassword(!showPassword)}
                                variant="ghost"
                            />
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    width="full"
                >
                    Réinitialiser le mot de passe
                </Button>
            </Box>
        </Container>
    );
};

export default ResetPasswordConfirm;