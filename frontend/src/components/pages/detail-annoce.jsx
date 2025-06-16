"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Heading,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardBody,
  Input,
  useDisclosure,
  Collapse,
  useToast,
  Stack,
  Icon,
  useColorModeValue,
  Badge,
  AspectRatio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useBreakpointValue,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaEllipsisH, FaThumbsUp, FaReply, FaStar, FaShare, FaPhone, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEnvelope, FaEye } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import Loading from "../partials/loading";
import SimpleNavbar from "../partials/navbar";
import { useAuth } from "@/hooks/useAuth";
import { baseUrl } from "@/config";
import { gsap } from "gsap";
import Footer from "../partials/footer";
import ShareButton from "./partials/share";
import { baseUrlFrontend } from "@/config";
import { v4 as uuidv4 } from "uuid";

export default function DetailAnnonce() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vue, setVue] = useState(0);
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();
  const { isOpen: isSubscriptionModalOpen, onOpen: onSubscriptionModalOpen, onClose: onSubscriptionModalClose } = useDisclosure();
  const { user, isAuthenticated } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const toast = useToast();
  const containerRef = useRef();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Couleurs adaptatives
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const cardBg = useColorModeValue("white", "neutral.800");
  const borderColor = useColorModeValue("neutral.200", "neutral.700");
  const textColor = useColorModeValue("neutral.600", "neutral.300");
  const primaryTextColor = useColorModeValue("neutral.800", "white");
  const accentColor = useColorModeValue("accent.500", "accent.300");
  const hoverBg = useColorModeValue("primary.50", "primary.900");

  const statusPaiement=async(pay)=>{
    try{
      console.log('inside');
      
      const verifyResponse=await axiosInstance.get('/api/subscriptions/verify/')
      console.log('verification',verifyResponse);
      

      const response= await axiosInstance.post("/api/paiement/lygos/status/",{
      order_id:verifyResponse.data.order_id
      
    })
    const status=response.data.status
    console.log('votre status',status);
    
    const responsePub=await axiosInstance.patch(`/api/subscriptions/${verifyResponse.data.id}/`,{
      status:status
    })
    // console.log(responsePub);
    
    // console.log(response);
    }catch(err){
        console.log("erreur de status",err);

    }
    
    
    
    
  }


  // Animations GSAP
  useEffect(() => {
    if (!loading) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out"
      });

      gsap.from(".animate-section", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.3
      });
    }
  }, [loading]);

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annonceResponse, commentsResponse, favorisResponse, noteResponse, subscriptionResponse] = await Promise.all([
          axiosInstance.get(`/api/annonces/${id}`),
          axiosInstance.get(`/api/annonces/${id}/commentaires`),
          axiosInstance.get(`/api/annonces/${id}/is-favoris/`),
          axiosInstance.get(`/api/annonces/${id}/note`),
          
          isAuthenticated && axiosInstance.get("/api/subscriptions/current/") 
        ]);

       
        statusPaiement()
        setAnnonce(annonceResponse.data);
        setComments(commentsResponse.data);
        setIsFavorite(favorisResponse.data.is_favoris);
        setUserRating(noteResponse.data?.user_note || 0);
        setHasActiveSubscription((subscriptionResponse.data?.is_active && subscriptionResponse.data?.status=='completed') || false);
        
        
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast, isAuthenticated]);

  const addView = async () => {
    if (isAuthenticated) {
      try {
        await axiosInstance.post("/api/vues/", {
          annonce: id,
          user: user.id,
        });
      } catch (err) {
        
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (isAuthenticated) {
      try {
        if (isFavorite) {
          await axiosInstance.delete(`/api/favoris/${id}/supprimer-favori/`);
          toast({
            title: "Retiré des favoris",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        } else {
          await axiosInstance.post("/api/favoris/", { annonce_id: id, user: user.id });
          toast({
            title: "Ajouté aux favoris",
            description: "Vous pouvez retrouver cette annonce dans vos favoris",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        }
        setIsFavorite(!isFavorite);
      } catch (err) {
        console.log(err);
        toast({
          title: "Erreur",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Erreur",
        description: "Vous devez vous authentifier avant de pouvoir réaliser cette action",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDiscussion = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erreur",
        description: "Vous devez vous authentifier avant de pouvoir envoyer un message",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (user.id == annonce.auteur_detail.id) {
      toast({
        title: "Erreur...",
        description: `Vous ne pouvez pas démarrer une discussion avec vous-même`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (!hasActiveSubscription) {
      onSubscriptionModalOpen();
      return;
    }

    try {
      const response = await axiosInstance.post("/api/discussions/", {
        createur1: user.id,
        createur2: annonce.auteur_detail.id,
      });
      navigate(`/messages?discussion=${response.data.id}`);
    } catch (err) {
      navigate("/messages");
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      const paymentRef = `PAY-${Date.now()}`;
      const order_id = uuidv4();
      console.log('paiement reference:', paymentRef);

      const response = await axiosInstance.post("/api/subscriptions/subscribe/", {
        plan_type: planType,
        payment_reference: paymentRef,
        order_id:order_id,
      });

      //setHasActiveSubscription(true);
      onSubscriptionModalClose();

      toast({
        title: "Abonnement activé!",
        description: `Votre abonnement ${planType} a été activé avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      console.log('hello')
      
      const link = `${baseUrlFrontend}/merci`;
      const linkechec = `${baseUrlFrontend}/echec`;
      const montant = planType === 'daily'
        ? 250
        : planType === 'weekly'
          ? 500
          : planType === 'monthly'
            ? 1000
            : 0;

      console.log('montant:',montant);
      
      if (response.status == 200 || response.status == 201) {
        const config = {
          timeout: 30000, // 30 secondes
          headers: {
            'Content-Type': 'application/json',
          }
        };

        const payresponse = await axiosInstance.post(
          "/api/paiement/lygos/",
          {
            amount: montant,
            shop_name: "Bayis Immob",
            message: `Paiement pour votre abonnement`,
            order_id: order_id,
            success_url: link,
            failure_url: linkechec
          },
          config
        );
        if (payresponse.status == 200) {
          window.open(payresponse.data.link, '_blank')
          const responseTmp = await axiosInstance.post(`/api/subscriptions/${response.data.id}/`, {
            order_id: order_id
          });

        }

      }



      // Rediriger vers la discussion après l'abonnement
      handleDiscussion();



    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de l'abonnement`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Gestion des commentaires
  const handleAddComment = async (parentCommentaire = null) => {
    if (isAuthenticated) {
      if (!newComment.trim()) return;

      try {
        const response = await axiosInstance.post("/api/commentaires/", {
          texte: newComment,
          annonce_id: id,
          parent_commentaire: parentCommentaire,
        });
        setComments([...comments, response.data]);
        setNewComment("");
        setReplyCommentId(null);
      } catch (err) {
        toast({
          title: "Erreur",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer un commentaire sans être authentifié",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Gestion des notes
  const handleAddRating = async (valeur) => {
    if (isAuthenticated) {
      try {
        await axiosInstance.post("/api/notes/", {
          valeur: valeur,
          annonce: id,
          user: user.id,
        });
        setUserRating(valeur);
        toast({
          title: "Merci pour votre note !",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (err) {
        console.log(err);
        
      }
    } else {
      toast({
        title: "Erreur",
        description: "Pour noter cette annonce veuillez d'abord vous authentifier",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Navigation entre images
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % annonce.photos.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? annonce.photos.length - 1 : prevIndex - 1
    );
  };

  if (loading) return <Loading />;

  addView();

  return (
    <Box bg={bgColor} minH="100vh" ref={containerRef}>
      <SimpleNavbar />

      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 350px" }} gap={8}>
          {/* Colonne principale */}
          <GridItem>
            {/* Galerie d'images */}
            <Box className="animate-section" mb={8}>
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={`${annonce.photos[currentImageIndex]?.photo}` || `${baseUrl}${annonce.photos[currentImageIndex]?.photo}` || annonce.photos[currentImageIndex]?.photo}
                  alt={`Image ${currentImageIndex + 1}`}
                  objectFit="cover"
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={onImageModalOpen}
                />
              </AspectRatio>

              {annonce.photos.length > 1 && (
                <HStack mt={4} spacing={2} overflowX="auto" py={2}>
                  {annonce.photos.map((photo, index) => (
                    <Box
                      key={index}
                      w="80px"
                      h="60px"
                      borderRadius="md"
                      overflow="hidden"
                      borderWidth="2px"
                      borderColor={currentImageIndex === index ? "primary.500" : "transparent"}
                      cursor="pointer"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={`${photo.photo}` || `${baseUrl}${photo.photo}` || photo.photo}
                        alt={`Miniature ${index + 1}`}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    </Box>
                  ))}
                </HStack>
              )}
            </Box>

            {/* Titre et prix */}
            <Box className="animate-section" mb={6}>
              <Flex justify="space-between" align="center">
                <Heading size={{ base: "md", md: "xl" }} color={primaryTextColor} mb={2}>
                  {annonce.titre}
                </Heading>
              </Flex>

              <Heading size="xl" color="primary.500" mb={4}>
                {annonce.prix.toLocaleString()} Fcfa
              </Heading>

              <Flex align="center" color={textColor} fontSize="sm">
                <Icon as={FaMapMarkerAlt} mr={2} />
                <Text>{annonce.localisation}</Text>
                <Text mx={2}>•</Text>
                <Text>{annonce.vues?.length || 0} vues</Text>
              </Flex>
            </Box>

            {/* Description */}
            <Box className="animate-section" mb={8} bg={cardBg} borderRadius="xl" boxShadow="sm" p={6}>
              <Heading size="md" mb={4} color={primaryTextColor}>
                Description
              </Heading>
              <Collapse startingHeight={120} in={isOpen}>
                <Text color={textColor} lineHeight="tall">
                  {annonce.description}
                </Text>
              </Collapse>
              <Button
                size="sm"
                onClick={onToggle}
                mt={2}
                variant="ghost"
                colorScheme="primary"
              >
                {isOpen ? "Voir moins" : "Voir plus"}
              </Button>
            </Box>

            {/* Commentaires */}
            <Box className="animate-section">
              <Heading size="md" mb={6} color={primaryTextColor}>
                Commentaires ({comments.length})
              </Heading>

              {/* Formulaire de commentaire */}
              <Flex mb={8} gap={3}>
                <Avatar size="sm" name={user?.name} src={user?.avatar} />
                <Box flex={1}>
                  <Input
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    mb={2}
                  />
                  <Flex justify="flex-end">
                    <Button
                      colorScheme="primary"
                      size="sm"
                      onClick={() => handleAddComment()}
                      isDisabled={!newComment.trim()}
                    >
                      Publier
                    </Button>
                  </Flex>
                </Box>
              </Flex>

              {/* Liste des commentaires */}
              <VStack align="stretch" spacing={6}>
                {comments.map((comment) => (
                  <Box
                    key={comment.id}
                    p={4}
                    bg={cardBg}
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Flex align="center" mb={3}>
                      <Avatar size="sm" name={comment.user} src={comment.user?.avatar} mr={3} />
                      <Box flex={1}>
                        <Text fontWeight="bold" color={primaryTextColor}>
                          {comment.user}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {new Date(comment.date_creation).toLocaleDateString()}
                        </Text>
                      </Box>
                      <IconButton
                        icon={<FaEllipsisH />}
                        variant="ghost"
                        size="sm"
                        aria-label="Options"
                      />
                    </Flex>

                    <Text color={textColor} mb={3}>
                      {comment.texte}
                    </Text>

                    <Flex>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaThumbsUp />}
                        color={textColor}
                        mr={2}
                      >
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaReply />}
                        color={textColor}
                        onClick={() => setReplyCommentId(comment.id === replyCommentId ? null : comment.id)}
                      >
                        Répondre
                      </Button>
                    </Flex>

                    {replyCommentId === comment.id && (
                      <Box mt={4} pl={10}>
                        <Input
                          placeholder={`Réponse à ${comment.user}...`}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          mb={2}
                        />
                        <Flex justify="flex-end" gap={2}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyCommentId(null)}
                          >
                            Annuler
                          </Button>
                          <Button
                            colorScheme="primary"
                            size="sm"
                            onClick={() => handleAddComment(comment.id)}
                            isDisabled={!newComment.trim()}
                          >
                            Envoyer
                          </Button>
                        </Flex>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Colonne latérale */}
          <GridItem>
            <VStack spacing={6} position="sticky" top="24" align="stretch">
              {/* Carte de contact */}
              <Card className="animate-section" bg={cardBg} boxShadow="sm">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={primaryTextColor}>
                      Contact
                    </Heading>

                    <Flex align="center">
                      <Avatar
                        size="lg"
                        name={annonce.auteur_detail.name}
                        src={`${annonce.auteur_detail.photo}` || `${baseUrl}${annonce.auteur_detail.photo}` || annonce.auteur_detail.photo}
                        mr={4}
                      />
                      <Box>
                        <Text fontWeight="bold" color={primaryTextColor}>
                          {annonce.auteur_detail.name}
                        </Text>
                        <Text color={textColor} fontSize="sm">
                          Membre depuis {new Date(annonce.auteur_detail.date_joined).getFullYear()}
                        </Text>
                      </Box>
                    </Flex>

                    <VStack spacing={3} mt={4}>
                      {hasActiveSubscription && (
                        <Popover>
                          <PopoverTrigger>
                            <Button
                              colorScheme="primary"
                              leftIcon={<FaEye />}
                              w="full"
                            >
                              Voir le numéro
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody>
                              {annonce.auteur_detail.phone}
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      )}



                      <Button
                        variant="outline"
                        colorScheme="primary"
                        leftIcon={<FaEnvelope />}
                        w="full"
                        onClick={handleDiscussion}
                      >
                        Envoyer un message
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Carte d'actions */}
              <Card className="animate-section" bg={cardBg} boxShadow="sm">
                <CardBody>
                  <VStack spacing={4}>
                    <Button
                      variant={isFavorite ? "solid" : "outline"}
                      colorScheme={isFavorite ? "red" : "primary"}
                      size="lg"
                      w="full"
                      leftIcon={isFavorite ? <FaHeart /> : <FaRegHeart />}
                      onClick={handleToggleFavorite}
                    >
                      {isFavorite ? "Favori" : "Ajouter aux favoris"}
                    </Button>
                    <ShareButton />
                  </VStack>
                </CardBody>
              </Card>

              {/* Notation */}
              <Card className="animate-section" bg={cardBg} boxShadow="sm">
                <CardBody>
                  <VStack spacing={4}>
                    <Heading size="md" color={primaryTextColor}>
                      Noter cette annonce
                    </Heading>
                    <HStack spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          as={FaStar}
                          boxSize={6}
                          color={star <= userRating ? "yellow.400" : "gray.300"}
                          cursor="pointer"
                          _hover={{ transform: "scale(1.2)" }}
                          transition="all 0.2s"
                          onClick={() => handleAddRating(star)}
                        />
                      ))}
                    </HStack>
                    <Text color={textColor} fontSize="sm" textAlign="center">
                      {userRating ? `Vous avez noté ${userRating}/5` : "Cliquez pour noter"}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Modal pour l'image en grand */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" bg="blackAlpha.600" _hover={{ bg: "blackAlpha.700" }} />
          <ModalBody p={0}>
            <AspectRatio ratio={16 / 9}>
              <Image
                src={`${annonce.photos[currentImageIndex]?.photo}` || `${baseUrl}${annonce.photos[currentImageIndex]?.photo}` || annonce.photos[currentImageIndex]?.photo}
                alt={`Image ${currentImageIndex + 1}`}
                objectFit="contain"
              />
            </AspectRatio>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal d'abonnement */}
      <Modal isOpen={isSubscriptionModalOpen} onClose={onSubscriptionModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Abonnement Requis</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Pour envoyer des messages aux propriétaires, vous devez souscrire à un abonnement premium.
            </Text>

            <VStack spacing={4} align="stretch">
              <Card
                borderWidth="2px"
                borderColor="primary.500"
                _hover={{ transform: "scale(1.02)", shadow: "md" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleSubscribe("daily")}
              >
                <CardBody>
                  <Heading size="md">Journalier</Heading>
                  <Text fontSize="xl" fontWeight="bold" color="primary.500">250 FCFA</Text>
                  <Text mt={2}>Accès pour 24 heures</Text>
                </CardBody>
              </Card>

              <Card
                borderWidth="1px"
                _hover={{ transform: "scale(1.02)", shadow: "md" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleSubscribe("weekly")}
              >
                <CardBody>
                  <Heading size="md">Hebdomadaire</Heading>
                  <Text fontSize="xl" fontWeight="bold" color="primary.500">500 FCFA</Text>
                  <Text mt={2}>Accès pour 7 jours</Text>
                </CardBody>
              </Card>

              <Card
                borderWidth="1px"
                _hover={{ transform: "scale(1.02)", shadow: "md" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleSubscribe("monthly")}
              >
                <CardBody>
                  <Heading size="md">Mensuel</Heading>
                  <Text fontSize="xl" fontWeight="bold" color="primary.500">1000 FCFA</Text>
                  <Text mt={2}>Accès pour 30 jours</Text>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSubscriptionModalClose}>
              Plus tard
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
}