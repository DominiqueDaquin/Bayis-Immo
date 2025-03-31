"use client"

import React, { useState } from "react"
import {
  Button,
  Badge,
  Image,
  Text,
  HStack,
  VStack,
  Heading,
  Card,
  CardBody,
  IconButton,

} from "@chakra-ui/react"
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheck,
  FiX
} from "react-icons/fi"
import { baseUrl } from "@/config"

const PropertyCard = ({ property, onView, onEdit, onDelete,isModerateur,handleStatusChange,handleViewProperty }) => {
    const { title, description, prix, status, creer_le, photos } = property
  
    const getStatusColor = (status) => {
      switch (status) {
        case "a":
          return "green"
        case "p":
          return "orange"
        case "r":
          return "red"
        default:
          return "gray"
      }
    }
  
    const getStatusText = (status) => {
      switch (status) {
        case "a":
          return "Approuvé"
        case "p":
          return "En attente"
        case "r":
          return "Rejetté"
        default:
          return status
      }
    }
  
    return (
      <Card mb={4} overflow="hidden" variant="outline">
        <Image src={ `${baseUrl}${property.photos[0]?.photo}`  || "/placeholder.svg"} alt={title} height="200px" objectFit="cover" />
        <CardBody>
          <VStack align="start" spacing={2}>
            <Heading size="md">{title}</Heading>
            <Text color="blue.600" fontWeight="bold">
              {prix}
            </Text>
            <Badge colorScheme={getStatusColor(status)}>{getStatusText(status)}</Badge>
            <Text noOfLines={2} fontSize="sm" color="gray.600">
              {description}
            </Text>
        
            <Text fontSize="xs" color="gray.500">
              Publié le {new Date(creer_le).toLocaleDateString()}
            </Text>
  {
            isModerateur ? (<>
            
                                  <HStack>
                                    <IconButton 
                                    icon={<FiEye />}
                                    aria-label="voir"
                                    colorScheme="green"
                                    onClick={()=>handleViewProperty(property)}
                                    />
                                    <IconButton
                                      icon={<FiCheck />}
                                      aria-label="Valider"
                                      colorScheme="green"
                                      onClick={() => handleStatusChange(property.id, "a")}
            
                                    />
                                    <IconButton
                                      icon={<FiX />}
                                      aria-label="Rejeter"
                                      colorScheme="red"
                                      onClick={() => handleStatusChange(property.id, "r")}
            
                                    />
                                  </HStack>
            </>):(            <HStack spacing={2} pt={2}>
              <Button size="sm" leftIcon={<FiEye />} onClick={() => onView(property)}>
                Voir
              </Button>
              <Button size="sm" leftIcon={<FiEdit2 />} onClick={() => onEdit(property)}>
                Modifier
              </Button>
              <Button size="sm" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => onDelete(property)}>
                Supprimer
              </Button>
            </HStack>)
          }

          </VStack>
        </CardBody>
      </Card>
    )
  }

  export default PropertyCard;