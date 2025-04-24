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
import { FiXCircle, FiHome, FiCreditCard } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const PageEchecPaiement = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBg = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const errorColor = useColorModeValue('red.500', 'red.300')

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
              as={FiXCircle} 
              boxSize={16} 
              color={errorColor} 
            />
            <Heading size="xl">Paiement échoué</Heading>
            
            <Text fontSize="lg" color={textColor}>
              Nous n'avons pas pu traiter votre paiement.
            </Text>
            
            <Text fontSize="md" color={textColor}>
              Veuillez vérifier les informations de votre carte ou essayer un autre moyen de paiement.
            </Text>
            
            <VStack spacing={4} mt={8} w="full">
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<FiCreditCard />}
                onClick={() => navigate('/paiement')} // Remplacez par votre route de paiement
                w="full"
                maxW="300px"
              >
                Réessayer le paiement
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                leftIcon={<FiHome />}
                onClick={() => navigate('/annonce')}
                w="full"
                maxW="300px"
              >
                Retour à l'accueil
              </Button>
            </VStack>
            
            <Text fontSize="sm" color={textColor} mt={4}>
              Si le problème persiste, veuillez contacter notre support.
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default PageEchecPaiement