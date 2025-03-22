"use client"
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  Container,
  Stack,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Heading,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiSettings,
  FiBell,
  FiMessageSquare,
  FiBarChart,
  FiGift,
  FiMonitor,
  FiCheckCircle,
  FiAlertCircle,
  FiMenu,
} from "react-icons/fi"
import SimpleNavbar from "../partials/navbar"
import HomeDashboard from "./home"
import Chat from "./chat"
import { useState } from "react"
import Annonce from "./annonce"
import Tombola from "./tombola/tombola"
import Notifications from "./notification"
import GestionnaireCampagnes from "./publicite"
import ProfileSettings from "./settings"

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

export default function Dashboard() {
  // Pour le drawer mobile
  const { isOpen, onOpen, onClose } = useDisclosure()

  // État pour gérer le composant actif
  const [activeMenu, setActiveMenu] = useState(<DashboardContent />)

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Sidebar pour desktop */}
      <Box display={{ base: "none", md: "block" }} w={60} bg={useColorModeValue("white", "gray.900")}>
        <SidebarContent setActiveMenu={setActiveMenu} />
      </Box>

      {/* Drawer pour mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} returnFocusOnClose={false} onOverlayClick={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} setActiveMenu={setActiveMenu} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex="1">
        {/* Header avec bouton hamburger pour mobile */}
        <Flex
          px={4}
          py={4}
          alignItems="center"
          bg={useColorModeValue("white", "gray.900")}
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue("gray.200", "gray.700")}
          justifyContent="space-between"
        >
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
          />

          <Text fontSize="xl" fontWeight="bold" display={{ base: "flex", md: "none" }}>
            Immobilier Dashboard
          </Text>

          <Box width="100%" display={{ base: "none", md: "block" }}>
            <SimpleNavbar />
          </Box>
        </Flex>

        {/* Contenu principal */}
        <Box p={8} h="100vh" overflowY="auto" sx={{
        "&::-webkit-scrollbar": {
          width: "8px",
          display:"none"
        }
      }}
    >
          {activeMenu}
        </Box>
      </Box>
    </Flex>
  )
}