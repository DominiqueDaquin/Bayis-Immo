// src/components/LoginForm.js
import React, { useState, useContext } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext"; // Importer le contexte
import { BaseForm } from "./base-form";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    Heading,
    Input,
    Link,
    Text,
    VStack,
} from "@chakra-ui/react"
export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Utiliser la fonction login du contexte

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password); // Appeler la fonction login du contexte
            toast({
                title: "Connexion réussie.",
                description: "Vous êtes maintenant connecté.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/annonce"); // Rediriger vers la route /annonce
        } catch (error) {
            console.log(error);
            
            toast({
                title: "Erreur lors de la connexion.",
                description: error.response?.data?.detail || "Identifiants incorrects.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseForm description="Bon retour parmi nous! Connectez-vous maintenant" onSubmit={handleSubmit}>
            <Box mb={4}>
                <Text as="label" htmlFor="email" display="block" mb={2} fontSize="sm" fontWeight="medium">
                    Adresse Email
                </Text>
                <Input
                    id="email"
                    type="email"
                    size="lg"
                    borderRadius="md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </Box>

            <Box mb={4}>
                <Text as="label" htmlFor="password" display="block" mb={2} fontSize="sm" fontWeight="medium">
                    Mot de passe
                </Text>
                <Input
                    id="password"
                    type="password"
                    size="lg"
                    borderRadius="md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </Box>

            <Flex justify="space-between" align="center">
                <Link color="blue.400" fontSize="sm" href="#">
                    Mot de passe oublié?
                </Link>
            </Flex>

            <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                borderRadius="md"
                isLoading={isLoading}
                loadingText="Connexion en cours..."
            >
                Se connecter
            </Button>
        </BaseForm>
    );
};