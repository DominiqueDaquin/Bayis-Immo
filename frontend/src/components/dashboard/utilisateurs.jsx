"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Badge,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  Spinner,
  IconButton,
  Tooltip,
  Heading,
  Checkbox,
  Stack,
  SimpleGrid,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure as useAlertDisclosure
} from "@chakra-ui/react";
import { FiSearch, FiEdit, FiTrash2, FiUserPlus, FiRefreshCw, FiFilter } from "react-icons/fi";
import axiosInstance from "@/api/axios";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";
import { baseUrl } from "@/config";
import { useRef } from "react";

const UserManagementPage = () => {
  // States principaux
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modals
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure();
  const { isOpen: isAddUserModalOpen, onOpen: onAddUserModalOpen, onClose: onAddUserModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useAlertDisclosure();
  
  const toast = useToast();
  const cancelRef = useRef();

  // Fetch users and groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axiosInstance.get("/auth/users/"),
          axiosInstance.get("/api/groups/"), // Endpoint original
        ]);

        const normalizedUsers = usersRes.data.map(user => ({
          ...user,
          groups: user.groups || []
        }));

        setUsers(normalizedUsers);
        setFilteredUsers(normalizedUsers);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGroup = selectedGroupFilter === "" || 
        user.groups.some(group => {
          const groupName = typeof group === 'object' ? group.name : group;
          return groupName === selectedGroupFilter;
        });
      
      return matchesSearch && matchesGroup;
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedGroupFilter, users]);

  // Gestion des groupes
  const handleEditGroups = (user) => {
    setSelectedUser(user);
    const userGroupNames = user.groups?.map(group => 
      typeof group === 'object' ? group.name : group
    ) || [];
    setSelectedGroups(userGroupNames);
    onGroupModalOpen();
  };

  const handleUpdateGroups = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/auth/users/${selectedUser.id}/groups/`, {
        groups: selectedGroups
      });

      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { 
              ...user, 
              groups: groups.filter(g => selectedGroups.includes(g.name))
            }
          : user
      ));

      toast({
        title: "Succès",
        description: "Groupes mis à jour avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onGroupModalClose();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la mise à jour",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Gestion suppression utilisateur
  const handleDeleteUser = async () => {
    try {
      await axiosInstance.delete(`/auth/users/${selectedUser.id}/`);
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setFilteredUsers(filteredUsers.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la suppression",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteAlertClose();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Jamais";
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy HH:mm", { locale: fr });
  };

  // Colonnes responsives
  const tableColumns = [
    { header: "Photo", accessor: "photo", showOnMobile: true },
    { header: "Nom", accessor: "name", showOnMobile: true },
    { header: "Email", accessor: "email", showOnMobile: false },
    { header: "Username", accessor: "username", showOnMobile: false },
    { header: "Téléphone", accessor: "phone", showOnMobile: false },
    { header: "Groupes", accessor: "groups", showOnMobile: true },
    { header: "Inscription", accessor: "date_joined", showOnMobile: false },
    { header: "Dernière connexion", accessor: "last_login", showOnMobile: false },
    { header: "Actions", accessor: "actions", showOnMobile: true }
  ];

  return (
    <Box p={[2, 4, 6]}>
      {/* Header avec boutons */}
      <Flex justify="space-between" mb={6} align="center" direction={["column", "row"]} gap={4}>
        <Heading as="h1" size="xl">Gestion des Utilisateurs ({filteredUsers.length})</Heading>
        <Flex gap={2} w={["100%", "auto"]}>
          <Tooltip label="Rafraîchir">
            <IconButton
              icon={<FiRefreshCw />}
              onClick={() => {
                setSearchTerm("");
                setSelectedGroupFilter("");
                handleRefresh();
              }}
              aria-label="Rafraîchir"
            />
          </Tooltip>
          <Button 
            leftIcon={<FiUserPlus />} 
            colorScheme="blue" 
            w={["100%", "auto"]}
            onClick={onAddUserModalOpen}
          >
            Ajouter
          </Button>
        </Flex>
      </Flex>

      {/* Filtres */}
      <SimpleGrid columns={[1, 2]} gap={4} mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Flex align="center" gap={2}>
          <FiFilter />
          <Select
            placeholder="Tous les groupes"
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
          >
            {groups.map(group => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </Select>
        </Flex>
      </SimpleGrid>

      {/* Tableau */}
      {isLoading ? (
        <Flex justify="center" mt={10}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="striped" size="sm">
            <Thead>
              <Tr>
                {tableColumns.map((column) => (
                  <Th key={column.accessor} display={{ base: column.showOnMobile ? "table-cell" : "none", md: "table-cell" }}>
                    {column.header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  {tableColumns.map((column) => (
                    <Td key={`${user.id}-${column.accessor}`} display={{ base: column.showOnMobile ? "table-cell" : "none", md: "table-cell" }}>
                      {column.accessor === "photo" ? (
                        <Avatar
                          size="sm"
                          name={user.name || user.username}
                          src={user.photo ? `${baseUrl}${user.photo}` : undefined}
                        />
                      ) : column.accessor === "name" ? (
                        <Text fontWeight="medium">{user.name || "-"}</Text>
                      ) : column.accessor === "email" ? (
                        user.email
                      ) : column.accessor === "username" ? (
                        user.username
                      ) : column.accessor === "phone" ? (
                        user.phone || "-"
                      ) : column.accessor === "groups" ? (
                        <Flex wrap="wrap" gap={1}>
                          {user.groups?.length > 0 ? (
                            user.groups.map((group) => (
                              <Badge 
                                key={`group-${user.id}-${typeof group === 'object' ? group.id : group}`} 
                                colorScheme="blue"
                                variant="solid"
                                borderRadius="full"
                                px={2}
                              >
                                {typeof group === 'object' ? group.name : group}
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">Aucun</Text>
                          )}
                        </Flex>
                      ) : column.accessor === "date_joined" ? (
                        formatDate(user.date_joined)
                      ) : column.accessor === "last_login" ? (
                        formatDate(user.last_login)
                      ) : column.accessor === "actions" ? (
                        <Flex gap={1}>
                          <Tooltip label="Modifier les groupes">
                            <IconButton
                              icon={<FiEdit />}
                              onClick={() => handleEditGroups(user)}
                              aria-label="Modifier"
                              size="sm"
                              colorScheme="blue"
                            />
                          </Tooltip>
                          <Tooltip label="Supprimer">
                            <IconButton
                              icon={<FiTrash2 />}
                              onClick={() => {
                                setSelectedUser(user);
                                onDeleteAlertOpen();
                              }}
                              aria-label="Supprimer"
                              size="sm"
                              colorScheme="red"
                            />
                          </Tooltip>
                        </Flex>
                      ) : null}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal pour modifier les groupes */}
      <Modal isOpen={isGroupModalOpen} onClose={onGroupModalClose} size={["full", "md"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Groupes de {selectedUser?.name || selectedUser?.username || "l'utilisateur"}
          </ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Sélectionnez les groupes:</FormLabel>
              <Stack spacing={3} maxH="60vh" overflowY="auto">
                {groups.filter((g)=>!selectedGroups.includes(g.name)).map((group) => (
                  <Checkbox
                    key={group.id}
                    isChecked={selectedGroups.includes(group.name)}
                    onChange={(e) => {
                      const groupName = group.name;
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, groupName]);
                      } else {
                        setSelectedGroups(selectedGroups.filter(name => name !== groupName));
                      }
                    }}
                  >
                    {group.name}
                  </Checkbox>
                ))}
              </Stack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onGroupModalClose}>
              Annuler
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateGroups}
              isLoading={isUpdating}
            >
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal pour ajouter un utilisateur */}
      <Modal isOpen={isAddUserModalOpen} onClose={onAddUserModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter un nouvel utilisateur</ModalHeader>
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Nom complet</FormLabel>
              <Input placeholder="Nom complet" />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input placeholder="Email" type="email" />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Nom d'utilisateur</FormLabel>
              <Input placeholder="Username" />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Mot de passe</FormLabel>
              <Input placeholder="Mot de passe" type="password" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddUserModalClose}>
              Annuler
            </Button>
            <Button colorScheme="blue">
              Créer l'utilisateur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert de confirmation pour suppression */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer l'utilisateur
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer {selectedUser?.name || selectedUser?.username || "cet utilisateur"} ? Cette action est irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserManagementPage;