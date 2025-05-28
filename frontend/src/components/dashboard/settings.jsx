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
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  CheckIcon,
  EditIcon,
  SettingsIcon,
  SunIcon,
  LockIcon,
} from '@chakra-ui/icons';
import axiosInstance from '@/api/axios'; 
import { useAuth } from '@/hooks/useAuth'; 

// Composant Section Paramètres réutilisable
const SettingsSection = ({ icon, title, children }) => (
  <Card 
    width="100%" 
    bg={useColorModeValue("white", "neutral.800")}
    boxShadow="md"
  >
    <CardHeader>
      <Flex alignItems="center" gap={2}>
        {icon}
        <Heading size="md">{title}</Heading>
      </Flex>
    </CardHeader>
    <CardBody>
      {children}
    </CardBody>
  </Card>
);

// Composant Paramètre individuel
const SettingItem = ({ label, description, control }) => (
  <Box>
    <Flex 
      flexDirection={["column", "row"]} 
      justifyContent="space-between" 
      alignItems={["flex-start", "center"]} 
      gap={2}
    >
      <Box flex={1}>
        <Text fontWeight="medium">{label}</Text>
        {description && (
          <Text fontSize="sm" color="gray.500">
            {description}
          </Text>
        )}
      </Box>
      <Box>
        {control}
      </Box>
    </Flex>
    <Divider my={4} />
  </Box>
);

export default function Settings() {
    // États et hooks
    const { userDetail } = useAuth();
    const [formValues, setFormValues] = useState({
      imageUrl: '',
      name: '',
      email: '',
      phone: ''
    });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
      current_password: '',
      new_password: '',
      re_new_password: ''
    });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isAdvertiserModalOpen, setIsAdvertiserModalOpen] = useState(false);
    const [isAdvertiserLoading, setIsAdvertiserLoading] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();
    const { colorMode, toggleColorMode } = useColorMode();
  
    // Thème
    const theme = {
      bgColor: useColorModeValue("neutral.50", "neutral.900"),
      sidebarBg: useColorModeValue("white", "neutral.800"),
      textColor: useColorModeValue("neutral.800", "neutral.100")
    };
  
    // Effets
    useEffect(() => {
      if (userDetail) {
        setFormValues({
          imageUrl: userDetail.photo || '',
          name: userDetail.name || '',
          email: userDetail.email || '',
          phone: userDetail.phone || ''
        });
      }
    }, [userDetail]);
  
    // Handlers
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('photo', file);
  
      try {
        await axiosInstance.patch(`/auth/users/${userDetail.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        setFormValues(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
        showToast("Photo de profil mise à jour", "success");
      } catch (error) {
        showToast(
          "Erreur lors de la mise à jour de la photo",
          "error",
          error.response?.data?.detail
        );
      }
    };
  
    const handleUpdateProfile = async () => {
      try {
        await axiosInstance.patch(`/auth/users/${userDetail.id}/`, {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
        });
        showToast("Profil mis à jour", "success");
      } catch (error) {
        showToast(
          "Erreur lors de la mise à jour du profil",
          "error",
          error.response?.data?.detail
        );
      }
    };

    const handlePasswordChange = async () => {
      setIsPasswordLoading(true);
      
      try {
        await axiosInstance.post('/auth/users/set_password/', passwordData);
        
        showToast("Mot de passe modifié avec succès", "success");
        setIsPasswordModalOpen(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          re_new_password: ''
        });
      } catch (error) {
        let errorMessage = "Erreur lors du changement de mot de passe";
        
        if (error.response?.data) {
          // Gestion des erreurs spécifiques de Djoser
          if (error.response.data.current_password) {
            errorMessage = "Mot de passe actuel incorrect";
          } else if (error.response.data.new_password) {
            errorMessage = error.response.data.new_password.join(' ');
          } else if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors.join(' ');
          }
        }
        
        showToast(errorMessage, "error");
      } finally {
        setIsPasswordLoading(false);
      }
    };

    const handleBecomeAdvertiser = async () => {
      setIsAdvertiserLoading(true);
      
      try {
        await axiosInstance.post('/auth/add-to-group/', { 
          group_name: 'annonceur',
          user_id: userDetail.id 
        });
        
        showToast("Vous êtes maintenant annonceur!", "success");
        setIsAdvertiserModalOpen(false);
      } catch (error) {
        let errorMessage = "Erreur lors de l'ajout au groupe annonceur";
        
        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
        
        showToast(errorMessage, "error");
      } finally {
        setIsAdvertiserLoading(false);
      }
    };
  
    const showToast = (title, status, description) => {
      toast({
        title,
        status,
        description,
        duration: status === "error" ? 5000 : 3000,
        isClosable: true,
      });
    };

    return (
      <Container 
        maxW="container.xl" 
        px={[2, 4]} 
        py={[4, 8]}
      >
        <VStack 
          spacing={[4, 8]} 
          align="stretch" 
          width="100%"
        >
          <Heading size="lg" px={[2, 0]}>Paramètres</Heading>

          {/* Section Profil Personnel */}
          <SettingsSection icon={<SettingsIcon />} title="Profil Personnel">
            <VStack spacing={6} align="stretch" width="100%">
              {/* Photo de profil */}
              <VStack spacing={4} align="center" width="100%">
                <Box position="relative">
                  <Avatar
                    size={["xl", "2xl"]}
                    name={formValues.name}
                    src={formValues.imageUrl}
                    bg="green.400"
                  >
                    <AvatarBadge
                      as={IconButton}
                      size="xs"
                      rounded="full"
                      top="-5px"
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
              <VStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Nom Complet</FormLabel>
                  <Input 
                    value={formValues.name} 
                    onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))} 
                    size={["md", "lg"]}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    value={formValues.email} 
                    onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))} 
                    type="email" 
                    size={["md", "lg"]}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Téléphone</FormLabel>
                  <Input 
                    value={formValues.phone} 
                    onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))} 
                    type="tel" 
                    size={["md", "lg"]}
                  />
                </FormControl>
                
                <Button 
                  colorScheme="blue" 
                  onClick={handleUpdateProfile}
                  width="100%"
                  size={["md", "lg"]}
                  mt={2}
                >
                  Mettre à jour le profil
                </Button>
              </VStack>
            </VStack>
          </SettingsSection>

          {/* Section Devenir Annonceur */}
          <SettingsSection icon={<Box as="span" fontSize="lg">📢</Box>} title="Devenir Annonceur">
            <VStack spacing={4} align="stretch" width="100%">
              <SettingItem
                label="Statut Annonceur"
                description="Publiez des annonces et bénéficiez de visibilité"
                control={
                  <Button 
                    colorScheme="orange" 
                    size={["sm", "md"]}
                    onClick={() => setIsAdvertiserModalOpen(true)}
                  >
                    Devenir Annonceur
                  </Button>
                }
              />
            </VStack>
          </SettingsSection>

          {/* Section Préférences */}
          <SettingsSection icon={<SunIcon />} title="Préférences du Site">
            <VStack spacing={4} align="stretch" width="100%">
              <SettingItem
                label="Thème"
                description="Choisissez entre le mode clair et sombre"
                control={
                  <Switch
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    size={["md", "lg"]}
                  />
                }
              />
            </VStack>
          </SettingsSection>

          {/* Section Sécurité */}
          <SettingsSection icon={<LockIcon />} title="Sécurité">
            <VStack spacing={4} align="stretch" width="100%">
              <SettingItem
                label="Changer le mot de passe"
                description="Dernière modification il y a 3 mois"
                control={
                  <Button 
                    variant="outline" 
                    size={["sm", "md"]}
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Modifier
                  </Button>
                }
              />
            </VStack>
          </SettingsSection>
        </VStack>

        {/* Modal de changement de mot de passe */}
        <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Changer le mot de passe</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.re_new_password}
                    onChange={(e) => setPasswordData({...passwordData, re_new_password: e.target.value})}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                onClick={handlePasswordChange}
                isLoading={isPasswordLoading}
                mr={3}
              >
                Enregistrer
              </Button>
              <Button onClick={() => setIsPasswordModalOpen(false)}>Annuler</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Devenir Annonceur */}
        <Modal isOpen={isAdvertiserModalOpen} onClose={() => setIsAdvertiserModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Devenir Annonceur</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>
                  En devenant annonceur, vous pourrez publier des annonces sur notre plateforme et bénéficier d'une visibilité accrue.
                </Text>
                <Text fontWeight="bold">Avantages :</Text>
                <VStack align="start" spacing={2}>
                  <Text>• Publication illimitée d'annonces</Text>
                  <Text>• Mise en avant de vos annonces</Text>
                  <Text>• Statistiques détaillées de performance</Text>
                  <Text>• Support prioritaire</Text>
                </VStack>
                <Text mt={4}>
                  En cliquant sur "Valider", vous acceptez nos conditions générales pour les annonceurs.
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="orange" 
                onClick={handleBecomeAdvertiser}
                isLoading={isAdvertiserLoading}
                mr={3}
              >
                Valider
              </Button>
              <Button onClick={() => setIsAdvertiserModalOpen(false)}>Annuler</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    );
}