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
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, StarIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import SimpleNavbar from "../partials/navbar";
import axiosInstance from "@/api/axios";
import Loading from "../partials/loading";
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading,setLoading]=useState(true)
  const itemsPerPage = 6;
  const toast = useToast();
  
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axiosInstance.get("/api/favoris/");
        setFavorites(response.data)
        
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces Favoris. Veuillez réessayer.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();
  }, [toast]);

  const filteredFavorites = favorites
  .filter((fav) => fav && fav.title) // Filtre les éléments invalides
  .filter((fav) =>
    fav.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if(loading)
    return <Loading/>

  return (
    <div style={{ background: "#ededed", borderRadius: "8px", minHeight: "100vh" }}>
      <SimpleNavbar />
      <Container maxW="7xl" py={8}>
        <Stack spacing={6}>
          <Heading size="lg" mb={2} color={textColor}>
            Mes Favoris Immobiliers
          </Heading>

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

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {currentItems.map((favorite) => (
              <Card key={favorite.id} transition="all 0.2s" bg={cardBg} _hover={{ transform: "translateY(-2px)", shadow: "lg", bg: cardHoverBg }}>
                <CardBody>
                  <Stack spacing={4}>
                    <Avatar size="xl" src={favorite.image} borderRadius="lg" mb={2} />
                    <Stack spacing={2}>
                      <Heading size="md" color={textColor}>{favorite.title}</Heading>
                      <Text color={subtitleColor} fontSize="sm">{favorite.description}</Text>
                      <Text color={subtitleColor} fontSize="sm"><strong>Lieu :</strong> {favorite.location}</Text>
                      <Text color={subtitleColor} fontSize="sm"><strong>Prix :</strong> {favorite.price}</Text>
                    </Stack>
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">
                        <StarIcon mr={1} /> {favorite.rating}
                      </Badge>
                      <Button rightIcon={<ChevronRightIcon />} colorScheme="blue" size="sm" variant="outline">
                        Voir plus
                      </Button>
                    </Flex>
                    <IconButton icon={<DeleteIcon />} variant="ghost" colorScheme="red" aria-label="Supprimer des favoris" alignSelf="flex-end" onClick={() => removeFavorite(favorite.id)} size="sm" _hover={{ bg: "red.50" }} />
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>

          <Flex justify="center" mt={6}>
            <HStack spacing={2}>
              {Array.from({ length: Math.ceil(filteredFavorites.length / itemsPerPage) }, (_, i) => (
                <Button key={i + 1} onClick={() => paginate(i + 1)} colorScheme={currentPage === i + 1 ? "blue" : "gray"} variant={currentPage === i + 1 ? "solid" : "outline"}>
                  {i + 1}
                </Button>
              ))}
            </HStack>
          </Flex>

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
