"use client"

import React, { useState } from "react"
import {
  Input,
  Button,
  IconButton,
  Text,
  InputGroup,
  HStack,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  InputRightAddon,
  Box,
  Image,
  Flex,
  useToast,
} from "@chakra-ui/react"
import { FiUpload, FiX } from "react-icons/fi"

const PropertyForm = ({ property, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    property || {
      titre: "",
      description: "",
      prix: "",
      localisation: "",
      status: "p", 
      photos_upload: [] 
    }
  )
  const [uploadedImages, setUploadedImages] = useState(property?.photos_upload || [])
  const toast = useToast()
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Fichier non valide",
            description: `Le fichier ${file.name} n'est pas une image`,
            status: "error",
            duration: 5000,
            isClosable: true,
          })
          return false
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB max
          toast({
            title: "Fichier trop volumineux",
            description: `L'image ${file.name} dépasse la taille maximale de 5MB`,
            status: "error",
            duration: 5000,
            isClosable: true,
          })
          return false
        }
        
        return true
      })

      
      // Création des URLs pour la prévisualisation
      const newPreviews = validFiles.map(file => URL.createObjectURL(file))
      
      setUploadedImages(prev => [...prev, ...newPreviews])
      setFormData(prev => ({
        ...prev,
        photos_upload: [...prev.photos_upload, ...validFiles]
      }))
    }
  }

  const handleRemoveImage = (index) => {
    // Supprime la prévisualisation
    const newPreviews = [...uploadedImages]
    URL.revokeObjectURL(newPreviews[index]) // Libère la mémoire
    newPreviews.splice(index, 1)
    
    // Supprime le fichier correspondant
    const newFiles = [...formData.photos_upload]
    newFiles.splice(index, 1)
    
    setUploadedImages(newPreviews)
    setFormData(prev => ({
      ...prev,
      photos_upload: newFiles
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  
    // Vérification des champs
    if (!formData.titre || !formData.description || !formData.localisation) {
      toast({ title: "Champs manquants", status: "error" })
      return
    }
  
    // 1. Construction du FormData
    const formDataToSend = new FormData()
    
    // 2. Ajout des champs texte
    formDataToSend.append("titre", formData.titre)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("prix", formData.prix)
    formDataToSend.append("localisation", formData.localisation)
    formDataToSend.append("status", formData.status)
  
    // 3. Ajout des images (format adapté à Django)
    formData.photos_upload.forEach(file => {
      formDataToSend.append("photos_upload", file) // Nom exact du champ attendu
    })
  const my_data={}

    for (let [key, value] of formDataToSend.entries()) {
      
      my_data[key]=value
    }
    console.log(my_data);
    

    onSubmit(my_data) 
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Section Upload d'images */}
        <FormControl>
          <FormLabel>Images de l'annonce (max 10)</FormLabel>
          <Box 
            border="2px dashed" 
            borderColor="gray.200" 
            borderRadius="md" 
            p={4} 
            textAlign="center"
            _hover={{ borderColor: "blue.300" }}
          >
            <Flex direction="column" align="center" justify="center">
              <IconButton
                as="label"
                htmlFor="image-upload"
                icon={<FiUpload />}
                aria-label="Télécharger des images"
                size="lg"
                variant="ghost"
                colorScheme="blue"
                cursor="pointer"
                isDisabled={uploadedImages.length >= 10}
              />
              <Text mt={2} fontSize="sm" color="gray.500">
                {uploadedImages.length >= 10 
                  ? "Nombre maximum d'images atteint" 
                  : "Glissez-déposez ou cliquez pour télécharger des images (JPEG, PNG, max 5MB)"}
              </Text>
              <Input
                type="file"
                id="image-upload"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                display="none"
                disabled={uploadedImages.length >= 10}
              />
            </Flex>
          </Box>
          
          {/* Prévisualisation des images */}
          {uploadedImages.length > 0 && (
            <Flex wrap="wrap" mt={4} gap={2}>
              {uploadedImages.map((image, index) => (
                <Box key={index} position="relative">
                  <Image 
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                    alt={`Preview ${index}`} 
                    boxSize="100px" 
                    objectFit="cover" 
                    borderRadius="md"
                  />
                  <IconButton
                    icon={<FiX />}
                    aria-label="Supprimer l'image"
                    size="xs"
                    position="absolute"
                    top={1}
                    right={1}
                    onClick={() => handleRemoveImage(index)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </Box>
              ))}
            </Flex>
          )}
        </FormControl>

        {/* Titre */}
        <FormControl isRequired>
          <FormLabel>Titre de l'annonce</FormLabel>
          <Input
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder="Ex: Villa moderne avec piscine"
            maxLength={100}
          />
        </FormControl>

        {/* Description */}
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez votre bien en détail..."
            rows={4}
            maxLength={2000}
          />
        </FormControl>

        {/* Prix et Localisation */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Prix (FCFA)</FormLabel>
            <InputGroup>
              <NumberInput w="full" min={0}>
                <NumberInputField
                  name="prix"
                  value={formData.prix}
                  onChange={handleChange}
                  placeholder="Ex: 250000"
                />
              </NumberInput>
              <InputRightAddon children="FCFA" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Localisation</FormLabel>
            <Input
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              placeholder="Ex: Ange Raphaël"
              maxLength={100}
            />
          </FormControl>
        </SimpleGrid>

        {/* Boutons de soumission */}
        <HStack spacing={4} justify="flex-end" pt={6}>
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
          <Button 
            colorScheme="blue" 
            type="submit"
            isLoading={false} // Vous pouvez ajouter un état de chargement ici
          >
            {property ? "Mettre à jour" : "Créer l'annonce"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

export default PropertyForm