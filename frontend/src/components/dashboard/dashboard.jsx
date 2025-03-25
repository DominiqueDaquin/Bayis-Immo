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
import { useState } from "react"
import SidebarContent from "./parials/sidebar"

const DashboardContent = () => <HomeDashboard />

export default function Dashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeMenu, setActiveMenu] = useState(<DashboardContent />)

  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Sidebar pour desktop */}
      <Box 
        display={{ base: "none", md: "block" }} 
        w={60} 
        bg={sidebarBg}
        borderRightWidth="1px"
        borderRightColor={borderColor}
      >
        <SidebarContent setActiveMenu={setActiveMenu} />
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
          bg={headerBg}
          borderBottomWidth="1px"
          borderBottomColor={borderColor}
          justifyContent="space-between"
        >
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
            colorScheme="primary"
          />

          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            display={{ base: "flex", md: "none" }}
            color={textColor}
            fontFamily="heading"
          >
            Immobilier Dashboard
          </Text>

          <Box width="100%" display={{ base: "none", md: "block" }}>
            <SimpleNavbar />
          </Box>
        </Flex>

        {/* Contenu principal */}
        <Box 
          p={8} 
          h="100vh" 
          overflowY="auto" 
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
  )
}