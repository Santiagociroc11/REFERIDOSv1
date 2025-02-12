import { supabase } from '../lib/supabase';
import { Client, Pet, Reward, Visit } from '../types';

export async function fetchClients(): Promise<Client[]> {
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      pets (*),
      rewards (*),
      visits (*, pets (*))
    `)
    .order('name');

  if (error) throw error;
  return clients;
}

export async function createClient(
  client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { pets: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>[] }
): Promise<Client> {
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      phone: client.phone,
      email: client.email,
      registration_date: client.registrationDate,
      referrer_id: client.referrerId
    })
    .select()
    .single();

  if (clientError) throw clientError;

  const petsToInsert = client.pets.map(pet => ({
    client_id: newClient.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed
  }));

  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .insert(petsToInsert)
    .select();

  if (petsError) throw petsError;

  return {
    ...newClient,
    pets: pets
  } as Client;
}

export async function updateRewardStatus(rewardId: string, status: 'CLAIMED'): Promise<void> {
  const { error } = await supabase
    .from('rewards')
    .update({
      status,
      date_claimed: new Date().toISOString()
    })
    .eq('id', rewardId);

  if (error) throw error;
}

export async function createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .insert({
      client_id: visit.clientId,
      pet_id: visit.petId,
      visit_date: visit.visitDate,
      reason: visit.reason,
      notes: visit.notes
    })
    .select(`*, pets (*)`)
    .single();

  if (error) throw error;
  return data;
}

export async function checkAndCreateRewards(clientId: string): Promise<void> {
  // Get direct referrals count
  const { count: directCount, error: directError } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('referrer_id', clientId);

  if (directError) throw directError;

  // Get second level referrals count
  const { data: directReferrals, error: secondError } = await supabase
    .from('clients')
    .select('id')
    .eq('referrer_id', clientId);

  if (secondError) throw secondError;

  const secondLevelCount = await Promise.all(
    directReferrals.map(async (ref) => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('referrer_id', ref.id);
      return count || 0;
    })
  ).then(counts => counts.reduce((a, b) => a + b, 0));

  // Get existing rewards
  const { data: existingRewards, error: rewardsError } = await supabase
    .from('rewards')
    .select('*')
    .eq('client_id', clientId);

  if (rewardsError) throw rewardsError;

  const directRewardsCount = existingRewards?.filter(r => r.type === 'DIRECT').length || 0;
  const secondLevelRewardsCount = existingRewards?.filter(r => r.type === 'SECOND_LEVEL').length || 0;

  const newDirectRewardsCount = Math.floor(directCount / 3) - directRewardsCount;
  const newSecondLevelRewardsCount = Math.floor(secondLevelCount / 5) - secondLevelRewardsCount;

  const newRewards = [];

  for (let i = 0; i < newDirectRewardsCount; i++) {
    newRewards.push({
      client_id: clientId,
      type: 'DIRECT',
      description: 'Recompensa por 3 referidos directos'
    });
  }

  for (let i = 0; i < newSecondLevelRewardsCount; i++) {
    newRewards.push({
      client_id: clientId,
      type: 'SECOND_LEVEL',
      description: 'Recompensa por 5 referidos en segunda línea'
    });
  }

  if (newRewards.length > 0) {
    const { error: insertError } = await supabase
      .from('rewards')
      .insert(newRewards);

    if (insertError) throw insertError;
  }
}