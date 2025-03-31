// src/components/LoginForm.js
import React, { useState, useContext } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { BaseForm } from "./base-form";
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import {
    Box,
    Button,
    Input,
    Link,
    Text,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    FormControl,
    FormLabel,
    Flex
} from "@chakra-ui/react"
import axiosInstance from "@/api/axios";

export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [userEnteredCode, setUserEnteredCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const { 
        isOpen: isResetModalOpen, 
        onOpen: onResetModalOpen, 
        onClose: onResetModalClose 
    } = useDisclosure();
    
    const { 
        isOpen: isCodeModalOpen, 
        onOpen: onCodeModalOpen, 
        onClose: onCodeModalClose 
    } = useDisclosure();
    
    const { 
        isOpen: isPasswordModalOpen, 
        onOpen: onPasswordModalOpen, 
        onClose: onPasswordModalClose 
    } = useDisclosure();
    
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const generateVerificationCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast({
                title: "Connexion réussie.",
                description: "Vous êtes maintenant connecté.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/annonce");
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

    const handleResetRequest = async () => {
        if (!resetEmail) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer votre adresse email",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsResetLoading(true);
        try {
            // Vérifier d'abord que l'email existe
            const checkUser = await axiosInstance.post("/auth/users/reset_password/", {
                email: resetEmail
            });

            // Si la requête réussit, l'email existe
            const code = generateVerificationCode();
            setVerificationCode(code);
            
            // Envoyer le code par email
            const emailResponse = await axiosInstance.post("/api/send-mail/", {
                email: resetEmail,
                objet: "Code de réinitialisation",
                body: `Votre code de réinitialisation est : ${code}. Ce code est valable 5 minutes.`
            });

            if (emailResponse.status === 200) {
                toast({
                    title: "Code envoyé",
                    description: "Un code de vérification a été envoyé à votre adresse email.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                onResetModalClose();
                onCodeModalOpen();
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Aucun compte trouvé avec cette adresse email.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsResetLoading(false);
        }
    };

    const handleCodeVerification = () => {
        if (userEnteredCode === verificationCode) {
            toast({
                title: "Code vérifié",
                description: "Veuillez maintenant entrer votre nouveau mot de passe.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onCodeModalClose();
            onPasswordModalOpen();
        } else {
            toast({
                title: "Code incorrect",
                description: "Le code que vous avez entré est incorrect.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handlePasswordReset = async () => {
        if (!newPassword) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer un nouveau mot de passe",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsCodeLoading(true);
        try {
            // Obtenir le vrai token et uid de Djoser
            const tokenResponse = await axiosInstance.post("/auth/users/reset_password/", {
                email: resetEmail
            });

            // Dans une vraie implémentation, vous récupéreriez le token et uid de la réponse
            // Mais comme Djoser les envoie par email, nous devons les demander à nouveau
            // Solution alternative: créer un endpoint personnalisé qui bypass Djoser
            
            // Solution temporaire: utiliser l'endpoint de changement de mot de passe direct
            const userResponse = await axiosInstance.get(`/auth/users/?email=${resetEmail}`);
            const userId = userResponse.data.results[0]?.id;
            
            if (!userId) {
                throw new Error("Utilisateur non trouvé");
            }

            // Changer le mot de passe directement (nécessite un endpoint personnalisé)
            const resetResponse = await axiosInstance.post("/auth/custom_password_reset/", {
                user_id: userId,
                new_password: newPassword,
                code: verificationCode
            });

            toast({
                title: "Mot de passe réinitialisé",
                description: "Votre mot de passe a été modifié avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            onPasswordModalClose();
            setResetEmail("");
            setNewPassword("");
            setUserEnteredCode("");
            
        } catch (error) {
            console.log(error);
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Échec de la réinitialisation du mot de passe.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsCodeLoading(false);
        }
    };

    return (
        <>
            <BaseForm description="Bon retour parmi nous! Connectez-vous maintenant" onSubmit={handleSubmit}>
                <Box mb={4}>
                    <Text as="label" htmlFor="email" display="block" mb={2} fontSize="sm" fontWeight="medium">
                        Adresse Email
                    </Text>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" h="full">
                            <FiMail color="gray.300" />
                        </InputLeftElement>
                        <Input
                            id="email"
                            type="email"
                            size="lg"
                            borderRadius="md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            pl={10}
                        />
                    </InputGroup>
                </Box>
        
                <Box mb={4}>
                    <Text as="label" htmlFor="password" display="block" mb={2} fontSize="sm" fontWeight="medium">
                        Mot de passe
                    </Text>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" h="full">
                            <FiLock color="gray.300" />
                        </InputLeftElement>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            size="lg"
                            borderRadius="md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            pl={10}
                        />
                        <InputRightElement h="full">
                            <IconButton
                                variant="ghost"
                                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </InputRightElement>
                    </InputGroup>
                </Box>
        
                <Flex justify="space-between" align="center" mb={4}>
                    <Link 
                        color="blue.400" 
                        fontSize="sm" 
                        onClick={onResetModalOpen}
                    >
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

            {/* Modal pour demander l'email de réinitialisation */}
            <Modal isOpen={isResetModalOpen} onClose={onResetModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Réinitialisation du mot de passe</ModalHeader>
                    <ModalBody>
                        <Text mb={4}>
                            Entrez votre adresse email pour recevoir un code de vérification.
                        </Text>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Votre adresse email"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="outline" 
                            mr={3} 
                            onClick={onResetModalClose}
                        >
                            Annuler
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleResetRequest}
                            isLoading={isResetLoading}
                        >
                            Envoyer le code
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal pour entrer le code de vérification */}
            <Modal isOpen={isCodeModalOpen} onClose={onCodeModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Vérification du code</ModalHeader>
                    <ModalBody>
                        <Text mb={4}>
                            Un code de vérification a été envoyé à {resetEmail}. Veuillez l'entrer ci-dessous :
                        </Text>
                        <Input
                            placeholder="Code à 6 chiffres"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            size="lg"
                            mb={4}
                        />
                        <Text fontSize="sm" color="gray.500">
                            Ce code est valable 5 minutes.
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="outline" 
                            mr={3} 
                            onClick={onCodeModalClose}
                        >
                            Annuler
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleCodeVerification}
                            leftIcon={<FiCheck />}
                        >
                            Vérifier
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal pour entrer le nouveau mot de passe */}
            <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Nouveau mot de passe</ModalHeader>
                    <ModalBody>
                        <Text mb={4}>
                            Veuillez entrer votre nouveau mot de passe.
                        </Text>
                        <FormControl mb={4}>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nouveau mot de passe"
                                />
                                <InputRightElement>
                                    <IconButton
                                        variant="ghost"
                                        aria-label={showNewPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                                        icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="outline" 
                            mr={3} 
                            onClick={onPasswordModalClose}
                        >
                            Annuler
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handlePasswordReset}
                            isLoading={isCodeLoading}
                        >
                            Réinitialiser
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};