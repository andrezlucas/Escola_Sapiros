function FormEditarPerfil() {
  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1D5D7F] flex items-center justify-center text-white text-3xl font-bold">
          FOTO
        </div>
        <div>
          <h2 className="font-bold text-2xl text-[#1D5D7F]">Felipe Melo</h2>
          <p className="text-lg text-gray-600">3º Ano - Manhã</p>
        </div>
      </div>

      <h3 className="font-bold text-xl mb-6 text-[#1D5D7F]">Editar Perfil</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo:
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="Digite seu nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email:
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone:
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="(DD) 99999-9999"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha:
          </label>

          <div className="flex items-center gap-3">
            <input
              type="password"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
              placeholder="••••••••"
            />
            <button className="px-6 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#1D5D7F]/90 transition whitespace-nowrap">
              Alterar
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
            Cancelar
          </button>
          <button className="px-6 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#1D5D7F]/90 transition">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormEditarPerfil;
