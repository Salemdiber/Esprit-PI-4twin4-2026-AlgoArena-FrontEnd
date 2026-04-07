import React from 'react';
import { HStack, IconButton, Popover, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { Smile } from 'lucide-react';
import { ALLOWED_REACTIONS } from './chatConstants';

const ChatReactionPicker = ({ onPick, ariaLabel }) => (
  <Popover placement="top" isLazy>
    <PopoverTrigger>
      <IconButton size="xs" variant="ghost" icon={<Smile size={14} />} aria-label={ariaLabel} />
    </PopoverTrigger>
    <PopoverContent bg="gray.800" borderColor="gray.700" borderRadius="full" w="auto">
      <PopoverBody p={2}>
        <HStack spacing={1} wrap="wrap">
          {ALLOWED_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="xs"
              variant="ghost"
              aria-label={emoji}
              onClick={() => onPick(emoji)}
              _hover={{ transform: 'scale(1.15)' }}
              icon={<span>{emoji}</span>}
            />
          ))}
        </HStack>
      </PopoverBody>
    </PopoverContent>
  </Popover>
);

export default ChatReactionPicker;

