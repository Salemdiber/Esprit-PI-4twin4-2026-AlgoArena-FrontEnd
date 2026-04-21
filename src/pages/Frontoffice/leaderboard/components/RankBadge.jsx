/**
 * RankBadge – coloured tier badge
 *
 * Renders a Chakra Badge with a gradient background matching the tier.
 * Supports: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND.
 */
import React from 'react';
import { Badge } from '@chakra-ui/react';

const tierStyles = {
    BRONZE: {
        bgGradient: 'linear(135deg, #8B4513, #CD853F)',
    },
    SILVER: {
        bgGradient: 'linear(135deg, #71717a, #a1a1aa)',
    },
    GOLD: {
        bgGradient: 'linear(135deg, #f59e0b, #fbbf24)',
    },
    PLATINUM: {
        bgGradient: 'linear(135deg, #06b6d4, #22d3ee)',
    },
    DIAMOND: {
        bgGradient: 'linear(135deg, #3b82f6, #60a5fa)',
    },
};

const RankBadge = ({ tier = 'BRONZE', size = 'sm', ...rest }) => {
    const style = tierStyles[tier] || tierStyles.BRONZE;

    const sizeMap = {
        sm: { px: 2, py: 0.5, fontSize: 'xs' },
        md: { px: 4, py: 1.5, fontSize: 'xs' },
        lg: { px: 5, py: 2, fontSize: 'sm' },
    };

    const s = sizeMap[size] || sizeMap.sm;

    return (
        <Badge
            px={s.px}
            py={s.py}
            fontSize={s.fontSize}
            fontFamily="body"
            fontWeight="extrabold"
            color="#0f172a"
            letterSpacing="1px"
            borderRadius="6px"
            textTransform="uppercase"
            bgGradient={style.bgGradient}
            {...rest}
        >
            {tier}
        </Badge>
    );
};

export default RankBadge;
