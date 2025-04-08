"use client";

import {
  Box,
  Text,
  VStack,
  Heading,
  useColorMode,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "Trouvez votre propriété idéale",
    subtitle: "Découvrez des milliers d'annonces vérifiées à travers tout le Cameroun"
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "De nombreux lots à gagner",
    subtitle: "Tentez de remporter des téléphones, des ordinateurs, des motos, et meme des terrains"
  },
  {
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "Investissez dans l'immobilier",
    subtitle: "Les meilleures opportunités d'investissement au Cameroun"
  }
];

const HeroBanner = () => {
  const { colorMode } = useColorMode();
  const overlayColor = colorMode === 'light' ? "blackAlpha.600" : "blackAlpha.700";
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideSize = useBreakpointValue({ base: "250px", md: "400px" });
  const arrowSize = useBreakpointValue({ base: "sm", md: "md" });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-rotation des slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      position="relative"
      h={slideSize}
      overflow="hidden"
    >
      {/* Slides */}
      <Box
        display="flex"
        transition="transform 0.5s ease"
        transform={`translateX(-${currentSlide * 100}%)`}
        h="full"
        w="full"
      >
        {slides.map((slide, index) => (
          <Box
            key={index}
            flex="none"
            w="full"
            h="full"
            bgImage={`url('${slide.image}')`}
            bgPosition="center"
            bgSize="cover"
            position="relative"
          >
            <Box 
              bg={overlayColor}
              h="full" 
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={4} textAlign="center" px={4} zIndex={1} maxW="3xl">
                <Heading 
                  as="h1" 
                  size={{ base: "xl", md: "2xl" }}
                  color="white"
                  textShadow="0 2px 4px rgba(0,0,0,0.5)"
                >
                  {slide.title}
                </Heading>
                <Text 
                  fontSize={{ base: "md", md: "xl" }}
                  color="whiteAlpha.900"
                >
                  {slide.subtitle}
                </Text>
              </VStack>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Navigation arrows */}
      <IconButton
        aria-label="Previous slide"
        icon={<FaChevronLeft />}
        position="absolute"
        left="4"
        top="50%"
        transform="translateY(-50%)"
        size={arrowSize}
        borderRadius="full"
        onClick={prevSlide}
        zIndex={2}
      />
      <IconButton
        aria-label="Next slide"
        icon={<FaChevronRight />}
        position="absolute"
        right="4"
        top="50%"
        transform="translateY(-50%)"
        size={arrowSize}
        borderRadius="full"
        onClick={nextSlide}
        zIndex={2}
      />

      {/* Indicators */}
      <Box
        position="absolute"
        bottom="4"
        left="50%"
        transform="translateX(-50%)"
        display="flex"
        gap="2"
        zIndex={2}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            w="2"
            h="2"
            borderRadius="full"
            bg={currentSlide === index ? "white" : "whiteAlpha.500"}
            cursor="pointer"
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroBanner;