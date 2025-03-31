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
  Image
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
  const navigate=useNavigate()
  return (
    <Box
      bg={bgColor}
      color={textColor}
      borderTopWidth="1px"
      borderTopColor={borderColor}
      mt="auto"
    >
      <Container as={Stack} maxW={'7xl'} py={10} spacing={10}>
        {/* <SimpleGrid
          templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={10}
        >
         
          <Stack spacing={6}>
            <Flex align="center">
              <Icon as={FaHome} boxSize={8}  mr={2} />
              <Heading as="h2" size="lg" >
                Bayis Immob
              </Heading>
            </Flex>
            <Text fontSize={'sm'}>
              Bayis immob vous accompagne dans la recherche de votre bien idéal. 
              Notre expertise immobilière et notre large réseau nous permettent 
              de vous proposer les meilleures opportunités du marché.
            </Text>
            <Stack direction={'row'} spacing={4}>
              <Icon as={FaPhone}  />
              <Text>+237 6 95 24 01 65</Text>
            </Stack>
            <Stack direction={'row'} spacing={4}>
              <Icon as={FaEnvelope}  />
              <Text>contact@bayisimmob.com</Text>
            </Stack>
          </Stack>

          <Stack align={'flex-start'}>
            <Heading as="h3" size="md" >
              Nos biens
            </Heading>
            <Stack spacing={3}>
              <Link href={'#'} display="flex" alignItems="center">
                <Icon as={FaBuilding} mr={2} /> Appartements
              </Link>
              <Link href={'#'} display="flex" alignItems="center">
                <Icon as={FaHome} mr={2} /> Maisons
              </Link>
              <Link href={'#'} display="flex" alignItems="center">
                <Icon as={FaSwimmingPool} mr={2} /> Propriétés de luxe
              </Link>
              <Link href={'#'} display="flex" alignItems="center">
                <Icon as={FaTree} mr={2} /> Terrains
              </Link>
              <Link href={'#'} display="flex" alignItems="center">
                <Icon as={FaCity} mr={2} /> Locaux commerciaux
              </Link>
            </Stack>
          </Stack>

          <Stack align={'flex-start'}>
            <Heading as="h3" size="md" >
              Informations
            </Heading>
            <Link href={'#'}>Nos agences</Link>
            <Link href={'#'}>Blog immobilier</Link>
            <Link href={'#'}>Estimation gratuite</Link>
            <Link href={'#'}>Solutions de financement</Link>
            <Link href={'#'}>Contactez-nous</Link>
          </Stack>

          <Stack>
            <Heading as="h3" size="md" >
              Nous trouver
            </Heading>
            <Stack spacing={4}>
              <Flex align="center">
                <Icon as={FaMapMarkerAlt} mr={3}  />
                <Text>Orange Digital Center<br/>Akwa soudanaise</Text>
              </Flex>
              <Flex align="center">
                <Icon as={FaClock} mr={3}  />
                <Stack spacing={0}>
                  <Text>Lun-Ven: 9h-19h</Text>
                  <Text>Sam: 10h-18h</Text>
                </Stack>
              </Flex>
            </Stack>
          </Stack>
        </SimpleGrid> */}

        {/* Section juridique */}
        <Box
          pt={8}
          // borderTopWidth="1px"
          // borderTopColor={borderColor}
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
                Bayis immob est une marque reservé
              </Text>
            </Stack>

            <Stack spacing={4}>
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
      </Container>
    </Box>
  )
}

export default Footer