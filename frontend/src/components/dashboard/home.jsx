import {
  Container,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Grid,
  GridItem,
  Stack,
  useToast,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiBell,
  FiHome,
  FiGift,
  FiMonitor,
  FiBarChart,
  FiUsers,
  FiEye,
  FiDollarSign,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/api/axios";
import { Chart } from "chart.js/auto";

const HomeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const usersChartRef = useRef(null);
  const viewsChartRef = useRef(null);
  const conversionChartRef = useRef(null);
  const FavorisRef = useRef(null);
  
  const chartHeight = useBreakpointValue({ base: "250px", md: "300px" });
  const gridColumns = useBreakpointValue({ base: "1fr", lg: "2fr 1fr" });
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });

  // Date actuelle formatée
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/api/statistiques");
        // Ajout de données simulées pour l'exemple
        const enhancedData = {
          ...response.data,
          taux_conversion: 65, // Taux de conversion en %
          revenus_mois: 0, // Revenus ce mois
          nouveaux_utilisateurs: 24, // Nouveaux utilisateurs
          annonces_expirantes: 3, // Annonces qui expirent bientôt
        };
        console.log(response.data);
        
        setStats(enhancedData);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    // Détruire les anciens graphiques avant de créer les nouveaux
    if (usersChartRef.current) {
      usersChartRef.current.destroy();
    }
    if (viewsChartRef.current) {
      viewsChartRef.current.destroy();
    }
    if (conversionChartRef.current) {
      conversionChartRef.current.destroy();
    }
    if(FavorisRef.current){
    FavorisRef.current.destroy()
    }

    // Créer le graphique d'inscriptions
    const usersCtx = document.getElementById('usersChart');
    if (usersCtx) {
      usersChartRef.current = new Chart(usersCtx, {
        type: 'line',
        data: {
          labels: stats.users_par_date.map(item => 
            new Date(item.date_inscription).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })
          ),
          datasets: [{
            label: 'Inscriptions',
            data: stats.users_par_date.map(item => item.nombre_utilisateurs),
            borderColor: '#8884d8',
            backgroundColor: 'rgba(136, 132, 216, 0.2)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        }
      });
    }

    // Créer le graphique des vues par annonce
    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx) {
      const topAnnonces = [...stats.vues_par_annonces]
        .sort((a, b) => b.nombre_vues - a.nombre_vues)
        .slice(0, 5);

      viewsChartRef.current = new Chart(viewsCtx, {
        type: 'bar',
        data: {
          labels: topAnnonces.map(annonce => 
            annonce.annonce__titre.length > 15 
              ? annonce.annonce__titre.substring(0, 15) + '...' 
              : annonce.annonce__titre
          ),
          datasets: [{
            label: 'Vues',
            data: topAnnonces.map(annonce => annonce.nombre_vues),
            backgroundColor: COLORS,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const annonce = topAnnonces[context.dataIndex];
                  return `${annonce.annonce__titre}: ${context.raw} vues`;
                }
              }
            }
          },
        }
      });
    }

    const FavoriCtx=document.getElementById('FavorisChart')
    if (FavoriCtx) {
      const topAnnonces = [...stats.favoris_par_annonce]
        .sort((a, b) => b.nombre_vues - a.nombre_vues)
        .slice(0, 5);

      FavorisRef.current = new Chart(FavoriCtx, {
        type: 'bar',
        data: {
          labels: topAnnonces.map(annonce => 
            annonce.annonce__titre.length > 15 
              ? annonce.annonce__titre.substring(0, 15) + '...' 
              : annonce.annonce__titre
          ),
          datasets: [{
            label: 'Favoris',
            data: topAnnonces.map(annonce => annonce.nombre_vues),
            backgroundColor: COLORS,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const annonce = topAnnonces[context.dataIndex];
                  return `${annonce.annonce__titre}: ${context.raw} vues`;
                }
              }
            }
          },
        }
      });
    }

    // Graphique de conversion (exemple supplémentaire)
    const conversionCtx = document.getElementById('conversionChart');
    if (conversionCtx) {
      conversionChartRef.current = new Chart(conversionCtx, {
        type: 'doughnut',
        data: {
          labels: ['Converties', 'Non converties'],
          datasets: [{
            data: [stats.total_discussions, stats.total_vues - stats.total_discussions],
            backgroundColor: ['#00C49F', '#FF8042'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        }
      });
    }

    // Nettoyage
    return () => {
      if (usersChartRef.current) {
        usersChartRef.current.destroy();
      }
      if (viewsChartRef.current) {
        viewsChartRef.current.destroy();
      }
      if (conversionChartRef.current) {
        conversionChartRef.current.destroy();
      }
            if (FavorisRef.current) {
        FavorisRef.current.destroy();
      }
    };
  }, [stats]);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Text>Chargement des statistiques...</Text>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxW="7xl" py={8}>
        <Text>Erreur lors du chargement des statistiques</Text>
      </Container>
    );
  }

  const topAnnonces = [...stats.vues_par_annonces]
    .sort((a, b) => b.nombre_vues - a.nombre_vues)
    .slice(0, 5);

  // Nouvelles données suggérées
  const quickStats = [
    {
      label: "Publicités actives",
      value: `${stats.publicites_actives}`,
      icon: FiDollarSign,
      color: "green.400",
    },
    {
      label: "Nouveaux utilisateurs",
      value: stats.nouveaux_utilisateurs,
      icon: FiUser,
      color: "blue.400",
    },
    {
      label: "Taux de conversion",
      value: `${((stats.total_discussions/stats.total_vues)*100 || 0).toFixed(2)}%`,
      icon: FiBarChart,
      color: "purple.400",
    },
    {
      label: "Annonces actives",
      value: stats.annonces_actives,
      icon: FiCalendar,
      color: "orange.400",
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      {/* Header */}
      <Flex mb={8} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box mb={{ base: 4, md: 0 }}>
          <Heading size="lg">Tableau de Bord</Heading>
          <Text color="gray.500">{currentDate}</Text>
        </Box>
        <Box textAlign={{ base: "left", md: "right" }}>
          <Button
            leftIcon={<FiBell />}
            colorScheme={stats.unread_notifications > 0 ? "red" : "blue"}
            size="sm"
            variant={stats.unread_notifications > 0 ? "solid" : "outline"}
          >
            {stats.unread_notifications} Notification(s)
          </Button>
        </Box>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={cardColumns} spacing={6} mb={8}>
        {quickStats.map((stat, index) => (
          <Card key={index} bgGradient={`linear(to-r, ${stat.color}, ${stat.color.replace('400', '500')})`} color="white">
            <CardBody>
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber>{stat.value}</StatNumber>
                <StatHelpText>
                  <Icon as={stat.icon} /> {stat.label.includes('Taux') ? 'Moyenne' : 'Ce mois-ci'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Main Grid */}
      <Grid templateColumns={gridColumns} gap={8}>
        {/* Left Column */}
        <GridItem>
          <Card mb={8} boxShadow="lg">
            <CardHeader>
              <Heading size="md">Évolution des inscriptions</Heading>
              <Text fontSize="sm" color="gray.500">
                Sur les 30 derniers jours
              </Text>
            </CardHeader>
            <CardBody height={chartHeight}>
              <canvas id="usersChart"></canvas>
            </CardBody>
          </Card>

          <Card mb={8} boxShadow="lg">
            <CardHeader>
              <Heading size="md">Top annonces</Heading>
              <Text fontSize="sm" color="gray.500">
                Classement par nombre de vues
              </Text>
            </CardHeader>
            <CardBody height={chartHeight}>
              <canvas id="viewsChart"></canvas>
            </CardBody>
          </Card>

                    <Card mb={8} boxShadow="lg">
            <CardHeader>
              <Heading size="md">Top Favoris</Heading>
              <Text fontSize="sm" color="gray.500">
                Annonces les plus aimées
              </Text>
            </CardHeader>
            <CardBody height={chartHeight}>
              <canvas id="FavorisChart"></canvas>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right Column */}
        <GridItem>
          <Card mb={8} boxShadow="lg">
            <CardHeader>
              <Heading size="md">Taux de conversion</Heading>
              <Text fontSize="sm" color="gray.500">
                Visites vs. Contacts
              </Text>
            </CardHeader>
            <CardBody height={chartHeight}>
              <canvas id="conversionChart"></canvas>
            </CardBody>
          </Card>

          <Card mb={8} boxShadow="lg">
            <CardHeader>
              <Heading size="md">Annonces populaires</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {topAnnonces.map((annonce, index) => (
                  <Box
                    key={annonce.annonce_id}
                    p={3}
                    borderRadius="md"
                    bg={index % 2 === 0 ? "blackAlpha.50" : "whiteAlpha.100"}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">
                          #{index + 1} {annonce.annonce__titre}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {annonce.nombre_vues} vues
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={
                          index === 0
                            ? "yellow"
                            : index === 1
                            ? "gray"
                            : index === 2
                            ? "orange"
                            : "blue"
                        }
                        fontSize="sm"
                      >
                        {index === 0 ? "Top" : `#${index + 1}`}
                      </Badge>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* <Card boxShadow="lg">
            <CardHeader>
              <Heading size="md">Actions Rapides</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={1} spacing={4}>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiHome />}
                  size="md"
                  variant="solid"
                >
                  Ajouter une annonce
                </Button>
                <Button
                  colorScheme="green"
                  leftIcon={<FiGift />}
                  size="md"
                  variant="solid"
                >
                  Gérer la tombola
                </Button>
                <Button
                  colorScheme="purple"
                  leftIcon={<FiMonitor />}
                  size="md"
                  variant="solid"
                >
                  Créer une publicité
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card> */}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default HomeDashboard;