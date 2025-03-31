import { Box, Heading, Text, Button, Container, Flex, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.lg" height="100vh" display="flex" alignItems="center">
      <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap={10}>
        <Box textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h1" size="2xl" mb={4} color="blue.500">
            404
          </Heading>
          <Heading as="h2" size="lg" mb={4}>
            Oups ! Page introuvable
          </Heading>
          <Text fontSize="xl" mb={8} color="gray.600">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<FiHome />}
            onClick={() => navigate('/annonce')}
          >
            Retour à l'accueil
          </Button>
        </Box>
        <Box>
          <Image
            src="/404-error.svg" // Remplacez par votre propre illustration
            alt="Erreur 404"
            maxW="100%"
            height="auto"
            maxH="400px"
          />
        </Box>
      </Flex>
    </Container>
  );
};

export default Page404;