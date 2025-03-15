import {
    Box,
    Input,
    Grid,
    Card,
    CardBody,
    Heading,
    Text,
    IconButton,
    InputGroup,
    InputLeftElement,
    Container,
    Stack,
    useToast,
    useColorModeValue,
    Flex,
    Avatar,
    Badge,
    Button,
  } from "@chakra-ui/react";
  import { SearchIcon, DeleteIcon, StarIcon, ChevronRightIcon } from "@chakra-ui/icons";
  import { useState } from "react";
  import SimpleNavbar from "./partials/navbar";
import { background } from "@chakra-ui/system";
  
  // Sample data for favorites (biens immobiliers)
  const initialFavorites = [
    {
      id: 1,
      title: "Appartement Lumineux",
      description: "2 chambres, 75m², proche du centre-ville.",
      location: "Paris, France",
      price: "€1,200/mois",
      image: "https://via.placeholder.com/150",
      rating: 4.5,
    },
    {
      id: 2,
      title: "Maison Moderne",
      description: "4 chambres, 120m², jardin privé.",
      location: "Lyon, France",
      price: "€2,500/mois",
      image: "https://via.placeholder.com/150",
      rating: 4.8,
    },
    {
      id: 3,
      title: "Studio Cosy",
      description: "1 chambre, 35m², proche des transports.",
      location: "Marseille, France",
      price: "€800/mois",
      image: "https://via.placeholder.com/150",
      rating: 4.2,
    },
  ];
  
  export default function FavoritesPage() {
    const [favorites, setFavorites] = useState(initialFavorites);
    const [searchQuery, setSearchQuery] = useState("");
    const toast = useToast();
  
    const filteredFavorites = favorites.filter((fav) =>
      fav.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    const removeFavorite = (id) => {
      setFavorites(favorites.filter((fav) => fav.id !== id));
      toast({
        title: "Bien supprimé des favoris",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    };
  
    const cardBg = useColorModeValue("white", "gray.700");
    const cardHoverBg = useColorModeValue("gray.50", "gray.600");
    const textColor = useColorModeValue("gray.800", "white");
    const subtitleColor = useColorModeValue("gray.600", "gray.400");
  
    return (
        <div style={{ background: "#ededed",  borderRadius: "8px", height:"100vh"}}>
        <SimpleNavbar />
      <Container maxW="7xl" py={8} >
        
        <Stack spacing={6}>
          <Heading size="lg" mb={2} color={textColor}>
            Mes Favoris Immobiliers
          </Heading>
  
          {/* Barre de recherche */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher un bien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              borderRadius="lg"
              bg={useColorModeValue("white", "gray.700")}
              borderColor={useColorModeValue("gray.200", "gray.600")}
              _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            />
          </InputGroup>
  
          {/* Grille des favoris */}
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {filteredFavorites.map((favorite) => (
              <Card
                key={favorite.id}
                transition="all 0.2s"
                bg={cardBg}
                _hover={{ transform: "translateY(-2px)", shadow: "lg", bg: cardHoverBg }}
              >
                <CardBody>
                  <Stack spacing={4}>
                    {/* Image du bien */}
                    <Avatar
                      size="xl"
                      src={favorite.image}
                      borderRadius="lg"
                      mb={2}
                    />
  
                    {/* Titre et description */}
                    <Stack spacing={2}>
                      <Heading size="md" color={textColor}>
                        {favorite.title}
                      </Heading>
                      <Text color={subtitleColor} fontSize="sm">
                        {favorite.description}
                      </Text>
                      <Text color={subtitleColor} fontSize="sm">
                        <strong>Lieu :</strong> {favorite.location}
                      </Text>
                      <Text color={subtitleColor} fontSize="sm">
                        <strong>Prix :</strong> {favorite.price}
                      </Text>
                    </Stack>
  
                    {/* Note et actions */}
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">
                        <StarIcon mr={1} /> {favorite.rating}
                      </Badge>
                      <Button
                        rightIcon={<ChevronRightIcon />}
                        colorScheme="blue"
                        size="sm"
                        variant="outline"
                      >
                        Voir plus
                      </Button>
                    </Flex>
  
                    {/* Bouton de suppression */}
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Supprimer des favoris"
                      alignSelf="flex-end"
                      onClick={() => removeFavorite(favorite.id)}
                      size="sm"
                      _hover={{ bg: "red.50" }}
                    />
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>
  
          {/* Message si aucun favori trouvé */}
          {filteredFavorites.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color={subtitleColor}>Aucun bien trouvé dans vos favoris.</Text>
            </Box>
          )}
        </Stack>
      </Container>
        </div>
      
    );
  }