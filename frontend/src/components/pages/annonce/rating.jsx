

import {
  Text,
  HStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { StarIcon } from "@chakra-ui/icons";


 const Rating = ({ rating, reviews }) => {
    const { colorMode } = useColorMode();
    const starColor = colorMode === 'light' ? "accent.500" : "accent.300";
    const textColor = useColorModeValue("neutral.500", "neutral.400");
    
    return (
      <HStack spacing={1}>
        {Array(5).fill("").map((_, i) => (
          <StarIcon
            key={i}
            color={i < Math.floor(rating) ? starColor : "neutral.300"}
            boxSize={4}
          />
        ))}
        <Text fontSize="sm" color={textColor}>({reviews} avis)</Text>
      </HStack>
    );
  };

  export default Rating;