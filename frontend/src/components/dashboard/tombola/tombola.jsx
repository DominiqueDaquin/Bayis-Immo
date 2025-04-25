"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Flex,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Container,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Heading,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react"
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from "react-icons/fi"
import axiosInstance from "@/api/axios"
import Loading from "../../partials/loading" // Import du composant de chargement
import { useAuth } from "@/hooks/useAuth"
import TombolaCard from "./tombola-card"
import TombolaForm from "./tombola-form"

const getStatusColor = (status) => {
  switch (status) {
    case "a":
      return "green"
    case "p":
      return "orange"
    case "f":
      return "blue"
    case "r":
      return "red"
    default:
      return "gray"
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "a":
      return "Active"
    case "p":
      return "En attente"
    case "f":
      return "Terminée"
    case "r":
      return "Rejetée"
    default:
      return status
  }
}

export default function Tombola({ isModerateur }) {
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [selectedTombola, setSelectedTombola] = useState(null)
  const [tombolas, setTombolas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const cancelRef = React.useRef()
  const toast = useToast()
  const { user } = useAuth()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })
  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  // Charger les tombolas depuis l'API
  useEffect(() => {
    const fetchTombolas = async () => {
      try {
        const endpoint = isModerateur ? "/api/tombolas/" : "/api/tombolas/mes-tombolas"
        const response = await axiosInstance.get(endpoint)
        setTombolas(response.data)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les cagnottes.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchTombolas()
  }, [toast, isModerateur])

  // Créer une tombola
  const handleCreateSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post("/api/tombolas/", { ...formData, creer_par: user.id },{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setTombolas([...tombolas, response.data])
      onCreateClose()
      toast({
        title: "Succès",
        description: "La cagnotte a été créée avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.log(error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la cagnotte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Modifier une tombola
  const handleEditSubmit = async (formData) => {
    try {
      const response = await axiosInstance.patch(`/api/tombolas/${selectedTombola.id}/`, {...formData,"statut":"p"})
      setTombolas(tombolas.map((t) => (t.id === response.data.id ? response.data : t)))
      onEditClose()
      toast({
        title: "Succès",
        description: "La cagnotte a été mise à jour avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la cagnotte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Supprimer une tombola
  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/api/tombolas/${selectedTombola.id}`)
      setTombolas(tombolas.filter((t) => t.id !== selectedTombola.id))
      onDeleteClose()
      toast({
        title: "Succès",
        description: "La cagnotte a été supprimée avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la cagnotte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Valider ou rejeter une tombola (pour modérateurs)
  const handleStatusChange = async (tombolaId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/tombolas/${tombolaId}/`, { statut: newStatus })
      setTombolas(tombolas.map((t) => (t.id === tombolaId ? response.data : t)))
      toast({
        title: "Succès",
        description: `La Cagnotte a été ${newStatus === "a" ? "validée" : "rejetée"} avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la ${newStatus === "a" ? "validation" : "rejet"} de la cagnotte.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Filtrage et recherche
  const filteredTombolas = tombolas
    .filter((t) => (filterStatus === "all" ? true : t.statut === filterStatus))
    .filter((t) => t.titre.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Box bg={bgColor} minH="100vh" >
      <Container maxW="7xl" py={8} px={{ base: 0, md: 8 }}>
        <Box bg={sidebarBg} p={6} borderRadius="md" boxShadow="md">
          <Flex justify="space-between" align="center" mb={8}>
            <Heading size="lg">{isModerateur ? "Cagnottes à valider" : "Mes Cagnotte"}</Heading>
            
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen}>
              {
                isMobile?("Créer"):("Créer une Cagnotte")
              }
                
              </Button>
            
          </Flex>

          <Flex mb={6} gap={4}>
            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher une cagnotte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            {!isModerateur && (
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                maxW={{ base: "100%", md: "200px" }}
              >
                <option value="all">Toutes</option>
                <option value="a">Actives</option>
                <option value="p">En attente</option>
                <option value="f">Terminées</option>
                <option value="r">Rejetées</option>
              </Select>
            )}
          </Flex>

          {isLoading ? (
            <Loading />
          ) : filteredTombolas.length === 0 ? (
            <Text textAlign="center" fontSize="lg" color="gray.500">
              Aucune cagnotte trouvée.
            </Text>
          ) : isMobile ? (
            <VStack spacing={4}>
              {filteredTombolas.map((tombola) => (
                <TombolaCard
                  key={tombola.id}
                  tombola={tombola}
                  onView={(t) => {
                    setSelectedTombola(t)
                    onViewOpen()
                  }}
                  onEdit={(t) => {
                    setSelectedTombola(t)
                    onEditOpen()
                  }}
                  onDelete={(t) => {
                    setSelectedTombola(t)
                    onDeleteOpen()
                  }}
                  isModerateur={isModerateur}
                  onValidate={() => handleStatusChange(tombola.id, "a")}
                  onReject={() => handleStatusChange(tombola.id, "r")}
                  
                />
              ))}
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Titre</Th>
                    <Th>Cagnotte</Th>
                    <Th>Statut</Th>
                    <Th>Date de fin</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTombolas.map((tombola) => (
                    <Tr key={tombola.id}>
                      <Td>
                        <Image src={tombola?.photo} boxSize="100px"></Image>
                        {tombola.titre}</Td>
                      <Td>{tombola.cagnotte} Fcfa</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(tombola.statut)}>{getStatusText(tombola.statut)}</Badge>
                      </Td>
                      <Td>{new Date(tombola.date_fin).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEye />}
                            aria-label="Voir"
                            onClick={() => {
                              setSelectedTombola(tombola)
                              onViewOpen()
                            }}
                          />
                          {!isModerateur && (
                            <>
                              <IconButton
                                icon={<FiEdit2 />}
                                aria-label="Modifier"
                                onClick={() => {
                                  setSelectedTombola(tombola)
                                  onEditOpen()
                                }}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                aria-label="Supprimer"
                                colorScheme="red"
                                onClick={() => {
                                  setSelectedTombola(tombola)
                                  onDeleteOpen()
                                }}
                              />
                            </>
                          )}
                          {isModerateur && (
                            <>
                              <IconButton
                                icon={<FiCheck />}
                                aria-label="Valider"
                                colorScheme="green"
                                onClick={() => handleStatusChange(tombola.id, "a")}
                              />
                              <IconButton
                                icon={<FiX />}
                                aria-label="Rejeter"
                                colorScheme="red"
                                onClick={() => handleStatusChange(tombola.id, "r")}
                              />
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Modals */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Détails de la cagnotte</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTombola && (
                <VStack spacing={4} align="stretch">
                  <Image
                    src={selectedTombola.photo || "/placeholder.svg"}
                    alt={selectedTombola.titre}
                    height="200px"
                    objectFit="cover"
                  />
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedTombola.titre}
                  </Text>
                  <Text>{selectedTombola.description}</Text>
                  <Text>Cagnotte: {selectedTombola.cagnotte} Fcfa</Text>
                  <Text>Date de fin: {new Date(selectedTombola.date_fin).toLocaleDateString()}</Text>
                  <Badge colorScheme={getStatusColor(selectedTombola.statut)}>
                    {getStatusText(selectedTombola.statut)}
                  </Badge>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        
          <>
            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={modalSize}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Créer une cagnotte</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <TombolaForm onSubmit={handleCreateSubmit} onCancel={onCreateClose} />
                </ModalBody>
              </ModalContent>
            </Modal>
            <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Modifier la cagnotte</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedTombola && (
                    <TombolaForm tombola={selectedTombola} onSubmit={handleEditSubmit} onCancel={onEditClose} />
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
       

        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Supprimer la cagnotte
              </AlertDialogHeader>
              <AlertDialogBody>
                Êtes-vous sûr de vouloir supprimer cette cagnotte ? Cette action est irréversible.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Annuler
                </Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                  Supprimer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  )
}