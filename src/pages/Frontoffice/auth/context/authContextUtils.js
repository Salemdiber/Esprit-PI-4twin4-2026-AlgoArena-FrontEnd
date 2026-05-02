export const redirectBasedOnRole = (user) => {
    if (!user || !user.role) return '/signin';
    const role = user.role.toUpperCase();
    if (role === 'ADMIN' || role === 'ORGANIZER') {
        return '/admin';
    }
    return '/';
};

export const hasCompletedSpeedChallenge = (user) => {
    if (!user) return false;
    return user.speedChallengeCompleted === true;
};