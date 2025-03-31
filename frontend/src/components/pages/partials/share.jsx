import { FaShare, FaFacebook, FaWhatsapp, FaTwitter, FaLink } from 'react-icons/fa';
import { 
  Button, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverBody, 
  HStack, 
  IconButton,
  useToast
} from '@chakra-ui/react';

function ShareButton() {
  const toast = useToast();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const share = (platform) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(currentUrl);
    const text = encodeURIComponent("Regardez cette annonce intéressante !");

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(currentUrl);
        toast({
          title: 'Lien copié',
          description: 'Le lien a été copié dans votre presse-papier',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Popover placement="top" isLazy>
      <PopoverTrigger>
        <Button
          variant="outline"
          colorScheme="primary"
          size="lg"
          w="full"
          leftIcon={<FaShare />}
        >
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent width="auto" zIndex="100">
        <PopoverBody p={2}>
          <HStack spacing={1}>
            <IconButton
              aria-label="Partager sur Facebook"
              icon={<FaFacebook />}
              colorScheme="facebook"
              onClick={() => share('facebook')}
              variant="ghost"
            />
            <IconButton
              aria-label="Partager sur WhatsApp"
              icon={<FaWhatsapp />}
              colorScheme="whatsapp"
              onClick={() => share('whatsapp')}
              variant="ghost"
            />
            <IconButton
              aria-label="Partager sur Twitter"
              icon={<FaTwitter />}
              colorScheme="twitter"
              onClick={() => share('twitter')}
              variant="ghost"
            />
            <IconButton
              aria-label="Copier le lien"
              icon={<FaLink />}
              onClick={() => share('copy')}
              variant="ghost"
            />
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default ShareButton;