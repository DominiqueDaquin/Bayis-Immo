"use client"

import React, { useState } from "react"
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

// Composant pour le carrousel d'images
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Box position="relative">
      <Image
        src={images[currentIndex] || "/placeholder.svg"}
        alt={`Image ${currentIndex + 1}`}
        w="100%"
        h={{ base: "250px", md: "400px" }}
        objectFit="cover"
        borderRadius="lg"
      />
      <IconButton
        icon={<FiChevronLeft />}
        position="absolute"
        left="2"
        top="50%"
        transform="translateY(-50%)"
        onClick={prevImage}
        isRound
        bg="white"
        opacity="0.8"
        _hover={{ opacity: 1 }}
        size={{ base: "sm", md: "md" }}
      />
      <IconButton
        icon={<FiChevronRight />}
        position="absolute"
        right="2"
        top="50%"
        transform="translateY(-50%)"
        onClick={nextImage}
        isRound
        bg="white"
        opacity="0.8"
        _hover={{ opacity: 1 }}
        size={{ base: "sm", md: "md" }}
      />
      <HStack justify="center" mt={4} spacing={2}>
        {images.map((_, index) => (
          <Box
            key={index}
            w="2"
            h="2"
            borderRadius="full"
            bg={index === currentIndex ? "blue.500" : "gray.300"}
            cursor="pointer"
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </HStack>
    </Box>
  )
}

// Composant pour les filtres
const Filters = ({ onFilterChange }) => {
  return (
    <HStack spacing={4} mb={6} wrap="wrap" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Tag size="lg" variant="outline" colorScheme="blue" cursor="pointer" onClick={() => onFilterChange("all")}>
        Tous
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="green" cursor="pointer" onClick={() => onFilterChange("active")}>
        Actif
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="orange" cursor="pointer" onClick={() => onFilterChange("pending")}>
        En attente
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="red" cursor="pointer" onClick={() => onFilterChange("sold")}>
        Vendu
      </Tag>
    </HStack>
  )
}

// Composant pour afficher une annonce en mode carte (pour mobile)
const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
  const { title, description, price, status, publishedAt, images } = property

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green"
      case "pending":
        return "orange"
      case "sold":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Actif"
      case "pending":
        return "En attente"
      case "sold":
        return "Vendu"
      default:
        return status
    }
  }

  return (
    <Card mb={4} overflow="hidden" variant="outline">
      <Image src={images[0] || "/placeholder.svg"} alt={title} height="200px" objectFit="cover" />
      <CardBody>
        <VStack align="start" spacing={2}>
          <Heading size="md">{title}</Heading>
          <Text color="blue.600" fontWeight="bold">
            {price}
          </Text>
          <Badge colorScheme={getStatusColor(status)}>{getStatusText(status)}</Badge>
          <Text noOfLines={2} fontSize="sm" color="gray.600">
            {description}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Publié le {new Date(publishedAt).toLocaleDateString()}
          </Text>
          <HStack spacing={2} pt={2}>
            <Button size="sm" leftIcon={<FiEye />} onClick={() => onView(property)}>
              Voir
            </Button>
            <Button size="sm" leftIcon={<FiEdit2 />} onClick={() => onEdit(property)}>
              Modifier
            </Button>
            <Button size="sm" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => onDelete(property)}>
              Supprimer
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

// Composant de formulaire pour création/modification d'annonce
const PropertyForm = ({ property, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    property || {
      title: "",
      description: "",
      price: "",
      location: "",
      surface: "",
      status: "active",
      features: [],
      images: ["/placeholder.svg?height=400&width=600"],
    },
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleFeatureChange = (e) => {
    const { value } = e.target
    // Convertir la chaîne en tableau en séparant par des virgules
    const featuresArray = value.split(",").map((item) => item.trim())
    setFormData((prev) => ({ ...prev, features: featuresArray }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Titre</FormLabel>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Villa moderne avec piscine"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description détaillée du bien"
            rows={4}
          />
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Prix</FormLabel>
            <InputGroup>
              <NumberInput w="full">
                <NumberInputField
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex: 250000"
                />
              </NumberInput>
              <InputRightAddon children="€" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Surface</FormLabel>
            <InputGroup>
              <NumberInput w="full">
                <NumberInputField
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  placeholder="Ex: 120"
                />
              </NumberInput>
              <InputRightAddon children="m²" />
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        <FormControl isRequired>
          <FormLabel>Localisation</FormLabel>
          <Input name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Bordeaux" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Statut</FormLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="sold">Vendu</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Caractéristiques (séparées par des virgules)</FormLabel>
          <Input
            name="features"
            value={formData.features.join(", ")}
            onChange={handleFeatureChange}
            placeholder="Ex: 3 chambres, 2 SDB, Jardin"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Images</FormLabel>
          <HStack>
            <Input
              placeholder="URL de l'image"
              value={formData.images[0] || ""}
              onChange={(e) => {
                const newImages = [...formData.images]
                newImages[0] = e.target.value
                setFormData((prev) => ({ ...prev, images: newImages }))
              }}
            />
            <IconButton icon={<FiImage />} aria-label="Ajouter une image" />
          </HStack>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Ajoutez des URLs d'images ou utilisez le bouton pour télécharger
          </Text>
        </FormControl>

        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button onClick={onCancel}>Annuler</Button>
          <Button colorScheme="blue" type="submit">
            {property ? "Mettre à jour" : "Créer l'annonce"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

// Composant principal
export default function Annonce() {
  // États pour les différentes modales
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [selectedProperty, setSelectedProperty] = useState(null)
  const cancelRef = React.useRef()

  // Détection de la taille d'écran pour le responsive
  const isMobile = useBreakpointValue({ base: true, md: false })
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })

  // Données exemple
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Villa moderne avec piscine",
      description:
        "Magnifique villa contemporaine de 200m² avec piscine, jardin paysager et vue panoramique. Prestations haut de gamme, 5 chambres, 3 salles de bains...",
      status: "active",
      price: "750 000 €",
      location: "Bordeaux",
      publishedAt: "2024-03-14",
      images: [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
      ],
      features: ["5 chambres", "3 SDB", "Piscine", "Jardin"],
      surface: "200m²",
    },
    {
      id: 2,
      title: "Appartement centre-ville",
      description:
        "Bel appartement rénové au cœur du centre historique. Parquet ancien, moulures, grande hauteur sous plafond. Cuisine équipée, 2 chambres...",
      status: "pending",
      price: "320 000 €",
      location: "Bordeaux",
      publishedAt: "2024-03-13",
      images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
      features: ["2 chambres", "1 SDB", "Balcon"],
      surface: "75m²",
    },
    {
      id: 3,
      title: "Maison de ville avec jardin",
      description:
        "Charmante maison de ville avec jardin privatif. Rénovation récente, belle pièce de vie lumineuse, 3 chambres à l'étage...",
      status: "sold",
      price: "450 000 €",
      location: "Bordeaux",
      publishedAt: "2024-03-12",
      images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
      features: ["3 chambres", "2 SDB", "Jardin"],
      surface: "120m²",
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green"
      case "pending":
        return "orange"
      case "sold":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Actif"
      case "pending":
        return "En attente"
      case "sold":
        return "Vendu"
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

  const handleCreateSubmit = (formData) => {
    // Simuler la création d'une nouvelle annonce
    const newProperty = {
      ...formData,
      id: properties.length + 1,
      publishedAt: new Date().toISOString().split("T")[0],
    }
    setProperties([...properties, newProperty])
    onCreateClose()
  }

  const handleEditSubmit = (formData) => {
    // Mettre à jour l'annonce existante
    const updatedProperties = properties.map((prop) =>
      prop.id === selectedProperty.id ? { ...prop, ...formData } : prop,
    )
    setProperties(updatedProperties)
    onEditClose()
  }

  const handleDeleteConfirm = () => {
    // Supprimer l'annonce
    const filteredProperties = properties.filter((prop) => prop.id !== selectedProperty.id)
    setProperties(filteredProperties)
    onDeleteClose()
  }

  // Rendu conditionnel pour mobile ou desktop
  const renderPropertyList = () => {
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
                  <Image
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{property.title}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {property.description}
                    </Text>
                  </VStack>
                </Td>
                <Td fontWeight="bold">{property.price}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(property.status)}>{getStatusText(property.status)}</Badge>
                </Td>
                <Td>{new Date(property.publishedAt).toLocaleDateString()}</Td>
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
        {/* En-tête */}
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

        {/* Barre de recherche et filtres */}
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

        {/* Filtres */}
        <Box overflowX="auto">
          <Filters onFilterChange={(filter) => console.log(filter)} />
        </Box>

        {/* Liste des annonces (responsive) */}
        {renderPropertyList()}

        {/* Modal de visualisation */}
        {isMobile ? (
          <Drawer isOpen={isViewOpen} placement="bottom" onClose={onViewClose} size="full">
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Détails de l'annonce</DrawerHeader>
              <DrawerBody p={0}>
                {selectedProperty && (
                  <VStack spacing={6} align="stretch">
                    <ImageCarousel images={selectedProperty.images} />
                    <VStack align="start" spacing={4} bg="white" p={4}>
                      <Heading size="lg">{selectedProperty.title}</Heading>
                      <HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {selectedProperty.price}
                        </Text>
                        <Badge colorScheme={getStatusColor(selectedProperty.status)}>
                          {getStatusText(selectedProperty.status)}
                        </Badge>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                        <Box>
                          <HStack>
                            <Icon as={FiMapPin} color="gray.500" />
                            <Text fontWeight="bold">Localisation</Text>
                          </HStack>
                          <Text>{selectedProperty.location}</Text>
                        </Box>
                        <Box>
                          <HStack>
                            <Icon as={FiHome} color="gray.500" />
                            <Text fontWeight="bold">Surface</Text>
                          </HStack>
                          <Text>{selectedProperty.surface}</Text>
                        </Box>
                      </SimpleGrid>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Caractéristiques
                        </Text>
                        <HStack wrap="wrap" spacing={2}>
                          {selectedProperty.features.map((feature, index) => (
                            <Tag key={index} size="md">
                              {feature}
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
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
                    <ImageCarousel images={selectedProperty.images} />
                    <VStack align="start" spacing={4} bg="white">
                      <Heading size="lg">{selectedProperty.title}</Heading>
                      <HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {selectedProperty.price}
                        </Text>
                        <Badge colorScheme={getStatusColor(selectedProperty.status)}>
                          {getStatusText(selectedProperty.status)}
                        </Badge>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <Box>
                          <Text fontWeight="bold">Localisation</Text>
                          <Text>{selectedProperty.location}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Surface</Text>
                          <Text>{selectedProperty.surface}</Text>
                        </Box>
                      </SimpleGrid>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Caractéristiques
                        </Text>
                        <HStack wrap="wrap" spacing={2}>
                          {selectedProperty.features.map((feature, index) => (
                            <Tag key={index} size="md">
                              {feature}
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
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

        {/* Modal de création d'annonce */}
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

        {/* Modal de modification d'annonce */}
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

        {/* Dialog de confirmation de suppression */}
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
                      <Text fontWeight="bold">{selectedProperty.title}</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {selectedProperty.location} - {selectedProperty.price}
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

