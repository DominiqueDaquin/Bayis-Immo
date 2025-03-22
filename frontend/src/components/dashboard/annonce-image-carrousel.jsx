"use client"

import React, { useState } from "react"
import {
  Box,
  IconButton,
  Image,
  HStack,
} from "@chakra-ui/react"
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"

// Composant pour le carrousel d'images
const baseUrl='http://127.0.0.1:8000'


const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  console.log(images);
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Box position="relative">
      <Image
        src={`${baseUrl}${images[currentIndex]}` || "/placeholder.svg"}
        alt={`Image ${currentIndex + 1}`}
        w="100%"
        h={{ base: "250px", md: "400px" }}
        objectFit="cover"
        borderRadius="lg"
      />
      <IconButton
        icon={<FiChevronLeft />}
        position="absolute"
        left="2"
        top="50%"
        transform="translateY(-50%)"
        onClick={prevImage}
        isRound
        bg="white"
        opacity="0.8"
        _hover={{ opacity: 1 }}
        size={{ base: "sm", md: "md" }}
      />
      <IconButton
        icon={<FiChevronRight />}
        position="absolute"
        right="2"
        top="50%"
        transform="translateY(-50%)"
        onClick={nextImage}
        isRound
        bg="white"
        opacity="0.8"
        _hover={{ opacity: 1 }}
        size={{ base: "sm", md: "md" }}
      />
      <HStack justify="center" mt={4} spacing={2}>
        {images.map((_, index) => (
          <Box
            key={index}
            w="2"
            h="2"
            borderRadius="full"
            bg={index === currentIndex ? "blue.500" : "gray.300"}
            cursor="pointer"
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </HStack>
    </Box>
  )
}

export default ImageCarousel;