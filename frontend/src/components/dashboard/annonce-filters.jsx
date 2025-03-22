"use client"

import React, { useState } from "react"
import {
  HStack,
  Tag,
} from "@chakra-ui/react"


const Filters = ({ onFilterChange }) => {
    return (
      <HStack spacing={4} mb={6} wrap="wrap" bg="white" p={4} borderRadius="md" boxShadow="sm">
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