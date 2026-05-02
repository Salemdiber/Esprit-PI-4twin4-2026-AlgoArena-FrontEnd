/**
 * AvatarMedia – robust avatar renderer for the leaderboard cards.
 *
 * Renders the initials in a coloured Flex *underneath* the <Image>. When the
 * stored upload is missing, 404s, or returns an unsupported MIME type, the
 * initials show through automatically — no reliance on data-URL SVG text
 * rendering (which is unreliable across browsers).
 *
 * Props
 *  - src             string | null   Resolved avatar URL (or null/'' for none)
 *  - username        string          Used to compute the initials
 *  - alt             string          Falls back to username
 *  - size            number          Pixel size used for the explicit width / height
 *  - fontSize        string          Chakra fontSize token for the initials letter
 *  - eager           bool            true → loading="eager" + fetchpriority="high"
 *  - bg              string          Background colour for the initials Flex
 *  - color           string          Text colour for the initials letter
 *  - ...rest         passed straight to <Image>
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Image } from '@chakra-ui/react';
import { getDiceBearUrl } from '../../../../services/dicebear';

const computeInitials = (username) => {
    const labelText = String(username || 'Player').trim();
    const initials = labelText
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return initials || 'P';
};

const AvatarMedia = ({
    src,
    username,
    alt,
    size = 96,
    fontSize,
    eager = false,
    bg = '#0f172a',
    color = '#67e8f9',
    ...rest
}) => {
    // We preload the image off-DOM and ONLY render the <img> once it has
    // successfully loaded. This prevents Chrome from painting its broken-image
    // placeholder (the small grey icon with a coloured corner) inside the
    // avatar circle while the request is in flight or has failed.
    const initials = useMemo(() => computeInitials(username), [username]);
    const fallbackSrc = useMemo(() => {
        try {
            return getDiceBearUrl(username || alt || 'Player', 'adventurer');
        } catch {
            return null;
        }
    }, [username, alt]);
    const [resolvedSrc, setResolvedSrc] = useState(fallbackSrc);

    useEffect(() => {
        setResolvedSrc(fallbackSrc);

        if (!src) {
            return undefined;
        }

        let cancelled = false;
        const probe = new window.Image();
        probe.onload = () => {
            if (!cancelled) setResolvedSrc(src);
        };
        probe.onerror = () => {
            if (!cancelled) setResolvedSrc(fallbackSrc);
        };
        probe.src = src;

        return () => {
            cancelled = true;
            probe.onload = null;
            probe.onerror = null;
        };
    }, [src, fallbackSrc]);

    const computedFontSize = fontSize || `${Math.round(size * 0.42)}px`;

    return (
        <Box
            position="relative"
            w="full"
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={bg}
            color={color}
            fontFamily="heading"
            fontWeight="800"
            fontSize={computedFontSize}
            letterSpacing="0.02em"
            lineHeight="1"
            userSelect="none"
            overflow="hidden"
        >
            {/* Initials are rendered as plain text so they always show when no
                image is mounted (no <img> means no broken-image icon). */}
            <span aria-hidden="true">{initials}</span>

            {/* Image is mounted only after it has loaded successfully. */}
            {resolvedSrc && (
                <Image
                    src={resolvedSrc}
                    alt={alt || username || 'avatar'}
                    position="absolute"
                    inset={0}
                    w="full"
                    h="full"
                    objectFit="contain"
                    objectPosition="center"
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : undefined}
                    decoding="async"
                    width={size}
                    height={size}
                    {...rest}
                />
            )}
        </Box>
    );
};

export default AvatarMedia;
