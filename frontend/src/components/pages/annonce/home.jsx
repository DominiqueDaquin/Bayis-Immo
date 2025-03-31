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
  Avatar,
  Badge,
  Button,
  useToast,
  useBreakpointValue,
  useTheme,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
  Show,
  Hide
} from "@chakra-ui/react";
import Footer from "@/components/partials/footer";
import { FaHeart, FaRegHeart, FaThLarge, FaCommentAlt, FaFilter, FaSearch } from "react-icons/fa";
import { StarIcon } from "@chakra-ui/icons";
import { gsap } from "gsap";
import SimpleNavbar from "../../partials/navbar";
import axiosInstance from "@/api/axios";
import Loading from "../../partials/loading";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "@/config";

import Pagination from "./pagination";
import HeroBanner from "./hero";
import Rating from "./rating";
import PropertyCard from "./property-card";
import FiltersDrawer from "./filters-drawer";
export default function Home() {
  const theme = useTheme();
  const { colorMode } = useColorMode();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [prixMin, setPrixMin] = useState(null)
  const [prixMax, setPrixMax] = useState(null)
  const [locationFiltre,setLocationFiltre]=useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [tri,setTri]=useState("")
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
    .filter((t) => prixMin==null? true:t.prix >= prixMin)
    .filter((t) => prixMax==null ? true:t.prix <= prixMax)
    .filter((t) => t.titre.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((t) => t.localisation.toLowerCase().includes(locationFiltre.toLowerCase()))
    .sort((a, b) => {
      switch (tri) {
        case "featured":
          return b.vues.length -a. vues.length
        case "price-asc":
          return a.prix - b.prix; 
        case "price-desc":
          return b.prix - a.prix; 
        case "rating":
          return b.moyenne - a.moyenne; 
        default:
          return 0; // Pas de tri spécifique
      }})
  const paginatedProperties = filteredAnnonce.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (category) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchAnnonces = async () => {
    try {
      const response = await axiosInstance.get("/api/annonces");
      setAnnonces(response.data);
      console.log(response.data);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get('/api/favoris/mes-favoris/');
      console.log("Mes favoris", response.data);

      setFavorites(response.data.map(fav => fav.id));
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
        position: "top"
      });
      return;
    }

    try {
      if (favorites.includes(annonceId)) {
        await axiosInstance.delete(`/api/favoris/${annonceId}/supprimer-favori/`);
        setFavorites(prev => prev.filter(id => id !== annonceId));
        toast({
          title: "Retiré des favoris",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top"
        });
      } else {
        await axiosInstance.post("/api/favoris/", { annonce_id: annonceId, user: user.id });
        setFavorites(prev => [...prev, annonceId]);
        toast({
          title: "Ajouté aux favoris !",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (error) {
      console.log("erreur favoris", error);

      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Une erreur s'est produite",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  // useEffect(() => {
  //   if (annonces.length > 0 && containerRef.current) {
  //     const cards = gsap.utils.toArray(".property-card");

  //     cards.forEach((card, i) => {
  //       gsap.fromTo(card, {
  //         opacity: 0,
  //         y: 30,
  //         duration: 0.6,
  //         delay: i * 0.1,
  //         scrollTrigger: {
  //           trigger: card,
  //           start: "top 0%",
  //           toggleActions: "play none none none",
  //           once: true
  //         }
  //       },{
  //         opacity:1,
  //         y:0,
  //         duration: 0.6,
  //         delay: i * 0.1,
  //         scrollTrigger: {
  //           trigger: card,
  //           start: "top 80%",
  //           toggleActions: "play none none none",
  //           once: true
  //         }
  //       });
  //     });
  //   }
  // }, [annonces, currentPage]);

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
        {/* Barre de recherche et filtres */}
        <Flex
          justify="space-between"
          mb={8}
          direction={{ base: "column", md: "row" }}
          gap={6}
        >
          <Box flex={1} maxW={{ base: "full", md: "md" }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color={useColorModeValue("neutral.400", "neutral.500")} />
              </InputLeftElement>
              <Input
                placeholder="Rechercher par lieu, propriété..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                focusBorderColor="primary.500"
                bg={cardBg}
              />
            </InputGroup>
          </Box>

          <HStack spacing={3}>
            <Select
              placeholder="Trier par"
              width={{ base: "full", md: "200px" }}
              variant="outline"
              icon={<FaFilter size="14px" />}
              colorScheme="primary"
              bg={cardBg}
              onChange={(e)=>setTri(e.target.value)}
            >
              <option value="featured">En vedette</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Meilleures notes</option>
            </Select>

            {/* <Show above="sm">
              <Button
                leftIcon={<FaThLarge />}
                variant="outline"
                colorScheme="primary"
                bg={cardBg}
              >
                Vue grille
              </Button>
            </Show> */}

            <Hide above="md">
              <Button
                leftIcon={<FaFilter />}
                onClick={() => setIsFiltersOpen(true)}
                colorScheme="primary"
                bg={cardBg}
              >
                Filtres
              </Button>
            </Hide>
          </HStack>
        </Flex>

        <Flex gap={8} direction={{ base: "column", md: "row" }}>
          {/* Filtres - Visible seulement sur desktop */}
          <Show above="md">
            <Box w="300px" flexShrink={0}>
              <Card bg={cardBg} p={4} shadow="sm" position="sticky" top="24">
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel fontWeight="semibold" color={textColor}>Prix (XAF)</FormLabel>
                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                      <Input
                        type="number"
                        placeholder="Minimum"
                        focusBorderColor="primary.500"
                        onChange={(e) => setPrixMin(parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        placeholder="Maximum"
                        focusBorderColor="primary.500"
                        onChange={(e) => setPrixMax(parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold" color={textColor}>Localisation</FormLabel>
                    <Select
                      placeholder="Choisir une ville"
                      focusBorderColor="primary.500"
                      onChange={(e)=>setLocationFiltre(e.target.value)}
                    >
                      <option>Douala</option>
                      <option>Yaoundé</option>
                      <option>Bafoussam</option>
                    </Select>
                  </FormControl>

                  {/* <FormControl>
                    <FormLabel fontWeight="semibold" color={textColor}>Catégories</FormLabel>
                    <VStack align="start" spacing={3}>
                      {Object.entries(categories).map(([key, value]) => (
                        <Checkbox
                          key={key}
                          colorScheme="primary"
                          isChecked={value}
                          onChange={() => handleCategoryChange(key)}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Checkbox>
                      ))}
                    </VStack>
                  </FormControl> */}

                  {/* <Button colorScheme="primary">
                    Appliquer les filtres
                  </Button> */}
                </VStack>
              </Card>
            </Box>
          </Show>

          {/* Liste des propriétés */}
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
                <GridItem key={property.id} className="property-card">
                  <PropertyCard
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                    id={property.id}
                  />
                </GridItem>
              ))}
            </Grid>

            {annonces.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </Box>
        </Flex>

        {/* Drawer de filtres pour mobile */}
        <FiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        />

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
            onClick={()=> window.open("https://wa.me/+237683950330?text=Hello%20je%20suis%20un%20utilisateur%20de%20votre%20plateforme%20bayisImmob%20et%20j'ai%20besoin%20d'assistance","_blank") }
          />
        </Tooltip>
      </Container>
      <Footer />
    </Box>
  );
}