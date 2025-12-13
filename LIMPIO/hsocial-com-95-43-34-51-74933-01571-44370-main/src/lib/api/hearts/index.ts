// Stub hearts API - profile_hearts and engagement_hearts tables removed

export async function giveHeartToProfile(profileId: string) {
  console.log('Profile hearts feature disabled');
  throw new Error('Hearts feature disabled');
}

export async function hasGivenHeartToProfile(profileId: string) {
  return false;
}

export async function countProfileHearts(profileId: string) {
  return 0;
}

export async function countTotalHearts(userId: string) {
  return 0;
}
