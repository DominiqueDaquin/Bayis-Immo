"use client"
import { useToast } from "@chakra-ui/react"
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
  HStack,
  VStack,
  Tag,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  InputRightAddon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react"
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiImage,
  FiMapPin,
  FiHome,
} from "react-icons/fi"
import ImageCarousel from "./annonce-image-carrousel"
import Filters from "./annonce-filters"
import PropertyCard from "./annonce-property-card"
import PropertyForm from "./annonce-property-form"
import axiosInstance from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
import Loading from "../partials/loading"
import { baseUrl } from "@/config"

export default function Annonce() {
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const cancelRef = React.useRef()
  const toast=useToast();
  const {user}=useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false })
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })

  // Fetch annonces from API
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axiosInstance.get("/api/annonces/mes-annonces")
          
        setProperties(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des annonces:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnonces()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "a":
        return "green"
      case "p":
        return "orange"
      case "d":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "a":
        return "Approuvé"
      case "p":
        return "En attente"
      case "d":
        return "Désactivé"
      default:
        return status
    }
  }

  const handleViewProperty = (property) => {
    setSelectedProperty(property)
    onViewOpen()
  }

  const handleEditProperty = (property, e) => {
    if (e) e.stopPropagation()
    setSelectedProperty(property)
    onEditOpen()
  }

  const handleDeleteProperty = (property, e) => {
    if (e) e.stopPropagation()
    setSelectedProperty(property)
    onDeleteOpen()
  }

  const handleCreateSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post("/api/annonces/",{...formData,creer_par:user.id})
      
      const newProperty = response.data
      setProperties([...properties, newProperty])
      onCreateClose()
      toast(
        {
          title:"Annonce Creer a success",
          status:"success",
          duration:5000,
          isClosable:true
        }
      )
    } catch (error) {
      
      toast(
        {
          title:"Erreur lors de la creation de l'annonce",
          description:error.response?.data?.prix || "impossible de creer cette annonce, veuillez reessayez",
          status:"error",
          duration:5000,
          isClosable:true
        }
      )
      console.error("Erreur lors de la création de l'annonce:", error)
    }
  }

  const handleEditSubmit = async (formData) => {
    try {
      const response = await axiosInstance.patch(`/api/annonces/${selectedProperty.id}/`, formData)
      const updatedProperty = response.data
      const updatedProperties = properties.map((prop) =>
        prop.id === updatedProperty.id ? updatedProperty : prop,
      )
      setProperties(updatedProperties)
      onEditClose()
    } catch (error) {
      console.error("Erreur lors de la modification de l'annonce:", error)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/api/annonces/${selectedProperty.id}/`)
      const filteredProperties = properties.filter((prop) => prop.id !== selectedProperty.id)
      setProperties(filteredProperties)
      onDeleteClose()
    } catch (error) {
      console.error("Erreur lors de la suppression de l'annonce:", error)
    }
  }

  const renderPropertyList = () => {
    if (isLoading) {
      return <Loading/>
    }

    if (isMobile) {
      return (
        <VStack spacing={4} align="stretch">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleViewProperty}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          ))}
        </VStack>
      )
    }

    return (
      <Box overflowX="auto" bg="white" borderRadius="md" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="white">
            <Tr>
              <Th>Photo</Th>
              <Th>Titre</Th>
              <Th>Prix</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {properties.map((property) => (
              <Tr
                key={property.id}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                onClick={() => handleViewProperty(property)}
                bg="white"
              >
                <Td>
                  {property.photos.length > 0 ? (
                    <Image
                      src={`${baseUrl}${property.photos[0].photo}`}
                      alt={property.titre}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  ) : (
                    <Image
                      src="/placeholder.svg"
                      alt="Pas d'image"
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  )}
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{property.titre}</Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{property.prix} Fcfa </Text>
                  </VStack>
                </Td>

                <Td>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {property.description}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(property.status)}>{getStatusText(property.status)}</Badge>
                </Td>
                <Td>{new Date(property.creer_le).toLocaleDateString()}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<FiEye />}
                      aria-label="Voir"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProperty(property)
                      }}
                      bg="white"
                    />
                    <IconButton
                      icon={<FiEdit2 />}
                      aria-label="Modifier"
                      size="sm"
                      onClick={(e) => handleEditProperty(property, e)}
                      bg="white"
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Supprimer"
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => handleDeleteProperty(property, e)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    )
  }

  return (
    <Box bg="white" minH="100vh" w="100%">
      <Container maxW="7xl" py={8} px={{ base: 4, md: 8 }}>
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          bg="white"
          direction={{ base: "column", sm: "row" }}
          gap={{ base: 4, sm: 0 }}
        >
          <Heading size="lg">Annonces Immobilières</Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen} w={{ base: "full", sm: "auto" }}>
            Créer une annonce
          </Button>
        </Flex>

        <Flex mb={6} gap={4} wrap={{ base: "wrap", md: "nowrap" }} bg="white" direction={{ base: "column", sm: "row" }}>
          <InputGroup maxW={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input placeholder="Rechercher une annonce..." bg="white" />
          </InputGroup>
          <HStack spacing={2} justifyContent={{ base: "flex-end", sm: "flex-start" }}>
            <IconButton icon={<FiFilter />} aria-label="Filtrer" bg="white" />
            <IconButton icon={<FiDownload />} aria-label="Exporter" bg="white" />
          </HStack>
        </Flex>

        <Box overflowX="auto">
          <Filters onFilterChange={(filter) => console.log(filter)} />
        </Box>

        {renderPropertyList()}

        {isMobile ? (
          <Drawer isOpen={isViewOpen} placement="bottom" onClose={onViewClose} size="full">
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Détails de l'annonce</DrawerHeader>
              <DrawerBody p={0}>
                {selectedProperty && (
                  <VStack spacing={6} align="stretch">
                    <ImageCarousel images={selectedProperty.photos.map((photo) => photo.photo)} />
                    <VStack align="start" spacing={4} bg="white" p={4}>
                      <Heading size="lg">{selectedProperty.titre}</Heading>
                      <HStack>
                        <Badge colorScheme={getStatusColor(selectedProperty.status)}>
                          {getStatusText(selectedProperty.status)}
                        </Badge>
                      </HStack>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Description
                        </Text>
                        <Text>{selectedProperty.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={4} w="full" pt={4}>
                        <Button
                          colorScheme="blue"
                          leftIcon={<FiEdit2 />}
                          onClick={() => {
                            onViewClose()
                            handleEditProperty(selectedProperty)
                          }}
                          w="full"
                        >
                          Modifier
                        </Button>
                        <Button
                          colorScheme="red"
                          leftIcon={<FiTrash2 />}
                          onClick={() => {
                            onViewClose()
                            handleDeleteProperty(selectedProperty)
                          }}
                          w="full"
                        >
                          Supprimer
                        </Button>
                      </SimpleGrid>
                    </VStack>
                  </VStack>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : (
          <Modal isOpen={isViewOpen} onClose={onViewClose} size={modalSize}>
            <ModalOverlay />
            <ModalContent maxW={{ base: "100%", md: "900px" }} bg="white">
              <ModalCloseButton zIndex="modal" />
              <ModalBody p={6} bg="white">
                {selectedProperty && (
                  <VStack spacing={6} align="stretch">
                    <ImageCarousel images={selectedProperty.photos.map((photo) => photo.photo)} />
                    <VStack align="start" spacing={4} bg="white">
                      <Heading size="lg">{selectedProperty.titre}</Heading>
                      <HStack>
                        <Badge colorScheme={getStatusColor(selectedProperty.status)}>
                          {getStatusText(selectedProperty.status)}
                        </Badge>
                      </HStack>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Description
                        </Text>
                        <Text>{selectedProperty.description}</Text>
                      </Box>
                      <HStack spacing={4}>
                        <Button
                          colorScheme="blue"
                          leftIcon={<FiEdit2 />}
                          onClick={() => {
                            onViewClose()
                            handleEditProperty(selectedProperty)
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          colorScheme="red"
                          leftIcon={<FiTrash2 />}
                          onClick={() => {
                            onViewClose()
                            handleDeleteProperty(selectedProperty)
                          }}
                        >
                          Supprimer
                        </Button>
                      </HStack>
                    </VStack>
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalHeader>Créer une nouvelle annonce</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <PropertyForm onSubmit={handleCreateSubmit} onCancel={onCreateClose} />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalHeader>Modifier l'annonce</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedProperty && (
                <PropertyForm property={selectedProperty} onSubmit={handleEditSubmit} onCancel={onEditClose} />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent mx={4}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Supprimer l'annonce
              </AlertDialogHeader>

              <AlertDialogBody>
                {selectedProperty && (
                  <>
                    <Text mb={4}>
                      Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action ne peut pas être annulée.
                    </Text>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold">{selectedProperty.titre}</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {new Date(selectedProperty.creer_le).toLocaleDateString()}
                      </Text>
                    </Box>
                  </>
                )}
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