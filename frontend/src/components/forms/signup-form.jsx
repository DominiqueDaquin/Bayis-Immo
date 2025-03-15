import {
    Box,
    Button,
    Input,
    Link,
    Text,
} from "@chakra-ui/react";
import { BaseForm } from "./base-form";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";

export const SignupForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/auth/users/", {
                email: email,
                name: name, 
                phone: phone,
                password: password,
                username:email,
            });

            if (response.status === 201) {
                toast({
                    title: "Inscription réussie.",
                    description: "Vous avez été inscrit avec succès.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                navigate("/login"); // Rediriger vers la route /annonce
            }
        } catch (error) {
            toast({
                title: "Erreur lors de l'inscription.",
                description: error.response?.data?.detail || JSON.stringify(error.response?.data) || "Une erreur s'est produite.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseForm
            description="Bienvenue sur notre plateforme, connectez-vous dès maintenant et bénéficiez de nos offres sur l'immobilier!"
            onSubmit={handleSubmit}
        >
            <Box mb={4}>
                <Text as="label" htmlFor="name" display="block" mb={2} fontSize="sm" fontWeight="medium">
                    Nom complet
                </Text>
                <Input
                    id="name"
                    type="text"
                    size="lg"
                    borderRadius="md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </Box>

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
                <Text as="label" htmlFor="phone" display="block" mb={2} fontSize="sm" fontWeight="medium">
                    Téléphone
                </Text>
                <Input
                    id="phone"
                    type="text"
                    size="lg"
                    borderRadius="md"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

            <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                borderRadius="md"
                isLoading={isLoading}
                loadingText="Inscription en cours..."
            >
                S'inscrire
            </Button>

            <Text fontSize="sm" textAlign="center">
                Vous avez déjà un compte{" "}
                <Link color="blue.400" href="/login">
                    Se connecter
                </Link>
            </Text>
        </BaseForm>
    );
};