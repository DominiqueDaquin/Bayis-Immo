"use client";
import {
  HStack,
  Button,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";



const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { colorMode } = useColorMode();
  const buttonBg = useColorModeValue("primary.50", "primary.800");
  const activeBg = useColorModeValue("primary.500", "primary.600");
  
  return (
    <HStack spacing={2} mt={8} justify="center" flexWrap="wrap">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        size="sm"
        variant="outline"
        colorScheme="primary"
      >
        Précédent
      </Button>

      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          bg={currentPage === i + 1 ? activeBg : "transparent"}
          color={currentPage === i + 1 ? "white" : colorMode === 'light' ? "primary.600" : "primary.200"}
          variant={currentPage === i + 1 ? "solid" : "outline"}
          size="sm"
          _hover={{
            bg: currentPage === i + 1 ? activeBg : buttonBg
          }}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        colorScheme="primary"
      >
        Suivant
      </Button>
    </HStack>
  );
};


export default Pagination;