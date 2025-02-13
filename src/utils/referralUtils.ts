import { Client, Reward } from '../types';

export const getDirectReferrals = (clientId: string, clients: Client[]): Client[] => {
  return clients.filter(client => client.referrerId === clientId);
};

export const getSecondLevelReferrals = (clientId: string, clients: Client[]): Client[] => {
  const directReferrals = getDirectReferrals(clientId, clients);
  const secondLevel: Client[] = [];
  
  directReferrals.forEach(direct => {
    const referrals = getDirectReferrals(direct.id, clients);
    secondLevel.push(...referrals);
  });
  
  return secondLevel;
};

export const checkRewardEligibility = (
  client: Client,
  clients: Client[],
  existingRewards: Reward[]
): Reward[] => {
  const newRewards: Reward[] = [];
  const directReferrals = getDirectReferrals(client.id, clients);
  const secondLevelReferrals = getSecondLevelReferrals(client.id, clients);
  
  // Check direct referrals rewards (every 3 referrals)
  const directRewardsCount = existingRewards.filter(
    r => r.clientId === client.id && r.type === 'DIRECT'
  ).length;
  
  const newDirectRewardsEarned = Math.floor(directReferrals.length / 3) - directRewardsCount;
  
  for (let i = 0; i < newDirectRewardsEarned; i++) {
    newRewards.push({
      id: crypto.randomUUID(),
      clientId: client.id,
      type: 'DIRECT',
      status: 'PENDING',
      dateEarned: new Date().toISOString(),
      description: 'Recompensa por 3 referidos directos'
    });
  }
  
  // Check second level rewards
  const secondLevelRewardsCount = existingRewards.filter(
    r => r.clientId === client.id && r.type === 'SECOND_LEVEL'
  ).length;
  
  const newSecondLevelRewardsEarned = Math.floor(secondLevelReferrals.length / 6) - secondLevelRewardsCount;
  
  for (let i = 0; i < newSecondLevelRewardsEarned; i++) {
    newRewards.push({
      id: crypto.randomUUID(),
      clientId: client.id,
      type: 'SECOND_LEVEL',
      status: 'PENDING',
      dateEarned: new Date().toISOString(),
      description: 'Recompensa por 6 referidos en segunda línea'
    });
  }
  
  return newRewards;
};