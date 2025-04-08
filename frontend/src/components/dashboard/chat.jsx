import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  useBreakpointValue
} from "@chakra-ui/react";
import { FiMenu, FiSend, FiSmile, FiInfo, FiMoreVertical } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
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

const ChatBackground = () => {
  const patternColor = useColorModeValue("rgba(0, 0, 0, 0.05)", "rgba(255, 255, 255, 0.05)");
  
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(' + patternColor + ' 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none'
      }}
    />
  );
};

export default function Chat() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [searchParams] = useSearchParams();

  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const sidebarBg = useColorModeValue("white", "neutral.800");
  const chatBg = useColorModeValue("white", "neutral.700");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesAsRead = async (discussionId) => {
    try {
      await axiosInstance.patch(`/api/discussions/${discussionId}/marquer-comme-lus/`);
      setMessages(prev => prev.map(msg => {
        if (msg.destinataire === user.id && msg.status === 'e') {
          return { ...msg, status: 'l' };
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
  }, [selectedContact, toast, user]);

  useEffect(() => {
    // Vérifier si on doit afficher directement une discussion depuis l'URL
    const discussionId = searchParams.get('discussion');
    if (discussionId && selectedContact?.id !== discussionId) {
      // La gestion se fait dans ContactList
    }
  }, [searchParams]);

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
    if (isMobile) onClose();
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
      <Box key={date} position="relative">
        <DateDivider date={date} />
        {dateMessages.map((message) => (
          <Message
            key={message.id}
            content={message.texte}
            timestamp={message.envoyer_le}
            isOwn={message.destinataire !== user.id}
            status={message.status}
            senderName={message.destinataire === user.id ? selectedContact.name : "Vous"}
          />
        ))}
      </Box>
    ));
  };

  return (
    <Container maxW="100%" h="90vh" p={0} bg={bgColor}>
      {/* Version Mobile */}
      {isMobile ? (
        <>
          {selectedContact ? (
            <Flex direction="column" h="90vh">
              {/* Header de la conversation */}
              <Flex 
                p={3} 
                align="center" 
                borderBottom="1px" 
                borderColor="gray.200" 
                bg={sidebarBg}
              >
                <IconButton
                  icon={<FaArrowLeft />}
                  variant="ghost"
                  onClick={() => setSelectedContact(null)}
                  mr={2}
                  aria-label="Retour"
                />
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
                </HStack>
              </Flex>

              {/* Zone des messages */}
              <Box
                flex="1"
                overflowY="auto"
                position="relative"
                bg={chatBg}
              >
                <ChatBackground />
                <Box
                  p={4}
                  position="relative"
                  zIndex={1}
                  h="full"
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
                </Box>
              </Box>

              {/* Zone de saisie */}
              <Flex 
                p={3} 
                borderTop="1px" 
                borderColor="gray.200" 
                bg={sidebarBg}
              >
                <HStack w="full" spacing={2}>
                  <IconButton 
                    icon={<FiSmile />} 
                    variant="ghost" 
                    colorScheme="blue" 
                    aria-label="Emoji" 
                  />
                  <Input
                    placeholder="Écrivez votre message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    bg={bgColor}
                    borderRadius="full"
                    flex="1"
                  />
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
          ) : (
            <Box h="90vh" overflowY="auto" bg={sidebarBg}>
              <ContactList 
                setContact={handleSelectContact}
                onMobileClose={onClose}
              />
            </Box>
          )}
        </>
      ) : (
        /* Version Desktop */
        <Flex h="full" overflow="hidden">
          {/* Sidebar */}
          <Box
            w="350px"
            borderRight="1px"
            borderColor="gray.200"
            bg={sidebarBg}
            h="90vh"
            overflowY="scroll"
          >
            <ContactList 
              setContact={handleSelectContact}
            />
          </Box>

          {/* Zone de chat principale */}
          <Flex 
            flex="1" 
            direction="column" 
            bg={chatBg}
            h="90vh" 
            overflow="scroll"
            position="relative"
          >
            {selectedContact ? (
              <>
                {/* Header de la conversation */}
                <Flex 
                  p={3} 
                  align="center" 
                  borderBottom="1px" 
                  borderColor="gray.200" 
                  bg={sidebarBg}
                >
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
                </Flex>

                {/* Zone des messages */}
                <Box
                  flex="1"
                  overflowY="auto"
                  position="relative"
                >
                  <ChatBackground />
                  <Box
                    p={4}
                    position="relative"
                    zIndex={1}
                    h="full"
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
                  </Box>
                </Box>

                {/* Zone de saisie */}
                <Flex 
                  p={3} 
                  borderTop="1px" 
                  borderColor="gray.200" 
                  bg={sidebarBg}
                >
                  <HStack w="full" spacing={2}>
                    <IconButton 
                      icon={<FiSmile />} 
                      variant="ghost" 
                      colorScheme="blue" 
                      aria-label="Emoji" 
                    />
                    <Input
                      placeholder="Écrivez votre message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      bg={bgColor}
                      borderRadius="full"
                      flex="1"
                    />
                    <IconButton
                      icon={<FiSend />}
                      colorScheme="blue"
                      aria-label="Envoyer"
                      onClick={handleSendMessage}
                      isDisabled={inputValue.trim() === ""}
                    />
                  </HStack>
                </Flex>
              </>
            ) : (
              <Flex justify="center" align="center" h="100%">
                <Text color="gray.500">Sélectionnez une conversation</Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Container>
  );
}