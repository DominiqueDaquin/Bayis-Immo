import { Flex, Spinner, Text } from "@chakra-ui/react";

function Loading() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh" // Prend toute la hauteur de l'écran
      bg="gray.50" // Fond léger
    >
      {/* Spinner de chargement */}
      <Spinner
        size="xl"
        thickness="4px"
        speed="0.65s"
        color="blue.500" // Couleur du spinner
        emptyColor="gray.200" // Couleur de fond du spinner
      />

      {/* Texte de chargement */}
      <Text mt={4} fontSize="lg" color="gray.600">
        Chargement en cours...
      </Text>
    </Flex>
  );
}

export default Loading;