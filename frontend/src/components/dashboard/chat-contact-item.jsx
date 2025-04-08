import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Badge,
  AvatarBadge,
  Spinner,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";

const ContactItem = ({ name, lastMessage, time, unread, unreadCount, isActive, isOnline, onClick }) => {
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const sidebarBg = useColorModeValue("white", "neutral.800");
  const borderColor = useColorModeValue("neutral.200", "neutral.700");
  const textColor = useColorModeValue("neutral.800", "neutral.100");

  return (
    <Flex
      p={3}
      cursor="pointer"
      alignItems="center"
      _hover={{ bg: borderColor }}
      bg={isActive ? "blue.50" : sidebarBg}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderLeftColor={isActive ? "blue.500" : "transparent"}
      onClick={onClick}
      position="relative"
    >
      <Avatar size="md" name={name} mr={3}>
        {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
      </Avatar>
      <Box flex="1">
        <Flex justify="space-between" align="center">
          <Text fontWeight={unread ? "bold" : "medium"} color={isActive ? "blue.600" : textColor}>
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
          {unread && unreadCount > 0 && (
            <Flex
              bg="blue.500"
              color="white"
              borderRadius="full"
              minW="20px"
              h="20px"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
              ml={2}
            >
              {unreadCount}
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

const ContactList = ({ setContact, onMobileClose }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const sidebarBg = useColorModeValue("white", "neutral.800");

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await axiosInstance.get("/api/discussions/mes-discussions/");
        setDiscussions(response.data);
        
        // Vérifier si un paramètre discussion est présent dans l'URL
        const discussionId = searchParams.get('discussion');
        if (discussionId) {
          const discussion = response.data.find(d => d.id.toString() === discussionId);
          if (discussion) {
            const nom = discussion.createur1 === user.id ? discussion.name2 : discussion.name1;
            const destinataire = discussion.createur1 === user.id ? discussion.createur2 : discussion.createur1;
            
            setContact({
              id: discussion.id,
              name: nom,
              destinataire: destinataire,
            });
            
            await axiosInstance.patch(`/api/discussions/${discussion.id}/marquer-comme-lus/`);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des discussions:", error);
        setError("Impossible de charger les discussions. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDiscussions();
  }, [searchParams, user]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  if (discussions.length === 0) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color="gray.500">Aucune discussion disponible.</Text>
      </Flex>
    );
  }

  return (
    <VStack spacing={0} align="stretch" minH="100vh">
      {discussions.map((discussion) => {
        const nom = discussion.createur1 === user.id ? discussion.name2 : discussion.name1;
        const destinataire = discussion.createur1 === user.id ? discussion.createur2 : discussion.createur1;

        return (
          <ContactItem
            key={discussion.id}
            name={nom}
            lastMessage={discussion.last_message || "Aucun message"}
            time={formatTime(discussion.last_message_time)}
            unread={discussion.un_read}
            unreadCount={discussion.unread_count}
            isOnline={discussion.is_online}
            isActive={false}
            onClick={() => {
              setContact({
                id: discussion.id,
                name: nom,
                destinataire: destinataire,
              });
              
              if (onMobileClose) onMobileClose();
              
              axiosInstance.patch(`/api/discussions/${discussion.id}/marquer-comme-lus/`);
            }}
          />
        );
      })}
    </VStack>
  );
};

export default ContactList;