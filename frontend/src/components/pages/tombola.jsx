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

const DEFAULT_TOMBOLA_IMAGE = "/default-tombola.jpg"

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

  const isModerateur = userGroups?.includes("moderateur") || false
  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()

  // Couleurs et styles
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  // Vérification du statut de paiement
  const checkPaymentStatus = async (participant) => {
    console.log("hello");

    try {
      if (participant.order_id && !participant.is_payed) {
        const response = await axiosInstance.post("/api/paiement/lygos/status/", {
          order_id: participant.order_id
        })
        const is_payed=response.data.status=="success" ? true:false
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
      // Gère les deux formats de réponse possibles
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
    console.log("hello6");

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Chargement en parallèle
        const [tombolasData, participationsData] = await Promise.all([
          fetchTombolas(),
          fetchParticipations()
        ])

        setTombolas(tombolasData)
        setUserParticipations(participationsData)
        console.log("Nos user participation", userParticipations);

        // Vérification des statuts de paiement
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

  // Gestion du paiement
  const handlePayer = async () => {
    const order_id = uuidv4()
    const link = `${baseUrlFrontend}/merci`

    try {
      const paymentResponse = await axiosInstance.post("/api/paiement/lygos/", {
        amount: 250,
        shop_name: "Bayis Immob",
        message: `Participation à: ${selectedTombola.titre}`,
        order_id: order_id,
        success_url: link,
      })

      if (paymentResponse.status === 200) {
        await axiosInstance.post(`/api/user-tombolas/`, {
          user: user.id,
          order_id: order_id,
          tombola: selectedTombola.id
        })

        toast({
          title: "Paiement initié",
          description: "Redirection vers le paiement...",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        window.open(paymentResponse.data.link, "_blank")

        // Recharger les participations après paiement
        const updatedParticipations = await fetchParticipations()
        setUserParticipations(updatedParticipations)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Erreur lors du paiement",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Composants modaux
  const CouponModal = () => (
    <Modal isOpen={isCouponOpen} onClose={onCouponClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Participation à la tombola</ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center">
          <Image
            src="/coupon.png"
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
          <Button colorScheme="blue" mr={3} onClick={handlePayer}>
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
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onDetailClose}>
            Fermer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  // Composant de filtre
  const FilterButtons = () => (
    <HStack spacing={2} mb={6} overflowX="auto" pb={2}>
      <Button
        size="sm"
        variant={filter === "all" ? "solid" : "outline"}
        onClick={() => setFilter("all")}
        borderRadius="full"
        colorScheme="gray"
      >
        Toutes
      </Button>
      <Button
        size="sm"
        variant={filter === "active" ? "solid" : "outline"}
        onClick={() => setFilter("active")}
        borderRadius="full"
        colorScheme="gray"
      >
        Actives
      </Button>
      <Button
        size="sm"
        variant={filter === "participating" ? "solid" : "outline"}
        onClick={() => setFilter("participating")}
        borderRadius="full"
        colorScheme="gray"
      >
        Mes participations
      </Button>
      <Select
        size="sm"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        borderRadius="full"
        colorScheme="gray"
        maxW="150px"
      >
        <option value="participants">Participants</option>
        <option value="date">Date</option>
      </Select>
    </HStack>
  )

  // Composant de carte tombola
  const TombolaCard = ({
    tombola,
    isParticipating,
    isModerateur,
    textColor,
    borderColor,
    sidebarBg,
    onDetailClick,
    onCouponClick,
    isMobile
  }) => (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={sidebarBg}
      position="relative"
      cursor="pointer"
      onClick={onDetailClick}
      _hover={{ shadow: "md" }}
    >
      {isParticipating && (
        <Badge colorScheme="green" position="absolute" top={2} right={2}>
          Vous participez
        </Badge>
      )}

      <Flex justify="space-between" mb={2}>
        <Heading size="md" color={textColor}>
          {tombola.titre}
        </Heading>
      </Flex>

      <HStack mb={2} spacing={4}>
        <Flex align="center">
          <Icon as={FaUsers} mr={1} />
          <Text fontSize="sm">{tombola.participants_actuel} participants</Text>
        </Flex>
        <Flex align="center">
          <Icon as={FaClock} mr={1} />
          <Text fontSize="sm">Fin: {new Date(tombola.date_fin).toLocaleDateString()}</Text>
        </Flex>
      </HStack>

      <Text noOfLines={2} mb={2} color={textColor}>
        {tombola.description || "Aucune description..."}
      </Text>

      {isModerateur && (
        <HStack mb={4} flexWrap="wrap">
          <Tag size="sm" variant="subtle" colorScheme="blue">
            Cagnotte: {tombola.cagnotte} Fcfa
          </Tag>
        </HStack>
      )}

      <HStack spacing={2}>
        <Button
          colorScheme="blue"
          size={isMobile ? "sm" : "md"}
          onClick={onCouponClick}
        >
          Participer
        </Button>
      </HStack>
    </Box>
  )

  if (isLoading) return <Loading />


  return (

    <div>

      <SimpleNavbar />
      <Container maxW="container.xl" py={8}>
        <Box bg={headerBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color={textColor}>
              Tombolas à découvrir
            </Heading>
          </Flex>

          <InputGroup maxW={{ base: "100%", md: "400px" }} my={4}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher une tombola..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <FilterButtons />

          <VStack spacing={4} align="stretch">
            {filteredTombolas.map(tombola => {
              const participation = userParticipations.filter((participation) => participation.tombola_id == tombola.id)[0]
              console.log("part:", participation);

              { participation && checkPaymentStatus(participation) }

              return (<TombolaCard
                key={tombola.id}
                tombola={tombola}
                isParticipating={userParticipations.some(participation => (participation.tombola_id === tombola.id && participation.is_payed))}
                isModerateur={isModerateur}
                textColor={textColor}
                borderColor={borderColor}
                sidebarBg={sidebarBg}
                onDetailClick={() => setSelectedTombola(tombola)}
                onCouponClick={(e) => {
                  e.stopPropagation()
                  setSelectedTombola(tombola)
                  onCouponOpen()
                }}
                isMobile={isMobile}
              />)

            })}
          </VStack>
        </Box>
      </Container>
      <Footer />

      <CouponModal />
      <DetailModal />
    </div>
  )
}

export default TombolaListing