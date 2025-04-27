"use client"
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Icon,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  Textarea,
  Button,
  useToast,
  FormControl,
  FormLabel,
  VStack
} from '@chakra-ui/react'
import { 
  FaHome,
  FaBuilding,
  FaCity,
  FaTree,
  FaSwimmingPool,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa'
import { BsShieldLock } from 'react-icons/bs'
import { RiCopyrightLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import axiosInstance from "@/api/axios";
import { useState } from 'react';

const Footer = () => {
  // Couleurs adaptatives
  const bgColor = useColorModeValue("white", "neutral.800");
  const hoverBgColor = useColorModeValue("primary.50", "primary.900");
  const activeBgColor = useColorModeValue("primary.100", "primary.800");
  const textColor = useColorModeValue("neutral.700", "neutral.200");
  const buttonBg = useColorModeValue("primary.500", "primary.600");
  const buttonHover = useColorModeValue("primary.600", "primary.500");
  const headingColor = useColorModeValue('blue.600', 'blue.300')
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const navigate = useNavigate()
  const toast = useToast()

  // Gestion de la modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // State pour le formulaire
  const [formData, setFormData] = useState({
    email: '',
    objet: '',
    body: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await axiosInstance.post('api/send-mail/', formData)
      
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message et vous répondrons dès que possible.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      
      // Reset form et fermeture de la modal
      setFormData({
        email: '',
        objet: '',
        body: ''
      })
      onClose()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      console.error('Error sending email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      bg={bgColor}
      color={textColor}
      borderTopWidth="1px"
      borderTopColor={borderColor}
      mt="auto"
      
    >
      <Container as={Stack} maxW={'7xl'} py={10} spacing={10} >


        {/* Section juridique */}
        <Box
          pt={8}
          
        >
          <SimpleGrid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            spacing={8}
          >
            <Stack spacing={4}>
              <Heading as="h4" size="sm" >
                <Flex align="center">
                  <Icon as={BsShieldLock} mr={2} /> Mentions légales
                  </Flex>
              </Heading>
              <Text fontSize="xs">
                Bayis immob est un marketplace spécialisé dans la mise en relation immobilière
              </Text>
            </Stack>

            <Stack spacing={3}>
              <Flex
                direction={{ base: 'column', sm: 'row' }}
                justify={{ md: 'space-between' }}
                align="center"
                spacing={4}
              >
                <Link href={'/cgu'} fontSize="sm">Conditions générales</Link>
                <Link href={'/privacy'} fontSize="sm">Politique de confidentialité</Link>
                <Link href={'/cookies'} fontSize="sm">Préférences cookies</Link>
                <Link href={'/mentions'} fontSize="sm">Mentions légales</Link>
                <Link href={'#'} onClick={onOpen} fontSize="sm">Contactez-nous</Link>
              </Flex>
              <Flex align="center" justify="center" color={textColor}>
                <Icon as={RiCopyrightLine} mr={1} />
                <Text fontSize="sm">
                  {new Date().getFullYear()} Bayis immob - Tous droits réservés
                </Text>
              </Flex>
            </Stack>
          </SimpleGrid>
        </Box>

        {/* Modal du formulaire de contact */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Contactez-nous</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack 
                as="form" 
                onSubmit={handleSubmit}
                spacing={5}
                align="stretch"
              >
                <FormControl isRequired>
                  <FormLabel>Votre email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    size="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Objet</FormLabel>
                  <Input
                    type="text"
                    name="objet"
                    value={formData.objet}
                    onChange={handleChange}
                    placeholder="Objet de votre message"
                    size="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="Votre message..."
                    rows={5}
                    size="md"
                  />
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Envoi en cours..."
                  mt={2}
                  size="md"
                >
                  Envoyer le message
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}

export default Footer