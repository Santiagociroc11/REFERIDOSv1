import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Gift, Search, ChevronRight, UserCheck, UsersRound } from 'lucide-react';
import { Client, Reward, Pet } from './types';
import { fetchClients, createClient, updateRewardStatus, checkAndCreateRewards } from './utils/supabaseUtils';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    referrerId: '',
    petName: '',
    petSpecies: '',
    petBreed: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await fetchClients();
      setClients(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading clients:', error);
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const client = {
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email || undefined,
        registrationDate: new Date().toISOString(),
        referrerId: newClient.referrerId || undefined,
        pets: [{
          name: newClient.petName,
          species: newClient.petSpecies,
          breed: newClient.petBreed || undefined
        }]
      };

      await createClient(client);
      
      if (client.referrerId) {
        await checkAndCreateRewards(client.referrerId);
      }
      
      await loadClients();
      
      setNewClient({
        name: '',
        phone: '',
        email: '',
        referrerId: '',
        petName: '',
        petSpecies: '',
        petBreed: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      await updateRewardStatus(rewardId);
      await loadClients();
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getDirectReferralsCount = (clientId: string): number => {
    return clients.filter(client => client.referrerId === clientId).length;
  };

  const getIndirectReferralsCount = (clientId: string): number => {
    const directReferrals = clients.filter(client => client.referrerId === clientId);
    return directReferrals.reduce((count, directRef) => 
      count + clients.filter(client => client.referrerId === directRef.id).length, 
    0);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-800">Sistema de Referidos - Veterinaria</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Registrar Cliente
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Clientes</h2>
            {loading ? (
              <div className="text-center py-4">Cargando...</div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center text-sm text-blue-600">
                            <UserCheck className="h-4 w-4 mr-1" />
                            <span>{getDirectReferralsCount(client.id)} directos</span>
                          </div>
                          <div className="flex items-center text-sm text-green-600">
                            <UsersRound className="h-4 w-4 mr-1" />
                            <span>{getIndirectReferralsCount(client.id)} indirectos</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedClient ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Detalles del Cliente</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Información Personal</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-1"><span className="font-medium">Nombre:</span> {selectedClient.name}</p>
                      <p className="mb-1"><span className="font-medium">Teléfono:</span> {selectedClient.phone}</p>
                      {selectedClient.email && <p className="mb-1"><span className="font-medium">Email:</span> {selectedClient.email}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Sistema de Referidos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-700">Referidos Directos</span>
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{getDirectReferralsCount(selectedClient.id)}</p>
                        <p className="text-sm text-blue-600">Próxima recompensa en: {3 - (getDirectReferralsCount(selectedClient.id) % 3)} más</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-700">Referidos Indirectos</span>
                          <UsersRound className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-700">{getIndirectReferralsCount(selectedClient.id)}</p>
                        <p className="text-sm text-green-600">Próxima recompensa en: {5 - (getIndirectReferralsCount(selectedClient.id) % 5)} más</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Mascotas</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedClient.pets.map(pet => (
                        <div key={pet.id} className="mb-2 last:mb-0">
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-gray-600">{pet.species} {pet.breed && `(${pet.breed})`}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Recompensas</h3>
                    {selectedClient.rewards && selectedClient.rewards.length > 0 ? (
                      <div className="space-y-3">
                        {selectedClient.rewards.map(reward => (
                          <div key={reward.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-medium">{reward.description}</p>
                              <p className="text-sm text-gray-600">
                                Estado: {reward.status === 'PENDING' ? 'Pendiente' : 'Reclamada'}
                              </p>
                            </div>
                            {reward.status === 'PENDING' && (
                              <button
                                onClick={() => handleClaimReward(reward.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                              >
                                Reclamar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay recompensas disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-2" />
                <p>Selecciona un cliente para ver sus detalles y recompensas</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Registrar Nuevo Cliente</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (opcional)</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Referido por (opcional)</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.referrerId}
                  onChange={(e) => setNewClient(prev => ({ ...prev, referrerId: e.target.value }))}
                >
                  <option value="">Ninguno</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la Mascota</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newClient.petName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, petName: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especie</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newClient.petSpecies}
                      onChange={(e) => setNewClient(prev => ({ ...prev, petSpecies: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Raza (opcional)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newClient.petBreed}
                      onChange={(e) => setNewClient(prev => ({ ...prev, petBreed: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;