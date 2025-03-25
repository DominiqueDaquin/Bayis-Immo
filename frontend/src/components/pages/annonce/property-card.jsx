"use client";
import Rating from "./rating";
import { useRef } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Image,
  VStack,
  Heading,
  Card,
  CardBody,
  Avatar,
  Badge,
  Button,
  useColorMode,
  useColorModeValue,

} from "@chakra-ui/react";
import { FaHeart, FaRegHeart} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "@/config";

// Enregistrer 


const PropertyCard = ({ property, isFavorite, onToggleFavorite, id }) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const cardRef = useRef();
    const cardBg = useColorModeValue("white", "neutral.800");
    const cardBorder = useColorModeValue("neutral.100", "neutral.700");
    const titleColor = useColorModeValue("neutral.800", "white");
    const priceColor = useColorModeValue("primary.600", "primary.400");
    const favIconColor = useColorModeValue("accent.500", "accent.300");
  
    // useEffect(() => {
    //   const card = cardRef.current;
    //   gsap.from(card, {
    //     opacity: 0,
    //     y: 30,
    //     duration: 0.6,
    //     scrollTrigger: {
    //       trigger: card,
    //       start: "top 80%",
    //       toggleActions: "play none none none"
    //     }
    //   });
  
    //   return () => {
    //     gsap.killTweensOf(card);
    //   };
    // }, []);
  
    return (
      <Card
        ref={cardRef}
        maxW="sm"
        borderRadius="xl"
        overflow="hidden"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ 
          transform: "translateY(-8px)",
          boxShadow: "xl"
        }}
        boxShadow="md"
        borderWidth="1px"
        borderColor={cardBorder}
        bg={cardBg}
      >
        <Box position="relative">
          <Image
            src={`${baseUrl}${property.photos[0]?.photo}` || "https://via.placeholder.com/300"}
            alt={property.titre}
            height={{ base: "200px", md: "240px" }}
            width="100%"
            objectFit="cover"
            borderTopRadius="xl"
          />
          <Box position="absolute" top="2" right="2">
            <IconButton
              aria-label="Ajouter aux favoris"
              icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
              variant="ghost"
              colorScheme="whiteAlpha"
              rounded="full"
              bg={colorMode === 'light' ? "whiteAlpha.800" : "blackAlpha.600"}
              _hover={{ bg: colorMode === 'light' ? "whiteAlpha.900" : "blackAlpha.500" }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
            />
          </Box>
          <Badge
            position="absolute"
            bottom="2"
            left="2"
            colorScheme={property.status === "a" ? "success" : "warning"}
            px={2}
            py={1}
            borderRadius="md"
            textTransform="capitalize"
          >
            {property.status === "a" ? "Disponible" : "En attente"}
          </Badge>
        </Box>
        <CardBody>
          <VStack align="start" spacing={3}>
            <Heading as="h3" size="md" noOfLines={1} color={titleColor}>
              {property.titre}
            </Heading>
            <Text fontSize="xl" fontWeight="black" color={priceColor}>
              XAF {property.prix?.toLocaleString() || "N/A"}
            </Text>
            <Rating rating={property.moyenne || 0} reviews={property.avis || 0} />
            
            <Flex align="center" w="full" pt={2}>
              <Avatar 
                size="sm" 
                src={property.creer_par?.avatar || "https://bit.ly/dan-abramov"} 
                mr={2}
              />
              <Text fontSize="sm" color={useColorModeValue("neutral.600", "neutral.300")} flex={1}>
                {property.creer_par?.name || "Anonyme"}
              </Text>
              <Button 
                size="sm" 
                colorScheme="primary"
                variant="outline"
                onClick={() => navigate(`/detail-annonce/${id}`)}
                _hover={{ bg: colorMode === 'light' ? "primary.50" : "primary.900" }}
              >
                Voir
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  export default PropertyCard;