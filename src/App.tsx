import React, { useState, useEffect } from 'react';
import Login from './login';
import { Users, UserPlus, Gift, Search, ChevronRight, UserCheck, UsersRound } from 'lucide-react';
import { Client, Reward, Pet } from './types';
import { fetchClients, createClient, updateRewardStatus, checkAndCreateRewards, deleteClient } from './utils/supabaseUtils';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'stats' | 'pendingRewards'>('clients');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el botón de registrar
  const [customBreed, setCustomBreed] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchReferrerTerm, setSearchReferrerTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    cedula: '',
    referrerId: '',
    petName: '',
    petSpecies: '',
    petBreed: ''
  });


  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Revisar si el usuario ya está autenticado
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadClients = async () => {
    try {
      const data = await fetchClients();
      setClients(data);
      setLoading(false);
      console.log("Clientes obtenidos desde Supabase:", data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setLoading(false);
    }
  };

  const speciesData = {
    "Perro": ["Labrador", "Poodle", "Bulldog", "Golden Retriever", "Chihuahua", "Pastor Alemán", "Dálmata", "Shih Tzu", "YorkShire", "Pug", "Pitbull", "Mestizo", "Otro"],
    "Gato": ["Persa", "Siamés", "Maine Coon", "Bengalí", "Ragdoll", "Sphynx", "Mestizo", "Otro"],
    "Otro": []
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }


  const handleDeleteClient = async (clientId: string) => {
    console.log(`🛠 Intentando eliminar el cliente con ID: ${clientId}`);

    const confirmDelete = window.confirm("❌ ¿Estás seguro de que quieres eliminar este cliente?");
    if (!confirmDelete) {
      console.log("🚫 Eliminación cancelada por el usuario.");
      return;
    }

    console.log("✅ Confirmación aceptada. Procediendo a eliminar...");

    const success = await deleteClient(clientId);
    if (success) {
      console.log("✅ Cliente eliminado con éxito.");
      alert("✅ Cliente eliminado con éxito.");
      await loadClients(); // Refrescar la lista de clientes
      setSelectedClient(null);
    } else {
      console.error("❌ Error al eliminar el cliente.");
      alert("❌ Error al eliminar el cliente. Inténtalo de nuevo.");
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita doble envío

    setIsSubmitting(true); // Bloquea el botón
    try {
      const client = {
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email || undefined,
        cedula: newClient.cedula,
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
        cedula: '',
        referrerId: '',
        petName: '',
        petSpecies: '',
        petBreed: ''
      });

      setShowAddForm(false);
    } catch (error) {
      console.error('❌ Error al registrar cliente:', error);
      alert("❌ Ocurrió un error al registrar el cliente.");
    } finally {
      setIsSubmitting(false); // Habilita el botón después del proceso
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      const claimedDescription = prompt("📝 ingresa una descripción para reclamar la recompensa:");

      if (!claimedDescription || claimedDescription.trim() === "") {
        alert("❌ Debes ingresar una descripción para reclamar la recompensa (diga que reclamó y quien lo reclamó)");
        return;
      }

      console.log(`🛠️ Intentando reclamar recompensa con ID: ${rewardId} y descripción: ${claimedDescription}`);
      const result = await updateRewardStatus(rewardId, claimedDescription);

      if (!result) {
        alert("❌ No se pudo reclamar la recompensa. Inténtalo de nuevo.");
        return;
      }

      console.log("✅ Recompensa reclamada correctamente.");
      await loadClients();
      alert("🎉 ¡Recompensa reclamada con éxito!");
    } catch (error) {
      console.error('❌ Error al reclamar la recompensa:', error);
      alert("❌ Error al reclamar la recompensa.");
    }
  };

  const getDirectReferralsCount = (clientId: string): number => {
    if (!clients || clients.length === 0) return 0;
    const count = clients.filter(client => client.referrer_id === clientId).length;
    console.log(`Referidos directos de ${clientId}:`, count);
    return count;
  };

  const getIndirectReferralsCount = (clientId: string): number => {
    if (!clients || clients.length === 0) return 0;
    const directReferrals = clients.filter(client => client.referrer_id === clientId);
    const count = directReferrals.reduce(
      (total, directClient) => total + clients.filter(client => client.referrer_id === directClient.id).length,
      0
    );
    console.log(`Referidos indirectos de ${clientId}:`, count);
    return count;
  };

  const getDirectReferrals = (clientId: string): Client[] => {
    return clients.filter(client => client.referrer_id === clientId);
  };

  const getIndirectReferrals = (clientId: string): Client[] => {
    const directReferrals = getDirectReferrals(clientId);
    return clients.filter(client =>
      directReferrals.some(directClient => directClient.id === client.referrer_id)
    );
  };


 const filteredClients = clients.filter(client =>
  client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  client.phone.includes(searchTerm) ||
  client.cedula.includes(searchTerm)
);


  // Filtrar clientes por nombre o teléfono
  const filteredReferrers = clients.filter(client =>
    client.name.toLowerCase().includes(searchReferrerTerm.toLowerCase()) ||
    client.phone.includes(searchReferrerTerm) ||
    client.cedula.includes(searchTerm)
  );

  // 🔢 Total de clientes
  const totalClients = clients.length;

  // 📈 Total de referidos directos
  const totalDirectReferrals = clients.reduce((sum, client) => sum + getDirectReferralsCount(client.id), 0);

  // 📉 Total de referidos indirectos
  const totalIndirectReferrals = clients.reduce((sum, client) => sum + getIndirectReferralsCount(client.id), 0);

  // 🎁 Total de recompensas ganadas y reclamadas
  const totalRewards = clients.reduce((sum, client) => sum + (client.rewards?.length || 0), 0);
  const totalClaimedRewards = clients.reduce(
    (sum, client) => sum + (client.rewards?.filter(reward => reward.status === 'CLAIMED').length || 0),
    0
  );

  // 🐶🐱 Especies más comunes
  const speciesCount = clients.reduce((acc, client) => {
    client.pets.forEach(pet => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const sortedSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1]);

  // 👑 Cliente con más referidos
  const topReferrer = clients.reduce((max, client) => {
    const referrals = getDirectReferralsCount(client.id);
    return referrals > max.count ? { name: client.name, count: referrals } : max;
  }, { name: '', count: 0 });

  // 👑 TOP 5 clientes con más referidos
  const topReferrers = [...clients]
    .map(client => ({
      id: client.id,
      name: client.name,
      count: getDirectReferralsCount(client.id),
    }))
    .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
    .slice(0, 5); // Tomar los 5 mejores

  const pendingRewards = clients.flatMap(client =>
    client.rewards
      .filter(reward => reward.status === 'PENDING')
      .map(reward => ({
        ...reward,
        clientName: client.name,
        clientPhone: client.phone,
      }))
  );


  return (


    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-800">Sistema de Referidos - AGRO VETERINARIA EL TEMPLO</h1>
            <h1 className="ml-2 text-xl font-bold text-gray-800"></h1>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* ✅ TABS */}
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between">
          <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 rounded-lg ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
            Clientes
          </button>
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
            Estadísticas
          </button>
          <button onClick={() => setActiveTab('pendingRewards')} className={`px-4 py-2 rounded-lg relative ${activeTab === 'pendingRewards' ? 'bg-green-600 text-white' : 'text-gray-700'}`}>
            Recompensas Pendientes
            {pendingRewards.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 rounded-full">{pendingRewards.length}</span>}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'clients' && (
          // ✅ Sección de Clientes (Ya existente)
          <div>

            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">

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
                      placeholder="Buscar cliente por nombre o teléfono o cedula..."
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
                                <p className="text-sm text-gray-600">🆔 Cédula: {client.cedula}</p>
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
                              <p className="mb-1"><span className="font-medium">Cédula:</span> {selectedClient.cedula}</p>
                              <p className="mb-1"><span className="font-medium">Teléfono:</span> {selectedClient.phone}</p>
                              {selectedClient.email && <p className="mb-1"><span className="font-medium">Email:</span> {selectedClient.email}</p>}
                              <p className="mb-1"><span className="font-medium">Fecha de Inscripción:</span> {new Date(selectedClient.registration_date).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* 🔥 Nueva sección: Lista de referidos directos e indirectos */}
                          <div className="mt-4">
                            <h3 className="text-md font-semibold">Referidos Directos ({getDirectReferralsCount(selectedClient.id)})</h3>
                            {getDirectReferrals(selectedClient.id).length > 0 ? (
                              <ul className="list-disc ml-6">
                                {getDirectReferrals(selectedClient.id).map(ref => (
                                  <li key={ref.id} className="text-sm text-gray-700">
                                    {ref.name} - {ref.phone} (Registrado: {new Date(ref.registration_date).toLocaleDateString()})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No tiene referidos directos.</p>
                            )}
                          </div>

                          <div className="mt-4">
                            <h3 className="text-md font-semibold">Referidos Indirectos ({getIndirectReferralsCount(selectedClient.id)})</h3>
                            {getIndirectReferrals(selectedClient.id).length > 0 ? (
                              <ul className="list-disc ml-6">
                                {getIndirectReferrals(selectedClient.id).map(ref => (
                                  <li key={ref.id} className="text-sm text-gray-700">
                                    {ref.name} - {ref.phone} (Registrado: {new Date(ref.registration_date).toLocaleDateString()})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No tiene referidos indirectos.</p>
                            )}
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
                                <p className="text-sm text-green-600">Próxima recompensa en: {6 - (getIndirectReferralsCount(selectedClient.id) % 6)} más</p>
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
                                        Fecha de ganada: {new Date(reward.date_earned).toLocaleDateString()}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Estado: {reward.status === 'PENDING' ? 'Pendiente' : `Reclamada el: ${new Date(reward.date_claimed).toLocaleDateString()}`}
                                      </p>
                                      {reward.claimed_description && (
                                        <p className="text-sm text-gray-600">
                                          📌 Observación: {reward.claimed_description}
                                        </p>
                                      )}
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

                          <div className="flex justify-end space-x-3 mt-4">
                            <button
                              onClick={() => handleDeleteClient(selectedClient.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Eliminar Cliente
                            </button>
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
                        <label className="block text-sm font-medium text-gray-700">Cédula</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newClient.cedula}
                          onChange={(e) => setNewClient(prev => ({ ...prev, cedula: e.target.value }))}
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

                        {/* Input para buscar el referido */}
                        <input
                          type="text"
                          placeholder="Buscar por nombre o teléfono o cedula..."
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={searchReferrerTerm}
                          onChange={(e) => setSearchReferrerTerm(e.target.value)}
                        />

                        {/* Lista de resultados filtrados */}
                        {searchReferrerTerm && (
                          <ul className="mt-2 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-md">
                            {filteredReferrers.length > 0 ? (
                              filteredReferrers.map(ref => (
                                <li
                                  key={ref.id}
                                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                  onClick={() => {
                                    setNewClient(prev => ({ ...prev, referrerId: ref.id }));
                                    setSearchReferrerTerm(ref.name); // Mostrar el nombre seleccionado
                                  }}
                                >
                                  {ref.name} - {ref.phone}
                                </li>
                              ))
                            ) : (
                              <li className="px-4 py-2 text-gray-500">No se encontraron resultados</li>
                            )}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la Mascota</h3>
                        <div className="space-y-3">

                          {/* Nombre de la mascota */}
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

                          {/* Selección de Especie */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Especie</label>
                            <select
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={newClient.petSpecies}
                              onChange={(e) => {
                                const species = e.target.value;
                                setSelectedSpecies(species);
                                setSelectedBreed('');
                                setCustomBreed(false);
                                setNewClient(prev => ({ ...prev, petSpecies: species, petBreed: '' }));
                              }}
                            >
                              <option value="">Selecciona una especie</option>
                              {Object.keys(speciesData).map(species => (
                                <option key={species} value={species}>{species}</option>
                              ))}
                            </select>
                          </div>

                          {/* Selección de Raza (Dependiente de la Especie) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Raza (opcional)</label>
                            {selectedSpecies && speciesData[selectedSpecies].length > 0 ? (
                              <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={selectedBreed}
                                onChange={(e) => {
                                  const breed = e.target.value;
                                  if (breed === "Otro") {
                                    setCustomBreed(true);
                                    setNewClient(prev => ({ ...prev, petBreed: '' }));
                                  } else {
                                    setCustomBreed(false);
                                    setNewClient(prev => ({ ...prev, petBreed: breed }));
                                  }
                                  setSelectedBreed(breed);
                                }}
                              >
                                <option value="">Selecciona una raza</option>
                                {speciesData[selectedSpecies].map(breed => (
                                  <option key={breed} value={breed}>{breed}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="Ingresa la raza"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={newClient.petBreed}
                                onChange={(e) => setNewClient(prev => ({ ...prev, petBreed: e.target.value }))}
                              />
                            )}
                          </div>

                          {/* Input para raza personalizada si elige "Otro" */}
                          {customBreed && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Especificar Raza</label>
                              <input
                                type="text"
                                required
                                placeholder="Escribe la raza aquí..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={newClient.petBreed}
                                onChange={(e) => setNewClient(prev => ({ ...prev, petBreed: e.target.value }))}
                              />
                            </div>
                          )}

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
                          disabled={isSubmitting} // Bloquea si está procesando
                          className={`px-4 py-2 rounded-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                          {isSubmitting ? 'Registrando...' : 'Registrar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </div>
        )} {activeTab === 'stats' && (

          < div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              📊 Estadísticas Generales
            </h2>

            {/* 📊 Tarjetas de Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

              {/* Total de Clientes */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-5 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold">👥 Total de Clientes</h3>
                <p className="text-3xl font-extrabold">{totalClients}</p>
              </div>

              {/* Total de Referidos Directos */}
              <div className="bg-gradient-to-r from-green-400 to-green-600 p-5 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold">🔗 Referidos Directos</h3>
                <p className="text-3xl font-extrabold">{totalDirectReferrals}</p>
              </div>

              {/* Total de Referidos Indirectos */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-5 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold">🔁 Referidos Indirectos</h3>
                <p className="text-3xl font-extrabold">{totalIndirectReferrals}</p>
              </div>

              {/* Total de Recompensas Ganadas */}
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-5 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold">🎁 Recompensas Ganadas</h3>
                <p className="text-3xl font-extrabold">{totalRewards}</p>
              </div>

              {/* Total de Recompensas Reclamadas */}
              <div className="bg-gradient-to-r from-red-400 to-red-600 p-5 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold">✅ Recompensas Reclamadas</h3>
                <p className="text-3xl font-extrabold">{totalClaimedRewards}</p>
              </div>
            </div>

            {/* 🐶🐱 Especies de Mascotas Más Comunes */}
            <h2 className="text-2xl font-bold text-gray-800 mt-8 flex items-center">
              🐾 Especies de Mascotas Más Comunes
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <ul className="list-disc ml-6 text-gray-700">
                {sortedSpecies.map(([species, count]) => (
                  <li key={species} className="font-medium">
                    {species}: <span className="font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🏆 TOP 5 Referidores */}
            <h2 className="text-2xl font-bold text-gray-800 mt-8 flex items-center">
              🏆 TOP 5 Referidores
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              {topReferrers.length > 0 ? (
                <ul className="list-decimal ml-6 text-gray-700">
                  {topReferrers.map((referrer, index) => (
                    <li key={referrer.id} className="font-medium">
                      <span className={`font-bold ${index === 0 ? "text-yellow-500" : "text-blue-700"}`}>
                        {index + 1}.
                      </span>
                      {referrer.name} - <span className="font-semibold">{referrer.count}</span> referidos
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aún no hay referidores suficientes.</p>
              )}
            </div>

            {/* 👑 Mayor Referidor */}
            {topReferrers.length > 0 && (
              <div className="mt-6 bg-yellow-50 p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  👑 Mayor Referidor
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  🏅 {topReferrers[0].name} ({topReferrers[0].count} referidos)
                </p>
              </div>
            )}
          </div>
        )} {activeTab === 'pendingRewards' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">🎁 Recompensas Pendientes</h2>
            {pendingRewards.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <ul className="divide-y divide-gray-300">
                  {pendingRewards.map(reward => (
                    <li key={reward.id} className="flex justify-between items-center py-4">
                      <div>
                        <p className="text-sm text-gray-600">Cliente: {reward.clientName} ({reward.clientPhone})</p>
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-sm text-gray-600">
                          Fecha de ganada: {new Date(reward.date_earned).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={() => handleClaimReward(reward.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                        Reclamar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No hay recompensas pendientes.</p>
            )}
          </div>
        )}
      </main>
      <footer className="bg-gray-200 text-center text-gray-600 py-4 mt-6">
        <p>Desarrollado por <strong>Santiago Ciro - AutomSCC</strong></p>
      </footer>
    </div >
  );
}

export default App;