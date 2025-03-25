import { Box, Flex, Text, keyframes } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useColorModeValue } from "@chakra-ui/react";

// Create motion components using motion.create()
const MotionBox = motion.create(Box);

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

function Loading() {
  // Color values
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const primaryColor = useColorModeValue("primary.500", "primary.300");
  const secondaryColor = useColorModeValue("secondary.500", "secondary.300");
  const textColor = useColorModeValue("neutral.600", "neutral.300");
  const pulseColor = useColorModeValue("primary.100", "primary.800");

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      width="100vw"
      position="fixed"
      top="0"
      left="0"
      bg={bgColor}
      zIndex="modal"
    >
      {/* Animation container */}
      <Box position="relative" width="120px" height="120px" mb={6}>
        {/* Rotating outer circle */}
        <MotionBox
          position="absolute"
          width="full"
          height="full"
          border="4px solid"
          borderColor={`${primaryColor}20`}
          borderRadius="full"
          borderTopColor={primaryColor}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Pulsing inner circle */}
        <MotionBox
          position="absolute"
          top="50%"
          left="50%"
          width="60px"
          height="60px"
          bg={pulseColor}
          borderRadius="full"
          transform="translate(-50%, -50%)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Center icon */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize="3xl"
          fontWeight="bold"
          color={secondaryColor}
        >
          🏡
        </Box>
      </Box>

      {/* Animated text */}
      <Flex align="center" height="30px" overflow="hidden">
        {["C", "h", "a", "r", "g", "e", "m", "e", "n", "t", ".", ".", "."].map((letter, i) => (
          <MotionBox
            key={i}
            as="span"
            display="inline-block"
            color={textColor}
            fontSize="xl"
            fontWeight="medium"
            animate={{
              y: [0, -10, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1
            }}
          >
            {letter}
          </MotionBox>
        ))}
      </Flex>

      {/* Subtext */}
      <Text
        mt={4}
        color={textColor}
        opacity="0.8"
        fontSize="sm"
        textAlign="center"
        maxW="300px"
      >
        Nous préparons votre expérience immobilière...
      </Text>
    </Flex>
  );
}

export default Loading;