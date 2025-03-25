"use client";

import {
  Grid,
  Input,
  Checkbox,
  Select,
  FormControl,
  FormLabel,
  Button,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack
} from "@chakra-ui/react";

const FiltersDrawer = ({ isOpen, onClose, categories, handleCategoryChange }) => {
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "neutral.800");
    
    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filtres</DrawerHeader>
          <DrawerBody>
            <Stack spacing={6} py={4}>
              <FormControl>
                <FormLabel>Prix (XAF)</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <Input placeholder="Minimum" focusBorderColor="primary.500" />
                  <Input placeholder="Maximum" focusBorderColor="primary.500" />
                </Grid>
              </FormControl>
  
              <FormControl>
                <FormLabel>Localisation</FormLabel>
                <Select placeholder="Choisir une ville" focusBorderColor="primary.500">
                  <option>Douala</option>
                  <option>Yaoundé</option>
                  <option>Bafoussam</option>
                </Select>
              </FormControl>
  
              <FormControl>
                <FormLabel>Catégories</FormLabel>
                <Stack spacing={3}>
                  {Object.entries(categories).map(([key, value]) => (
                    <Checkbox
                      key={key}
                      colorScheme="primary"
                      isChecked={value}
                      onChange={() => handleCategoryChange(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Checkbox>
                  ))}
                </Stack>
              </FormControl>
  
              <Button colorScheme="primary" onClick={onClose}>
                Appliquer les filtres
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

export default FiltersDrawer;