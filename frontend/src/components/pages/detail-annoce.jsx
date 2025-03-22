"use client"

import React, { useEffect, useState } from "react"
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
  useColorModeValue,
  Divider,
  Card,
  CardBody,
  Input,
  useDisclosure,
  Collapse,
  useToast,
  Stack,
  Icon,
} from "@chakra-ui/react"
import { FaHeart, FaRegHeart, FaEllipsisH, FaThumbsUp, FaReply, FaStar } from "react-icons/fa"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "@/api/axios"
import Loading from "../partials/loading"
import SimpleNavbar from "../partials/navbar"
import { useAuth } from "@/hooks/useAuth"
import { baseUrl } from "@/config"

export default function DetailAnnonce() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [annonce, setAnnonce] = useState(null)
  const [comments, setComments] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyCommentId, setReplyCommentId] = useState(null)
  const [userRating, setUserRating] = useState(0) // Note de l'utilisateur
  const { isOpen, onToggle } = useDisclosure()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { user } = useAuth()
  const toast = useToast()

  // Couleurs selon le thème
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const primaryTextColor = useColorModeValue("gray.800", "white")

  // Récupérer les détails de l'annonce, les commentaires et les favoris
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annonceResponse, commentsResponse, favorisResponse, noteResponse] = await Promise.all([
          axiosInstance.get(`/api/annonces/${id}`),
          axiosInstance.get(`/api/annonces/${id}/commentaires`),
          axiosInstance.get(`/api/favoris/?annonce=${id}`),
          axiosInstance.get(`/api/annonces/${id}/note`),
        ])

        setAnnonce(annonceResponse.data)
        setSelectedImage(annonceResponse.data.photos[0]?.photo || "")
        setComments(commentsResponse.data)
        setIsFavorite(favorisResponse.data.length > 0)
        setUserRating(noteResponse.data?.valeur || 0) // Initialiser la note de l'utilisateur
        setLoading(false)
      } catch (err) {
        toast({
          title: "Erreur",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [id, toast])

  // Ajouter ou retirer des favoris
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axiosInstance.delete(`/api/favoris/${id}/`)
      } else {
        await axiosInstance.post("/api/favoris/", { annonce: id })
      }
      setIsFavorite(!isFavorite)
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Créer une discussion avec l'auteur de l'annonce
  const handleDiscussion = async () => {
    try {
      const response = await axiosInstance.post("/api/discussions/", {
        createur1: user.id,
        createur2: annonce.creer_par.id,
      })
      navigate("/messages") // Rediriger vers la zone des messages
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Ajouter un commentaire
  const handleAddComment = async (parentCommentaire = null) => {
    try {
      const response = await axiosInstance.post("/api/commentaires/", {
        texte: newComment,
        annonce: id,
        parent_commentaire: parentCommentaire,
      })
      setComments([...comments, response.data])
      setNewComment("")
      setReplyCommentId(null)
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Ajouter une note
  const handleAddRating = async (valeur) => {
    try {
      await axiosInstance.post("/api/notes/", {
        valeur: valeur,
        annonce: id,
        user: user.id,
      })
      setUserRating(valeur) // Mettre à jour la note de l'utilisateur
      toast({
        title: "Succès",
        description: "Votre note a été enregistrée.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Gestion du carrousel mobile
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % annonce.photos.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? annonce.photos.length - 1 : prevIndex - 1
    )
  }

  if (loading) return <Loading />

  return (
    <Box bg={bgColor} minH="100vh">
      <SimpleNavbar />

      <Container maxW="container.xl" marginTop="100px">
        <Grid templateColumns={{ base: "1fr", md: "1fr 400px" }} gap={6}>
          {/* Image principale et description */}
          <GridItem>
            {/* Carrousel pour les écrans mobiles */}
            <Box display={{ base: "block", md: "none" }}>
              <Box position="relative">
                <Image
                  src={`${baseUrl}${annonce?.photos[currentImageIndex]?.photo}` || "/placeholder.svg"}
                  alt={`Image ${currentImageIndex + 1}`}
                  width="100%"
                  height="400px"
                  objectFit="cover"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                />
                <IconButton
                  aria-label="Previous image"
                  icon={<FaEllipsisH />}
                  position="absolute"
                  left="10px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={handlePrevImage}
                />
                <IconButton
                  aria-label="Next image"
                  icon={<FaEllipsisH />}
                  position="absolute"
                  right="10px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={handleNextImage}
                />
              </Box>
            </Box>

            {/* Image principale pour les écrans plus larges */}
            <Box display={{ base: "none", md: "block" }}>
              <Image
                src={`${baseUrl}${selectedImage}` || "/placeholder.svg"}
                alt="Image principale"
                width="100%"
                height="600px"
                objectFit="cover"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
              />
            </Box>

            {/* Titre, prix et nombre de vues */}
            <Box mt={6}>
              <Heading size="lg" mb={2} color={primaryTextColor}>
                {annonce?.titre}
              </Heading>
              <Heading size="lg" color="blue.500" mb={4}>
                {annonce?.prix} Fcfa
              </Heading>
              <Text color={textColor} fontSize="md">
                {annonce.vues ? annonce.vues.length : 0} vues
              </Text>
            </Box>

            {/* Description avec possibilité de réduire/développer */}
            <Box mt={6}>
              <Heading size="md" mb={4} color={primaryTextColor}>
                Description
              </Heading>
              <Collapse startingHeight={100} in={isOpen}>
                <Text color={textColor} fontSize="md">
                  {annonce?.description}
                </Text>
              </Collapse>
              <Button size="sm" onClick={onToggle} mt={2} colorScheme="blue">
                {isOpen ? "Voir moins" : "Voir plus"}
              </Button>
            </Box>

            {/* Section commentaires */}
            <Box mt={6}>
              <Heading size="md" mb={4} color={primaryTextColor}>
                {comments.length === 0 ? "Aucun" : comments.length} Commentaires
              </Heading>
              <VStack align="stretch" spacing={4}>
                {comments.map((comment) => (
                  <Box key={comment.id} p={4} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                    <HStack spacing={3} mb={3}>
                      <Avatar size="sm" name={comment.user} src={comment.user?.avatar} />
                      <Text fontWeight="bold" color={primaryTextColor}>
                        {comment.user}
                      </Text>
                      <IconButton icon={<FaEllipsisH />} variant="ghost" size="sm" ml="auto" />
                    </HStack>
                    {comment.parent_commentaire != null && (
                      <Box background={bgColor} paddingLeft={1}>
                        Réponse au commentaire:
                        <Text color={textColor} mb={3}>
                          {comment.commentaire_parent}
                        </Text>
                      </Box>
                    )}
                    <Text color={textColor} mb={3}>
                      {comment.texte}
                    </Text>
                    <HStack spacing={4}>
                      <Button variant="ghost" size="sm" leftIcon={<FaThumbsUp />} color={textColor}>
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaReply />}
                        color={textColor}
                        onClick={() => setReplyCommentId(comment.id)}
                      >
                        Répondre
                      </Button>
                    </HStack>
                    {replyCommentId === comment.id && (
                      <Box mt={2}>
                        <Input
                          placeholder="Votre réponse..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          mb={2}
                        />
                        <Button size="sm" colorScheme="blue" onClick={() => handleAddComment(comment.id)}>
                          Envoyer
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>

              {/* Zone de texte pour ajouter un commentaire */}
              <Box mt={6}>
                <Input
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  mb={2}
                />
                <Button colorScheme="blue" onClick={() => handleAddComment()}>
                  Envoyer
                </Button>
              </Box>
            </Box>
          </GridItem>

          {/* Informations et actions */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  {/* Informations sur l'auteur */}
                  <Box>
                    <Heading size="md" mb={4} color={primaryTextColor}>
                      Auteur
                    </Heading>
                    <HStack spacing={3}>
                      <Avatar size="md" name={annonce?.creer_par} src={annonce?.creer_par?.avatar} />
                      <Text fontWeight="bold" color={primaryTextColor}>
                        {annonce?.creer_par}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Notation */}
                  <Box>
                    <Heading size="md" mb={4} color={primaryTextColor}>
                      Noter cette annonce
                    </Heading>
                    <HStack spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          as={FaStar}
                          color={star <= userRating ? "yellow.400" : "gray.300"}
                          cursor="pointer"
                          onClick={() => handleAddRating(star)}
                        />
                      ))}
                    </HStack>
                  </Box>

                  {/* Boutons d'action */}
                  <VStack spacing={3}>
                    <Button colorScheme="blue" size="lg" width="100%" onClick={handleDiscussion}>
                      Discussion
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      width="100%"
                      leftIcon={isFavorite ? <FaHeart /> : <FaRegHeart />}
                      onClick={handleToggleFavorite}
                      colorScheme={isFavorite ? "red" : "gray"}
                    >
                      {isFavorite ? "Ajouté aux favoris" : "Ajouter aux favoris"}
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}