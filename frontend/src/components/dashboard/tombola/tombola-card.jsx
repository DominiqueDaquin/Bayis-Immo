"use client"


import {
  Button,
  IconButton,
  Badge,
  Image,
  Text,
  HStack,
  VStack,
  Heading,
  Card,
  CardBody,
} from "@chakra-ui/react"
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi"
import { baseUrl } from "@/config"
const getStatusColor = (status) => {
  switch (status) {
    case "a":
      return "green"
    case "p":
      return "orange"
    case "f":
      return "blue"
    case "r":
      return "red"
    default:
      return "gray"
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "a":
      return "Active"
    case "p":
      return "En attente"
    case "f":
      return "Terminée"
    case "r":
      return "Rejetée"
    default:
      return status
  }
}

const TombolaCard = ({ tombola, onView, onEdit, onDelete,onValidate,onReject,isModerateur }) => {
  const { title, cagnotte, status, photo, date_fin } = tombola

  return (
    <Card mb={4} overflow="hidden" variant="outline">
      <Image src={`${photo}` || "/placeholder.svg"} alt={title} height="160px" objectFit="cover" />
      <CardBody>
        <VStack align="start" spacing={2}>
          <Heading size="md">{title}</Heading>
          <HStack>
            <Badge colorScheme={getStatusColor(status)}>{getStatusText(status)}</Badge>
            <Text fontSize="sm" color="gray.500">
              Fin: {new Date(date_fin).toLocaleDateString()}
            </Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold" color="blue.500">
            {cagnotte} Fcfa
          </Text>
          <HStack spacing={2} pt={2} w="full">
            <Button size="sm" leftIcon={<FiEye />} onClick={() => onView(tombola)} flex={1}>
              Voir
            </Button>
            <Button size="sm" leftIcon={<FiEdit2 />} onClick={() => onEdit(tombola)} flex={1}>
              Modifier
            </Button>
            <IconButton
              size="sm"
              colorScheme="red"
              icon={<FiTrash2 />}
              onClick={() => onDelete(tombola)}
              aria-label="Supprimer"
            />
            {isModerateur && tombola.statut=='p' && (
              <>
                <IconButton
                  icon={<FiCheck />}
                  aria-label="Valider"
                  colorScheme="green"
                  onClick={() => onValidate() }
                />
                <IconButton
                  icon={<FiX />}
                  aria-label="Rejeter"
                  colorScheme="red"
                  onClick={() => onReject() }
                />
                
              </>
            )}
          </HStack>

          

        </VStack>
      </CardBody>
    </Card>
  )
}


export default TombolaCard;