"use client";
import Rating from "./rating";
import { useRef, useState } from "react";
import handlePayerPublicite from "@/components/others/handle-payer-pub";
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
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  Stack,
  useDisclosure,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaBullhorn, FaMoneyBillWave, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "@/config";
import axiosInstance from "@/api/axios";
import { useToast } from "@chakra-ui/react";

const PropertyCard = ({ property, isFavorite, onToggleFavorite, id, currentUser }) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const cardRef = useRef();
    const cardBg = useColorModeValue("white", "neutral.800");
    const sponsoredCardBg = useColorModeValue("blue.50", "blue.900");
    const cardBorder = useColorModeValue("neutral.100", "neutral.700");
    const sponsoredCardBorder = useColorModeValue("blue.200", "blue.700");
    const titleColor = useColorModeValue("neutral.800", "white");
    const priceColor = useColorModeValue("primary.600", "primary.400");
    const favIconColor = useColorModeValue("accent.500", "accent.300");
    const toast = useToast();
    
    // Vérifie si l'annonce est sponsorisée
    const isSponsored = property.status === "s";
    
    // States pour les modals
    const { isOpen: isBoostOpen, onOpen: onBoostOpen, onClose: onBoostClose } = useDisclosure();
    const { isOpen: isTombolaOpen, onOpen: onTombolaOpen, onClose: onTombolaClose } = useDisclosure();
    const [selectedDuration, setSelectedDuration] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pub,setPub]=useState(null)

    // Options de durée pour la publicité
    const durationOptions = [
        { value: "1", label: "1 jour", price: 250 },
        { value: "3", label: "3 jours", price: 500 },
        { value: "7", label: "1 semaine", price: 1000 },
        { value: "14", label: "2 semaines", price: 2000 },
        { value: "30", label: "1 mois", price: 4000 },
        { value: "365", label: "12 mois", price: 15000 }
    ];

    // Vérifie si l'utilisateur courant est le créateur de l'annonce
    const isCreator = currentUser && (currentUser.id === property.auteur_detail?.id);

    // Gère la création de publicité
    const handleBoost = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const selectedOption = durationOptions.find(opt => opt.value === selectedDuration);
            const response = await axiosInstance.post("/api/publicites/", {
                user: currentUser.id,
                annonce: property.id,
                titre: `Publicité pour ${property.titre}`,
                duree_jours: selectedOption.value,
                montant: selectedOption.price
            });
            setPub(response.data)
            console.log(pub);
            const pubs=pub
            console.log(pubs);
            
            toast({
                title: "Publicité créée",
                description: `vous allez être redirigé vers le paiement`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onBoostClose();
            try{
              console.log("hello");
              
              handlePayerPublicite(pub)
            }catch(err){
              toast({
                title: "Passez au paiement",
                description: `veuillez vous rendre au niveau de votre dashboard pour finaliser le paiement`,
                status: "alert",
                duration: 5000,
                isClosable: true,
            });
            }
            
        } catch (err) {
            console.log("une erreur est survenue", err);
            setError(err.response?.data || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    // Gère l'ajout à la cagnotte
    const handleAddToTombola = async () => {
        if (property.prix < 100000) {
            setError("Le prix doit être d'au moins 100 000 FCFA pour participer à la tombola");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post("/api/tombolas/", {
                titre: property.titre,
                cagnotte: property.prix,
                creer_par: currentUser.id,
                description: `Tentez de gagner: ${property.titre}`
            });

            toast({
                title: "Ajouté à la tombola",
                description: "Votre article a été ajouté à la cagnotte avec succès",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onTombolaClose();
        } catch (err) {
            setError(err.response?.data || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <>
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
          boxShadow={isSponsored ? "0 0 10px rgba(0, 100, 255, 0.3)" : "md"}
          borderWidth="1px"
          borderColor={isSponsored ? sponsoredCardBorder : cardBorder}
          bg={isSponsored ? sponsoredCardBg : cardBg}
          position="relative"
        >
          {/* Badge sponsorisé */}
          {isSponsored && (
            <Box
              position="absolute"
              top={2}
              left={2}
              zIndex={1}
              bg="blue.500"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              display="flex"
              alignItems="center"
              fontSize="sm"
              fontWeight="bold"
            >
              <FaStar style={{ marginRight: "4px" }} />
              Sponsorisé
            </Box>
          )}

          <Box position="relative">
            <Image
              src={`${property.photos[0]?.photo}` || "https://via.placeholder.com/300" }
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
            {/* <Badge
              position="absolute"
              bottom="2"
              left="2"
              colorScheme={
                property.status === "a" ? "green" : 
                property.status === "s" ? "blue" : "orange"
              }
              px={2}
              py={1}
              borderRadius="md"
              textTransform="capitalize"
            >
              {property.status === "a" ? "Disponible" : 
               property.status === "s" ? "Sponsorisé" : ""}
            </Badge> */}
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
                  name={ property.profil_auteur || property.creer_par } 
                  src={`${baseUrl}${property.auteur_detail.photo}` || property.auteur_detail.photo} 
                  mr={2}
                />
                <Text fontSize="sm" color={useColorModeValue("neutral.600", "neutral.300")} flex={1}>
                  {property.creer_par || "Anonyme"}
                </Text>
                
                {/* Boutons d'action */}
                <Flex gap={2}>
                  {isCreator && (
                    <>
                      <Tooltip label="Booster cette annonce" hasArrow>
                        <IconButton
                          aria-label="Booster"
                          icon={<FaBullhorn />}
                          size="sm"
                          colorScheme="orange"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBoostOpen();
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip label="Ajouter à la cagnotte" hasArrow>
                        <IconButton
                          aria-label="Cagnotte"
                          icon={<FaMoneyBillWave />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTombolaOpen();
                          }}
                        />
                      </Tooltip>
                    </>
                  )}
                  
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
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Modal pour booster l'annonce */}
        <Modal isOpen={isBoostOpen} onClose={onBoostClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Booster cette annonce</ModalHeader>
            <ModalBody>
              <Text mb={4}>Choisissez la durée de la publicité :</Text>
              
              <RadioGroup onChange={setSelectedDuration} value={selectedDuration}>
                <Stack direction="column">
                  {durationOptions.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label} - {option.price.toLocaleString()} FCFA
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>

              {error && (
                <Alert status="error" mt={4}>
                  <AlertIcon />
                  {typeof error === 'object' ? JSON.stringify(error) : error}
                </Alert>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBoostClose}>
                Annuler
              </Button>
              <Button 
                colorScheme="orange" 
                onClick={handleBoost}
                isLoading={isLoading}
                loadingText="En cours..."
              >
                Confirmer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal pour ajouter à la cagnotte */}
        <Modal isOpen={isTombolaOpen} onClose={onTombolaClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Ajouter à la cagnotte</ModalHeader>
            <ModalBody>
              <Text mb={4}>
                Voulez-vous ajouter "{property.titre}" à la tombola ?
                {property.prix < 100000 && (
                  <Text color="red.500" mt={2}>
                    Note : Le prix doit être d'au moins 100 000 FCFA pour participer
                  </Text>
                )}
              </Text>

              {error && (
                <Alert status="error" mt={4}>
                  <AlertIcon />
                  {typeof error === 'object' ? JSON.stringify(error) : error}
                </Alert>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onTombolaClose}>
                Annuler
              </Button>
              <Button 
                colorScheme="green" 
                onClick={handleAddToTombola}
                isLoading={isLoading}
                loadingText="En cours..."
                isDisabled={property.prix < 100000}
              >
                Confirmer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
};

export default PropertyCard;