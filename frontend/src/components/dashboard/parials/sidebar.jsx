"use client"
import {
  Box,
  Text,
  Icon,
  useColorModeValue,
  Stack,
  Button,
  Badge,
  Flex,
  Spinner,
  Avatar,
  VStack,
  Divider,
  useToast
} from "@chakra-ui/react"
import {
  FiHome,
  FiCompass,
  FiSettings,
  FiBell,
  FiMessageSquare,
  FiBarChart,
  FiGift,
  FiMonitor,
  FiLogOut,
  FiArrowLeft,
  FiUser
} from "react-icons/fi"
import { useEffect, useState } from "react"
import axiosInstance from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
const NavItem = ({ icon, children, onClick, badgeCount, ...rest }) => {
  return (
    <Button
      variant="ghost"
      justifyContent="space-between"
      px={8}
      leftIcon={<Icon as={icon} />}
      onClick={onClick}
      {...rest}
    >
      <Flex align="center" flex="1">
        {children}
      </Flex>
      {badgeCount > 0 && (
        <Badge 
          colorScheme="red" 
          borderRadius="full" 
          ml={2}
          minW="20px" 
          h="20px" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          {badgeCount}
        </Badge>
      )}
    </Button>
  )
}

const SidebarContent = ({ onClose = null, setActiveMenu, setActiveTab, components,IsModerateur }) => {
  const [counts, setCounts] = useState({ 
    unread_discussions: 0, 
    unread_notifications: 0 
  })
  const [loading, setLoading] = useState(true)
  const { user, logout,userDetail } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()


  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axiosInstance.get('/api/statistiques/')
        setCounts(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCounts()
    const interval = setInterval(fetchUnreadCounts, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    toast({
      title: "Déconnexion réussie",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
    navigate("/login")
  }

  const navItems = [
    { label: "Tableau de bord", key: "dashboard", icon: FiHome },
    { label: "Annonces", key: "annonces", icon: FiCompass },
    { label: "Cagnotte", key: "tombola", icon: FiGift },
    { label: "Publicité", key: "publicite", icon: FiMonitor },
    { 
      label: "Notifications", 
      key: "notifications", 
      icon: FiBell, 
      badgeCount: loading ? 0 : counts.unread_notifications
    },
    { 
      label: "Messages", 
      key: "messages", 
      icon: FiMessageSquare, 
      badgeCount: loading ? 0 : counts.unread_discussions 
    },
    
    { label: "Paramètres", key: "settings", icon: FiSettings },
  ]
  if (IsModerateur)
    navItems=[...{ label: "Utilisateurs", key: "utilisateurs", icon: FiUser }]

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Zone avatar en haut */}
      <Box p={4} textAlign="center">
        <VStack spacing={3}>
          <Avatar 
            size="lg" 
            name={user?.name || user?.email} 
            src={userDetail?.photo}
            bg="blue.500"
            color="white"
          />
          <Text fontWeight="bold">{user?.name || user?.email}</Text>
          {user?.role && (
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              {user.role}
            </Badge>
          )}
        </VStack>
      </Box>

      <Divider />

      {/* Contenu principal */}
      <Box flex="1" overflowY="auto" py={4}>
        {loading ? (
          <Flex justify="center" pt={4}>
            <Spinner size="sm" />
          </Flex>
        ) : (
          <Stack spacing={1}>
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                icon={item.icon}
                onClick={() => {
                  setActiveTab(item.key)
                  setActiveMenu(components[item.key])
                  if (onClose) onClose()
                }}
                badgeCount={item.badgeCount || 0}
              >
                {item.label}
              </NavItem>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      {/* Boutons en bas */}
      <Box p={4}>
        <Stack spacing={3}>
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="ghost"
            justifyContent="flex-start"
            onClick={() => navigate("/annonce")}
          >
            Retour à l'accueil
          </Button>
          <Button
            leftIcon={<Icon as={FiLogOut} />}
            colorScheme="red"
            variant="ghost"
            justifyContent="flex-start"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export default SidebarContent