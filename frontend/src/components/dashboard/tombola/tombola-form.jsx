"use client"

import React, { useState} from "react"
import {

  Input,
  Button,

  Image,
  Text,

  HStack,
  VStack,

  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import axiosInstance from "@/api/axios"


const TombolaForm = ({ tombola, onSubmit, onCancel }) => {
  

    const [formData, setFormData] = useState(
      tombola || {
        titre: "",
        description: "",
        cagnotte: "",
        image: null,
        date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], 
      },
    )
    const [isUploading, setIsUploading] = useState(false)
  
    const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  
    const handleNumberChange = (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  
    const handleImageUpload = async (e) => {
      const file = e.target.files[0]
      if (!file) return
  
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)
  
      try {
        const response = await axiosInstance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setFormData((prev) => ({ ...prev, image: response.data.url }))
      } catch (error) {
        
        console.error("Erreur lors de l'upload de l'image:", error)
        toast({
          title: "Erreur",
          description: error,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsUploading(false)
      }
    }
  
    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Titre</FormLabel>
            <Input name="titre" value={formData.titre} onChange={handleChange} placeholder="Ex: Tombola de Noël" />
          </FormControl>
  
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée de la tombola"
              rows={3}
            />
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Montant de la cagnotte</FormLabel>
            <NumberInput min={0} value={formData.cagnotte} onChange={(value) => handleNumberChange("cagnotte", value)}>
              <NumberInputField name="cagnotte" placeholder="Ex: 1000" />
            </NumberInput>
          </FormControl>
  
          <FormControl isRequired>
            <FormLabel>Date de fin</FormLabel>
            <Input name="date_fin" type="date" value={formData.date_fin} onChange={handleChange} />
          </FormControl>
  
          <FormControl>
            <FormLabel>Image</FormLabel>  
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            {isUploading && <Text fontSize="sm">Upload en cours...</Text>}
            {formData.image && <Image src={formData.image} alt="Preview" mt={2} maxH="200px" />}
          </FormControl>
  
          <HStack spacing={4} justify="flex-end" pt={4}>
            <Button onClick={onCancel}>Annuler</Button>
            <Button colorScheme="blue" type="submit" isLoading={isUploading}>
              {tombola ? "Mettre à jour" : "Créer la tombola"}
            </Button>
          </HStack>
        </VStack>
      </form>
    )
  }


export default TombolaForm;