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
    Progress,
    Grid,
    GridItem,
    Stack,
    List,
    ListItem,
    ListIcon,
  } from "@chakra-ui/react";
  import {
    FiBell,
    FiTrendingUp,
    FiCheckCircle,
    FiAlertCircle,
    FiHome,
    FiGift,
    FiMonitor,
    FiBarChart,
  } from "react-icons/fi";
  
  const HomeDashboard = () => {
    // Date actuelle formatée
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    return (
      <Container maxW="7xl">
        {/* Header */}
        <Flex mb={8} justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="lg">Vue d'ensemble</Heading>
            <Text color="gray.500">{currentDate}</Text>
          </Box>
          <Box textAlign="right" display={{ base: "none", md: "block" }}>
            <Button leftIcon={<FiBell />} colorScheme="blue" size="sm">
              3 Notifications
            </Button>
          </Box>
        </Flex>
  
        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Annonces Actives</StatLabel>
                <StatNumber>45</StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} /> +23% ce mois
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Visites Programmées</StatLabel>
                <StatNumber>28</StatNumber>
                <StatHelpText>Pour cette semaine</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Taux d'Occupation</StatLabel>
                <StatNumber>91%</StatNumber>
                <Progress value={91} colorScheme="blue" size="sm" mt={2} />
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
  
        {/* Main Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Left Column */}
          <GridItem>
            <Card mb={8}>
              <CardHeader>
                <Heading size="md">Performance des Annonces</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Taux de Conversion</Text>
                      <Text mb={2}>65%</Text>
                    </Flex>
                    <Progress value={65} colorScheme="blue" />
                  </Box>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Vues Totales</Text>
                      <Text mb={2}>82%</Text>
                    </Flex>
                    <Progress value={82} colorScheme="green" />
                  </Box>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Contacts Générés</Text>
                      <Text mb={2}>43%</Text>
                    </Flex>
                    <Progress value={43} colorScheme="purple" />
                  </Box>
                </Stack>
              </CardBody>
            </Card>
  
            <Card>
              <CardHeader>
                <Heading size="md">Alertes Système</Heading>
              </CardHeader>
              <CardBody>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">
                      14:32:12
                    </Text>{" "}
                    - Scan de sécurité terminé, aucune menace détectée
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiAlertCircle} color="orange.500" />
                    <Text as="span" fontWeight="bold">
                      13:45:06
                    </Text>{" "}
                    - Pic de trafic détecté sur l'annonce "Villa Marseille"
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiBell} color="blue.500" />
                    <Text as="span" fontWeight="bold">
                      09:12:45
                    </Text>{" "}
                    - Mise à jour disponible v12.4.5
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">
                      04:30:00
                    </Text>{" "}
                    - Sauvegarde incrémentielle réussie
                  </ListItem>
                </List>
              </CardBody>
            </Card>
          </GridItem>
  
          {/* Right Column */}
          <GridItem>
            <Card mb={8}>
              <CardHeader>
                <Heading size="md">Actions Rapides</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Button colorScheme="blue" leftIcon={<FiHome />}>
                    Ajouter une annonce
                  </Button>
                  <Button colorScheme="green" leftIcon={<FiGift />}>
                    Gérer la tombola
                  </Button>
                  <Button colorScheme="purple" leftIcon={<FiMonitor />}>
                    Créer une publicité
                  </Button>
                  <Button colorScheme="orange" leftIcon={<FiBarChart />}>
                    Voir les statistiques
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>
  
            <Card mb={8}>
              <CardHeader>
                <Heading size="md">Allocation des Ressources</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Puissance de traitement</Text>
                      <Text mb={2}>42% alloué</Text>
                    </Flex>
                    <Progress value={42} colorScheme="blue" />
                  </Box>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Allocation mémoire</Text>
                      <Text mb={2}>68% alloué</Text>
                    </Flex>
                    <Progress value={68} colorScheme="pink" />
                  </Box>
                  <Box>
                    <Flex justify="space-between">
                      <Text mb={2}>Bande passante réseau</Text>
                      <Text mb={2}>35% alloué</Text>
                    </Flex>
                    <Progress value={35} colorScheme="cyan" />
                  </Box>
                </Stack>
              </CardBody>
            </Card>
  
            <Card>
              <CardHeader>
                <Heading size="md">État de Sécurité</Heading>
              </CardHeader>
              <CardBody>
                <List spacing={3}>
                  <ListItem>
                    <Flex justify="space-between">
                      <Text>Pare-feu</Text>
                      <Text color="green.500" fontWeight="bold">
                        Actif
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between">
                      <Text>Détection d'intrusion</Text>
                      <Text color="green.500" fontWeight="bold">
                        Actif
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between">
                      <Text>Chiffrement</Text>
                      <Text color="green.500" fontWeight="bold">
                        Actif
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between">
                      <Text>Base de données des menaces</Text>
                      <Text color="blue.500">Mise à jour il y a 12 min</Text>
                    </Flex>
                  </ListItem>
                </List>
                <Box mt={4}>
                  <Text mb={2}>Niveau de sécurité: 75%</Text>
                  <Progress value={75} colorScheme="green" />
                </Box>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    );
  };
  
  export default HomeDashboard;