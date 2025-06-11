"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Link,
  Avatar,
  Image,
  Button,
  Text,
  useColorModeValue,
  keyframes
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { FaHome, FaHeart, FaEnvelope, FaBell, FaTrophy, FaChartLine, FaCog,FaAddressBook } from "react-icons/fa";
import { gsap } from "gsap";
import logoText from "@/assets/logo-texte.png";

// Animation pour le logo
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

export default function SimpleNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, userGroups, userDetail } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef();
  const logoRef = useRef();

  // Couleurs adaptatives
  const bgColor = useColorModeValue("white", "neutral.800");
  const hoverBgColor = useColorModeValue("primary.50", "primary.900");
  const activeBgColor = useColorModeValue("primary.100", "primary.800");
  const textColor = useColorModeValue("neutral.700", "neutral.200");
  const buttonBg = useColorModeValue("primary.500", "primary.600");
  const buttonHover = useColorModeValue("primary.600", "primary.500");

  // Liens de navigation
  const commonLinks = [
    { label: "Accueil", href: "/annonce", icon: <FaHome /> },
    { label: "Cagnotte", href: "/tombolas", icon: <FaTrophy /> },
    { label: "Demandes", href: "/demandes",  icon: <FaAddressBook /> },
  ];

  const normalUserLinks = [
    { label: "Favoris", href: "/favorites", icon: <FaHeart /> },
    { label: "Messages", href: "/messages", icon: <FaEnvelope /> },
    { label: "Notifications", href: "/notifications", icon: <FaBell /> },
    { label: "Paramètres", href: "/parametres", icon: <FaCog /> },
    
  ];

  const annonceurLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <FaChartLine /> },
  ];

  const renderLinks = (links) => {
    return links.map((link, index) => (
      <Link
        key={index}
        px={3}
        py={2}
        rounded="md"
        color={textColor}
        fontWeight="medium"
        _hover={{
          textDecoration: "none",
          bg: hoverBgColor,
          color: "primary.600",
          transform: "translateY(-2px)"
        }}
        _active={{
          bg: activeBgColor
        }}
        href={link.href}
        display="flex"
        alignItems="center"
        gap={2}
        transition="all 0.2s"
      >
        <Box color="primary.500">{link.icon}</Box>
        <Text>{link.label}</Text>
      </Link>
    ));
  };

  return (
    <Box
      ref={navRef}
      bg={bgColor}
      px={{ base: 4, md: 8 }}
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      position="sticky"
      top="0"
      zIndex="sticky"
    
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Menu mobile */}
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          color="primary.500"
          variant="ghost"
        />

        {/* Logo avec animation */}
        <Box 
          ref={logoRef}
          onClick={() => navigate("/")}
          cursor="pointer"
          animation={`${floatAnimation} 4s ease-in-out infinite`}
        >
          <Image 
            h={{ base: "70px", md: "90px" }} 
            src={logoText} 
            alt="Logo" 
            transition="all 0.3s"
            _hover={{ transform: "scale(1.05)" }}
          />
        </Box>

        {/* Liens de navigation */}
        <HStack spacing={6} alignItems="center">
          <HStack as="nav" spacing={1} display={{ base: "none", md: "flex" }}>
            {renderLinks(commonLinks)}
            {isAuthenticated && !userGroups.includes("annonceur") && renderLinks(normalUserLinks)}
            {isAuthenticated && userGroups.includes("annonceur") && renderLinks(annonceurLinks)}
          </HStack>

          {/* Bouton de connexion ou avatar */}
          {!isAuthenticated ? (
            <Button
              bg={buttonBg}
              color="white"
              _hover={{ bg: buttonHover, transform: "translateY(-2px)" }}
              _active={{ bg: "primary.700" }}
              onClick={() => navigate("/login")}
              px={6}
              transition="all 0.2s"
            >
              Connexion
            </Button>
          ) : (
            <Flex alignItems="center">
              <Avatar
                size="sm"
                name={userDetail?.name}
                src={userDetail?.photo}
                cursor="pointer"
                onClick={() => navigate("/parametres")}
                _hover={{ transform: "scale(1.1)", boxShadow: "md" }}
                transition="all 0.2s"
              />
              
            </Flex>
          )}
        </HStack>
      </Flex>

      {/* Menu mobile dépliant */}
      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={2}>
            {renderLinks(commonLinks)}
            {isAuthenticated && !userGroups.includes("annonceur") && renderLinks(normalUserLinks)}
            {isAuthenticated && userGroups.includes("annonceur") && renderLinks(annonceurLinks)}
          </Stack>
        </Box>
      )}
    </Box>
  );
}