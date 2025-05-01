"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Heading,
  HStack,
  VStack,
  Tag,
  useColorModeValue,
  Icon,
  Container,
  useBreakpointValue,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
  useDisclosure,
  SimpleGrid,
  AspectRatio,
  Stack,
  Divider,
} from "@chakra-ui/react"
import { FaHeart, FaUsers, FaClock } from "react-icons/fa"
import { FiSearch } from "react-icons/fi"
import axiosInstance from "@/api/axios"
import SimpleNavbar from "../partials/navbar"
import Loading from "../partials/loading"
import Footer from "../partials/footer"
import { useAuth } from "@/hooks/useAuth"
import { v4 as uuidv4 } from "uuid"
import { baseUrl, baseUrlFrontend } from "@/config"
import money from "@/assets/money.png"
import banImage from "@/assets/ban-tombola.png"
import cagnotteImg from "@/assets/default-cagnotte.png"
import pattern from "@/assets/pattern_opacite_reduite.png"

const DEFAULT_TOMBOLA_IMAGE = cagnotteImg

const TombolaListing = () => {
  // Hooks et état initial
  const { user, userGroups } = useAuth()
  const { isOpen: isCouponOpen, onOpen: onCouponOpen, onClose: onCouponClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  const [selectedTombola, setSelectedTombola] = useState(null)
  const [tombolas, setTombolas] = useState([])
  const [userParticipations, setUserParticipations] = useState([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("participants")
  const [isLoading, setIsLoading] = useState(true)
  const [btnLoading, setbtnLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const isModerateur = userGroups?.includes("moderateur") || false
  const isCreator = (tombola) => user && tombola?.creer_par === user.id || false
  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()

  // Couleurs et styles
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const cardBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")
  const buttonBg = useColorModeValue("blue.500", "blue.300")
  const buttonHoverBg = useColorModeValue("blue.600", "blue.400")
  const banSize = useBreakpointValue({ base: "250px", md: "90vh" });
  // Vérification du statut de paiement
  const checkPaymentStatus = async (participant) => {
    try {
      if (participant.order_id && !participant.is_payed) {
        const response = await axiosInstance.post("/api/paiement/lygos/status/", {
          order_id: participant.order_id
        })
        const is_payed = response.data.status == "success" ? true : false
        await axiosInstance.patch(`/api/user-tombolas/${participant.id}/`, {
          statut: response.data.status,
          is_payed: is_payed
        })
      }
    } catch (err) {
      console.error("Erreur de status", err)
    }
  }

  // Récupération des participations
  const fetchParticipations = useCallback(async () => {
    if (!user) return []

    try {
      const response = await axiosInstance.get(`/api/users/participations/`)
      const participations = response.data
      return participations
    } catch (error) {
      console.error("Erreur participations:", error)
      return []
    }
  }, [user])

  // Récupération des données principales
  const fetchTombolas = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/tombolas/")
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  // Effet principal pour charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [tombolasData, participationsData] = await Promise.all([
          fetchTombolas(),
          fetchParticipations()
        ])

        setTombolas(tombolasData)
        setUserParticipations(participationsData)

        const participantsToCheck = tombolasData
          .flatMap(t => t.participants || [])
          .filter(p => p.order_id && !p.is_payed)

        await Promise.all(participantsToCheck.map(checkPaymentStatus))

      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        console.error("Load error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchTombolas, fetchParticipations, toast])

  // Filtrage et tri des tombolas
  const filteredTombolas = tombolas
    .filter(tombola => {
      if (filter === "all") return true
      if (filter === "active") return tombola.statut === "a"
      if (filter === "participating") return userParticipations.some(participation => participation.tombola_id === tombola.id)
      return true
    })
    .filter(tombola => {
      const query = searchQuery.toLowerCase()
      return (
        tombola.titre?.toLowerCase().includes(query) ||
        tombola.description?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === "participants") return b.participants_actuel - a.participants_actuel
      if (sortBy === "date") return new Date(a.date_fin) - new Date(b.date_fin)
      return 0
    })

  // Pagination
  const totalPages = Math.ceil(filteredTombolas.length / itemsPerPage)
  const paginatedTombolas = filteredTombolas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Gestion du paiement
  const handlePayer = async () => {
    setbtnLoading(true)
    const order_id = uuidv4();
    const link = `${baseUrlFrontend}/merci`;

    try {
      const paymentResponse = await axiosInstance.post("/api/paiement/lygos/", {
        amount: 250,
        shop_name: "Bayis Immob",
        message: `Participation à: ${selectedTombola.titre}`,
        order_id: order_id,
        success_url: link,
      });

      if (paymentResponse.status === 200) {
        try {
          // Essayer de créer une participation
          await axiosInstance.post(`/api/user-tombolas/`, {
            user: user.id,
            order_id: order_id,
            tombola: selectedTombola.id,
          });
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log("Participation existe déjà, mise à jour de l'order_id...");

            // 1. Chercher la participation existante
            const participationsResponse = await axiosInstance.get(`/api/user-tombolas/?user=${user.id}&tombola=${selectedTombola.id}`);

            if (participationsResponse.data.length > 0) {
              const existingParticipation = participationsResponse.data[0];

              // 2. Faire un PATCH pour modifier seulement l'order_id
              await axiosInstance.patch(`/api/user-tombolas/${existingParticipation.id}/`, {
                order_id: order_id,
              });
            }
          } else {
            throw error; // propager l'erreur si ce n'est pas une erreur 400
          }
        }

        toast({
          title: "Paiement initié",
          description: "Redirection vers le paiement...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        window.open(paymentResponse.data.link, "_blank");

        const updatedParticipations = await fetchParticipations();
        setUserParticipations(updatedParticipations);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Erreur lors du paiement",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setbtnLoading(false)
  };


  // Composants modaux
  const CouponModal = () => (
    <Modal isOpen={isCouponOpen} onClose={onCouponClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Participation à Cagnotte</ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center">
          <Image
            src={money}
            alt="Coupon de participation"
            mb={4}
            mx="auto"
            maxW="300px"
          />
          <Text mb={4}>
            Pour participer à "{selectedTombola?.titre}", payez 250 Fcfa.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handlePayer} isLoading={btnLoading} loadingText="patienter un moment..." >
            Payer 250 Fcfa
          </Button>
          <Button variant="ghost" onClick={onCouponClose}>
            Annuler
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  const DetailModal = () => (
    <Modal isOpen={isDetailOpen} onClose={onDetailClose} size={isMobile ? "full" : "md"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{selectedTombola?.titre}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Image
            src={selectedTombola?.photo || DEFAULT_TOMBOLA_IMAGE}
            alt={selectedTombola?.titre}
            mb={4}
            w="100%"
            maxH="300px"
            objectFit="cover"
            borderRadius="md"
            fallbackSrc={DEFAULT_TOMBOLA_IMAGE}
          />
          <Text mb={4}>{selectedTombola?.description || "Aucune description"}</Text>
          <HStack spacing={4}>
            <Flex align="center">
              <Icon as={FaUsers} mr={1} />
              <Text>{selectedTombola?.participants_actuel} participants</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaClock} mr={1} />
              <Text>Fin: {selectedTombola?.date_fin && new Date(selectedTombola.date_fin).toLocaleDateString()}</Text>
            </Flex>
          </HStack>
          {(isModerateur || isCreator(selectedTombola)) && (
            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="bold">Cagnotte: {selectedTombola?.cagnotte} Fcfa</Text>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onDetailClose}>
            Fermer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  // Composant de filtre responsive
  const FilterButtons = () => (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={4}
      mb={6}
      align={{ base: "stretch", md: "center" }}
    >
      <HStack spacing={2} overflowX="auto" pb={2} flexWrap={{ base: "nowrap", md: "wrap" }}>
        <Button
          size="sm"
          variant={filter === "all" ? "solid" : "outline"}
          onClick={() => setFilter("all")}
          borderRadius="full"
          colorScheme="gray"
          minW="max-content"
        >
          Toutes
        </Button>
        <Button
          size="sm"
          variant={filter === "active" ? "solid" : "outline"}
          onClick={() => setFilter("active")}
          borderRadius="full"
          colorScheme="gray"
          minW="max-content"
        >
          Actives
        </Button>
        {user && (
          <Button
            size="sm"
            variant={filter === "participating" ? "solid" : "outline"}
            onClick={() => setFilter("participating")}
            borderRadius="full"
            colorScheme="gray"
            minW="max-content"
          >
            Mes participations
          </Button>
        )}
      </HStack>

      <Select
        size="sm"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        borderRadius="full"
        colorScheme="gray"
        maxW={{ base: "100%", md: "200px" }}
      >
        <option value="participants">Plus populaires</option>
        <option value="date">Proche de la fin</option>
      </Select>
    </Stack>
  )

  // Composant de carte tombola amélioré
  const TombolaCard = ({ tombola }) => {
    const isParticipating = userParticipations.some(
      participation => participation.tombola_id === tombola.id && participation.is_payed
    )

    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={cardBg}
        overflow="hidden"
        maxW="800px"
        mx="auto"
        w="100%"
        _hover={{ shadow: "md", transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <Flex direction={{ base: "column", md: "row" }}>
          <AspectRatio ratio={4 / 4} minW={{ base: "100%", md: "250px" }} maxW={{ md: "300px" }}>
            <Image
              src={tombola.photo || DEFAULT_TOMBOLA_IMAGE}
              alt={tombola.titre}
              objectFit="cover"
              fallbackSrc={DEFAULT_TOMBOLA_IMAGE}
            />
          </AspectRatio>

          <Box p={4} flex={1}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Heading size="md" color={textColor}>
                {tombola.titre}
              </Heading>
              {isParticipating && (
                <Badge colorScheme="green" ml={2}>
                  Vous participez
                </Badge>
              )}
            </Flex>

            <Text noOfLines={2} mb={3} color={textColor}>
              {tombola.description || "Aucune description..."}
            </Text>

            <Divider my={2} />

            <Flex justify="space-between" align="center" flexWrap="wrap">
              <HStack spacing={4}>
                <Flex align="center">
                  <Icon as={FaUsers} mr={1} />
                  <Text fontSize="sm">{tombola.participants_actuel} participants</Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaClock} mr={1} />
                  <Text fontSize="sm">Fin: {new Date(tombola.date_fin).toLocaleDateString()}</Text>
                </Flex>
              </HStack>

              {(isModerateur || isCreator(tombola)) && (
                <Tag size="sm" variant="subtle" colorScheme="blue" mt={{ base: 2, md: 0 }}>
                  Cagnotte: {tombola.cagnotte} Fcfa
                </Tag>
              )}
            </Flex>

            <Flex justify="flex-end" mt={4}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTombola(tombola)
                  onCouponOpen()
                }}
              >
                Participer
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    )
  }

  if (isLoading) return <Loading />

  return (
    <Box bg={bgColor}


    >
      <SimpleNavbar />
      <Box
        h={banSize}
      >
        {/* <Box
        bgImage={banImage}
        h="full"
        w="full"
        bgPosition="center"
        bgSize="cover"
        >
g
        </Box> */}
        <Image src={banImage} w="full" h="full" />
      </Box>
      <Container maxW="container.xl" py={8} minH="100vh">
        <Box bg={headerBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6}>
          <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
            <Heading size="lg" color={textColor} mb={{ base: 4, md: 0 }}>
              Cagnotte à découvrir
            </Heading>

            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher une tombola..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Flex>

          <FilterButtons />

          <VStack spacing={6} align="stretch">
            {paginatedTombolas.length > 0 ? (
              <>
                {paginatedTombolas.map(tombola => {
                  const participation = userParticipations.filter(
                    (participation) => participation.tombola_id == tombola.id
                  )[0]

                  if (participation) checkPaymentStatus(participation)

                  return (
                    <Box
                      key={tombola.id}
                      onClick={() => {
                        setSelectedTombola(tombola)
                        onDetailOpen()
                      }}
                      cursor="pointer"
                    >
                      <TombolaCard tombola={tombola} />
                    </Box>
                  )
                })}

                {totalPages > 1 && (
                  <Flex justify="center" mt={6}>
                    <HStack spacing={2}>
                      <Button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        isDisabled={currentPage === 1}
                        size="sm"
                      >
                        Précédent
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            colorScheme={currentPage === pageNum ? "blue" : "gray"}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      <Button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        isDisabled={currentPage === totalPages}
                        size="sm"
                      >
                        Suivant
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </>
            ) : (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" color="gray.500">
                  Aucune tombola trouvée
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Container>
      <Footer />

      <CouponModal />
      <DetailModal />
    </Box>
  )
}

export default TombolaListing