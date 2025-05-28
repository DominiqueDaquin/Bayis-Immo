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
import GoogleLogin from "../others/google-login";

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
            <div className="social-login">
                 
                    <GoogleLogin />
                    <Flex align="center" my={6} w="full">
                  <Box flex={1} h="1px" bg="gray.200" />
                  <Text mx={4} color="gray.500" fontSize="sm" fontWeight="medium">
                    OU
                  </Text>
                  <Box flex={1} h="1px" bg="gray.200" />
                </Flex>
                  </div>
            {children}
                  
            </VStack>

          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};