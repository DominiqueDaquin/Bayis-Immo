"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  VStack,
  HStack,
  IconButton,
  Divider,
  Badge,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tooltip,
  AvatarBadge,
  InputRightElement,
} from "@chakra-ui/react"
import {
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiCheck,
  FiCheckCircle,
  FiMenu,
  FiInfo,
  FiSmile,
  FiImage,
  FiMic,
} from "react-icons/fi"

// Composant pour un contact dans la liste
const ContactItem = ({ name, lastMessage, time, unread, isActive, isOnline, onClick }) => {
  return (
    <Flex
      p={3}
      cursor="pointer"
      alignItems="center"
      _hover={{ bg: "gray.50" }}
      bg={isActive ? "blue.50" : "white"}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderLeftColor={isActive ? "blue.500" : "transparent"}
      onClick={onClick}
    >
      <Avatar size="md" name={name} mr={3}>
        {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
      </Avatar>
      <Box flex="1">
        <Flex justify="space-between" align="center">
          <Text fontWeight={isActive || unread ? "bold" : "medium"} color={isActive ? "blue.600" : "gray.800"}>
            {name}
          </Text>
          <Text fontSize="xs" color={unread ? "blue.500" : "gray.500"} fontWeight={unread ? "bold" : "normal"}>
            {time}
          </Text>
        </Flex>
        <Flex justify="space-between" align="center">
          <Text
            fontSize="sm"
            color={unread ? "gray.800" : "gray.500"}
            fontWeight={unread ? "medium" : "normal"}
            noOfLines={1}
            maxW="200px"
          >
            {lastMessage}
          </Text>
          {unread > 0 && (
            <Badge colorScheme="blue" rounded="full" px={2}>
              {unread}
            </Badge>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

// Composant pour un message
const Message = ({ content, timestamp, isOwn, status, senderName }) => {
  const align = isOwn ? "flex-end" : "flex-start"
  const messageTime = new Date(timestamp)
  const now = new Date()

  // Calcul du temps écoulé
  let timeAgo
  const diffMs = now - messageTime
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 1) {
    timeAgo = "À l'instant"
  } else if (diffMins < 60) {
    timeAgo = `Il y a ${diffMins} min`
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    timeAgo = `Il y a ${hours}h`
  } else {
    const days = Math.floor(diffMins / 1440)
    timeAgo = `Il y a ${days}j`
  }

  const getStatusText = () => {
    switch (status) {
      case "envoyé":
        return "Envoyé"
      case "reçu":
        return "Reçu"
      case "lu":
        return "Lu"
      default:
        return ""
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "envoyé":
        return <FiCheck color="#718096" />
      case "reçu":
        return <FiCheck color="#4299E1" />
      case "lu":
        return <FiCheckCircle color="#38B2AC" />
      default:
        return null
    }
  }

  return (
    <Flex w="100%" justify={align} mb={4}>
      {!isOwn && <Avatar size="sm" name={senderName} mr={2} alignSelf="flex-end" />}
      <Box maxW={{ base: "75%", md: "70%" }}>
        <Box
          bg={isOwn ? "blue.500" : "white"}
          color={isOwn ? "white" : "gray.800"}
          px={4}
          py={3}
          borderRadius={16}
          borderBottomRightRadius={isOwn ? 4 : 16}
          borderBottomLeftRadius={isOwn ? 16 : 4}
          boxShadow={isOwn ? "none" : "0 1px 2px rgba(0,0,0,0.1)"}
          border={isOwn ? "none" : "1px solid"}
          borderColor="gray.200"
        >
          {content}
        </Box>
        <Flex justify={isOwn ? "flex-end" : "flex-start"} align="center" mt={1} fontSize="xs" color="gray.500">
          <Tooltip label={messageTime.toLocaleString()} placement="bottom">
            <Text>{timeAgo}</Text>
          </Tooltip>
          {isOwn && (
            <Tooltip label={getStatusText()} placement="bottom">
              <Box ml={2}>{getStatusIcon()}</Box>
            </Tooltip>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

// Composant pour la date dans le chat
const DateDivider = ({ date }) => {
  return (
    <Flex align="center" my={6}>
      <Divider flex="1" />
      <Text
        mx={4}
        fontSize="xs"
        fontWeight="medium"
        color="gray.500"
        bg="white"
        px={3}
        py={1}
        borderRadius="full"
        boxShadow="sm"
      >
        {date}
      </Text>
      <Divider flex="1" />
    </Flex>
  )
}

// Composant principal du chat
export default function Chat() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedContact, setSelectedContact] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Bonjour, je souhaiterais avoir plus d'informations sur l'appartement T3 à Bordeaux",
      timestamp: "2023-05-15T14:30:00",
      isOwn: false,
      status: "lu",
      senderName: "Marie Dubois",
    },
    {
      id: 2,
      content: "Bonjour Marie, bien sûr, je peux vous aider. Quel aspect vous intéresse en particulier ?",
      timestamp: "2023-05-15T14:32:00",
      isOwn: true,
      status: "lu",
    },
    {
      id: 3,
      content: "J'aimerais connaître la surface exacte, le prix et s'il y a des charges de copropriété",
      timestamp: "2023-05-15T14:33:00",
      isOwn: false,
      status: "lu",
      senderName: "Marie Dubois",
    },
    {
      id: 4,
      content:
        "L'appartement fait 75m², le prix est de 250 000€ et les charges sont de 120€/mois. Il est situé au 3ème étage avec ascenseur et dispose d'un balcon de 8m².",
      timestamp: "2023-05-15T14:35:00",
      isOwn: true,
      status: "lu",
    },
    {
      id: 5,
      content: "Merci pour ces informations. Est-il possible de visiter l'appartement cette semaine ?",
      timestamp: "2023-05-15T14:38:00",
      isOwn: false,
      status: "lu",
      senderName: "Marie Dubois",
    },
    {
      id: 6,
      content:
        "Oui, je peux vous proposer une visite jeudi à 17h ou vendredi à 14h. Quelle date vous conviendrait le mieux ?",
      timestamp: "2023-05-15T14:40:00",
      isOwn: true,
      status: "reçu",
    },
    {
      id: 7,
      content: "Vendredi à 14h serait parfait pour moi.",
      timestamp: "2023-05-15T14:45:00",
      isOwn: false,
      status: "lu",
      senderName: "Marie Dubois",
    },
    {
      id: 8,
      content:
        "Très bien, je note la visite pour vendredi à 14h. Je vous envoie l'adresse exacte et les instructions d'accès par message.",
      timestamp: "2023-05-15T14:47:00",
      isOwn: true,
      status: "envoyé",
    },
  ])

  // Scroll automatique vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const contacts = [
    {
      id: 1,
      name: "Marie Dubois",
      lastMessage: "D'accord, je vous envoie les détails demain",
      time: "14:30",
      unread: 2,
      isOnline: true,
    },
    {
      id: 2,
      name: "Pierre Martin",
      lastMessage: "Le rendez-vous est confirmé pour lundi",
      time: "12:15",
      unread: 0,
      isOnline: false,
    },
    {
      id: 3,
      name: "Sophie Bernard",
      lastMessage: "Merci pour les informations sur l'appartement",
      time: "Hier",
      unread: 0,
      isOnline: true,
    },
    {
      id: 4,
      name: "Thomas Leroy",
      lastMessage: "Je suis intéressé par la visite",
      time: "Lun",
      unread: 0,
      isOnline: false,
    },
    {
      id: 5,
      name: "Camille Petit",
      lastMessage: "Pouvez-vous m'envoyer plus de photos ?",
      time: "27/04",
      unread: 0,
      isOnline: false,
    },
  ]

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return
    // Logique pour envoyer le message
    setInputValue("")
  }

  return (
    <Container maxW="100%" h="100vh" p={0}>
      <Flex h="full" overflow="hidden">
        {/* Liste des contacts (visible sur desktop, dans un drawer sur mobile) */}
        <Box
          w="350px"
          borderRight="1px"
          borderColor="gray.200"
          bg="white"
          display={{ base: "none", md: "block" }}
          h="80vh"
          overflowY="hidden"
        >
          <VStack spacing={0} align="stretch" h="full">
            <Box p={4} borderBottom="1px" borderColor="gray.200">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.500" />
                </InputLeftElement>
                <Input placeholder="Rechercher..." bg="gray.50" _focus={{ bg: "white", boxShadow: "md" }} />
              </InputGroup>
            </Box>
            <VStack
              spacing={0}
              align="stretch"
              overflowY="auto"
              flex="1"
              css={{
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#CBD5E0",
                  borderRadius: "24px",
                },
              }}
            >
              {contacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  {...contact}
                  isActive={selectedContact?.id === contact.id}
                  onClick={() => setSelectedContact(contact)}
                />
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Zone principale du chat */}
        <Flex flex="1" direction="column" bg="white" h="80vh" overflow="hidden">
          {/* En-tête */}
          <Flex p={4} align="center" borderBottom="1px" borderColor="gray.200" bg="white">
            <IconButton
              icon={<FiMenu />}
              variant="ghost"
              display={{ base: "flex", md: "none" }}
              onClick={onOpen}
              mr={2}
              aria-label="Menu"
            />
            {selectedContact ? (
              <>
                <Avatar size="sm" name={selectedContact.name} mr={3}>
                  {selectedContact.isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
                </Avatar>
                <Box flex="1">
                  <Text fontWeight="bold">{selectedContact.name}</Text>
                  <Text fontSize="xs" color={selectedContact.isOnline ? "green.500" : "gray.500"}>
                    {selectedContact.isOnline ? "En ligne" : "Vu dernièrement à 15:42"}
                  </Text>
                </Box>
                <HStack>
                  <IconButton icon={<FiInfo />} variant="ghost" aria-label="Informations" />
                  <IconButton icon={<FiMoreVertical />} variant="ghost" aria-label="Plus d'options" />
                </HStack>
              </>
            ) : (
              <Text>Sélectionnez une conversation</Text>
            )}
          </Flex>

          {/* Messages */}
          <VStack
            flex="1"
            p={4}
            overflowY="auto"
            spacing={4}
            align="stretch"
            bg="white"
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E0",
                borderRadius: "24px",
              },
            }}
          >
            <DateDivider date="Aujourd'hui" />
            {messages.map((message) => (
              <Message key={message.id} {...message} />
            ))}
            <Box ref={messagesEndRef} />
          </VStack>

          {/* Zone de saisie */}
          <Flex p={4} borderTop="1px" borderColor="gray.200" bg="white">
            <HStack w="full" spacing={2}>
              <IconButton icon={<FiPaperclip />} variant="ghost" colorScheme="blue" aria-label="Joindre un fichier" />
              <IconButton icon={<FiImage />} variant="ghost" colorScheme="blue" aria-label="Envoyer une image" />
              <InputGroup>
                <Input
                  placeholder="Écrivez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                  bg="gray.50"
                  _focus={{ bg: "white" }}
                  borderRadius="full"
                  py={6}
                />
                <InputRightElement h="full">
                  <IconButton icon={<FiSmile />} variant="ghost" colorScheme="blue" aria-label="Emoji" />
                </InputRightElement>
              </InputGroup>
              <IconButton icon={<FiMic />} variant="ghost" colorScheme="blue" aria-label="Message vocal" />
              <IconButton
                icon={<FiSend />}
                colorScheme="blue"
                aria-label="Envoyer"
                onClick={handleSendMessage}
                isDisabled={inputValue.trim() === ""}
              />
            </HStack>
          </Flex>
        </Flex>
      </Flex>

      {/* Drawer pour mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Conversations</DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              <Box p={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.500" />
                  </InputLeftElement>
                  <Input placeholder="Rechercher..." bg="gray.50" _focus={{ bg: "white" }} />
                </InputGroup>
              </Box>
              {contacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  {...contact}
                  isActive={selectedContact?.id === contact.id}
                  onClick={() => {
                    setSelectedContact(contact)
                    onClose()
                  }}
                />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  )
}
