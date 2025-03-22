"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Image,
  useToast,
  Badge,
  useColorModeValue,
  HStack,
  IconButton,
} from "@chakra-ui/react"
import axiosInstance from "@/api/axios"
import { v4 as uuidv4 } from "uuid"
import { FiCheck, FiX } from "react-icons/fi"
import { useAuth } from "@/hooks/useAuth"

export default function GestionnaireCampagnes({ isModerateur }) {
  const [campagnes, setCampagnes] = useState([])
  const [annonces, setAnnonces] = useState([])
  const [publiciteSelectionnee, setPubliciteSelectionnee] = useState("")
  const [montant, setMontant] = useState("")
  const [titre, setTitre] = useState("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { user } = useAuth()
  const bgColor = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // États pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Récupérer les annonces créées par l'utilisateur
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axiosInstance.get("/api/annonces/mes-annonces")
        setAnnonces(response.data)
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
    }

    fetchAnnonces()
  }, [])

  // Récupérer les publicités
  useEffect(() => {
    const fetchPublicites = async () => {
      try {
        const endpoint = isModerateur ? "/api/publicites/" : `/api/publicites/mes-publicites/`
        const response = await axiosInstance.get(endpoint)
        setCampagnes(response.data)
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les publicités.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
    }

    fetchPublicites()
  }, [isModerateur, user])

  // Créer une passerelle de paiement avec Lygos
  const createPaymentGateway = async (montant, annonceId, titre) => {
    try {
      const response = await axiosInstance.post("/api/paiement/lygos/", {
        amount: montant,
        shop_name: "Bayis Immob",
        message: "Paiement pour la publicité",
        order_id: uuidv4(),
      })
      return response.data
    } catch (err) {
      throw new Error("Erreur lors de la création de la passerelle de paiement.")
    }
  }

  // Créer une nouvelle publicité
  const handleCreerCampagne = async () => {
    if (!publiciteSelectionnee || !montant || !titre) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
      return
    }

    try {
      const paymentGateway = await createPaymentGateway(montant, publiciteSelectionnee, titre)
      window.location.href = paymentGateway.link
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du paiement.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Supprimer une publicité
  const handleSupprimerPublicite = async (id) => {
    try {
      await axiosInstance.delete(`/api/publicites/${id}/`)
      setCampagnes(campagnes.filter((campagne) => campagne.id !== id))
      toast({
        title: "Succès",
        description: "Publicité supprimée avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la publicité.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Activer ou désactiver une publicité (pour modérateurs)
  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await axiosInstance.patch(`/api/publicites/${id}/`, { is_active: !isActive })
      setCampagnes(campagnes.map((campagne) => (campagne.id === id ? response.data : campagne)))
      toast({
        title: "Succès",
        description: `La publicité a été ${!isActive ? "activée" : "désactivée"} avec succès.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la ${!isActive ? "activation" : "désactivation"} de la publicité.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Formater la date de création
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filtrer les publicités en fonction du statut et de la recherche
  const filteredCampagnes = campagnes
    .filter((campagne) => {
      if (filterStatus === "all") return true
      if (filterStatus === "active") return campagne.is_active
      if (filterStatus === "inactive") return !campagne.is_active
      return true
    })
    .filter((campagne) => campagne.titre.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg" color={textColor}>
            {isModerateur ? "Gestion des Publicités" : "Mes Campagnes Publicitaires"}
          </Heading>
          {!isModerateur && (
            <Button colorScheme="blue" onClick={onOpen}>
              + Créer une publicité
            </Button>
          )}
        </Flex>

        <Box mb={6}>
          <Flex mb={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                {/* <SearchIcon color="gray.300" /> */}
              </InputLeftElement>
              <Input
                placeholder="Rechercher une campagne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Flex>

          <Tabs colorScheme="blue" mb={4} onChange={(index) => {
            const statusMap = ["all", "active", "inactive"]
            setFilterStatus(statusMap[index])
          }}>
            <TabList>
              <Tab>Toutes</Tab>
              <Tab>Actives</Tab>
              <Tab>Inactives</Tab>
            </TabList>
          </Tabs>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>TITRE</Th>
                <Th>ANNONCE</Th>
                <Th>MONTANT</Th>
                <Th>DATE DE CRÉATION</Th>
                <Th>STATUT</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCampagnes.map((campagne) => (
                <Tr key={campagne.id}>
                  <Td>{campagne.titre}</Td>
                  <Td>{campagne.annonce.titre}</Td>
                  <Td color="blue.500" fontWeight="medium">
                    {campagne.montant} Fcfa
                  </Td>
                  <Td>{formatDate(campagne.date_creation)}</Td>
                  <Td>
                    <Badge colorScheme={campagne.is_active ? "green" : "red"}>
                      {campagne.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {isModerateur && (
                        <>
                          <IconButton
                            icon={<FiCheck />}
                            aria-label="Activer"
                            colorScheme={campagne.is_active ? "gray" : "green"}
                            onClick={() => handleToggleActive(campagne.id, campagne.is_active)}
                          />
                          <IconButton
                            icon={<FiX />}
                            aria-label="Désactiver"
                            colorScheme={campagne.is_active ? "red" : "gray"}
                            onClick={() => handleToggleActive(campagne.id, campagne.is_active)}
                          />
                        </>
                      )}
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleSupprimerPublicite(campagne.id)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Modal pour créer une nouvelle publicité */}
        {!isModerateur && (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Créer une nouvelle publicité</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl mb={4}>
                  <FormLabel>Titre de la publicité</FormLabel>
                  <Input
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Entrer le titre de la publicité"
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Sélectionner l'annonce à booster</FormLabel>
                  <Select
                    placeholder="Choisir une annonce"
                    value={publiciteSelectionnee}
                    onChange={(e) => setPubliciteSelectionnee(e.target.value)}
                  >
                    {annonces.map((annonce) => (
                      <option key={annonce.id} value={annonce.id.toString()}>
                        {annonce.titre}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Montant (en Fcfa)</FormLabel>
                  <Input
                    type="number"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    placeholder="Entrer le montant"
                  />
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleCreerCampagne}>
                  Payer et créer
                </Button>
                <Button onClick={onClose}>Annuler</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  )
}