"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Input,
  Avatar,
  Text,
  VStack,
  HStack,
  IconButton,
  Divider,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  AvatarBadge,
  InputGroup,
  InputRightElement,
  useToast,
  Spinner,
  useColorModeValue,
  Badge
} from "@chakra-ui/react";
import { FiMenu, FiSend, FiSmile, FiInfo, FiMoreVertical, FiCheck, FiCheckCircle } from "react-icons/fi";
import ContactList from "./chat-contact-item";
import Message from "./chat-messages";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";

const DateDivider = ({ date }) => {
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  return (
    <Flex align="center" my={6}>
      <Divider flex="1" />
      <Text
        mx={4}
        fontSize="xs"
        fontWeight="medium"
        color="gray.500"
        bg={bgColor}
        px={3}
        py={1}
        borderRadius="full"
        boxShadow="sm"
      >
        {date}
      </Text>
      <Divider flex="1" />
    </Flex>
  );
};

const groupMessagesByDate = (messages) => {
  const grouped = {};
  messages.forEach(message => {
    const date = new Date(message.envoyer_le).toLocaleDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(message);
  });
  return grouped;
};

export default function Chat() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const { user } = useAuth();

  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const sidebarBg = useColorModeValue("white", "neutral.800");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesAsRead = async (discussionId) => {
    try {
      await axiosInstance.patch(`/api/discussions/${discussionId}/marquer-comme-lus/`);
      setUnreadCounts(prev => ({ ...prev, [discussionId]: 0 }));
      
      // Mettre à jour le statut des messages localement
      setMessages(prev => prev.map(msg => {
        if (msg.destinataire === user.id && msg.status === 'e') {
          return { ...msg, status: 'l' }; // Marquer comme lu
        }
        return msg;
      }));
    } catch (error) {
      console.error("Erreur lors du marquage des messages comme lus:", error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact?.id) return;

      setLoadingMessages(true);
      setErrorMessages(null);

      try {
        const response = await axiosInstance.get(
          `/api/messages/pour_discussion/${selectedContact.id}/`
        );
        setMessages(response.data);
        
        await markMessagesAsRead(selectedContact.id);
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
        setErrorMessages("Impossible de charger les messages. Veuillez réessayer.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedContact, toast]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !selectedContact?.id) return;
    
    try {
      const response = await axiosInstance.post("/api/messages/", {
        texte: inputValue,
        discussion: selectedContact.id,
        destinataire: selectedContact.destinataire,
      });

      setMessages(prev => [...prev, response.data]);
      setInputValue("");
      scrollToBottom();
      
      if (response.data.destinataire !== user.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [selectedContact.id]: (prev[selectedContact.id] || 0) + 1
        }));
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    onClose();
    markMessagesAsRead(contact.id);
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <Flex justify="center" align="center" h="100%">
          <Text color="gray.500">Aucun message disponible.</Text>
        </Flex>
      );
    }

    const groupedMessages = groupMessagesByDate(messages);
    return Object.entries(groupedMessages).map(([date, dateMessages]) => (
      <Box key={date}>
        <DateDivider date={date} />
        {dateMessages.map((message) => (
          <Message
            key={message.id}
            content={message.texte}
            timestamp={message.envoyer_le}
            isOwn={message.destinataire !== user.id}
            status={message.status}
            senderName={message.destinataire === user.id ? selectedContact.name : "Vous"}
            time={message.temps_ecoule}
          />
        ))}
      </Box>
    ));
  };

  return (
    <Container maxW="100%" h="100vh" p={0}>
      <Flex h="full" overflow="hidden">
        <Box
          w="350px"
          borderRight="1px"
          borderColor="gray.200"
          bg={sidebarBg}
          display={{ base: "none", md: "block" }}
          h="80vh"
          overflowY="hidden"
        >
          <ContactList 
            setContact={handleSelectContact}
            unreadCounts={unreadCounts}
          />
        </Box>

        <Flex flex="1" direction="column" bg={sidebarBg} h="80vh" overflow="hidden">
          <Flex p={4} align="center" borderBottom="1px" borderColor="gray.200" bg={sidebarBg}>
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
                  <AvatarBadge boxSize="1em" bg="green.500" />
                </Avatar>
                <Box flex="1">
                  <Text fontWeight="bold">{selectedContact.name}</Text>
                  <Text fontSize="xs" color="green.500">
                    En ligne
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

          <VStack
            flex="1"
            p={4}
            overflowY="auto"
            spacing={4}
            align="stretch"
            bg={sidebarBg}
            css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E0",
                borderRadius: "24px",
              },
            }}
          >
            {loadingMessages ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="lg" />
              </Flex>
            ) : errorMessages ? (
              <Flex justify="center" align="center" h="100%">
                <Text color="red.500">{errorMessages}</Text>
              </Flex>
            ) : (
              renderMessages()
            )}
            <Box ref={messagesEndRef} />
          </VStack>

          <Flex p={4} borderTop="1px" borderColor="gray.200" bg={sidebarBg}>
            <HStack w="full" spacing={2}>
              <InputGroup>
                <Input
                  placeholder="Écrivez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  bg={bgColor}
                  borderRadius="full"
                  py={6}
                />
                <InputRightElement h="full">
                  <IconButton icon={<FiSmile />} variant="ghost" colorScheme="blue" aria-label="Emoji" />
                </InputRightElement>
              </InputGroup>
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

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Conversations</DrawerHeader>
          <DrawerBody p={0}>
            <ContactList
              setContact={handleSelectContact}
              unreadCounts={unreadCounts}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
}