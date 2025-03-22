"use client";

import { useState, useRef, useEffect } from "react";
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
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  AvatarBadge,
  InputRightElement,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiMenu,
  FiInfo,
  FiSmile,
  FiImage,
  FiMic,
} from "react-icons/fi";
import ContactList from "./chat-contact-item"; // Importez le composant ContactList
import Message from "./chat-messages";
import axiosInstance from "@/api/axios"; // Assurez-vous que le chemin est correct
import { useAuth } from "@/hooks/useAuth"; // Pour récupérer l'utilisateur connecté

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
  );
};

// Composant principal du chat
export default function Chat() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContact, setSelectedContact] = useState(null); // Contact sélectionné (ID et nom)
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]); // Liste des messages
  const [loadingMessages, setLoadingMessages] = useState(false); // État de chargement des messages
  const [errorMessages, setErrorMessages] = useState(null); // Gestion des erreurs des messages
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  

  // Scroll automatique vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Charger les messages du contact sélectionné
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact?.id) return;

      // setLoadingMessages(true);
      setErrorMessages(null);

      try {
        const response = await axiosInstance.get(
          `/api/messages/pour_discussion/${selectedContact.id}/`
        );
        setMessages(response.data);
        console.log(messages);
        
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
  }, [selectedContact, toast,messages]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !selectedContact?.id) return;
    console.log(selectedContact.id,selectedContact.destinataire,inputValue);
    
    try {
      const response = await axiosInstance.post("/api/messages/", {
        texte: inputValue,
        discussion: selectedContact.id,
        destinataire: selectedContact.destinataire, // ID du destinataire
      });

      // Ajouter le nouveau message à la liste
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setInputValue(""); // Réinitialiser le champ de saisie
      scrollToBottom(); // Faire défiler vers le bas
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
          <ContactList setContact={setSelectedContact} />
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
            {loadingMessages ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="lg" />
              </Flex>
            ) : errorMessages ? (
              <Flex justify="center" align="center" h="100%">
                <Text color="red.500">{errorMessages}</Text>
              </Flex>
            ) : messages.length === 0 ? (
              <Flex justify="center" align="center" h="100%">
                <Text color="gray.500">Aucun message disponible.</Text>
              </Flex>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.texte}
                  timestamp={message.envoyer_le}
                  isOwn={message.destinataire != user.id} // Vérifier si le message est de l'utilisateur connecté
                  status={message.status}
                  senderName={message.destinataire === user.id ? selectedContact.name:"Vous"}
                  time={message.temps_ecoule}
                />
              ))
            )}
            <Box ref={messagesEndRef} />
          </VStack>

          {/* Zone de saisie */}
          <Flex p={4} borderTop="1px" borderColor="gray.200" bg="white">
            <HStack w="full" spacing={2}>
              {/* <IconButton icon={<FiPaperclip />} variant="ghost" colorScheme="blue" aria-label="Joindre un fichier" />
              <IconButton icon={<FiImage />} variant="ghost" colorScheme="blue" aria-label="Envoyer une image" /> */}
              <InputGroup>
                <Input
                  placeholder="Écrivez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
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
              {/* <IconButton icon={<FiMic />} variant="ghost" colorScheme="blue" aria-label="Message vocal" /> */}
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
            <ContactList
              setContact={(contact) => {
                setSelectedContact(contact);
                onClose();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
}