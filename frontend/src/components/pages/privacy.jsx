import React from "react";
import { Box, Heading, Text, Link, VStack, Container } from "@chakra-ui/react";
import SimpleNavbar from "../partials/navbar";
const PrivacyPolicy = () => {
  return (
<div>
<SimpleNavbar/>
<Container maxW="4xl" py={10}>
      <Box boxShadow="lg" borderRadius="xl" p={6} bg="white">
        <Box>
          <VStack spacing={4} align="start">
            <Heading size="xl" textAlign="center" w="full">
              Politique de Confidentialité
            </Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center" w="full">
              Dernière mise à jour : 01 Avril 2025
            </Text>
            
            <Heading size="md">1. Collecte des Données</Heading>
            <Text>
              Nous collectons différentes données personnelles des utilisateurs, notamment : <br/>
            </Text>
            <Text>
              - Nom, email, numéro de téléphone<br/>
              - Données de navigation et cookies<br/>
              - Informations relatives aux annonces immobilières publiées
            </Text>
            
            <Heading size="md">2. Utilisation des Données</Heading>
            <Text>
              Les données collectées sont utilisées pour : <br/>
              - Fournir et améliorer nos services <br/>
              - Assurer la sécurité et la gestion du site <br/>
              - Suivre l'audience via Google Analytics et Facebook Pixel <br/>
              - Former des modèles d'intelligence artificielle pour améliorer notre plateforme
            </Text>
            
            <Heading size="md">3. Stockage et Sécurité</Heading>
            <Text>
              Les données sont stockées sur les serveurs de notre hébergeur et conservées durant tout le cycle de vie de l'application. Nous mettons en place des mesures de sécurité adaptées pour protéger ces informations.
            </Text>
            
            <Heading size="md">4. Partage des Données</Heading>
            <Text>
              Nous ne partageons pas les données personnelles avec des tiers sauf dans les cas suivants :
              - Partenaires techniques et services d'analyse (Google Analytics, Facebook Pixel)
              - Conformité avec une obligation légale
            </Text>
            
            <Heading size="md">5. Droits des Utilisateurs</Heading>
            <Text>
              Les utilisateurs ont le droit de modifier leurs données personnelles à tout moment via leur compte. Cependant, la suppression des données n'est pas possible.
            </Text>
            
            <Heading size="md">6. Cookies et Technologies de Suivi</Heading>
            <Text>
              Nous utilisons des cookies pour améliorer l'expérience utilisateur et analyser l'utilisation du site. Vous pouvez configurer votre navigateur pour refuser ces cookies si vous le souhaitez.
            </Text>
            
            <Heading size="md">7. Modifications de la Politique</Heading>
            <Text>
              Nous nous réservons le droit de modifier cette politique à tout moment. Toute mise à jour sera communiquée sur notre site.
            </Text>
          </VStack>
        </Box>
      </Box>
    </Container>
</div>
    
  );
};

export default PrivacyPolicy;
