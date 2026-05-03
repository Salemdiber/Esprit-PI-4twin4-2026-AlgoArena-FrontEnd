/**
 * ArenaStage – Top 3 podium section
 *
 * Layout:
 *  • 3-column grid on desktop (2nd | 1st | 3rd)
 *  • Stacked vertically on tablet/mobile (1st → 2nd → 3rd)
 */
import React from 'react';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import ChampionCard from './ChampionCard';
import RankCard from './RankCard';

const ArenaStage = ({ players, animationsReady = false }) => {
    // Expect at least 3 players
    const champion = players[0]; // rank 1
    const second = players[1];   // rank 2
    const third = players[2];    // rank 3

    if (!champion || !second || !third) return null;

    return (
        <Box
            mb={20}
        >
            <Grid
                templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}
                gap={8}
                alignItems="end"
            >
                {/* 2nd place – left on desktop, second on mobile */}
                <GridItem order={{ base: 2, lg: 1 }}>
                    <RankCard player={second} variant="stage" animationsReady={animationsReady} />
                </GridItem>

                {/* 1st place – centre on desktop, first on mobile */}
                <GridItem order={{ base: 1, lg: 2 }}>
                    <ChampionCard player={champion} animationsReady={animationsReady} />
                </GridItem>

                {/* 3rd place – right on desktop, third on mobile */}
                <GridItem order={{ base: 3, lg: 3 }}>
                    <RankCard player={third} variant="stage" animationsReady={animationsReady} />
                </GridItem>
            </Grid>
        </Box>
    );
};

export default React.memo(ArenaStage);
