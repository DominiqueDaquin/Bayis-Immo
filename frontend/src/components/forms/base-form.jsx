import {
    Box,
    Button,

    Container,
    Flex,
    Heading,
    Input,
    Link,
    Text,
    VStack,
  } from "@chakra-ui/react"
import houseImage from "@/assets/maison.jpg"


export const BaseForm = ({description,onSubmit,children}) => {
 
  return (
    <Flex minHeight="100vh" width="100%">
      {/* Left side - Image */}
      <Box
        width="50%"
        bgImage={`url(${houseImage})`}
        bgSize="cover"
        bgPosition="center"
        display={{ base: "none", md: "block" }}
      />

      {/* Right side - Form */}
      <Box width={{ base: "100%", md: "50%" }} p={{ base: 6, md: 12 }} display="flex" alignItems="center">
        <Container maxW="md">
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading as="h1" size="xl" mb={4}>
                Hello,
              </Heading>
              <Text color="gray.600">
                {description}
              </Text>
            </Box>

            <VStack as="form" spacing={4} align="stretch" onSubmit={onSubmit}>
            {children}
            </VStack>

          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};