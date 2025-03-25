"use client";

import {
  Box,
  Text,
  VStack,
  Heading,
  useColorMode,
} from "@chakra-ui/react";


const HeroBanner = () => {
    const { colorMode } = useColorMode();
    const overlayColor = colorMode === 'light' ? "blackAlpha.600" : "blackAlpha.700";
    
    return (
      <Box
        bgImage="url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        bgPosition="center"
        bgSize="cover"
        h={{ base: "250px", md: "400px" }}
        position="relative"
        overflow="hidden"
      >
        <Box 
          bg={overlayColor}
          h="full" 
          w="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={4} textAlign="center" px={4} zIndex={1} maxW="3xl">
            <Heading 
              as="h1" 
              size={{ base: "xl", md: "2xl" }}
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.5)"
            >
              Trouvez votre propriété idéale
            </Heading>
            <Text 
              fontSize={{ base: "md", md: "xl" }}
              color="whiteAlpha.900"
            >
              Découvrez des milliers d'annonces vérifiées à travers tout le Cameroun
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

export default HeroBanner;