"use client"

import React, { useState } from "react"
import {
  HStack,
  Tag,
  useColorModeValue
} from "@chakra-ui/react"



const Filters = ({ onFilterChange }) => {
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
const sidebarBg = useColorModeValue("white", "neutral.800")
const headerBg = useColorModeValue("white", "neutral.800")
const borderColor = useColorModeValue("neutral.200", "neutral.700")
const textColor = useColorModeValue("neutral.800", "neutral.100")
    return (
      <HStack spacing={4} mb={6} wrap="wrap" bg={bgColor} p={4} borderRadius="md" boxShadow="sm">
        <Tag size="lg" variant="outline" colorScheme="blue" cursor="pointer" onClick={() => onFilterChange("all")}>
          Tous
        </Tag>
        <Tag size="lg" variant="outline" colorScheme="green" cursor="pointer" onClick={() => onFilterChange("active")}>
          Actif
        </Tag>
        <Tag size="lg" variant="outline" colorScheme="orange" cursor="pointer" onClick={() => onFilterChange("pending")}>
          En attente
        </Tag>
        <Tag size="lg" variant="outline" colorScheme="red" cursor="pointer" onClick={() => onFilterChange("sold")}>
          Vendu
        </Tag>
      </HStack>
    )
  }

  export default Filters;