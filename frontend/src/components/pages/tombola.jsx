"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
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
  Select,
} from "@chakra-ui/react"
import { FaHeart, FaUsers, FaClock } from "react-icons/fa"
import { BsGrid, BsList } from "react-icons/bs"
import axiosInstance from "@/api/axios"
import SimpleNavbar from "../partials/navbar"
import Loading from "../partials/loading"

export default function TombolaListing() {
  const [tombolas, setTombolas] = useState([])
  const [viewMode, setViewMode] = useState("grid")
  const [filter, setFilter] = useState("all")
  const [favorites, setFavorites] = useState([])
  const [searchQuery, setSearchQuery] = useState("") // État pour la barre de recherche
  const [sortBy, setSortBy] = useState("participants") // État pour le tri
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [isLoading, setIsLoading] = useState(true)

  // Couleurs pour le mode clair et sombre
  const bg = useColorModeValue("white", "gray.800")
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.800", "white")

  // Récupérer les tombolas depuis l'API
  useEffect(() => {
    const fetchTombolas = async () => {
      try {
        const response = await axiosInstance.get("/api/tombolas/")
        setTombolas(response.data)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les tombolas.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTombolas()
  }, [])

  // Filtrer et trier les tombolas
  const filteredTombolas = tombolas
    .filter((tombola) => {
      if (filter === "all") return true
      if (filter === "active") return tombola.statut === "a"
      return true
    })
    .filter((tombola) => {
      // Filtrage par recherche
      const query = searchQuery.toLowerCase()
      return (
        (tombola.titre && tombola.titre.toLowerCase().includes(query)) ||
        (tombola.description && tombola.description.toLowerCase().includes(query))
      )
    })
    .sort((a, b) => {
      // Tri par nombre de participants ou date
      if (sortBy === "participants") {
        return b.participants_actuel - a.participants_actuel
      } else if (sortBy === "date") {
        return new Date(a.date_fin) - new Date(b.date_fin)
      }
      return 0
    })

  // Toggle favori
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  // Participer à une tombola
  const handleParticiper = async (id) => {
    try {
      await axiosInstance.post(`/api/tombolas/${id}/participer/`)
      toast({
        title: "Succès",
        description: "Vous avez participé à la tombola avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Erreur",
        description: "Impossible de participer à la tombola.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Vérifier la participation
  const handleVerifierParticipation = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/tombolas/${id}/verifier-participation`)
      if (response.data.participant) {
        toast({
          title: "Info",
          description: "Vous participez déjà à cette tombola.",
          status: "info",
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Info",
          description: "Vous ne participez pas encore à cette tombola.",
          status: "info",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier la participation.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <SimpleNavbar />
      <Container maxW="container.xl" py={8}>
        <Box bg={bg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color={textColor}>
              Tombolas à découvrir
            </Heading>
            <HStack spacing={2}>
              <IconButton
                aria-label="Vue grille"
                icon={<BsGrid />}
                variant={viewMode === "grid" ? "solid" : "outline"}
                onClick={() => setViewMode("grid")}
                colorScheme="gray"
              />
              <IconButton
                aria-label="Vue liste"
                icon={<BsList />}
                variant={viewMode === "list" ? "solid" : "outline"}
                onClick={() => setViewMode("list")}
                colorScheme="gray"
              />
            </HStack>
          </Flex>

          {/* Barre de recherche */}
          <Input
            placeholder="Rechercher une tombola..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            mb={4}
          />

          {/* Filtres et tri */}
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

          {/* Liste des tombolas */}
          <VStack spacing={4} align="stretch">
            {filteredTombolas.map((tombola) => (
              <Box
                key={tombola.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={cardBg}
                position="relative"
              >
                <Flex justify="space-between" mb={2}>
                  <Heading size="md" color={textColor}>
                    {tombola.titre}
                  </Heading>
                  <HStack>
                    <IconButton
                      aria-label="Ajouter aux favoris"
                      icon={<FaHeart />}
                      variant="ghost"
                      colorScheme={favorites.includes(tombola.id) ? "red" : "gray"}
                      onClick={() => toggleFavorite(tombola.id)}
                      size="sm"
                    />
                  </HStack>
                </Flex>

                {tombola.statut === "a" && (
                  <Badge colorScheme="green" position="absolute" top={4} right={4}>
                    Active
                  </Badge>
                )}

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
                  {tombola.description}
                </Text>

                <HStack mb={4} flexWrap="wrap">
                  <Tag size="sm" variant="subtle" colorScheme="blue">
                    Cagnotte: {tombola.cagnotte} Fcfa
                  </Tag>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    colorScheme="blue"
                    size={isMobile ? "sm" : "md"}
                    onClick={() => handleParticiper(tombola.id)}
                  >
                    Participer
                  </Button>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "md"}
                    onClick={() => handleVerifierParticipation(tombola.id)}
                  >
                    Vérifier participation
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      </Container>
    </div>
  )
}