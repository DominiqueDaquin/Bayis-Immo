"use client"
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { FiMenu } from "react-icons/fi"
import SimpleNavbar from "../partials/navbar"
import HomeDashboard from "./home"
import { useState, useEffect } from "react"
import SidebarContent from "./parials/sidebar"
import Chat from "./chat"
import Annonce from "./annonce"
import Tombola from "./tombola/tombola"
import Notifications from "./notification"
import GestionnaireCampagnes from "./publicite"
import ProfileSettings from "./settings"
import { useAuth } from "@/hooks/useAuth"
import UserManagementPage from "./utilisateurs"





export default function Dashboard() {
  const { userGroups } = useAuth()
  const isModerateur = userGroups.includes("moderateur")
  console.log("est Moderateur", isModerateur);
  const COMPONENTS = {
    dashboard: <HomeDashboard />,
    annonces: <Annonce isModerateur={isModerateur} />,
    tombola: <Tombola isModerateur={isModerateur} />,
    publicite: <GestionnaireCampagnes isModerateur={isModerateur} />,
    notifications: <Notifications />,
    messages: <Chat />,
    statistiques: <Text>Statistiques</Text>,
    settings: <ProfileSettings />,
    utilisateurs:<UserManagementPage/>,
  }
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "dashboard")
  const [activeMenu, setActiveMenu] = useState(COMPONENTS[activeTab])

  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")


  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])


  return (
    <div>
      <Flex minH="100vh" bg={bgColor}>
        {/* Sidebar pour desktop */}
        <Box
          display={{ base: "none", lg: "block" }}
          w={60}
          bg={sidebarBg}
          borderRightWidth="1px"
          borderRightColor={borderColor}
        >
          <SidebarContent setActiveMenu={setActiveMenu} setActiveTab={setActiveTab} components={COMPONENTS} />
        </Box>

        {/* Drawer pour mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} returnFocusOnClose={false} onOverlayClick={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={sidebarBg}>
            <DrawerCloseButton />
            <DrawerHeader
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
              fontFamily="heading"
            >
              Menu
            </DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent onClose={onClose} setActiveMenu={setActiveMenu} setActiveTab={setActiveTab} components={COMPONENTS} isModerateur={isModerateur}/>
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
            bg={headerBg}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent="space-between"
          >
            <IconButton
              display={{ base: "flex", lg: "none" }}
              onClick={onOpen}
              variant="outline"
              aria-label="open menu"
              icon={<FiMenu />}
              colorScheme="primary"
            />

            <Text
              fontSize="xl"
              fontWeight="bold"
              display={{ base: "flex", lg: "none" }}
              color={textColor}
              fontFamily="heading"
            >
              Votre Dashboard
            </Text>

            
          </Flex>

          {/* Contenu principal */}
          <Box
            p={{base:1,md:4,lg:8}}
            h="100vh"
            overflowY="auto"
            overflowX="scroll"
            sx={{
              "&::-webkit-scrollbar": {
                width: "8px",
                display: "none"
              }
            }}
          >
            {activeMenu}
          </Box>
        </Box>

      </Flex>

    </div>

  )
}