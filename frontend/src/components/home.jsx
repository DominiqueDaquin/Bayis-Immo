"use client"

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Text,
  Input,
  Checkbox,
  Select,
  IconButton,
  Image,
  HStack,
  VStack,
  Heading,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Tooltip,
  useColorModeValue,
  Avatar,
  Badge,
  Button,
  useToast,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaThLarge, FaEllipsisH, FaCommentAlt, FaFilter } from "react-icons/fa";
import { StarIcon } from "@chakra-ui/icons";
import SimpleNavbar from "./partials/navbar";
import axiosInstance from "@/api/axios"; // Assurez-vous que le chemin est correct

const baseUrl='http://127.0.0.1:8000'

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <HStack spacing={2} mt={8} justify="center" flexWrap="wrap">
    <Button
      onClick={() => onPageChange(currentPage - 1)}
      isDisabled={currentPage === 1}
      size="sm"
    >
      Précédent
    </Button>

    {Array.from({ length: totalPages }, (_, i) => (
      <Button
        key={i + 1}
        onClick={() => onPageChange(i + 1)}
        colorScheme={currentPage === i + 1 ? "blue" : "gray"}
        size="sm"
      >
        {i + 1}
      </Button>
    ))}

    <Button
      onClick={() => onPageChange(currentPage + 1)}
      isDisabled={currentPage === totalPages}
      size="sm"
    >
      Suivant
    </Button>
  </HStack>
);

const HeroBanner = () => (
  <Box
    bgImage="url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
    bgPosition="center"
    bgSize="cover"
    h={{ base: "300px", md: "400px" }}
    position="relative"
  >
    <Box bg="blackAlpha.600" h="full" w="full"></Box>
  </Box>
);

const Rating = ({ rating, reviews }) => (
  <HStack spacing={1}>
    {Array(5).fill("").map((_, i) => (
      <StarIcon
        key={i}
        color={i < Math.floor(rating) ? "yellow.400" : "gray.300"}
        boxSize={4}
      />
    ))}
    <Text fontSize="sm" color="gray.500">({reviews} avis)</Text>
  </HStack>
);

const PropertyCard = ({ property, isFavorite, onToggleFavorite }) => {
  const hoverEffect = useColorModeValue("shadow-lg", "dark-shadow");

  return (
    <Card
      maxW="sm"
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", shadow: "md" }}
    >
      <Box position="relative">
        {()=>console.log("photo",property.photos[0]?.url )}
        <Image
          src={`${baseUrl}${property.photos[0]?.photo || "https://via.placeholder.com/300"}`}// Utilisez la première photo ou une image par défaut
          alt={property.titre}
          height={{ base: "200px", md: "240px" }}
          width="100%"
          objectFit="cover"
          borderTopRadius="xl"
        />
        <Box position="absolute" top="2" right="2">
          <IconButton
            aria-label="Favorite"
            icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
            variant="ghost"
            colorScheme="whiteAlpha"
            rounded="full"
            onClick={() => onToggleFavorite(property.id)}
          />
        </Box>
        <Badge
          position="absolute"
          bottom="2"
          left="2"
          colorScheme="blue"
          px={2}
          py={1}
          borderRadius="md"
        >
          {property.status === "a" ? "Approuvé" : "En attente"}
        </Badge>
      </Box>
      <CardBody>
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
            {property.titre}
          </Text>
          <Text fontSize="xl" fontWeight="black" color="blue.800">
            XAF {property.prix?.toLocaleString() || "N/A"}
          </Text>
          <Rating rating={property.moyenne || 0} reviews={property.nb_avis || 0} />
          <HStack spacing={2} w="full" pt={2}>
            <Avatar size="sm" src={property.creer_par?.avatar || "https://bit.ly/dan-abramov"} />
            <Text fontSize="sm" color="gray.600">{property.creer_par?.name || "Anonyme"}</Text>
            <Button size="sm" ml="auto" colorScheme="blue" variant="outline">
              Contacter
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState({
    terrain: false,
    appartements: false,
    bureau: false,
    autres: false,
  });
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const itemsPerPage = 6;
  const totalPages = Math.ceil(annonces.length / itemsPerPage);
  const paginatedProperties = annonces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Récupérer les annonces depuis l'API
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axiosInstance.get("/api/annonces");
        console.log(response);
        
        setAnnonces(response.data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces. Veuillez réessayer.",
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

  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (category) => {
    setCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Chargement des annonces...</Text>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <SimpleNavbar />

      <HeroBanner />

      <Container maxW="container.xl" py={8} mt={{ base: "-40px", md: "24" }} position="relative" zIndex={1}>
        <Flex justify="space-between" mb={8} direction={{ base: "column", md: "row" }} gap={4}>
          <Heading as="h1" size="lg" display="flex" alignItems="center">
            <Text as="span" color="blue.600">{annonces.length}</Text>
            <Text as="span" ml={2}>Résultats trouvés</Text>
          </Heading>

          <HStack spacing={4}>
            <Select placeholder="Trier par" width="200px" variant="filled" icon={<FaFilter />}>
              <option value="featured">En vedette</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Meilleures notes</option>
            </Select>
            <Button leftIcon={<FaThLarge />} variant="solid">
              Grille
            </Button>
          </HStack>
        </Flex>

        <Flex gap={8} direction={{ base: "column", md: "row" }}>
          <Card bg="white" p={4} w={{ base: "full", md: "300px" }} shadow="sm">
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel fontWeight="bold">Prix (XAF)</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <Input placeholder="Minimum" size="md" />
                  <Input placeholder="Maximum" size="md" />
                </Grid>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Localisation</FormLabel>
                <Select placeholder="Choisir une ville">
                  <option>Douala</option>
                  <option>Yaoundé</option>
                  <option>Bafoussam</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Catégories</FormLabel>
                <VStack align="start" spacing={3}>
                  <Checkbox
                    colorScheme="blue"
                    isChecked={categories.terrain}
                    onChange={() => handleCategoryChange("terrain")}
                  >
                    Terrains
                  </Checkbox>
                  <Checkbox
                    colorScheme="blue"
                    isChecked={categories.appartements}
                    onChange={() => handleCategoryChange("appartements")}
                  >
                    Appartements
                  </Checkbox>
                  <Checkbox
                    colorScheme="blue"
                    isChecked={categories.bureau}
                    onChange={() => handleCategoryChange("bureau")}
                  >
                    Bureaux
                  </Checkbox>
                  <Checkbox
                    colorScheme="blue"
                    isChecked={categories.autres}
                    onChange={() => handleCategoryChange("autres")}
                  >
                    Autres
                  </Checkbox>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Notes</FormLabel>
                <HStack spacing={3}>
                  <Select placeholder="Min">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </Select>
                  <Select placeholder="Max">
                    <option>4</option>
                    <option>5</option>
                  </Select>
                </HStack>
              </FormControl>
            </VStack>
          </Card>

          <Box flex={1}>
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={6}
            >
              {paginatedProperties.map((property) => (
                <GridItem key={property.id}>
                  <PropertyCard
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </GridItem>
              ))}
            </Grid>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Box>
        </Flex>

        <Tooltip label="Support client">
          <IconButton
            aria-label="Chat"
            icon={<FaCommentAlt />}
            position="fixed"
            bottom="8"
            right="8"
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            boxShadow="xl"
          />
        </Tooltip>
      </Container>
    </Box>
  );
}