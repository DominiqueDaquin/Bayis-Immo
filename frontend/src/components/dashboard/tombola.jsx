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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
} from "@chakra-ui/react"
import { FiSearch, FiFilter, FiDownload, FiPlus, FiEdit2, FiTrash2, FiEye, FiImage } from "react-icons/fi"

// Composant pour afficher une tombola en mode carte (pour mobile)
const TombolaCard = ({ tombola, onView, onEdit, onDelete }) => {
  const { title, prize, participants, maxParticipants, status, image, endDate } = tombola

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green"
      case "pending":
        return "orange"
      case "completed":
        return "blue"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "pending":
        return "En attente"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  const participationRate = (participants / maxParticipants) * 100

  return (
    <Card mb={4} overflow="hidden" variant="outline">
      <Image src={image || "/placeholder.svg"} alt={title} height="160px" objectFit="cover" />
      <CardBody>
        <VStack align="start" spacing={2}>
          <Heading size="md">{title}</Heading>
          <HStack>
            <Badge colorScheme={getStatusColor(status)}>{getStatusText(status)}</Badge>
            <Text fontSize="sm" color="gray.500">
              Fin: {new Date(endDate).toLocaleDateString()}
            </Text>
          </HStack>
          <Stat size="sm" mt={2}>
            <StatLabel>Cagnotte</StatLabel>
            <StatNumber color="blue.500">{prize} Fcfa</StatNumber>
          </Stat>
          <Box w="full">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm">Participants</Text>
              <Text fontSize="sm" fontWeight="bold">
                {participants}/{maxParticipants}
              </Text>
            </Flex>
            <Progress value={participationRate} colorScheme="blue" size="sm" borderRadius="full" />
          </Box>
          <HStack spacing={2} pt={2} w="full">
            <Button size="sm" leftIcon={<FiEye />} onClick={() => onView(tombola)} flex={1}>
              Voir
            </Button>
            <Button size="sm" leftIcon={<FiEdit2 />} onClick={() => onEdit(tombola)} flex={1}>
              Modifier
            </Button>
            <IconButton
              size="sm"
              colorScheme="red"
              icon={<FiTrash2 />}
              onClick={() => onDelete(tombola)}
              aria-label="Supprimer"
            />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

// Composant de formulaire pour création/modification d'une tombola
const TombolaForm = ({ tombola, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    tombola || {
      title: "",
      description: "",
      prize: "",
      maxParticipants: 100,
      status: "pending",
      image: "/placeholder.svg?height=400&width=600",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +30 jours
    },
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Titre</FormLabel>
          <Input name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Tombola de Noël" />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description détaillée de la tombola"
            rows={3}
          />
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Montant de la cagnotte</FormLabel>
            <InputGroup>
              <NumberInput
                min={0}
                w="full"
                value={formData.prize}
                onChange={(value) => handleNumberChange("prize", value)}
              >
                <NumberInputField name="prize" placeholder="Ex: 1000" />
              </NumberInput>
              <InputRightAddon children="€" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nombre max. de participants</FormLabel>
            <NumberInput
              min={1}
              max={1000}
              w="full"
              value={formData.maxParticipants}
              onChange={(value) => handleNumberChange("maxParticipants", value)}
            >
              <NumberInputField name="maxParticipants" placeholder="Ex: 100" />
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Date de fin</FormLabel>
            <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Statut</FormLabel>
            <Select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">En attente</option>
              <option value="active">Active</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </Select>
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Image</FormLabel>
          <InputGroup>
            <Input name="image" value={formData.image} onChange={handleChange} placeholder="URL de l'image" />
            <InputRightAddon p={0}>
              <IconButton icon={<FiImage />} aria-label="Ajouter une image" borderLeftRadius={0} />
            </InputRightAddon>
          </InputGroup>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Ajoutez une URL d'image ou utilisez le bouton pour télécharger
          </Text>
        </FormControl>

        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button onClick={onCancel}>Annuler</Button>
          <Button colorScheme="blue" type="submit">
            {tombola ? "Mettre à jour" : "Créer la tombola"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

// Composant pour les filtres
const Filters = ({ onFilterChange }) => {
  return (
    <HStack spacing={4} mb={6} wrap="wrap" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Tag size="lg" variant="outline" colorScheme="blue" cursor="pointer" onClick={() => onFilterChange("all")}>
        Toutes
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="green" cursor="pointer" onClick={() => onFilterChange("active")}>
        Actives
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="orange" cursor="pointer" onClick={() => onFilterChange("pending")}>
        En attente
      </Tag>
      <Tag size="lg" variant="outline" colorScheme="blue" cursor="pointer" onClick={() => onFilterChange("completed")}>
        Terminées
      </Tag>
    </HStack>
  )
}

// Composant principal
export default function Tombola() {
  // États pour les différentes modales
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [selectedTombola, setSelectedTombola] = useState(null)
  const cancelRef = React.useRef()

  // Détection de la taille d'écran pour le responsive
  const isMobile = useBreakpointValue({ base: true, md: false })
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })

  // Données exemple
  const [tombolas, setTombolas] = useState([
    {
      id: 1,
      title: "Tombola de Noël",
      description:
        "Grande tombola de fin d'année avec de nombreux lots à gagner dont un voyage pour 2 personnes aux Maldives.",
      prize: 2500,
      participants: 78,
      maxParticipants: 100,
      status: "active",
      image: "/placeholder.svg?height=400&width=600",
      createdAt: "2024-02-15",
      endDate: "2024-12-24",
    },
    {
      id: 2,
      title: "Tombola Caritative",
      description:
        "Tous les bénéfices seront reversés à l'association 'Les Enfants d'Abord' pour financer des projets éducatifs.",
      prize: 1000,
      participants: 45,
      maxParticipants: 200,
      status: "pending",
      image: "/placeholder.svg?height=400&width=600",
      createdAt: "2024-03-01",
      endDate: "2024-06-30",
    },
    {
      id: 3,
      title: "Tombola de Pâques",
      description: "Gagnez un assortiment de chocolats fins et des bons d'achat dans les commerces partenaires.",
      prize: 500,
      participants: 120,
      maxParticipants: 120,
      status: "completed",
      image: "/placeholder.svg?height=400&width=600",
      createdAt: "2024-01-10",
      endDate: "2024-04-09",
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green"
      case "pending":
        return "orange"
      case "completed":
        return "blue"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "pending":
        return "En attente"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  const handleViewTombola = (tombola) => {
    setSelectedTombola(tombola)
    onViewOpen()
  }

  const handleEditTombola = (tombola, e) => {
    if (e) e.stopPropagation()
    setSelectedTombola(tombola)
    onEditOpen()
  }

  const handleDeleteTombola = (tombola, e) => {
    if (e) e.stopPropagation()
    setSelectedTombola(tombola)
    onDeleteOpen()
  }

  const handleCreateSubmit = (formData) => {
    // Simuler la création d'une nouvelle tombola
    const newTombola = {
      ...formData,
      id: tombolas.length + 1,
      participants: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setTombolas([...tombolas, newTombola])
    onCreateClose()
  }

  const handleEditSubmit = (formData) => {
    // Mettre à jour la tombola existante
    const updatedTombolas = tombolas.map((tomb) => (tomb.id === selectedTombola.id ? { ...tomb, ...formData } : tomb))
    setTombolas(updatedTombolas)
    onEditClose()
  }

  const handleDeleteConfirm = () => {
    // Supprimer la tombola
    const filteredTombolas = tombolas.filter((tomb) => tomb.id !== selectedTombola.id)
    setTombolas(filteredTombolas)
    onDeleteClose()
  }

  // Rendu conditionnel pour mobile ou desktop
  const renderTombolaList = () => {
    if (isMobile) {
      return (
        <VStack spacing={4} align="stretch">
          {tombolas.map((tombola) => (
            <TombolaCard
              key={tombola.id}
              tombola={tombola}
              onView={handleViewTombola}
              onEdit={handleEditTombola}
              onDelete={handleDeleteTombola}
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
              <Th>Titre</Th>
              <Th>Cagnotte</Th>
              <Th>Participants</Th>
              <Th>Statut</Th>
              <Th>Date de fin</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tombolas.map((tombola) => (
              <Tr
                key={tombola.id}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                onClick={() => handleViewTombola(tombola)}
                bg="white"
              >
                <Td>
                  <HStack>
                    <Image
                      src={tombola.image || "/placeholder.svg"}
                      alt={tombola.title}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      mr={2}
                    />
                    <Text fontWeight="bold">{tombola.title}</Text>
                  </HStack>
                </Td>
                <Td fontWeight="bold" color="blue.500">
                  {tombola.prize} €
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text>
                      {tombola.participants}/{tombola.maxParticipants}
                    </Text>
                    <Progress
                      value={(tombola.participants / tombola.maxParticipants) * 100}
                      size="xs"
                      w="100px"
                      colorScheme="blue"
                      borderRadius="full"
                    />
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(tombola.status)}>{getStatusText(tombola.status)}</Badge>
                </Td>
                <Td>{new Date(tombola.endDate).toLocaleDateString()}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<FiEye />}
                      aria-label="Voir"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewTombola(tombola)
                      }}
                      bg="white"
                    />
                    <IconButton
                      icon={<FiEdit2 />}
                      aria-label="Modifier"
                      size="sm"
                      onClick={(e) => handleEditTombola(tombola, e)}
                      bg="white"
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Supprimer"
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => handleDeleteTombola(tombola, e)}
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
          <Heading size="lg">Mes Tombolas</Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen} w={{ base: "full", sm: "auto" }}>
            Créer une tombola
          </Button>
        </Flex>

        {/* Barre de recherche et filtres */}
        <Flex mb={6} gap={4} wrap={{ base: "wrap", md: "nowrap" }} bg="white" direction={{ base: "column", sm: "row" }}>
          <InputGroup maxW={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input placeholder="Rechercher une tombola..." bg="white" />
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

        {/* Liste des tombolas (responsive) */}
        {renderTombolaList()}

        {/* Modal de visualisation */}
        {isMobile ? (
          <Drawer isOpen={isViewOpen} placement="bottom" onClose={onViewClose} size="full">
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Détails de la tombola</DrawerHeader>
              <DrawerBody p={0}>
                {selectedTombola && (
                  <VStack spacing={6} align="stretch">
                    <Image
                      src={selectedTombola.image || "/placeholder.svg"}
                      alt={selectedTombola.title}
                      w="100%"
                      h={{ base: "200px" }}
                      objectFit="cover"
                    />
                    <VStack align="start" spacing={4} bg="white" p={4}>
                      <Heading size="lg">{selectedTombola.title}</Heading>
                      <HStack>
                        <Badge colorScheme={getStatusColor(selectedTombola.status)}>
                          {getStatusText(selectedTombola.status)}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          Créée le {new Date(selectedTombola.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                        <Stat>
                          <StatLabel>Cagnotte</StatLabel>
                          <StatNumber color="blue.500">{selectedTombola.prize} €</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Date de fin</StatLabel>
                          <StatNumber fontSize="lg">
                            {new Date(selectedTombola.endDate).toLocaleDateString()}
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>

                      <Box w="full">
                        <Text fontWeight="bold" mb={2}>
                          Participants
                        </Text>
                        <Flex justify="space-between" mb={1}>
                          <Text>{selectedTombola.participants} inscrits</Text>
                          <Text>{selectedTombola.maxParticipants} max</Text>
                        </Flex>
                        <Progress
                          value={(selectedTombola.participants / selectedTombola.maxParticipants) * 100}
                          colorScheme="blue"
                          size="md"
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {Math.round((selectedTombola.participants / selectedTombola.maxParticipants) * 100)}% de
                          participation
                        </Text>
                      </Box>

                      <Box w="full">
                        <Text fontWeight="bold" mb={2}>
                          Description
                        </Text>
                        <Text>{selectedTombola.description}</Text>
                      </Box>

                      <SimpleGrid columns={2} spacing={4} w="full" pt={4}>
                        <Button
                          colorScheme="blue"
                          leftIcon={<FiEdit2 />}
                          onClick={() => {
                            onViewClose()
                            handleEditTombola(selectedTombola)
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
                            handleDeleteTombola(selectedTombola)
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
            <ModalContent maxW={{ base: "100%", md: "800px" }} bg="white">
              <ModalCloseButton zIndex="modal" />
              <ModalBody p={6} bg="white">
                {selectedTombola && (
                  <VStack spacing={6} align="stretch">
                    <Flex direction={{ base: "column", md: "row" }} gap={6}>
                      <Image
                        src={selectedTombola.image || "/placeholder.svg"}
                        alt={selectedTombola.title}
                        w={{ base: "100%", md: "300px" }}
                        h={{ base: "200px", md: "auto" }}
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={4} flex="1">
                        <Heading size="lg">{selectedTombola.title}</Heading>
                        <HStack>
                          <Badge colorScheme={getStatusColor(selectedTombola.status)}>
                            {getStatusText(selectedTombola.status)}
                          </Badge>
                          <Text fontSize="sm" color="gray.500">
                            Créée le {new Date(selectedTombola.createdAt).toLocaleDateString()}
                          </Text>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                          <Stat>
                            <StatLabel>Cagnotte</StatLabel>
                            <StatNumber color="blue.500">{selectedTombola.prize} €</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Date de fin</StatLabel>
                            <StatNumber fontSize="lg">
                              {new Date(selectedTombola.endDate).toLocaleDateString()}
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>

                        <Box w="full">
                          <Text fontWeight="bold" mb={2}>
                            Participants
                          </Text>
                          <Flex justify="space-between" mb={1}>
                            <Text>{selectedTombola.participants} inscrits</Text>
                            <Text>{selectedTombola.maxParticipants} max</Text>
                          </Flex>
                          <Progress
                            value={(selectedTombola.participants / selectedTombola.maxParticipants) * 100}
                            colorScheme="blue"
                            size="md"
                            borderRadius="full"
                          />
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {Math.round((selectedTombola.participants / selectedTombola.maxParticipants) * 100)}% de
                            participation
                          </Text>
                        </Box>
                      </VStack>
                    </Flex>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Description
                      </Text>
                      <Text>{selectedTombola.description}</Text>
                    </Box>

                    <HStack spacing={4} justify="flex-end">
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiEdit2 />}
                        onClick={() => {
                          onViewClose()
                          handleEditTombola(selectedTombola)
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        colorScheme="red"
                        leftIcon={<FiTrash2 />}
                        onClick={() => {
                          onViewClose()
                          handleDeleteTombola(selectedTombola)
                        }}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {/* Modal de création d'une tombola */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalHeader>Créer une nouvelle tombola</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <TombolaForm onSubmit={handleCreateSubmit} onCancel={onCreateClose} />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de modification d'une tombola */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize}>
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalHeader>Modifier la tombola</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTombola && (
                <TombolaForm tombola={selectedTombola} onSubmit={handleEditSubmit} onCancel={onEditClose} />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent mx={4}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Supprimer la tombola
              </AlertDialogHeader>

              <AlertDialogBody>
                {selectedTombola && (
                  <>
                    <Text mb={4}>
                      Êtes-vous sûr de vouloir supprimer cette tombola ? Cette action ne peut pas être annulée.
                    </Text>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold">{selectedTombola.title}</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        Cagnotte: {selectedTombola.prize} € - {selectedTombola.participants} participants
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

