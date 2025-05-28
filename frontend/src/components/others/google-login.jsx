import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '@/api/axios';
import GoogleImage from '@/assets/google.png';
import { Image, Button, Flex, Text, useToast } from '@chakra-ui/react';

const GoogleLogin = () => {
  const toast = useToast();

  const login = useGoogleLogin({
    flow: 'implicit', // Corrigé : utilisation du flux implicite qui renvoie un access_token
    onSuccess: async (response) => {
      console.log("Réponse Google:", response); // Pour déboguer, vérifiez ce que contient la réponse
      
      try {
        if (!response.access_token) {
          console.error("Pas de token d'accès dans la réponse:", response);
          toast({
            title: 'Erreur d\'authentification',
            description: 'Token d\'accès non reçu de Google',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        
        const backendResponse = await axiosInstance.post('/api/social/token/', {
          provider: 'google-oauth2',
          access_token: response.access_token,
        });
        
        localStorage.setItem('token', backendResponse.data.access);
        localStorage.setItem('refresh_token', backendResponse.data.refresh);
        localStorage.setItem('user', JSON.stringify(backendResponse.data.user));
        
        // Notification de succès
        toast({
          title: 'Connexion réussie',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        window.location.href = '/annonce';
      } catch (err) {
        console.error('Erreur lors de l\'authentification Google:', err);
        toast({
          title: 'Erreur de connexion',
          description: err.response?.data?.error || err.response?.data?.message || 'Une erreur est survenue',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      console.error('Erreur de connexion Google:', error);
      toast({
        title: 'Erreur de connexion Google',
        description: error.error_description || 'Impossible de se connecter avec Google',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    scope: 'email profile',
  });

  return (
    <Button
      onClick={() => login()}
      w="full"
      maxW="lg"
      px={6}
      py={3}
      mx={2}
      my={2}
      fontWeight="medium"
      color="gray.800"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      _hover={{
        boxShadow: 'md',
        bg: 'gray.50',
      }}
      _focus={{
        outline: 'none',
        boxShadow: 'outline',
      }}
      borderWidth="1px"
      borderColor="gray.300"
      transition="all 0.3s ease"
    >
      <Flex align="center" justify="center">
        <Image 
          src={GoogleImage} 
          alt="Logo Google"
          boxSize="20px" 
          mr={3}
        />
        <Text>Continuer avec Google</Text>
      </Flex>
    </Button>
  );
};

export default GoogleLogin;