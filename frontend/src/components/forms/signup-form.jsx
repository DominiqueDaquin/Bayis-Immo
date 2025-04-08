"use client"
import {
  Box,
  Button,
  Input,
  Link,
  Text,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
  Checkbox,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress
} from "@chakra-ui/react";
import { BaseForm } from "./base-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown
} from "react-icons/fi";

// Liste des indicatifs pays avec drapeaux
const countryCodes = [
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+93", name: "Afghanistan", flag: "🇦🇫" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+95", name: "Myanmar", flag: "🇲🇲" },
  { code: "+98", name: "Iran", flag: "🇮🇷" },
  { code: "+211", name: "South Sudan", flag: "🇸🇸" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+218", name: "Libya", flag: "🇱🇾" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+222", name: "Mauritania", flag: "🇲🇷" },
  { code: "+223", name: "Mali", flag: "🇲🇱" },
  { code: "+224", name: "Guinea", flag: "🇬🇳" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", name: "Niger", flag: "🇳🇪" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+229", name: "Benin", flag: "🇧🇯" },
  { code: "+230", name: "Mauritius", flag: "🇲🇺" },
  { code: "+231", name: "Liberia", flag: "🇱🇷" },
  { code: "+232", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+235", name: "Chad", flag: "🇹🇩" },
  { code: "+236", name: "Central African Republic", flag: "🇨🇫" },
  { code: "+237", name: "Cameroon", flag: "🇨🇲" },
  { code: "+238", name: "Cape Verde", flag: "🇨🇻" },
  { code: "+239", name: "São Tomé and Príncipe", flag: "🇸🇹" },
  { code: "+240", name: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "+242", name: "Congo", flag: "🇨🇬" },
  { code: "+243", name: "Democratic Republic of the Congo", flag: "🇨🇩" },
  { code: "+244", name: "Angola", flag: "🇦🇴" },
  { code: "+245", name: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+246", name: "Diego Garcia", flag: "🇮🇴" },
  { code: "+248", name: "Seychelles", flag: "🇸🇨" },
  { code: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+252", name: "Somalia", flag: "🇸🇴" },
  { code: "+253", name: "Djibouti", flag: "🇩🇯" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+257", name: "Burundi", flag: "🇧🇮" },
  { code: "+258", name: "Mozambique", flag: "🇲🇿" },
  { code: "+260", name: "Zambia", flag: "🇿🇲" },
  { code: "+261", name: "Madagascar", flag: "🇲🇬" },
  { code: "+262", name: "Réunion", flag: "🇷🇪" },
  { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },
  { code: "+264", name: "Namibia", flag: "🇳🇦" },
  { code: "+265", name: "Malawi", flag: "🇲🇼" },
  { code: "+266", name: "Lesotho", flag: "🇱🇸" },
  { code: "+267", name: "Botswana", flag: "🇧🇼" },
  { code: "+268", name: "Eswatini", flag: "🇸🇿" },
  { code: "+269", name: "Comoros", flag: "🇰🇲" }
];

export const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnonceur, setIsAnnonceur] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  
  // États pour la validation
  const [nameValid, setNameValid] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  
  const { 
    isOpen: isVerificationModalOpen, 
    onOpen: onVerificationModalOpen, 
    onClose: onVerificationModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isChoiceModalOpen, 
    onOpen: onChoiceModalOpen, 
    onClose: onChoiceModalClose 
  } = useDisclosure();
  
  const [tempUserData, setTempUserData] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Vérification du nom
  useEffect(() => {
    const hasMinimumLetters = (name.match(/[a-zA-Z]/g) || []).length >= 3;
    setNameValid(name.length >= 3 && hasMinimumLetters);
  }, [name]);

  // Vérification de l'email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Vérification du téléphone
  useEffect(() => {
    const phoneRegex = /^\d{8,12}$/;
    setPhoneValid(phoneRegex.test(phone));
  }, [phone]);

  // Vérification du mot de passe
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    setPasswordValid(strength >= 3);
  }, [password]);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nameValid) {
      toast({
        title: "Nom invalide",
        description: "Votre nom doit contenir au moins 3 caractères dont 3 lettres.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!emailValid) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (phone && !phoneValid) {
      toast({
        title: "Téléphone invalide",
        description: "Veuillez entrer un numéro valide avec 8 à 12 chiffres.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!passwordValid) {
      toast({
        title: "Mot de passe faible",
        description: "Votre mot de passe doit être plus robuste (minimum 8 caractères avec majuscules, chiffres et caractères spéciaux).",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les CGU pour vous inscrire.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      const fullPhone = phone ? `${selectedCountry.code}${phone}` : null;
      
      const emailResponse = await axiosInstance.post("/api/send-mail/", {
        email: email,
        objet: "Code de vérification",
        body: `Votre code de vérification est : ${code}. Ce code expirera dans 5 minutes.`
      });

      if (emailResponse.status === 200) {
        toast({
          title: "Code envoyé",
          description: emailResponse.data.detail || "Un code de vérification a été envoyé à votre adresse email.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onVerificationModalOpen();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || error.response?.data?.phone || "Une erreur s'est produite lors de l'envoi du code de vérification.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (userEnteredCode === verificationCode) {
      setIsLoading(true);
      try {
        const fullPhone = phone ? `${selectedCountry.code}${phone}` : null;
        
        const response = await axiosInstance.post("/auth/users/", {
          email: email,
          name: name,
          phone: fullPhone,
          password: password,
          username: email,
        });

        if (response.status === 201) {
          setTempUserData(response.data);
          onVerificationModalClose();
          onChoiceModalOpen();
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Erreur lors de l'inscription.",
          description: error.response?.data?.password || error.response?.data?.phone || "Une erreur s'est produite.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Code incorrect",
        description: "Le code de vérification que vous avez entré est incorrect.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUserChoice = async (wantToBeAnnonceur) => {
    try {
      if (wantToBeAnnonceur && tempUserData) {
        await axiosInstance.post("/auth/add-to-group/", {
          user_id: tempUserData.id,
          group_name: "annonceur",
        });
      }

      toast({
        title: "Inscription réussie.",
        description: wantToBeAnnonceur 
          ? "Vous êtes maintenant inscrit en tant qu'annonceur. Connectez-vous maintenant!" 
          : "Votre compte a été créé avec succès. Connectez-vous maintenant!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la configuration de votre compte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onChoiceModalClose();
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
    setPhoneTouched(true);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'red';
      case 1: return 'red';
      case 2: return 'yellow';
      case 3: return 'green';
      case 4: return 'green';
      default: return 'gray';
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Très faible';
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Fort';
      case 4: return 'Très fort';
      default: return '';
    }
  };

  return (
    <>
      <BaseForm
        description="Bienvenue sur notre plateforme, connectez-vous dès maintenant et bénéficiez de nos offres sur l'immobilier!"
        onSubmit={handleSubmit}
      >
        <Box mb={4}>
          <Text as="label" htmlFor="name" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Nom complet<sup>*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiUser color="gray.300" />
            </InputLeftElement>
            <Input
              id="name"
              type="text"
              size="lg"
              borderRadius="md"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              required
              pl={10}
            />
          </InputGroup>
          {nameTouched && !nameValid && (
            <Text fontSize="sm" color="red.500" mt={1}>
              <FiAlertCircle style={{ display: 'inline', marginRight: '4px' }} />
              Le nom doit contenir au moins 3 caractères dont 3 lettres
            </Text>
          )}
          {nameTouched && nameValid && (
            <Text fontSize="sm" color="green.500" mt={1}>
              <FiCheckCircle style={{ display: 'inline', marginRight: '4px' }} />
              Nom valide
            </Text>
          )}
        </Box>

        <Box mb={4}>
          <Text as="label" htmlFor="email" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Adresse Email <sup>*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiMail color="gray.300" />
            </InputLeftElement>
            <Input
              id="email"
              type="email"
              size="lg"
              borderRadius="md"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailTouched(true);
              }}
              required
              pl={10}
            />
          </InputGroup>
          {emailTouched && !emailValid && (
            <Text fontSize="sm" color="red.500" mt={1}>
              <FiAlertCircle style={{ display: 'inline', marginRight: '4px' }} />
              Veuillez entrer une adresse email valide
            </Text>
          )}
          {emailTouched && emailValid && (
            <Text fontSize="sm" color="green.500" mt={1}>
              <FiCheckCircle style={{ display: 'inline', marginRight: '4px' }} />
              Email valide
            </Text>
          )}
        </Box>

        <Box mb={4}>
          <Text as="label" htmlFor="phone" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Téléphone 
          </Text>
          <InputGroup>
            <InputLeftElement width="fit-content" pl={2}>
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<FiChevronDown />}
                  variant="ghost" 
                  size="sm"
                  px={2}
                >
                  <Text fontSize="md">{selectedCountry.flag} {selectedCountry.code}</Text>
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  {countryCodes.map((country) => (
                    <MenuItem 
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <Text mr={2}>{country.flag}</Text>
                      <Text>{country.name} ({country.code})</Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </InputLeftElement>
            <Input
              id="phone"
              type="tel"
              size="lg"
              borderRadius="md"
              value={phone}
              onChange={handlePhoneChange}
              pl="6rem"
              placeholder="691008288"
            />
          </InputGroup>
          {phoneTouched && phone && !phoneValid && (
            <Text fontSize="sm" color="red.500" mt={1}>
              <FiAlertCircle style={{ display: 'inline', marginRight: '4px' }} />
              Le numéro doit contenir entre 8 et 12 chiffres
            </Text>
          )}
          {phoneTouched && phoneValid && (
            <Text fontSize="sm" color="green.500" mt={1}>
              <FiCheckCircle style={{ display: 'inline', marginRight: '4px' }} />
              Format valide: {selectedCountry.code} {phone}
            </Text>
          )}
        </Box>

        <Box mb={4}>
          <Text as="label" htmlFor="password" display="block" mb={2} fontSize="sm" fontWeight="medium">
            Mot de passe <sup>*</sup>
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiLock color="gray.300" />
            </InputLeftElement>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              size="lg"
              borderRadius="md"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
              }}
              required
              pl={10}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>
          {passwordTouched && (
            <Box mt={2}>
              <Progress 
                value={passwordStrength * 25} 
                size="xs" 
                colorScheme={getPasswordStrengthColor()}
                mb={1}
              />
              <Text fontSize="sm" color={getPasswordStrengthColor()}>
                Force du mot de passe: {getPasswordStrengthLabel()}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.
              </Text>
            </Box>
          )}
        </Box>

        <Flex mb={4} align="center">
          <Checkbox
            isChecked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            colorScheme="blue"
            mr={2}
          />
          <Text fontSize="sm">
            J'accepte les <Link color="blue.500" href="/cgu" target="_blank">Conditions Générales d'Utilisation</Link>
          </Text>
        </Flex>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          borderRadius="md"
          isLoading={isLoading}
          loadingText="Envoi du code..."
          isDisabled={!acceptedTerms || !nameValid || !emailValid || (phone && !phoneValid) || !passwordValid}
        >
          S'inscrire
        </Button>

        <Text fontSize="sm" textAlign="center" mt={4}>
          Vous avez déjà un compte{" "}
          <Link color="blue.400" href="/login">
            Se connecter
          </Link>
        </Text>
      </BaseForm>

      {/* Modal de vérification du code */}
      <Modal isOpen={isVerificationModalOpen} onClose={onVerificationModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vérification de l'email</ModalHeader>
          <ModalBody>
            <Text mb={4}>Un code de vérification a été envoyé à {email}. Veuillez l'entrer ci-dessous :</Text>
            <Input
              placeholder="Code de vérification"
              value={userEnteredCode}
              onChange={(e) => setUserEnteredCode(e.target.value)}
              size="lg"
              mb={4}
            />
            <Text fontSize="sm" color="gray.500">
              Ce code expirera dans 5 minutes.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onVerificationModalClose}
            >
              Annuler
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleVerification}
              isLoading={isLoading}
              leftIcon={<FiCheck />}
            >
              Vérifier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Popup de choix du type de compte */}
      <Modal isOpen={isChoiceModalOpen} onClose={onChoiceModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Type de compte</ModalHeader>
          <ModalBody>
            <Text mb={4}>Souhaitez-vous vous inscrire en tant qu'annonceur ou simple utilisateur ?</Text>
            <Text fontSize="sm" color="gray.500">
              Les annonceurs peuvent publier des annonces immobilières.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => handleUserChoice(false)}
            >
              Simple utilisateur
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => handleUserChoice(true)}
            >
              Devenir annonceur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};