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
  Spinner
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
} from "react-icons/fi"
import { useEffect, useState } from "react"
import axiosInstance from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
import HomeDashboard from "../home"
import Chat from "../chat"
import Annonce from "../annonce"
import Tombola from "../tombola/tombola"
import Notifications from "../notification"
import GestionnaireCampagnes from "../publicite"
import ProfileSettings from "../settings"

// Composants associés à chaque élément du menu
const DashboardContent = () => <HomeDashboard />
const AnnouncementsContent = () => <Annonce/>
const TombolaContent = () => <Tombola isModerateur={false} />
const AdsContent = () => <GestionnaireCampagnes isModerateur={false}/>
const NotificationsContent = () => <Notifications/>
const MessagesContent = () => <Chat/>
const StatisticsContent = () => <Text>Statistiques</Text>
const SettingsContent = () => <ProfileSettings/>

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

const SidebarContent = ({ onClose = null, setActiveMenu }) => {
  const [counts, setCounts] = useState({ 
    unread_discussions: 0, 
    unread_notifications: 0 
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
    
    // Mettre à jour périodiquement (toutes les 30 secondes)
    const interval = setInterval(fetchUnreadCounts, 30000)
    return () => clearInterval(interval)
  }, [user])

  const navItems = [
    { label: "Tableau de bord", icon: FiHome, component: <DashboardContent /> },
    { label: "Annonces", icon: FiCompass, component: <AnnouncementsContent /> },
    { label: "Tombola", icon: FiGift, component: <TombolaContent /> },
    { label: "Publicité", icon: FiMonitor, component: <AdsContent /> },
    { 
      label: "Notifications", 
      icon: FiBell, 
      component: <NotificationsContent />,
      badgeCount: loading ? 0 : counts.unread_notifications
    },
    { 
      label: "Messages", 
      icon: FiMessageSquare, 
      component: <MessagesContent />,
      badgeCount: loading ? 0 : counts.unread_discussions 
    },
    { label: "Statistiques", icon: FiBarChart, component: <StatisticsContent /> },
    { label: "Paramètres", icon: FiSettings, component: <SettingsContent /> },
  ]

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      h="full"
      py={8}
    >
      {loading ? (
        <Flex justify="center" pt={4}>
          <Spinner size="sm" />
        </Flex>
      ) : (
        <Stack spacing={4}>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              onClick={() => {
                setActiveMenu(item.component)
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
  )
}

export default SidebarContent