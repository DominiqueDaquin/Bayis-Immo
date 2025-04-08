"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Tooltip,
  Button,
  useToast,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaCommentAlt, FaSearch } from "react-icons/fa";
import { StarIcon } from "@chakra-ui/icons";
import axiosInstance from "@/api/axios";
import Loading from "../../partials/loading";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "@/config";

import Pagination from "./pagination";
import HeroBanner from "./hero";
import PropertyCard from "./property-card";
import SimpleNavbar from "../../partials/navbar";
import Footer from "@/components/partials/footer";

export default function Home() {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prixMin, setPrixMin] = useState(null);
  const [prixMax, setPrixMax] = useState(null);
  const [locationFiltre, setLocationFiltre] = useState("");
  const [tri, setTri] = useState("");
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const containerRef = useRef();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  // Couleurs adaptatives
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const cardBg = useColorModeValue("white", "neutral.800");
  const textColor = useColorModeValue("neutral.800", "whiteAlpha.900");

  const itemsPerPage = isMobile ? 8 : 12;
  const totalPages = Math.ceil(annonces.length / itemsPerPage) || 1;

  const filteredAnnonce = annonces
    .filter((t) => (prixMin == null ? true : t.prix >= prixMin))
    .filter((t) => (prixMax == null ? true : t.prix <= prixMax))
    .filter((t) =>
      t.titre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((t) =>
      t.localisation.toLowerCase().includes(locationFiltre.toLowerCase())
    )
    .sort((a, b) => {
      switch (tri) {
        case "featured":
          return b.vues.length - a.vues.length;
        case "price-asc":
          return a.prix - b.prix;
        case "price-desc":
          return b.prix - a.prix;
        case "rating":
          return b.moyenne - a.moyenne;
        default:
          return 0;
      }
    });

  const paginatedProperties = filteredAnnonce.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchAnnonces = async () => {
    try {
      const response = await axiosInstance.get("/api/annonces");
      setAnnonces(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get("/api/favoris/mes-favoris/");
      setFavorites(response.data.map((fav) => fav.id));
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
    }
  };

  const handleToggleFavorite = async (annonceId) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour gérer vos favoris",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      if (favorites.includes(annonceId)) {
        await axiosInstance.delete(
          `/api/favoris/${annonceId}/supprimer-favori/`
        );
        setFavorites((prev) => prev.filter((id) => id !== annonceId));
        toast({
          title: "Retiré des favoris",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      } else {
        await axiosInstance.post("/api/favoris/", {
          annonce_id: annonceId,
          user: user.id,
        });
        setFavorites((prev) => [...prev, annonceId]);
        toast({
          title: "Ajouté aux favoris !",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error.response?.data?.detail || "Une erreur s'est produite",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <SimpleNavbar />

      <HeroBanner />

      <Container
        maxW="container.xl"
        py={8}
        px={{ base: 4, md: 6 }}
        ref={containerRef}
      >
        {/* Nouvelle organisation des filtres */}
        <VStack spacing={6} align="stretch" mb={8}>
          {/* Barre de recherche principale */}
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FaSearch color={useColorModeValue("neutral.400", "neutral.500")} />
            </InputLeftElement>
            <Input
              placeholder="Rechercher par mot-clé, lieu, type de propriété..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              focusBorderColor="primary.500"
              bg={cardBg}
              borderRadius="md"
            />
          </InputGroup>

          {/* Filtres avancés */}
          <Box
            bg={cardBg}
            p={{ base: 3, md: 4 }}
            borderRadius="md"
            shadow="sm"
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
            >
              {/* Filtre Prix Min */}
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1} color={textColor}>
                    Prix min (XAF)
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    focusBorderColor="primary.500"
                    onChange={(e) => setPrixMin(parseFloat(e.target.value))}
                    size="sm"
                    bg={useColorModeValue("white", "neutral.700")}
                  />
                </FormControl>
              </GridItem>

              {/* Filtre Prix Max */}
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1} color={textColor}>
                    Prix max (XAF)
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Illimité"
                    focusBorderColor="primary.500"
                    onChange={(e) => setPrixMax(parseFloat(e.target.value))}
                    size="sm"
                    bg={useColorModeValue("white", "neutral.700")}
                  />
                </FormControl>
              </GridItem>

              {/* Filtre Localisation */}
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1} color={textColor}>
                    Localisation
                  </FormLabel>
                  <Select
                    placeholder="Toutes villes"
                    focusBorderColor="primary.500"
                    onChange={(e) => setLocationFiltre(e.target.value)}
                    size="sm"
                    bg={useColorModeValue("white", "neutral.700")}
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Maroua">Maroua</option>
                  </Select>
                </FormControl>
              </GridItem>

              {/* Filtre Tri */}
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1} color={textColor}>
                    Trier par
                  </FormLabel>
                  <Select
                    placeholder="Par défaut"
                    focusBorderColor="primary.500"
                    onChange={(e) => setTri(e.target.value)}
                    size="sm"
                    bg={useColorModeValue("white", "neutral.700")}
                  >
                    <option value="featured">En vedette</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="rating">Meilleures notes</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>
        </VStack>

        {/* Résultats */}
        <Box mb={6}>
          <Heading as="h2" size="md" mb={4} color={textColor}>
            {filteredAnnonce.length} annonces disponibles
          </Heading>

          {/* Grille des propriétés */}
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            gap={6}
          >
            {paginatedProperties.map((property) => (
              <GridItem key={property.id}>
                <PropertyCard
                  property={property}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={handleToggleFavorite}
                  id={property.id}
                  currentUser={user}
                />
              </GridItem>
            ))}
          </Grid>

          {/* Pagination */}
          {annonces.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              mt={8}
            />
          )}
        </Box>

        {/* Bouton de support flottant */}
        <Tooltip label="Support client" placement="left" hasArrow>
          <IconButton
            aria-label="Chat support"
            icon={<FaCommentAlt />}
            position="fixed"
            bottom="8"
            right="8"
            colorScheme="primary"
            size="lg"
            borderRadius="full"
            boxShadow="xl"
            zIndex="tooltip"
            _hover={{ transform: "scale(1.1)" }}
            onClick={() =>
              window.open(
                "https://wa.me/+237683950330?text=Hello%20je%20suis%20un%20utilisateur%20de%20votre%20plateforme%20bayisImmob%20et%20j'ai%20besoin%20d'assistance",
                "_blank"
              )
            }
          />
        </Tooltip>
      </Container>

      <Footer />
    </Box>
  );
}