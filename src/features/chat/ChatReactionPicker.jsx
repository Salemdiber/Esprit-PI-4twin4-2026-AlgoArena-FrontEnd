import React from 'react';
import { HStack, IconButton, Popover, PopoverBody, PopoverContent, PopoverTrigger, useColorModeValue } from '@chakra-ui/react';
import { Smile } from 'lucide-react';
import { ALLOWED_REACTIONS } from './chatConstants';

const ChatReactionPicker = ({ onPick, ariaLabel }) => {
  const popoverBg = useColorModeValue('var(--color-bg-card)', 'gray.800');
  const borderColor = useColorModeValue('var(--color-border)', 'gray.700');
  const iconColor = useColorModeValue('gray.700', 'gray.300');
  const iconHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');

  return (
    <Popover placement="top" isLazy>
      <PopoverTrigger>
        <IconButton size="xs" variant="ghost" color={iconColor} _hover={{ bg: iconHoverBg }} icon={<Smile size={14} />} aria-label={ariaLabel} />
      </PopoverTrigger>
      <PopoverContent bg={popoverBg} borderColor={borderColor} borderRadius="full" w="auto">
        <PopoverBody p={2}>
          <HStack spacing={1} wrap="wrap">
            {ALLOWED_REACTIONS.map((emoji) => (
              <IconButton
                key={emoji}
                size="xs"
                variant="ghost"
                aria-label={emoji}
                color={iconColor}
                onClick={() => onPick(emoji)}
                _hover={{ transform: 'scale(1.15)', bg: iconHoverBg }}
                icon={<span>{emoji}</span>}
              />
            ))}
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ChatReactionPicker;

