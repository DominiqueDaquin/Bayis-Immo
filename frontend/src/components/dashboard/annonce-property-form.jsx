"use client"

import React, { useState, useEffect } from "react"
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

const PropertyForm = ({ property, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    prix: "",
    localisation: "",
    status: "p",
    photos_upload: []
  })
  
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const toast = useToast()

  useEffect(() => {
    if (property) {
      setFormData({
        titre: property.titre || "",
        description: property.description || "",
        prix: property.prix || "",
        localisation: property.localisation || "",
        status: property.status || "p",
        photos_upload: []
      })
      setExistingImages(property.photos || [])
      setNewImages([])
    }
  }, [property])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + newImages.length > 6) {
      toast({
        title: "Fichiers trop nombreux",
        description: `Votre annonce ne peut contenir plus de 6 photos`,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return false
    }

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

      if (file.size > 5 * 1024 * 1024) {
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

    setNewImages(prev => [...prev, ...validFiles])
  }

  const handleRemoveImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index))
    } else {
      URL.revokeObjectURL(URL.createObjectURL(newImages[index]))
      setNewImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.titre || !formData.description || !formData.localisation) {
      toast({ title: "Champs manquants", status: "error" })
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append("titre", formData.titre)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("prix", formData.prix)
    formDataToSend.append("localisation", formData.localisation)
    formDataToSend.append("status", formData.status)

    newImages.forEach(file => {
      formDataToSend.append("photos_upload", file)
    })

    existingImages.forEach(photo => {
      formDataToSend.append("photos_keep", photo.id)
    })

    onSubmit(formDataToSend)
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel>Images de l'annonce (max 6)</FormLabel>
          
          {existingImages.length > 0 && (
            <Flex wrap="wrap" gap={2} mb={4}>
              {existingImages.map((image, index) => (
                <Box key={`existing-${index}`} position="relative">
                  <Image
                    src={image.photo}
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
                    onClick={() => handleRemoveImage(index, true)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </Box>
              ))}
            </Flex>
          )}

          {newImages.length > 0 && (
            <Flex wrap="wrap" gap={2} mb={4}>
              {newImages.map((image, index) => (
                <Box key={`new-${index}`} position="relative">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`New preview ${index}`}
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
                    onClick={() => handleRemoveImage(index, false)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </Box>
              ))}
            </Flex>
          )}

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
                isDisabled={existingImages.length + newImages.length >= 6}
              />
              <Text mt={2} fontSize="sm" color="gray.500">
                {existingImages.length + newImages.length >= 6
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
                disabled={existingImages.length + newImages.length >= 6}
              />
            </Flex>
          </Box>
        </FormControl>

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

        <HStack spacing={4} justify="flex-end" pt={6}>
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
            loadingText="Opération en cours..."
          >
            {property ? "Mettre à jour" : "Créer l'annonce"}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

export default PropertyForm