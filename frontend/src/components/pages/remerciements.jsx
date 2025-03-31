import { useEffect, useState } from 'react'
import {
  Container,
  Heading,
  Text,
  Button,
  useToast,
  Flex,
  Spinner,
  Icon,
  VStack,
  Box,
  useColorModeValue
} from '@chakra-ui/react'
import { FiCheckCircle, FiHome } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const PageRemerciementPaiement = () => {

  const navigate = useNavigate()

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBg = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

 
  return (
    <Box bg={bgColor} minH="100vh" py={20}>
      <Container maxW="container.md">
        <Box 
          bg={cardBg}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          textAlign="center"
        >
          <VStack spacing={6}>
             
              
                <Icon 
                  as={FiCheckCircle} 
                  boxSize={16} 
                  color="green.500" 
                />
                <Heading size="xl">Merci pour votre paiement !</Heading>
                <Text fontSize="lg" color={textColor}>
                  Votre publicité a été activée avec succès et sera visible par tous les utilisateurs.
                </Text>
                
                <VStack spacing={4} mt={8} w="full">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FiHome />}
                    onClick={() => navigate('/annonce')}
                    w="full"
                    maxW="300px"
                  >
                    Retour à l'accueil
                  </Button>
                </VStack>
              
            
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default PageRemerciementPaiement