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
} from "@chakra-ui/react"
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons"
export default function SimpleNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Memoize color mode values to prevent conditional hook calls
  const bgColor = useColorModeValue("white", "gray.800")
  const hoverBgColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box bg={bgColor} px={4} boxShadow="sm" position="sticky" top="0" zIndex="sticky">


      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {/* Zone pour le menu hamburger (mobile) */}
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />

        {/* Zone pour le logo */}
        <Box>
          <Image h="40px" src="/placeholder.svg?height=40&width=120" alt="Logo" />
        </Box>

        <HStack>
             <HStack spacing={8} alignItems={"center"}>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"/annonce"}
            >
              Accueil
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Favoris
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Messages
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Notifications
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"/dashboard"}
            >
              Dashboard
            </Link>
          </HStack>
        </HStack>

        {/* Zone pour l'avatar */}
        <Flex alignItems={"center"}>
          <Avatar size={"sm"} src="/placeholder.svg?height=32&width=32" cursor="pointer" />
        </Flex>
        </HStack>

        {/* Zone pour le menu de navigation avec liens en dur */}
       
      </Flex>

     

      {/* Menu mobile avec liens en dur */}
      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"/annonce"}
            >
              Accueil
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Favoris
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Messages
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"#"}
            >
              Notifications
            </Link>
            <Link
              px={2}
              py={1}
              rounded={"md"}
              _hover={{
                textDecoration: "none",
                bg: hoverBgColor,
              }}
              href={"/dashboard"}
            >
              Dashboard
            </Link>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}

