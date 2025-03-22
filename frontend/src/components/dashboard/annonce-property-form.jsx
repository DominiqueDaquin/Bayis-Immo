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
      status: "p", // Par défaut, l'annonce est en attente
    
    },
  )

  const [uploadedImages, setUploadedImages] = useState([])
  const toast = useToast()
  console.log("modification",formData);
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages((prev) => [...prev, ...newImages])
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    setFormData((prev) => ({ ...prev, photos: newPhotos }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData.photos,formData);  
    // if (formData.photos.length === 0) {
    //   toast({
    //     title: "Erreur",
    //     description: "Veuillez ajouter au moins une image.",
    //     status: "error",
    //     duration: 3000,
    //     isClosable: true,
    //   })
    //   return
    // }

    // Créer un objet FormData pour envoyer les fichiers
    const formDataToSend = new FormData()
    formDataToSend.append("titre", formData.titre)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("prix", formData.prix)
    formDataToSend.append("localisation", formData.localisation)
    formDataToSend.append("status", formData.status)

    // Ajouter chaque fichier à FormData
    // formData.photos.forEach((file, index) => {
    //   formDataToSend.append(`photos`, file)
    // })

    setFormData(formDataToSend)

   
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Section Upload d'images */}
        <FormControl>
          <FormLabel>Images de l'annonce</FormLabel>
          <Box border="2px dashed" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
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
              />
              <Text mt={2} fontSize="sm" color="gray.500">
                Glissez-déposez ou cliquez pour télécharger des images
              </Text>
              <Input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                display="none"
              />
            </Flex>
          </Box>
          <Flex wrap="wrap" mt={4} gap={2}>
            {uploadedImages.map((image, index) => (
              <Box key={index} position="relative">
                <Image src={image} alt={`Uploaded ${index}`} boxSize="100px" objectFit="cover" borderRadius="md" />
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
        </FormControl>

        {/* Titre */}
        <FormControl isRequired>
          <FormLabel>Titre de l'annonce</FormLabel>
          <Input
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder="Ex: Villa moderne avec piscine"
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
          />
        </FormControl>

        {/* Prix et Localisation */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl >
            <FormLabel>Prix</FormLabel>
            <InputGroup>
              <NumberInput w="full">
                <NumberInputField
                  name="prix"
                  value={formData.prix}
                  onChange={handleChange}
                  placeholder={formData.prix===""?"Ex: 250000":formData.prix}
                />
              </NumberInput>
              <InputRightAddon children="Fcfa" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Localisation</FormLabel>
            <Input
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              placeholder="Ex: Ange Raphaël"
            />
          </FormControl>
        </SimpleGrid>

        {/* Boutons de soumission */}
        <HStack spacing={4} justify="flex-end" pt={6}>
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
          <Button colorScheme="blue" type="submit">
            {property ? "Mettre à jour" : "Créer l'annonce"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

export default PropertyForm