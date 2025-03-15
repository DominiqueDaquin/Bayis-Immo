"use client"

import React from "react"
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
} from "@chakra-ui/react"
import { FaHeart, FaRegHeart, FaEllipsisH, FaThumbsUp, FaReply } from "react-icons/fa"

// Images simulées pour la galerie
const images = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  "https://images.unsplash.com/photo-1572025442646-866d16c84a54",
  "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0",
]

// Commentaires simulés
const comments = [
  {
    id: 1,
    author: "Jeanne",
    avatar: "/placeholder.svg",
    content:
      "Lorem ipsum dolor sit amet, coetur adipiscing elit, ut aliquam, purus sit amet luctus Lorem ipsum dolor sit amet",
    likes: 15,
    replies: 5,
  },
  // Ajoutez plus de commentaires si nécessaire
]

export default function DetailAnnonce() {
  const [selectedImage, setSelectedImage] = React.useState(images[0])
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Couleurs selon le thème
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const primaryTextColor = useColorModeValue("gray.800", "white")

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: "1fr", md: "100px 1fr 400px" }} gap={6}>
          {/* Miniatures */}
          <GridItem display={{ base: "none", md: "block" }}>
            <VStack spacing={4}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  borderWidth="2px"
                  borderColor={selectedImage === image ? "blue.500" : "transparent"}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => setSelectedImage(image)}
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Vue ${index + 1}`}
                    width="100px"
                    height="100px"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </VStack>
          </GridItem>

          {/* Image principale */}
          <GridItem>
            <Box borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Image principale"
                width="100%"
                height="600px"
                objectFit="cover"
              />
            </Box>
          </GridItem>

          {/* Informations et actions */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Text color="gray.500" fontSize="sm" mb={1}>
                      ID7243
                    </Text>
                    <Heading size="lg" mb={2} color={primaryTextColor}>
                      Bureau à louer
                    </Heading>
                    <Heading size="lg" color="blue.500" mb={4}>
                      100 000 Fcfa
                    </Heading>
                    <Text color={textColor} fontSize="md">
                      Appartements moderne situé en plein coeur de siege reginal offre une vue magnifique sur la route,
                      avec possibilité de travailler dans un silence de cathédrale.
                    </Text>
                  </Box>

                  <VStack spacing={3}>
                    <Button colorScheme="blue" size="lg" width="100%">
                      Discussion
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      width="100%"
                      leftIcon={isFavorite ? <FaHeart /> : <FaRegHeart />}
                      onClick={() => setIsFavorite(!isFavorite)}
                      colorScheme={isFavorite ? "red" : "gray"}
                    >
                      {isFavorite ? "Ajouté aux favoris" : "Ajouter aux favoris"}
                    </Button>
                    <Button variant="outline" size="lg" width="100%">
                      Voir le profil
                    </Button>
                  </VStack>

                  <Divider />

                  {/* Section commentaires */}
                  <Box>
                    <Heading size="md" mb={4} color={primaryTextColor}>
                      Comments
                    </Heading>
                    <VStack align="stretch" spacing={4}>
                      {comments.map((comment) => (
                        <Box key={comment.id} p={4} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                          <HStack spacing={3} mb={3}>
                            <Avatar size="sm" name={comment.author} src={comment.avatar} />
                            <Text fontWeight="bold" color={primaryTextColor}>
                              {comment.author}
                            </Text>
                            <IconButton icon={<FaEllipsisH />} variant="ghost" size="sm" ml="auto" />
                          </HStack>
                          <Text color={textColor} mb={3}>
                            {comment.content}
                          </Text>
                          <HStack spacing={4}>
                            <Button variant="ghost" size="sm" leftIcon={<FaThumbsUp />} color={textColor}>
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" leftIcon={<FaReply />} color={textColor}>
                              {comment.replies} Replies
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                      <Button variant="link" color="blue.500">
                        View all 124 comments
                      </Button>
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

