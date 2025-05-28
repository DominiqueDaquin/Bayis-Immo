// src/components/LoginForm.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthContext } from '@/context/AuthContext';
import { BaseForm } from './base-form';
import axiosInstance from '@/api/axios';
import GoogleLogin from '../others/google-login';


export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();
  
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Connexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/annonce');
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.response?.data?.detail || 'Email ou mot de passe incorrect',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!resetEmail) {
      toast({
        title: 'Email requis',
        description: 'Veuillez entrer votre adresse email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResetLoading(true);
    try {
      await axiosInstance.post('/auth/users/reset_password/', { email: resetEmail });
      
      toast({
        title: 'Email envoyé',
        description: 'Un lien de réinitialisation a été envoyé à votre adresse email',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onResetModalClose();
      setResetEmail('');
    } catch (error) {
      // On montre un message générique pour des raisons de sécurité
      toast({
        title: 'Demande envoyée',
        description: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <BaseForm description="Bon retour parmi nous! Connectez-vous maintenant" onSubmit={handleSubmit}>
        <Box mb={4}>
          <FormControl isRequired>
            <FormLabel>Adresse Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiMail color="gray.300" />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </InputGroup>
          </FormControl>
        </Box>

        <Box mb={4}>
          <FormControl isRequired>
            <FormLabel>Mot de passe</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiLock color="gray.300" />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  icon={showPassword ? <FiEyeOff /> : <FiEye />}
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </Box>

        <Flex justifyContent="flex-end" mb={6}>
          <Link
            color="blue.500"
            fontSize="sm"
            onClick={onResetModalOpen}
            _hover={{ textDecoration: 'none' }}
          >
            Mot de passe oublié ?
          </Link>
        </Flex>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          isLoading={isLoading}
          loadingText="Connexion..."
        >
          Se connecter
        </Button>
 
        <Text mt={4} textAlign="center" fontSize="sm">
          Pas encore de compte ?{' '}
          <Link as={RouterLink} to="/signup" color="blue.500" fontWeight="medium">
            Créer un compte
          </Link>
        </Text>


      </BaseForm>

      {/* Modal pour la réinitialisation du mot de passe */}
      <Modal isOpen={isResetModalOpen} onClose={onResetModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Réinitialiser le mot de passe</ModalHeader>
          <ModalBody pb={6}>
            <Text mb={4}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </Text>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onResetModalClose}>
              Annuler
            </Button>
            <Button
              colorScheme="blue"
              onClick={handlePasswordResetRequest}
              isLoading={isResetLoading}
              loadingText="Envoi en cours..."
            >
              Envoyer le lien
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};