import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Avatar,
  AvatarBadge,
  FormControl,
  FormLabel,
  Container,
  IconButton,
  Heading,
  Badge,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Switch,
  Button,
  Divider,
  useColorMode,
  useColorModeValue,
  Stack,
  Icon,
} from '@chakra-ui/react';
import {
  CheckIcon,
  EditIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  LockIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import axiosInstance from '@/api/axios'; 
import { useAuth } from '@/hooks/useAuth'; 

export default function Settings() {
  const { userDetail, isAuthenticated } = useAuth(); 
  const [imageUrl, setImageUrl] = useState(userDetail?.photo || ''); 
  const [name, setName] = useState(userDetail?.name || ''); 
  const [email, setEmail] = useState(userDetail?.email || ''); 
  const [phone, setPhone] = useState(userDetail?.phone || ''); 
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
    // Couleurs du thème
    const bgColor = useColorModeValue("neutral.50", "neutral.900")
    const sidebarBg = useColorModeValue("white", "neutral.800")
    const headerBg = useColorModeValue("white", "neutral.800")
    const borderColor = useColorModeValue("neutral.200", "neutral.700")
    const textColor = useColorModeValue("neutral.800", "neutral.100")
  

  // Mettre à jour les champs lorsque userDetail change
  useEffect(() => {
    if (userDetail) {
      setImageUrl(userDetail.photo || '');
      setName(userDetail.name || '');
      setEmail(userDetail.email || '');
      setPhone(userDetail.phone || '');
    }
  }, [userDetail]);

  // Gérer l'upload de la photo de profil
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await axiosInstance.patch(`/auth/users/${userDetail.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setImageUrl(URL.createObjectURL(file)); // Afficher la nouvelle image
        toast({
          title: "Photo de profil mise à jour",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Erreur lors de la mise à jour de la photo",
          description: error.response?.data?.detail || "Une erreur s'est produite.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Mettre à jour les informations de l'utilisateur
  const handleUpdateProfile = async () => {
    try {
      const response = await axiosInstance.patch(`/auth/users/${userDetail.id}/`, {
        name,
        email,
        phone,
      });

      toast({
        title: "Profil mis à jour",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erreur lors de la mise à jour du profil",
        description: error.response?.data?.detail || "Une erreur s'est produite.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Paramètres</Heading>

        {/* Section Profil Personnel */}
        <Card width={["100%", "70%"]} bg={sidebarBg}>
          <CardHeader>
            <HStack>
              <Icon as={SettingsIcon} />
              <Heading size="md">Profil Personnel</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Stack direction={['column', 'row']} spacing={8} align="flex-start">
              {/* Photo de profil */}
              <VStack spacing={4} align="center">
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    name={name}
                    src={imageUrl}
                    bg="green.400"
                  >
                    <AvatarBadge
                      as={IconButton}
                      size="sm"
                      rounded="full"
                      top="-10px"
                      colorScheme="green"
                      aria-label="Verified account"
                      icon={<CheckIcon />}
                    />
                  </Avatar>
                  <IconButton
                    aria-label="Change avatar"
                    icon={<EditIcon />}
                    size="sm"
                    colorScheme="gray"
                    rounded="full"
                    position="absolute"
                    bottom="0"
                    right="0"
                    onClick={() => fileInputRef.current.click()}
                  />
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </Box>
                <Badge colorScheme="green">Compte Vérifié</Badge>
              </VStack>

              {/* Informations personnelles */}
              <VStack spacing={4} flex={1}>
                <FormControl>
                  <FormLabel>Nom Complet</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </FormControl>
                <FormControl>
                  <FormLabel>Téléphone</FormLabel>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                </FormControl>
                <Button colorScheme="blue" onClick={handleUpdateProfile}>
                  Mettre à jour le profil
                </Button>
              </VStack>
            </Stack>
          </CardBody>
        </Card>

        {/* Section Préférences */}
        <Card width={["100%", "70%"]} bg={sidebarBg}>
          <CardHeader>
            <HStack>
              <Icon as={SunIcon} />
              <Heading size="md">Préférences du Site</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Thème</Text>
                  <Text fontSize="sm" color="gray.500">
                    Choisissez entre le mode clair et sombre
                  </Text>
                </VStack>
                <Switch
                  isChecked={colorMode === 'dark'}
                  onChange={toggleColorMode}
                />
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Langue</Text>
                  <Text fontSize="sm" color="gray.500">
                    Sélectionnez votre langue préférée
                  </Text>
                </VStack>
                <Select w="200px" defaultValue="fr">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </Select>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Notifications</Text>
                  <Text fontSize="sm" color="gray.500">
                    Gérer vos préférences de notifications
                  </Text>
                </VStack>
                <Switch defaultChecked />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Section Sécurité */}
        <Card width={["100%", "70%"]} bg={sidebarBg}>
          <CardHeader>
            <HStack>
              <Icon as={LockIcon} />
              <Heading size="md">Sécurité</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Changer le mot de passe</Text>
                  <Text fontSize="sm" color="gray.500">
                    Dernière modification il y a 3 mois
                  </Text>
                </VStack>
                <Button variant="outline">Modifier</Button>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Authentification à deux facteurs</Text>
                  <Text fontSize="sm" color="gray.500">
                    Ajouter une couche de sécurité supplémentaire
                  </Text>
                </VStack>
                <Switch />
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Sessions actives</Text>
                  <Text fontSize="sm" color="gray.500">
                    Gérer vos appareils connectés
                  </Text>
                </VStack>
                <Button variant="outline">Voir</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}