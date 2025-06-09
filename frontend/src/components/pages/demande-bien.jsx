import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    useDisclosure,
    useToast,
    Badge,
    Heading,
    Divider,
    Container,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import SimpleNavbar from '../partials/navbar';
import { v4 as uuidv4 } from "uuid";
import { baseUrlFrontend } from '@/config';

// Configuration des frais par ville
const FRAIS_PAR_VILLE = {
    douala:250,
    yaounde:250,
    edea:250,
    kribi:250
};

const DemandesBien = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { userDetail } = useAuth();
    const [demandes, setDemandes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paiementEnCours, setPaiementEnCours] = useState(false);

    const [formData, setFormData] = useState({
        type_bien: 'terrain',
        ville: 'douala',
        localisation: '',
        superficie_min: '',
        superficie_max: '',
        budget_min: '',
        budget_max: '',
        description: '',
        order_id: '',
        frais: FRAIS_PAR_VILLE.douala
    });

    const fetchDemandes = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('api/demandes-biens/');
            setDemandes(response.data);

            await response.data.map((demande)=>demande.order_id!=null && statusPaiement(demande))
        } catch (error) {
            console.log(error);
            if(error.status==401)
                toast({
                    title: 'Authentification requise',
                    description: `Veuillez vous connectez avant de voir l'historiques de vos demandes`,
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
            else
            toast({
                title: 'Erreur',
                description: `Impossible de charger les demandes: ${error}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };

        // Mise à jour automatique des frais lorsque la ville change
        if (name === 'ville') {
            newFormData.frais = FRAIS_PAR_VILLE[value] || FRAIS_PAR_VILLE.autres;
        }

        setFormData(newFormData);
    };

    const handlePayer = async () => {
        setPaiementEnCours(true);
        try {
            const order_id = uuidv4();
            const montant = formData.frais;
            
            const config = {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            };

            const response = await axiosInstance.post(
                "/api/paiement/lygos/",
                {
                    amount: montant,
                    shop_name: "Bayis Immob",
                    message: `Paiement pour votre demande de bien immobilier`,
                    order_id: order_id,
                    success_url: `${baseUrlFrontend}/demandes`,
                    failure_url: `${baseUrlFrontend}/echec`
                },
                config
            );
            console.log(response);
            
            if (response.status === 200) {
                // Sauvegarder l'order_id dans formData
                setFormData(prev => ({ ...prev, order_id }));
                
                // Rediriger vers l'interface de paiement
                //window.location.href = response.data.payment_url;
                window.open(response.data.link,'_blank')
            }
        } catch (error) {
            toast({
                title: 'Erreur',
                description: "Échec de la création du paiement",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setPaiementEnCours(false);
        }
    };

    const statusPaiement = async (demande) => {
        try {
            const response = await axiosInstance.post("/api/paiement/lygos/status/", {
                order_id: demande.order_id
            });
            
            const status = response.data.status;
            console.log(status);
            
            await axiosInstance.patch(`/api/demandes-biens/${demande.id}/`, {
                statut: status=='completed'?'traitee':'en_attente'
            });
            
            // Rafraîchir la liste des demandes
            fetchDemandes();
        } catch (err) {
            console.error("Erreur de status", err);
        }
    };

    const handleSubmit = async () => {
        if (!formData.order_id ) {
            toast({
                title: 'Paiement requis',
                description: "Veuillez d'abord effectuer le paiement",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/api/demandes-biens/', formData);
            
            toast({
                title: 'Succès',
                description: "Votre demande a été enregistrée",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            fetchDemandes();
            onClose();
            resetForm();
            
            // Envoyer la facture par email
            await envoyerFacture(response.data);
        } catch (error) {
            let errorMessage = "Une erreur est survenue";
            if (error.response?.data) {
                errorMessage = Object.values(error.response.data).join(' ');
            }
            toast({
                title: 'Erreur',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type_bien: 'terrain',
            ville: 'douala',
            localisation: '',
            superficie_min: '',
            superficie_max: '',
            budget_min: '',
            budget_max: '',
            description: '',
            order_id: '',
            frais: FRAIS_PAR_VILLE.douala
        });
    };

    const envoyerFacture = async (demande) => {
        try {
            await axiosInstance.post('/api/demandes-biens/envoyer-facture/', {
                demande_id: demande.id
            });
        } catch (error) {
            console.error("Erreur lors de l'envoi de la facture", error);
        }
    };

    const telechargerFacture = async (demandeId) => {
        try {
            const response = await axiosInstance.get(`/api/demandes-biens/${demandeId}/facture/`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture-demande-${demandeId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(error);
            
            toast({
                title: 'Erreur',
                description: "Impossible de télécharger la facture",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_attente': return 'yellow';
            case 'en_cours': return 'blue';
            case 'traitee': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div>
            <SimpleNavbar />

            <Container maxW="container.xl" py={8} centerContent>
                <Box width="100%">
                    <VStack spacing={6} align="stretch">
                        <HStack justifyContent="space-between">
                            <Heading size="lg">Mes Demandes de Biens Immobiliers</Heading>
                            <Button colorScheme="blue" onClick={onOpen}>
                                Nouvelle Demande
                            </Button>
                        </HStack>

                        <Divider />

                        {isLoading ? (
                            <Text textAlign="center">Chargement des demandes...</Text>
                        ) : demandes.length === 0 ? (
                            <Text textAlign="center">Laissez des professionnels vous aider à trouver le bien idéal pour vous. Vous attendez quoi! Cliquez sur nouvelle demande</Text>
                        ) : (
                            <Box overflowX="auto" borderRadius="md" borderWidth="1px" p={4}>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Type</Th>
                                            <Th>Localisation</Th>
                                            <Th>Superficie (m²)</Th>
                                            <Th>Budget (FCFA)</Th>
                                            <Th>Frais (FCFA)</Th>
                                            <Th>Date</Th>
                                            <Th>Statut</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {demandes.map((demande) => (
                                            <Tr key={demande.id}>
                                                <Td>{demande.type_bien_display}</Td>
                                                <Td>{demande.localisation}</Td>
                                                <Td>{demande.superficie_min} - {demande.superficie_max}</Td>
                                                <Td>
                                                    {new Intl.NumberFormat('fr-FR').format(demande.budget_min)} -{' '}
                                                    {new Intl.NumberFormat('fr-FR').format(demande.budget_max)}
                                                </Td>
                                                <Td>{new Intl.NumberFormat('fr-FR').format(demande.frais)}</Td>
                                                <Td>{new Date(demande.date_creation).toLocaleDateString()}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(demande.statut)}>
                                                        {demande.statut_display}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => telechargerFacture(demande.id)}
                                                        isDisabled={demande.statut !== 'traitee'}
                                                    >
                                                        Facture
                                                    </Button>
                                                    {
                                                        demande.statut!='traitee' && (
                                                            <Button 
                                                        size="sm" 
                                                        onClick={() => handlePayer()}
                                                        isLoading={paiementEnCours}
                                                        mx={2}
                                                    >
                                                        Payer
                                                    </Button>
                                                        )
                                                    }

                                                    
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </VStack>

                    {/* Modal pour nouvelle demande */}
                    <Modal isOpen={isOpen} onClose={onClose} size="xl">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Nouvelle Demande de Bien</ModalHeader>
                            <Text m={6}> Votre demande sera envoyer à nos annonceurs qui trouveront dans les plus bref delai votre bien </Text>
                            <ModalCloseButton />
                            <ModalBody pb={6}>
                                <VStack spacing={4}>
                                    <Alert status="info" borderRadius="md">
                                        <AlertIcon />
                                        Frais à payer des frais de demande: {new Intl.NumberFormat('fr-FR').format(formData.frais)} FCFA
                                    </Alert>

                                    <FormControl isRequired>
                                        <FormLabel>Type de bien</FormLabel>
                                        <Select
                                            name="type_bien"
                                            value={formData.type_bien}
                                            onChange={handleInputChange}
                                        >
                                            <option value="terrain">Terrain</option>
                                            <option value="maison">Maison</option>
                                            <option value="appartement">Appartement</option>
                                            <option value="local_commercial">Local Commercial</option>
                                            <option value="autres">Autres</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Ville</FormLabel>
                                        <Select
                                            name="ville"
                                            value={formData.ville}
                                            onChange={handleInputChange}
                                        >
                                            <option value="douala">Douala </option>
                                            <option value="yaounde">Yaounde </option>
                                            <option value="edea">Edea </option>
                                            <option value="kribi">Kribi </option>
                                            {/* <option value="autres">Autres villes (10,000 FCFA)</option> */}
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Localisation (ex: Bonanjo, Douala)</FormLabel>
                                        <Input
                                            name="localisation"
                                            value={formData.localisation}
                                            onChange={handleInputChange}
                                            placeholder="Où souhaitez-vous trouver le bien?"
                                        />
                                    </FormControl>

                                    <HStack spacing={4} width="100%">
                                        <FormControl isRequired>
                                            <FormLabel>Superficie min (m²)</FormLabel>
                                            <Input
                                                type="number"
                                                name="superficie_min"
                                                value={formData.superficie_min}
                                                onChange={handleInputChange}
                                                placeholder="500"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Superficie max (m²)</FormLabel>
                                            <Input
                                                type="number"
                                                name="superficie_max"
                                                value={formData.superficie_max}
                                                onChange={handleInputChange}
                                                placeholder="1000"
                                            />
                                        </FormControl>
                                    </HStack>

                                    <HStack spacing={4} width="100%">
                                        <FormControl isRequired>
                                            <FormLabel>Budget min (FCFA)</FormLabel>
                                            <Input
                                                type="number"
                                                name="budget_min"
                                                value={formData.budget_min}
                                                onChange={handleInputChange}
                                                placeholder="5000000"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Budget max (FCFA)</FormLabel>
                                            <Input
                                                type="number"
                                                name="budget_max"
                                                value={formData.budget_max}
                                                onChange={handleInputChange}
                                                placeholder="10000000"
                                            />
                                        </FormControl>
                                    </HStack>

                                    <FormControl>
                                        <FormLabel>Description complémentaire</FormLabel>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Décrivez plus précisément ce que vous recherchez..."
                                        />
                                    </FormControl>
                                </VStack>
                            </ModalBody>

                            <ModalFooter>
                                {formData.order_id ? (
                                    <>
                                        <Button
                                            colorScheme="green"
                                            onClick={handleSubmit}
                                            isLoading={isSubmitting}
                                            mr={3}
                                        >
                                            Finaliser la demande
                                        </Button>
                                        <Text fontSize="sm" color="green.500">
                                            Paiement effectué
                                        </Text>
                                    </>
                                ) : (
                                    <Button
                                        colorScheme="blue"
                                        onClick={handlePayer}
                                        isLoading={paiementEnCours}
                                        mr={3}
                                    >
                                        Payer {new Intl.NumberFormat('fr-FR').format(formData.frais)} FCFA
                                    </Button>
                                )}
                                <Button onClick={() => {
                                    onClose();
                                    resetForm();
                                }}>
                                    Annuler
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Box>
            </Container>
        </div>
    );
};

export default DemandesBien;