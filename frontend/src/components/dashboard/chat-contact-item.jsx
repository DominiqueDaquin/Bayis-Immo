"use client";

import { useState, useEffect } from "react";
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
import axiosInstance from "@/api/axios"; // Assurez-vous que le chemin est correct
import { useAuth } from "@/hooks/useAuth";

const ContactItem = ({ name, lastMessage, time, unread, isActive, isOnline, onClick }) => {
    // Couleurs du thème
  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  
  return (
    <Flex
      p={3}
      cursor="pointer"
      alignItems="center"
      _hover={{ bg: borderColor }}
      bg={isActive ? "blue.50" : bgColor}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderLeftColor={isActive ? "blue.500" : "transparent"}
      onClick={onClick}
    >
      <Avatar size="md" name={name} mr={3}>
        {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
      </Avatar>
      <Box flex="1">
        <Flex justify="space-between" align="center">
          <Text fontWeight={isActive || unread ? "bold" : "medium"} color={isActive ? "blue.600" : textColor}>
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
  );
};

const ContactList = ({ setContact }) => {
  const [discussions, setDiscussions] = useState([]); // Liste des discussions
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Gestion des erreurs
  const { user, isAuthenticated } = useAuth();
  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  // Charger les discussions depuis l'API
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await axiosInstance.get("/api/discussions/mes-discussions/");
        setDiscussions(response.data); // Mettre à jour la liste des discussions
      } catch (error) {
        console.error("Erreur lors du chargement des discussions:", error);
        setError("Impossible de charger les discussions. Veuillez réessayer.");
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    fetchDiscussions();
  }, []);

  // Formater l'heure du dernier message
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Afficher le contenu en fonction de l'état
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

  // Afficher la liste des discussions
  return (
    <VStack spacing={0} align="stretch">
      {discussions.map((discussion) => {
        const nom = discussion.createur1 === user.id ? discussion.name2 : discussion.name1;
        const destinataire = discussion.createur1 === user.id ? discussion.createur2 : discussion.createur1;

        return (
          <ContactItem
            key={discussion.id}
            name={nom}
            lastMessage={discussion.last_message} // Dernier message
            time={formatTime(discussion.last_message_time)} // Heure du dernier message
            unread={discussion.unread_count} // Nombre de messages non lus
            isOnline={discussion.is_online} // Statut en ligne
            isActive={false} // Mettre à jour si une discussion est active
            onClick={() => {
              setContact({
                id: discussion.id,
                name: nom,
                destinataire: destinataire, // ID du destinataire
              });
              console.log("Discussion sélectionnée:", discussion.id);
            }}
          />
        );
      })}
    </VStack>
  );
};

export default ContactList;