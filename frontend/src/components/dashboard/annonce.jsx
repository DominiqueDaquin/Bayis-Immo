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
  Heading,
  SimpleGrid,
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
  useColorModeValue,

} from "@chakra-ui/react"
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheck,
  FiX

} from "react-icons/fi"
import ImageCarousel from "./annonce-image-carrousel"
import Filters from "./annonce-filters"
import PropertyCard from "./annonce-property-card"
import PropertyForm from "./annonce-property-form"
import axiosInstance from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
import Loading from "../partials/loading"
import { baseUrl } from "@/config"


export default function Annonce({ isModerateur }) {
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const cancelRef = React.useRef()
  const toast = useToast();
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false })
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })
  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  const filteredAnnonce = properties
    .filter((t) => t.titre.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const endpoint = isModerateur ? "/api/annonces/" : "/api/annonces/mes-annonces"
        const response = await axiosInstance.get(endpoint)

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
        return "gray"
      case "r":
        return "red"
      case "s":
        return "blue"
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
      case "r":
        return "Rejetté"
      case "s":
        return "Sponsorisé"
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
    console.log("Données recues:", formData);

    try {
      const response = await axiosInstance.post("/api/annonces/", { ...formData, creer_par: user.id },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const newProperty = response.data
      setProperties([newProperty,...properties])
      onCreateClose()
      toast(
        {
          title: "Annonce Creer a success",
          status: "success",
          duration: 5000,
          isClosable: true
        }
      )
    } catch (error) {

      toast(
        {
          title: "Erreur lors de la creation de l'annonce",
          description: error.response?.data?.prix || "impossible de creer cette annonce, veuillez reessayez",
          status: "error",
          duration: 5000,
          isClosable: true
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
      return <Loading />
    }

    if (isMobile) {
      return (
        <VStack spacing={4} align="stretch">
          {filteredAnnonce.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleViewProperty}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              isModerateur={isModerateur}
              handleViewProperty={handleViewProperty}
              handleStatusChange={handleStatusChange}
            />
          ))}
        </VStack>
      )
    }

    return (
      <Box overflowX="auto" bg={bgColor} borderRadius="md" boxShadow="sm" minH="100vh" >
        <Table variant="simple">
          <Thead bg={bgColor}>
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
            {filteredAnnonce.map((property) => (
              <Tr
                key={property.id}
                cursor="pointer"
                bg={headerBg}

                _hover={{ bg: bgColor }}
                onClick={() =>isModerateur ?(""): handleViewProperty(property)}

              >
                <Td>
                  {property.photos.length > 0 ? (
                    <Image
                      src={`${baseUrl}${property.photos[0].photo}` || property.photos[0].photo}
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
                  <VStack align="start" spacing={1} isTruncated>
                    <Text fontWeight="bold">{property.titre.length>20?property.titre.slice(0,10)+"...":property.titre}</Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{property.prix} Fcfa </Text>
                  </VStack>
                </Td>

                <Td>
                  <Text fontSize="sm" color="gray.600" isTruncated>
                    {property.description.length > 100 ? property.description.slice(0, 10) + "..." : property.description}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(property.status)}>{getStatusText(property.status)}</Badge>
                </Td>
                <Td>{new Date(property.creer_le).toLocaleDateString()}</Td>
                <Td>

                  {isModerateur ? (
                    <>
                      <HStack>
                        <IconButton 
                        icon={<FiEye />}
                        aria-label="voir"
                        colorScheme="green"
                        onClick={()=>handleViewProperty(property)}
                        />
                        <IconButton
                          icon={<FiCheck />}
                          aria-label="Valider"
                          colorScheme="green"
                          onClick={() => handleStatusChange(property.id, "a")}

                        />
                        <IconButton
                          icon={<FiX />}
                          aria-label="Rejeter"
                          colorScheme="red"
                          onClick={() => handleStatusChange(property.id, "r")}

                        />
                      </HStack>

                    </>
                  ) : <HStack spacing={2}>
                    <IconButton
                      icon={<FiEye />}
                      aria-label="Voir"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProperty(property)
                      }}

                    />
                    <IconButton
                      icon={<FiEdit2 />}
                      aria-label="Modifier"
                      size="sm"
                      onClick={(e) => handleEditProperty(property, e)}

                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Supprimer"
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => handleDeleteProperty(property, e)}
                    />
                  </HStack>}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    )
  }

  const handleStatusChange = async (annonceId, newStatus) => {
    try {
      console.log("dans la ");
      
      const response = await axiosInstance.patch(`/api/annonces/${annonceId}/`, { status: newStatus })
      console.log("reponse",response);
      
      setProperties(properties.map((t) => (t.id === annonceId ? response.data : t)))
      toast({
        title: "Succès",
        description: `L'annonce' a été ${newStatus === "a" ? "validée" : "rejetée"} avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      
    if(response.status==200){
      try {
        let message=`votre annonce à été ${newStatus=='a' ?"Approuvé":"Rejeté"}`
        const Notificationresponse = await axiosInstance.post(`/api/notifications/`, { user:response.data.auteur_detail.id ,message:message,type:"a" })
        if(Notificationresponse.status==201){
          toast({
            title:"Notification envoyée",
            description:"Une notification à été envoyeée a l'annonceur pour le prevenir de votre décision sur son annonce ",
            status:"success",
            duration:5000,
            isClosable:true,
          })
        }
        
      } catch (error) {
        console.log(error);
        
      }
    }
    


    } catch (error) {

      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors  ${newStatus === "a" ? "de la validation" : " du rejet"} de l"annonce.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box bg={bgColor} minH="100vh" w="100%">
      <Container maxW="7xl" py={8} px={{ base: 0, md: 8 }}>
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          bg={bgColor}
          direction={{ base: "column", sm: "row" }}
          gap={{ base: 4, sm: 0 }}
        >
          <Heading size="lg"> {isModerateur ? "Annonces à valider" : "Annonces Immobilières"}  </Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen} w={{ base: "full", sm: "auto" }}>
            Créer une annonce
          </Button>
        </Flex>

        <Flex mb={6} gap={4} wrap={{ base: "wrap", md: "nowrap" }} bg={bgColor} direction={{ base: "column", sm: "row" }}>
          <InputGroup maxW={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input placeholder="Rechercher une annonce..." bg={headerBg} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>

        </Flex>



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
                    <VStack align="start" spacing={4} bg={bgColor} p={4}>
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

                  {
                    selectedProperty.auteur_detail.id==user.id && (
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
                    )
                  }

                      
                    </VStack>
                  </VStack>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : (
          <Modal isOpen={isViewOpen} onClose={onViewClose} size={modalSize}>
            <ModalOverlay />
            <ModalContent maxW={{ base: "100%", md: "900px" }} bg={bgColor}>
              <ModalCloseButton zIndex="modal" />
              <ModalBody p={6} bg={bgColor}>
                {selectedProperty && (
                  <VStack spacing={6} align="stretch">
                    <ImageCarousel images={selectedProperty.photos.map((photo) => photo.photo)} />
                    <VStack align="start" spacing={4} bg={bgColor}>
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
                        {
                          selectedProperty.auteur_detail.id == user.id && (
                            <>
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
                            </>
                            
                          )
                        }


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
          <ModalContent bg={bgColor}>
            <ModalHeader>Créer une nouvelle annonce</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <PropertyForm onSubmit={handleCreateSubmit} onCancel={onCreateClose} />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent bg={bgColor}>
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
                    <Box p={4} borderRadius="md">
                      <Text fontWeight="bold" color={textColor} >{selectedProperty.titre}</Text>
                      <Text fontSize="sm" color={textColor} mt={1}>
                        Creer le {new Date(selectedProperty.creer_le).toLocaleDateString()}
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