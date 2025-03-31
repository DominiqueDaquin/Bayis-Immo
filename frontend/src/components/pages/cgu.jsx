import React from "react";
import { Box, Heading, Text, Link, VStack, Container } from "@chakra-ui/react";
import SimpleNavbar from "../partials/navbar";
const TermsOfUse = () => {
  return (
    <div>
        <SimpleNavbar/>
<Container maxW="4xl" py={10}>
        
      <Box boxShadow="lg" borderRadius="xl" p={6} bg="white">
        <Box>
          <VStack spacing={4} align="start">
            <Heading size="xl" textAlign="center" w="full">
              Conditions Générales d'Utilisation
            </Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center" w="full">
              Dernière mise à jour : 01 Avril 2025
            </Text>
            
            <Heading size="md">1. Présentation du Site</Heading>
            <Text>
              Le site <strong>Bayis Immob</strong> (<Link href="https://bayisimmob.com" color="blue.500" isExternal>https://bayisimmob.com</Link>) est une marketplace Spécialisée dans la mise en relation immobilière . Édité par  <strong> Ets Bayis</strong>, joignable au +237683950330.
            </Text>
            
            <Heading size="md">2. Objet du Site</Heading>
            <Text>
              Bayis Immob permet aux utilisateurs de publier et de consulter des annonces immobilières. Seuls les contenus en rapport avec l'immobilier sont autorisés.
            </Text>
            
            <Heading size="md">3. Accès et Utilisation</Heading>
            <Text>
              L'accès à la plateforme est <strong>gratuit</strong>. Tout utilisateur s'engage à respecter les règles d'utilisation du site et à ne pas publier de contenu illicite, diffamatoire ou trompeur.
            </Text>
            
            <Heading size="md">4. Responsabilité</Heading>
            <Text><strong>Responsabilité de l'éditeur :</strong> Bayis Immob met tout en œuvre pour assurer le bon fonctionnement du site, mais ne garantit pas l'absence de bugs ou d'interruptions.</Text>
            <Text><strong>Responsabilité des utilisateurs :</strong> Chaque utilisateur est responsable des contenus qu'il publie et des transactions effectuées via la plateforme.</Text>
            
            <Heading size="md">5. Propriété Intellectuelle</Heading>
            <Text>
              Le contenu du site (textes, images, logo...) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.
            </Text>
            
            <Heading size="md">6. Données Personnelles et Cookies</Heading>
            <Text>
              Bayis Immob collecte certaines données personnelles des utilisateurs (email, numéro de téléphone...). Ces données ne peuvent pas être supprimées à la demande des utilisateurs.
            </Text>
            <Text>
              Le site utilise des <strong>cookies</strong> pour améliorer l'expérience utilisateur et analyser le trafic.
            </Text>
            
            <Heading size="md">7. Liens et Services Externes</Heading>
            <Text>
              Les utilisateurs peuvent publier des liens externes sous leur propre responsabilité. Bayis Immob utilise l'API de <strong>Lygoss</strong> pour les paiements en ligne.
            </Text>
            
            <Heading size="md">8. Droit Applicable et Juridiction Compétente</Heading>
            <Text>
              Les présentes CGU sont régies par le <strong>droit camerounais</strong>. En cas de litige, les tribunaux camerounais seront seuls compétents.
            </Text>
            <Text>
              Si Bayis Immob s'étend à d'autres pays, une adaptation des CGU et une mise en conformité avec le RGPD seront mises en place.
            </Text>
            
            <Heading size="md">9. Modification des CGU</Heading>
            <Text>
              Bayis Immob se réserve le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des mises à jour via une notification sur le site.
            </Text>
          </VStack>
        </Box>
      </Box>
    </Container>

    </div>
    
  );
};

export default TermsOfUse;
