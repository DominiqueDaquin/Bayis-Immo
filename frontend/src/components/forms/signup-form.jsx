"use client"
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
  Checkbox,
  Flex
} from "@chakra-ui/react";
import { BaseForm } from "./base-form";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCheck
} from "react-icons/fi";

export const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnonceur, setIsAnnonceur] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  
  const { 
    isOpen: isVerificationModalOpen, 
    onOpen: onVerificationModalOpen, 
    onClose: onVerificationModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isChoiceModalOpen, 
    onOpen: onChoiceModalOpen, 
    onClose: onChoiceModalClose 
  } = useDisclosure();
  
  const [tempUserData, setTempUserData] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const generateVerificationCode = () => {
    // Génère un code de 6 chiffres
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les CGU pour vous inscrire.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Générer et stocker le code de vérification
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      // Envoyer le code par email
      const emailResponse = await axiosInstance.post("/api/send-mail/", {
        email: email,
        objet: "Code de vérification",
        body: `Votre code de vérification est : ${code}. Ce code expirera dans 5 minutes.`
      });

      if (emailResponse.status === 200) {
        toast({
          title: "Code envoyé",
          description: emailResponse.data.detail || "Un code de vérification a été envoyé à votre adresse email.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onVerificationModalOpen();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Une erreur s'est produite lors de l'envoi du code de vérification.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (userEnteredCode === verificationCode) {
      // Code correct, procéder à l'inscription
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/auth/users/", {
          email: email,
          name: name,
          phone: phone,
          password: password,
          username: email,
        });

        if (response.status === 201) {
          setTempUserData(response.data);
          onVerificationModalClose();
          onChoiceModalOpen();
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Erreur lors de l'inscription.",
          description: error.response?.data?.password || "Une erreur s'est produite.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Code incorrect",
        description: "Le code de vérification que vous avez entré est incorrect.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUserChoice = async (wantToBeAnnonceur) => {
    try {
      if (wantToBeAnnonceur && tempUserData) {
        await axiosInstance.post("/auth/add-to-group/", {
          user_id: tempUserData.id,
          group_name: "annonceur",
        });
      }

      toast({
        title: "Inscription réussie.",
        description: wantToBeAnnonceur 
          ? "Vous êtes maintenant inscrit en tant qu'annonceur. Connectez vous maintenant!" 
          : "Votre compte a été créé avec succès.Connectez vous maintenant!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la configuration de votre compte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onChoiceModalClose();
    }
  };

  return (
    <>
      <BaseForm
        description="Bienvenue sur notre plateforme, connectez-vous dès maintenant et bénéficiez de nos offres sur l'immobilier!"
        onSubmit={handleSubmit}
      >
        <Box mb={4}>
          <Text as="label" htmlFor="name" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Nom complet<sup >*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiUser color="gray.300" />
            </InputLeftElement>
            <Input
              id="name"
              type="text"
              size="lg"
              borderRadius="md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              pl={10}
            />
          </InputGroup>
        </Box>

        <Box mb={4}>
          <Text as="label" htmlFor="email" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Adresse Email <sup >*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
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
          <Text as="label" htmlFor="phone" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Téléphone 
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiPhone color="gray.300" />
            </InputLeftElement>
            <Input
              id="phone"
              type="text"
              size="lg"
              borderRadius="md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pl={10}
            />
          </InputGroup>
        </Box>

        <Box mb={4}>
          <Text as="label" htmlFor="password" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Mot de passe <sup >*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
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
            <InputRightElement>
              <IconButton
                variant="ghost"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>
        </Box>

        <Flex mb={4} align="center">
          <Checkbox
            isChecked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            colorScheme="blue"
            mr={2}
          />
          <Text fontSize="sm">
            J'accepte les <Link color="blue.500" href="/cgu" target="_blank">Conditions Générales d'Utilisation</Link>
          </Text>
        </Flex>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          borderRadius="md"
          isLoading={isLoading}
          loadingText="Envoi du code..."
          isDisabled={!acceptedTerms}
          opacity={!acceptedTerms ? 0.7 : 1}
          cursor={!acceptedTerms ? "not-allowed" : "pointer"}
        >
          S'inscrire
        </Button>

        <Text fontSize="sm" textAlign="center" mt={4}>
          Vous avez déjà un compte{" "}
          <Link color="blue.400" href="/login">
            Se connecter
          </Link>
        </Text>
      </BaseForm>

      {/* Modal de vérification du code */}
      <Modal isOpen={isVerificationModalOpen} onClose={onVerificationModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vérification de l'email</ModalHeader>
          <ModalBody>
            <Text mb={4}>Un code de vérification a été envoyé à {email}. Veuillez l'entrer ci-dessous :</Text>
            <Input
              placeholder="Code de vérification"
              value={userEnteredCode}
              onChange={(e) => setUserEnteredCode(e.target.value)}
              size="lg"
              mb={4}
            />
            <Text fontSize="sm" color="gray.500">
              Ce code expirera dans 5 minutes.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onVerificationModalClose}
            >
              Annuler
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleVerification}
              isLoading={isLoading}
              leftIcon={<FiCheck />}
            >
              Vérifier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Popup de choix du type de compte */}
      <Modal isOpen={isChoiceModalOpen} onClose={onChoiceModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Type de compte</ModalHeader>
          <ModalBody>
            <Text mb={4}>Souhaitez-vous vous inscrire en tant qu'annonceur ou simple utilisateur ?</Text>
            <Text fontSize="sm" color="gray.500">
              Les annonceurs peuvent publier des annonces immobilières.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => handleUserChoice(false)}
            >
              Simple utilisateur
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => handleUserChoice(true)}
            >
              Devenir annonceur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};