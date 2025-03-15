"use client"

import { useState } from "react"
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
  Heading,
  Card,
  CardBody,
  Flex,
  Tooltip,
  Select,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  FiSearch,
  FiBell,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiMoreVertical,
  FiTrash2,
  FiMail,
  FiArchive,
  FiSettings,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi"

// Composant pour une notification individuelle
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onArchive }) => {
  const { id, title, message, type, date, isRead, isImportant } = notification

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return FiCheckCircle
      case "warning":
        return FiInfo
      case "error":
        return FiAlertCircle
      default:
        return FiBell
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "green"
      case "warning":
        return "orange"
      case "error":
        return "red"
      default:
        return "blue"
    }
  }

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const iconColor = getTypeColor(type)

  return (
    <Card
      bg={isRead ? bgColor : "blue.50"}
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ shadow: "md" }}
      position="relative"
    >
      <CardBody>
        <HStack spacing={4} align="flex-start">
          <Icon as={getTypeIcon(type)} boxSize={6} color={`${iconColor}.500`} />
          <VStack align="stretch" flex={1} spacing={1}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Text fontWeight="bold">{title}</Text>
                {isImportant && (
                  <Badge colorScheme="yellow" variant="solid">
                    Important
                  </Badge>
                )}
                {!isRead && (
                  <Badge colorScheme="blue" variant="solid">
                    Nouveau
                  </Badge>
                )}
              </HStack>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" aria-label="Options" />
                <MenuList>
                  <MenuItem icon={isRead ? <FiEyeOff /> : <FiEye />} onClick={() => onMarkAsRead(id)}>
                    Marquer comme {isRead ? "non lu" : "lu"}
                  </MenuItem>
                  <MenuItem icon={<FiArchive />} onClick={() => onArchive(id)}>
                    Archiver
                  </MenuItem>
                  <MenuItem icon={<FiTrash2 />} onClick={() => onDelete(id)} color="red.500">
                    Supprimer
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
            <Text color="gray.600" fontSize="sm">
              {message}
            </Text>
            <Text color="gray.500" fontSize="xs">
              {new Date(date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}

// Composant principal
export default function Notifications() {
  // État pour les notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nouvelle réservation",
      message: "Une nouvelle réservation a été effectuée pour la villa moderne avec piscine.",
      type: "success",
      date: "2024-03-15T10:30:00",
      isRead: false,
      isImportant: true,
    },
    {
      id: 2,
      title: "Mise à jour requise",
      message: "Une mise à jour importante du système est disponible. Veuillez mettre à jour dès que possible.",
      type: "warning",
      date: "2024-03-15T09:15:00",
      isRead: false,
      isImportant: true,
    },
    {
      id: 3,
      title: "Erreur de paiement",
      message: "Le paiement pour la réservation #1234 a échoué. Une action est requise.",
      type: "error",
      date: "2024-03-14T16:45:00",
      isRead: false,
      isImportant: true,
    },
    {
      id: 4,
      title: "Nouveau message",
      message: "Vous avez reçu un nouveau message de Marie Dubois concernant sa réservation.",
      type: "info",
      date: "2024-03-14T14:20:00",
      isRead: true,
      isImportant: false,
    },
    {
      id: 5,
      title: "Tombola terminée",
      message: "La tombola 'Noël 2023' est terminée. Le tirage au sort aura lieu demain.",
      type: "success",
      date: "2024-03-14T11:00:00",
      isRead: true,
      isImportant: false,
    },
    {
      id: 6,
      title: "Maintenance planifiée",
      message: "Une maintenance système est prévue ce soir à 22h00. Durée estimée : 2 heures.",
      type: "warning",
      date: "2024-03-14T09:30:00",
      isRead: true,
      isImportant: true,
    },
  ])

  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Nombre de colonnes selon la taille d'écran
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  // Gestionnaires d'événements
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, isRead: !notif.isRead } : notif)))
  }

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const handleArchive = (id) => {
    // Logique d'archivage à implémenter
    console.log("Archiver notification:", id)
  }

  // Filtrage des notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())

    switch (filter) {
      case "unread":
        return !notif.isRead && matchesSearch
      case "important":
        return notif.isImportant && matchesSearch
      default:
        return matchesSearch
    }
  })

  // Statistiques des notifications
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    important: notifications.filter((n) => n.isImportant).length,
  }

  return (
    <Box bg="white" minH="100vh" w="100%">
      <Container maxW="7xl" py={8}>
        {/* En-tête */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 4, sm: 0 }}
          >
            <Heading size="lg">Notifications</Heading>
            <HStack spacing={4}>
              <Button leftIcon={<FiRefreshCw />} variant="ghost">
                Actualiser
              </Button>
              <Button leftIcon={<FiSettings />} variant="ghost">
                Paramètres
              </Button>
            </HStack>
          </Flex>

          {/* Statistiques */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <VStack>
                  <Text fontSize="sm" color="gray.500">
                    Total
                  </Text>
                  <Heading size="md">{stats.total}</Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack>
                  <Text fontSize="sm" color="gray.500">
                    Non lues
                  </Text>
                  <Heading size="md" color="blue.500">
                    {stats.unread}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack>
                  <Text fontSize="sm" color="gray.500">
                    Importantes
                  </Text>
                  <Heading size="md" color="yellow.500">
                    {stats.important}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack>
                  <Text fontSize="sm" color="gray.500">
                    Archivées
                  </Text>
                  <Heading size="md" color="gray.500">
                    0
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Barre de recherche et filtres */}
          <Flex gap={4} direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }}>
            <InputGroup maxW={{ base: "100%", sm: "400px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher dans les notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} maxW={{ base: "100%", sm: "200px" }}>
              <option value="all">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="important">Importantes</option>
            </Select>
            <HStack spacing={2} justify={{ base: "flex-end", sm: "flex-start" }}>
              <Tooltip label="Tout marquer comme lu">
                <IconButton icon={<FiMail />} aria-label="Tout marquer comme lu" />
              </Tooltip>
              <Tooltip label="Archiver tout">
                <IconButton icon={<FiArchive />} aria-label="Archiver tout" />
              </Tooltip>
            </HStack>
          </Flex>
        </VStack>

        {/* Liste des notifications */}
        {filteredNotifications.length > 0 ? (
          <SimpleGrid columns={columns} spacing={4}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Icon as={FiBell} boxSize={10} color="gray.400" mb={4} />
            <Text color="gray.500">Aucune notification trouvée</Text>
          </Box>
        )}
      </Container>
    </Box>
  )
}

