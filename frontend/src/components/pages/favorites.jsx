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
  HStack,
  Image,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, StarIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import SimpleNavbar from "../partials/navbar";
import axiosInstance from "@/api/axios";
import Loading from "../partials/loading";
import { baseUrl } from "@/config";
export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [favoris, setFavoris] = useState([]);
  const itemsPerPage = 6;
  const toast = useToast();
  
  // Couleurs
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const sidebarBg = useColorModeValue("white", "neutral.800");
  const borderColor = useColorModeValue("neutral.200", "neutral.700");
  const textColor = useColorModeValue("neutral.800", "neutral.100");
  const subtitleColor = useColorModeValue("neutral.600", "neutral.400");

  useEffect(() => {
    const fetchFavoris = async () => {
      try {
        const response = await axiosInstance.get("/api/favoris/mes-favoris/");
        setFavoris(response.data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les favoris. Veuillez réessayer.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavoris();
  }, []);

  const filteredFavorites = favoris
    .filter((fav) => fav && fav.annonce && fav.annonce.titre)
    .filter((fav) =>
      fav.annonce.titre.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const removeFavorite = async (id) => {
    try {
      await axiosInstance.delete(`/api/favoris/${id}/`);
      setFavoris(favoris.filter((fav) => fav.id !== id));
      toast({
        title: "Supprimé des favoris",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le favori. Veuillez réessayer.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <SimpleNavbar />
        <Container maxW="7xl" py={8}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {[...Array(itemsPerPage)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton height="200px" mb={4} />
                  <SkeletonText mt="4" noOfLines={4} spacing="4" />
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <SimpleNavbar />
      <Container maxW="7xl" py={8}>
        <Stack spacing={6}>
          <Heading size="lg" mb={2} color={textColor}>
            Mes Annonces Favorites
          </Heading>

          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher une annonce..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset à la première page lors de la recherche
              }}
              size="lg"
              borderRadius="lg"
              bg={sidebarBg}
              borderColor={borderColor}
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            />
          </InputGroup>

          {filteredFavorites.length > 0 ? (
            <>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {currentItems.map((favorite) => (
                  <Card 
                    key={favorite.id} 
                    transition="all 0.2s" 
                    bg={sidebarBg} 
                    _hover={{ transform: "translateY(-4px)", shadow: "md" }}
                    border="1px"
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <Stack spacing={4}>
                        {favorite.annonce.photos && favorite.annonce.photos.length > 0 ? (
                          <Image
                            src={`${baseUrl }${favorite.annonce.photos[0].photo}`} // Adaptez selon votre structure de données
                            alt={favorite.annonce.titre}
                            borderRadius="lg"
                            height="200px"
                            width="100%"
                            objectFit="cover"
                          />
                        ) : (
                          <Box bg="gray.100" height="200px" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                            <Text color="gray.500">Pas d'image</Text>
                          </Box>
                        )}
                        
                        <Stack spacing={2}>
                          <Heading size="md" color={textColor} noOfLines={1}>
                            {favorite.annonce.titre}
                          </Heading>
                          
                          <Text color={subtitleColor} fontSize="sm">
                            <strong>Lieu :</strong> {favorite.annonce.localisation}
                          </Text>
                          <Text color={subtitleColor} fontSize="sm">
                            <strong>Prix :</strong> {favorite.annonce.prix} {/* Utilisez une fonction de formatage */}
                          </Text>
                      
                        </Stack>
                        
                        <Flex justify="space-between" align="center">
                          <Badge colorScheme={favorite.annonce.status === 'a' ? 'green' : 'orange'} px={2} py={1} borderRadius="md">
                            {favorite.annonce.status === 'a' ? 'Approuvé' : 'En attente'}
                          </Badge>
                          <Button 
                            rightIcon={<ChevronRightIcon />} 
                            colorScheme="blue" 
                            size="sm" 
                            as="a" 
                            href={`/detail-annonce/${favorite.annonce.id}`} // Adaptez selon votre routing
                          >
                            Voir plus
                          </Button>
                        </Flex>
                        
                        <IconButton 
                          icon={<DeleteIcon />} 
                          variant="ghost" 
                          colorScheme="red" 
                          aria-label="Supprimer des favoris" 
                          alignSelf="flex-end" 
                          onClick={() => removeFavorite(favorite.id)} 
                          size="sm" 
                        />
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {Math.ceil(filteredFavorites.length / itemsPerPage) > 1 && (
                <Flex justify="center" mt={6}>
                  <HStack spacing={2}>
                    {currentPage > 1 && (
                      <Button onClick={() => paginate(currentPage - 1)}>
                        Précédent
                      </Button>
                    )}
                    
                    {Array.from({ length: Math.ceil(filteredFavorites.length / itemsPerPage) }, (_, i) => (
                      <Button 
                        key={i + 1} 
                        onClick={() => paginate(i + 1)} 
                        colorScheme={currentPage === i + 1 ? "blue" : "gray"} 
                        variant={currentPage === i + 1 ? "solid" : "outline"}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    {currentPage < Math.ceil(filteredFavorites.length / itemsPerPage) && (
                      <Button onClick={() => paginate(currentPage + 1)}>
                        Suivant
                      </Button>
                    )}
                  </HStack>
                </Flex>
              )}
            </>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color={textColor} fontSize="lg" mb={4}>
                {searchQuery ? 
                  "Aucune annonce ne correspond à votre recherche." : 
                  "Vous n'avez aucune annonce en favoris pour le moment."}
              </Text>
              {searchQuery && (
                <Button colorScheme="blue" onClick={() => setSearchQuery("")}>
                  Réinitialiser la recherche
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}