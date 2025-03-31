"use client"

import { useState, useEffect } from "react"
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
  useToast,
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
import axiosInstance from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
// Composant pour une notification individuelle
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onArchive }) => {
  const { id, message, type, created_at, is_read, is_important } = notification

  const getTypeIcon = (type) => {
    switch (type) {
      case "a": // Alerte
        return FiAlertCircle
      case "c": // Critique
        return FiInfo
      case "d": // Default
        return FiBell
      default:
        return FiBell
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "a":
        return "red"
      case "c":
        return "orange"
      case "d":
        return "blue"
      default:
        return "gray"
    }
  }

  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  const iconColor = getTypeColor(type)

  return (
    <Card
      bg={is_read ? headerBg : borderColor}
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
                <Text fontWeight="bold">{message}</Text>
                {is_important && (
                  <Badge colorScheme="yellow" variant="solid">
                    Important
                  </Badge>
                )}
                {!is_read && (
                  <Badge colorScheme="blue" variant="solid">
                    Nouveau
                  </Badge>
                )}
              </HStack>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" aria-label="Options" />
                <MenuList>
                  <MenuItem icon={is_read ? <FiEyeOff /> : <FiEye />} onClick={() => onMarkAsRead(id)}>
                    Marquer comme {is_read ? "non lu" : "lu"}
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
            <Text color={textColor} fontSize="xs">
              {new Date(created_at).toLocaleDateString("fr-FR", {
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
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const toast = useToast()
  const {isAuthenticated}=useAuth()
  // Définir le nombre de colonnes en fonction de la taille de l'écran
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  useEffect(() => {
    const fetchNotifications = async () => {
      if(isAuthenticated){
         try {
        const response = await axiosInstance.get("/api/notifications/mes-notifications")
        if (Array.isArray(response.data)) {
          setNotifications(response.data)
        } else {
          toast({
            title: "Erreur",
            description: "La réponse de l'API n'est pas un tableau.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          })
        }
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
      }
      else{
        toast({
          title: "Erreur",
          description: "Vous devez vos autentifier avant de pouvoir accéder a vos notifications",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
     
    
    }

    fetchNotifications()
  }, [])

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/${id}/`, { is_read: true })
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
    )
    toast({
      title: "Succès",
      description: "Notification marquée comme lue.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    })

      // Si le filtre actif est "unread", basculer vers "all" pour éviter que la notification disparaisse
      if (filter === "unread") {
        setFilter("all")
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Archiver une notification
  const handleArchive = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/${id}/`, { is_archived: true })
      setNotifications((prev) =>{
        prev.map((notif) => (notif.id === id ? { ...notif, is_archived: true } : notif))
      toast({
        title: "Succès",
        description: "Notification archivée.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })})

      // Si le filtre actif est "important", basculer vers "all" pour éviter que la notification disparaisse
      if (filter === "important") {
        setFilter("all")
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la notification.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Supprimer une notification
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/notifications/${id}/`)
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      toast({
        title: "Succès",
        description: "Notification supprimée.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Filtrage des notifications
  const filteredNotifications = notifications
    ? notifications.filter((notif) => {
        const matchesSearch = notif.message.toLowerCase().includes(searchQuery.toLowerCase())

        switch (filter) {
          case "unread":
            return !notif.is_read && matchesSearch
          case "important":
            return notif.is_important && matchesSearch
          case "archived":
            return notif.is_archived && matchesSearch
          default:
            return matchesSearch // Afficher toutes les notifications, y compris archivées
        }
      })
    : [] // Retourne un tableau vide si notifications est undefined

  // Statistiques des notifications
  const stats = {
    total: notifications ? notifications.length : 0,
    unread: notifications ? notifications.filter((n) => !n.is_read).length : 0,
    important: notifications ? notifications.filter((n) => n.is_important).length : 0,
    archived: notifications ? notifications.filter((n) => n.is_archived).length : 0,
  }

  return (
    <Box bg={headerBg} minH="100vh" w="100%">
      <Container maxW="7xl" py={8}>
        {/* En-tête */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={{ base: 4, sm: 0 }}>
            <Heading size="lg">Notifications</Heading>

          </Flex>

          {/* Statistiques */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg={borderColor}>
              <CardBody>
                <VStack>
                  <Text fontSize="sm" color={textColor}>
                    Total
                  </Text>
                  <Heading size="md">{stats.total}</Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody bg={borderColor}>
                <VStack>
                  <Text fontSize="sm" color={textColor}>
                    Non lues
                  </Text>
                  <Heading size="md" color="blue.500">
                    {stats.unread}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody bg={borderColor}>
                <VStack>
                  <Text fontSize="sm" color={textColor}>
                    Importantes
                  </Text>
                  <Heading size="md" color="yellow.500">
                    {stats.important}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody bg={borderColor}>
                <VStack>
                  <Text fontSize="sm" color={textColor}>
                    Archivées
                  </Text>
                  <Heading size="md" color={textColor}>
                    {stats.archived}
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
              <option value="archived">Archivées</option>
            </Select>
            {/* <HStack spacing={2} justify={{ base: "flex-end", sm: "flex-start" }}>
              <Tooltip label="Tout marquer comme lu">
                <IconButton icon={<FiMail />} aria-label="Tout marquer comme lu" />
              </Tooltip>
              <Tooltip label="Archiver tout">
                <IconButton icon={<FiArchive />} aria-label="Archiver tout" />
              </Tooltip>
            </HStack> */}
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
            <Text color={textColor}>Aucune notification trouvée</Text>
          </Box>
        )}
      </Container>
    </Box>
  )
}