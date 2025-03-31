"use client"

import React, { useState } from "react"
import {
  Input,
  Button,
  Image,
  Text,
  Box,
  HStack,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  IconButton,
  useToast
} from "@chakra-ui/react"
import axiosInstance from "@/api/axios"
import { FiUpload } from "react-icons/fi"

const TombolaForm = ({ tombola, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    tombola || {
      titre: "",
      description: "",
      cagnotte: "",
      photo: null,
      date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
  )
  
  const [previewImage, setPreviewImage] = useState(tombola?.photo || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("titre", formData.titre)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("cagnotte", formData.cagnotte)
      formDataToSend.append("date_fin", formData.date_fin)
      
      console.log("photo is file?",formData.photo instanceof File);
      
      if (formData.photo instanceof File) {
        formDataToSend.append("photo", formData.photo)
      }

      const my_data={}

      for (let [key, value] of formDataToSend.entries()) {
        
        my_data[key]=value
      }
      await onSubmit(my_data)
      
     
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la tombola",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fichier non valide",
        description: "Veuillez uploader une image valide (JPEG, PNG, etc.)",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    // Création de l'URL pour la prévisualisation
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
    
    // Stockage du fichier pour l'envoi
    setFormData(prev => ({
      ...prev,
      photo: file
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Image {!tombola?.photo && "(Optionnel)"}</FormLabel>
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
                aria-label="Télécharger une image"
                size="lg"
                variant="ghost"
                colorScheme="blue"
                cursor="pointer"
              />
              <Text>Cliquez pour uploader une image</Text>
              <Text fontSize="sm" color="gray.500">Format: JPEG, PNG (Max 5MB)</Text>
              <Input 
                type="file" 
                accept="image/*" 
                display="none" 
                id="image-upload" 
                onChange={handleImageUpload} 
              />
            </Flex>
            
            {previewImage && (
              <Box mt={4}>
                <Image 
                  src={previewImage} 
                  alt="Aperçu de l'image"
                  maxH="200px"
                  mx="auto"
                  borderRadius="md"
                />
              </Box>
            )}
          </Box>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Titre</FormLabel>
          <Input 
            name="titre" 
            value={formData.titre} 
            onChange={handleChange} 
            placeholder="Ex: Tombola de Noël" 
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description détaillée de la tombola"
            rows={4}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Montant de la cagnotte (FCFA)</FormLabel>
          <NumberInput 
            min={0} 
            value={formData.cagnotte} 
            onChange={(value) => handleNumberChange("cagnotte", value)}
          >
            <NumberInputField name="cagnotte" placeholder="Ex: 100000" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Date de fin</FormLabel>
          <Input 
            name="date_fin" 
            type="date" 
            value={formData.date_fin} 
            onChange={handleChange} 
            min={new Date().toISOString().split('T')[0]}
          />
        </FormControl>

        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button onClick={onCancel} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            colorScheme="blue" 
            type="submit" 
            isLoading={isSubmitting}
            loadingText={tombola ? "Mise à jour..." : "Création..."}
          >
            {tombola ? "Mettre à jour" : "Créer la tombola"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

export default TombolaForm