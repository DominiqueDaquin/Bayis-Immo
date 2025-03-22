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
} from "@chakra-ui/react"
import {
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi"

const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
    const { title, description, price, status, publishedAt, images } = property
  
    const getStatusColor = (status) => {
      switch (status) {
        case "active":
          return "green"
        case "pending":
          return "orange"
        case "sold":
          return "red"
        default:
          return "gray"
      }
    }
  
    const getStatusText = (status) => {
      switch (status) {
        case "active":
          return "Actif"
        case "pending":
          return "En attente"
        case "sold":
          return "Vendu"
        default:
          return status
      }
    }
  
    return (
      <Card mb={4} overflow="hidden" variant="outline">
        <Image src={images || "/placeholder.svg"} alt={title} height="200px" objectFit="cover" />
        <CardBody>
          <VStack align="start" spacing={2}>
            <Heading size="md">{title}</Heading>
            <Text color="blue.600" fontWeight="bold">
              {price}
            </Text>
            <Badge colorScheme={getStatusColor(status)}>{getStatusText(status)}</Badge>
            <Text noOfLines={2} fontSize="sm" color="gray.600">
              {description}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Publié le {new Date(publishedAt).toLocaleDateString()}
            </Text>
            <HStack spacing={2} pt={2}>
              <Button size="sm" leftIcon={<FiEye />} onClick={() => onView(property)}>
                Voir
              </Button>
              <Button size="sm" leftIcon={<FiEdit2 />} onClick={() => onEdit(property)}>
                Modifier
              </Button>
              <Button size="sm" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => onDelete(property)}>
                Supprimer
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  export default PropertyCard;