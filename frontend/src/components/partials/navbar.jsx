"use client"

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Link,
  useColorModeValue,
  Avatar,
  Image,
  Button,
  Text,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react"
import logo from "@/assets/logo.png"
import logoText from "@/assets/logo-texte.png"
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FaHome, FaHeart, FaEnvelope, FaBell, FaTrophy, FaChartLine, FaCog } from "react-icons/fa" // Icônes pour les liens

export default function SimpleNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, isAuthenticated, userGroups, userDetail } = useAuth()
  const [isLoading, setIsLoading] = useState(true) // État pour gérer le chargement
  const navigate = useNavigate()

  // Simuler le chargement des groupes
  useEffect(() => {
    if (userGroups && userDetail) {
      setIsLoading(false)
    }
  }, [userGroups, userDetail])

  // Couleurs et styles
  const bgColor = useColorModeValue("white", "gray.800")
  const hoverBgColor = useColorModeValue("gray.200", "gray.700")

  // Liens communs pour les utilisateurs normaux et les annonceurs
  const commonLinks = [
    { label: "Accueil", href: "/annonce", icon: <FaHome /> },
    { label: "Tombolas", href: "/tombolas", icon: <FaTrophy /> },
  ]

  // Liens spécifiques pour les utilisateurs normaux
  const normalUserLinks = [
    { label: "Favoris", href: "/favorites", icon: <FaHeart /> },
    { label: "Messages", href: "/messages", icon: <FaEnvelope /> },
    { label: "Notifications", href: "/notifications", icon: <FaBell /> },
    { label: "Paramètres", href: "/parametres", icon: <FaCog /> },
  ]

  // Liens spécifiques pour les annonceurs
  const annonceurLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <FaChartLine /> },
  ]

  // Fonction pour afficher les liens
  const renderLinks = (links) => {
    return links.map((link, index) => (
      <Link
        key={index}
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
          textDecoration: "none",
          bg: hoverBgColor,
        }}
        href={link.href}
        display="flex"
        alignItems="center"
        gap={2}
      >
        {link.icon} {/* Icône */}
        <Text>{link.label}</Text> {/* Texte du lien */}
      </Link>
    ))
  }

  // Si les données ne sont pas encore chargées, on affiche un Skeleton
  if (isLoading) {
    return (
      <Box bg={bgColor} px={4} boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)" position="sticky" top="0" zIndex="sticky" margin="0">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Skeleton pour le menu hamburger (mobile) */}
          <Skeleton>
            <IconButton size="md" display={{ md: "none" }} />
          </Skeleton>

          {/* Skeleton pour le logo */}
          <Skeleton>
            <Image h="100px" src={logoText} alt="Logo" />
          </Skeleton>

          {/* Skeleton pour les liens de navigation */}
          <HStack spacing={8} alignItems="center">
            <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
              {commonLinks.map((_, index) => (
                <Skeleton key={index} height="20px" width="60px" />
              ))}
            </HStack>

            {/* Skeleton pour le bouton de connexion */}
            <Skeleton>
              <Button style={{ background: "#4FD1C5" }}>Login</Button>
            </Skeleton>

            {/* Skeleton pour l'avatar */}
            <SkeletonCircle size="8" />
          </HStack>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      bg={bgColor}
      px={4}
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)" // Ombre en bas
      position="sticky"
      top="0"
      zIndex="sticky"
      margin="0"
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {/* Menu hamburger (mobile) */}
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />

        {/* Logo */}
        <Box>
          <Image h="100px" src={logoText} alt="Logo" />
        </Box>

        {/* Liens de navigation (desktop) */}
        <HStack spacing={8} alignItems={"center"}>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {renderLinks(commonLinks)}
            {!userGroups.includes("annonceur") && renderLinks(normalUserLinks)}
            {userGroups.includes("annonceur") && renderLinks(annonceurLinks)}
          </HStack>

          {/* Bouton de connexion */}
          {!isAuthenticated ? (
            <Button
              style={{ background: "#4FD1C5" }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          ) : (
            <Flex alignItems={"center"}>
              {/* Avatar avec photo de profil */}
              <Avatar
                size={"sm"}
                name={userDetail?.name}
                src={userDetail?.photo || "/placeholder.svg?height=32&width=32"}
                cursor="pointer"
              />
              {/* Nom de l'utilisateur */}
              <Text ml={2} fontWeight="medium">
                {userDetail?.name}
              </Text>
            </Flex>
          )}
        </HStack>
      </Flex>

      {/* Menu mobile */}
      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {renderLinks(commonLinks)}
            {!userGroups.includes("annonceur") && renderLinks(normalUserLinks)}
            {userGroups.includes("annonceur") && renderLinks(annonceurLinks)}
          </Stack>
        </Box>
      )}
    </Box>
  )
}