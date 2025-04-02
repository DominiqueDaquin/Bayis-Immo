"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Tabs,
  Tab,
  TabList,
  useToast,
  Badge,
  useColorModeValue,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Link
} from "@chakra-ui/react"
import axiosInstance from "@/api/axios"
import { v4 as uuidv4 } from "uuid"
import { FiCheck, FiX, FiDollarSign } from "react-icons/fi"
import { useAuth } from "@/hooks/useAuth"
import { baseUrl, baseUrlFrontend } from "@/config"

export default function GestionnaireCampagnes({ isModerateur }) {
  const [campagnes, setCampagnes] = useState([])
  const [annonces, setAnnonces] = useState([])
  const [publiciteSelectionnee, setPubliciteSelectionnee] = useState("")
  const [titre, setTitre] = useState("")
  const [duree, setDuree] = useState("3")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { user } = useAuth()

  // Options de durée et prix
  const dureeOptions = [
    { value: "3", label: "3 jours", prix: 250 },
    { value: "7", label: "1 semaine", prix: 500 },
    { value: "14", label: "2 semaines", prix: 1000 },
    { value: "30", label: "1 mois", prix: 2000 },
  ]

  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  // États pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const statusPaiement=async(pub)=>{
    try{
      const response= await axiosInstance.post("/api/paiement/lygos/status/",{
      order_id:pub.order_id
      
    })
    const status=response.data.status
    const responsePub=await axiosInstance.patch(`/api/publicites/${pub.id}/`,{
      statut:status
    })
    console.log(responsePub);
    
    console.log(response);
    }catch(err){
        console.log("erreur de status",err);

    }
    
    
    
    
  }


  // Récupérer les annonces créées par l'utilisateur
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axiosInstance.get("/api/annonces/mes-annonces")
        setAnnonces(response.data)
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
    }

    fetchAnnonces()
  }, [])

  // Récupérer les publicités
  useEffect(() => {
    const fetchPublicites = async () => {
      try {
        const endpoint = isModerateur ? "/api/publicites/" : `/api/publicites/mes-publicites/`
        const response = await axiosInstance.get(endpoint)
        setCampagnes(response.data)
        await response.data.map((pub)=> pub.order_id!=null && pub.is_payed==false && (statusPaiement(pub)))
        console.log(response.data);
        
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les publicités.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
      }
    }

    fetchPublicites()
  }, [isModerateur, user])

  // Créer une nouvelle publicité (sans paiement)
  const handleCreerCampagne = async () => {
    if (!publiciteSelectionnee || !titre) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
      return
    }

    try {
      const selectedOption = dureeOptions.find(opt => opt.value === duree)
      const montant = selectedOption.prix
      
      const response = await axiosInstance.post("/api/publicites/", {
        titre,
        annonce: publiciteSelectionnee,
        montant,
        duree_jours: parseInt(duree),
        user: user.id
      })

      setCampagnes([...campagnes, response.data])
      onClose()
      toast({
        title: "Succès",
        description: "Publicité créée avec succès. Veuillez effectuer le paiement pour l'activer.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      console.log("Creation campagne", err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la publicité.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Payer une publicité
  const handlePayerPublicite = async (publicite) => {
    console.log("Dans la publicité");
    const order_id=uuidv4()
    const link=`${baseUrlFrontend}/merci`
    try {
      const response = await axiosInstance.post("/api/paiement/lygos/", {
        amount:publicite.montant ,
        shop_name: "Bayis Immob",
        message: `Paiement pour la publicité: ${publicite.titre}`,
        order_id: order_id,
        publicite_id: publicite.id,
        success_url:link,
        failure_url:link
      })
     console.log(response);
     
      if (response.status === 200) {

        const orderResponse= await axiosInstance.patch(`/api/publicites/${publicite.id}/`,{
          order_id:order_id
        })
        if(orderResponse.status==200){
          toast({
          title: "Paiement initié",
          description: "Redirection vers le paiement...",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        })
        window.open(response.data.link, "_blank")
        }

        
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du paiement.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Valider une publicité (pour modérateurs)
  const handleValiderPublicite = async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/publicites/${id}/`, {
        is_active: true
      })
      
      setCampagnes(campagnes.map(campagne => 
        campagne.id === id ? response.data : campagne
      ))
      
      toast({
        title: "Succès",
        description: "Publicité validée avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la publicité.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Supprimer une publicité
  const handleSupprimerPublicite = async (id) => {
    try {
      await axiosInstance.delete(`/api/publicites/${id}/`)
      setCampagnes(campagnes.filter((campagne) => campagne.id !== id))
      toast({
        title: "Succès",
        description: "Publicité supprimée avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la publicité.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    }
  }

  // Formater la date de création
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filtrer les publicités
  const filteredCampagnes = campagnes
    .filter((campagne) => {
      if (filterStatus === "all") return true
      if (filterStatus === "active") return campagne.is_active
      if (filterStatus === "inactive") return !campagne.is_active
      return true
    })
    .filter((campagne) => campagne.titre.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg" color={textColor}>
            {isModerateur ? "Gestion des Publicités" : "Mes Campagnes Publicitaires"}
          </Heading>
          {!isModerateur && (
            <Button colorScheme="blue" onClick={onOpen} leftIcon={<FiDollarSign />}>
              Créer une publicité
            </Button>
          )}
        </Flex>

        <Box mb={6}>
          <InputGroup mb={4}>
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Tabs colorScheme="blue" onChange={(index) => {
            const statusMap = ["all", "active", "inactive"]
            setFilterStatus(statusMap[index])
          }}>
            <TabList>
              <Tab>Toutes</Tab>
              <Tab>Actives</Tab>
              <Tab>Inactives</Tab>
            </TabList>
          </Tabs>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>TITRE</Th>
                
                <Th>MONTANT</Th>
                <Th>DUREE</Th>
                <Th>STATUT</Th>
                <Th>PAIEMENT</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCampagnes.map((campagne) => (
                <Tr key={campagne.id}>
                  <Td> <Link href={`/detail-annonce/${campagne.annonce}`} > {campagne.titre} </Link> </Td>
                  
                  <Td color="blue.500" fontWeight="medium">
                    {campagne.montant} Fcfa
                  </Td>
                  <Td>{campagne.duree_jours} jours</Td>
                  <Td>
                    <Badge colorScheme={campagne.is_active ? "green" : "red"}>
                      {campagne.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>

                  <Td>
                    <Badge colorScheme={campagne.statut=="success" ? "green" :campagne.statut=="failed" ? "red":"yellow"}>
                      {campagne.statut=="failed"?"Echec":campagne.statut }
                    </Badge>
                  </Td>

                  <Td>
                    <HStack spacing={2}>
                      {!campagne.is_active && !isModerateur && (
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={() => handlePayerPublicite(campagne)}
                        >
                          Payer
                        </Button>
                      )}
                      {isModerateur && !campagne.is_active && (
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={() => handleValiderPublicite(campagne.id)}
                        >
                          Valider
                        </Button>
                      )}
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleSupprimerPublicite(campagne.id)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Modal pour créer une nouvelle publicité */}
        {!isModerateur && (
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Créer une nouvelle publicité</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl mb={4}>
                  <FormLabel>Titre de la publicité</FormLabel>
                  <Input
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Entrer le titre de la publicité"
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Sélectionner l'annonce à booster</FormLabel>
                  <Select
                    placeholder="Choisir une annonce"
                    value={publiciteSelectionnee}
                    onChange={(e) => setPubliciteSelectionnee(e.target.value)}
                  >
                    {annonces.map((annonce) => (
                      <option key={annonce.id} value={annonce.id}>
                        {annonce.titre}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Durée de la publicité</FormLabel>
                  <RadioGroup onChange={setDuree} value={duree}>
                    <Stack direction="column">
                      {dureeOptions.map((option) => (
                        <Radio key={option.value} value={option.value}>
                          {option.label} - {option.prix} Fcfa
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleCreerCampagne}>
                  Créer la publicité
                </Button>
                <Button onClick={onClose}>Annuler</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  )
}