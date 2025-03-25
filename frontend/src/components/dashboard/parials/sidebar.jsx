"use client"
import {
  Box,
  Text,
  Icon,
  useColorModeValue,
  Stack,
  Button,
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
const NavItem = ({ icon, children, onClick, ...rest }) => {
  return (
    <Button
      variant="ghost"
      justifyContent="start"
      px={8}
      leftIcon={<Icon as={icon} />}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  )
}

const SidebarContent = ({ onClose = null, setActiveMenu }) => {
  const navItems = [
    { label: "Tableau de bord", icon: FiHome, component: <DashboardContent /> },
    { label: "Annonces", icon: FiCompass, component: <AnnouncementsContent /> },
    { label: "Tombola", icon: FiGift, component: <TombolaContent /> },
    { label: "Publicité", icon: FiMonitor, component: <AdsContent /> },
    { label: "Notifications", icon: FiBell, component: <NotificationsContent /> },
    { label: "Messages", icon: FiMessageSquare, component: <MessagesContent /> },
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
      <Stack spacing={4}>
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            onClick={() => {
              setActiveMenu(item.component)
              if (onClose) onClose() // Fermer le drawer sur mobile
            }}
          >
            {item.label}
          </NavItem>
        ))}
      </Stack>
    </Box>
  )
}

export default SidebarContent