"use client"
import {
  Box,
  Flex,
  Avatar,
  Text,
  Tooltip,
useColorModeValue
} from "@chakra-ui/react"
import {
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi"

const Message = ({ content, timestamp, isOwn, status, senderName,time }) => {
    const align = isOwn ? "flex-end" : "flex-start"
    const messageTime = new Date(timestamp)
    const now = new Date()
  // Couleurs du thème
  const bgColor = useColorModeValue("neutral.50", "neutral.900")
  const sidebarBg = useColorModeValue("white", "neutral.800")
  const headerBg = useColorModeValue("white", "neutral.800")
  const borderColor = useColorModeValue("neutral.200", "neutral.700")
  const textColor = useColorModeValue("neutral.800", "neutral.100")

  
    let timeAgo=time
  
    const getStatusText = () => {
      switch (status) {
        case 'e':
          return "Envoyé"
        case "r":
          return "Reçu"
        case "l":
          return "Lu"
        default:
          return ""
      }
    }
  
    const getStatusIcon = () => {
      switch (status) {
        case "e":
          return <FiCheck color="#718096" />
        case "r":
          return <FiCheck color="#4299E1" />
        case "l":
          return <FiCheckCircle color="#38B2AC" />
        default:
          return null
      }
    }
  
    return (
      <Flex w="100%" justify={align} mb={4}>
        {!isOwn && <Avatar size="sm" name={senderName} mr={2} alignSelf="flex-end" />}
        <Box maxW={{ base: "75%", md: "70%" }}>
          <Box
            bg={isOwn ? "blue.500" : "white"}
            color={isOwn ? "white" : "gray.800"}
            px={4}
            py={3}
            borderRadius={16}
            borderBottomRightRadius={isOwn ? 4 : 16}
            borderBottomLeftRadius={isOwn ? 16 : 4}
            boxShadow={isOwn ? "none" : "0 1px 2px rgba(0,0,0,0.1)"}
            border={isOwn ? "none" : "1px solid"}
            borderColor="gray.200"
          >
            {content}
          </Box>
          <Flex justify={isOwn ? "flex-end" : "flex-start"} align="center" mt={1} fontSize="xs" color="gray.500">
            <Tooltip label={messageTime.toLocaleString()} placement="bottom">
              <Text>{timeAgo}</Text>
            </Tooltip>
            {isOwn && (
              <Tooltip label={getStatusText()} placement="bottom">
                <Box ml={2}>{getStatusIcon()}</Box>
              </Tooltip>
            )}
          </Flex>
        </Box>
      </Flex>
    )
  }

export default Message;